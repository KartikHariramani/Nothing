import asyncio
import logging
from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal
from app.models.models import Campaign, Registration, User
from app.services.telegram_service import telegram_service
from app.services.audit_service import audit_service
from app.services.ml_service import ml_service

logger = logging.getLogger(__name__)

class ProductionWorker:
    def __init__(self):
        self._is_running = False

    async def start(self):
        self._is_running = True
        logger.info("Life Share Production Background Worker started.")
        while self._is_running:
            try:
                await self.process_scheduled_reminders()
                await self.process_no_shows()
            except Exception as e:
                logger.error(f"Error in background worker tick: {e}", exc_info=True)
            # Tick every 60 seconds
            await asyncio.sleep(60)

    def stop(self):
        self._is_running = False

    async def process_scheduled_reminders(self):
        """
        Scan upcoming campaigns and dispatch T-3 and T-1 reminders to registered/confirmed donors.
        Strictly checks consent inside telegram_service.send_mobilisation_message.
        """
        db = SessionLocal()
        try:
            today = datetime.now(timezone.utc).date()
            live_campaigns = db.query(Campaign).filter(Campaign.status.in_(["live", "approved"])).all()

            for camp in live_campaigns:
                try:
                    drive_date = datetime.strptime(camp.drive_date, "%Y-%m-%d").date()
                    delta_days = (drive_date - today).days

                    target_stage = None
                    msg_type = None
                    if delta_days <= 1 and delta_days >= 0:
                        target_stage = "t_minus_1"
                        msg_type = "t_minus_1_reminder"
                    elif delta_days <= 3 and delta_days > 1:
                        target_stage = "t_minus_3"
                        msg_type = "t_minus_3_reminder"

                    if target_stage:
                        # Find registrations needing this reminder
                        regs = db.query(Registration).filter(
                            Registration.campaign_id == camp.id,
                            Registration.status.in_(["registered", "confirmed"]),
                            Registration.reminder_stage != target_stage,
                            Registration.reminder_stage != "t_minus_1" # If already got T-1, don't send T-3
                        ).all()

                        for reg in regs:
                            res = await telegram_service.send_mobilisation_message(
                                db=db,
                                donor_id=reg.donor_id,
                                message_type=msg_type,
                                campaign_id=camp.id,
                                registration_id=reg.id,
                                actor_id="scheduled_worker"
                            )
                            if res.get("success"):
                                reg.reminder_stage = target_stage
                                reg.updated_at = datetime.now(timezone.utc)
                                db.commit()
                except Exception as ex:
                    logger.error(f"Error processing reminders for campaign {camp.id}: {ex}")
        finally:
            db.close()

    async def process_no_shows(self):
        """
        Identify completed drives where registrations were confirmed/registered but never checked in (no QR scan).
        Marks them as 'no_show' and records an audit event.
        """
        db = SessionLocal()
        try:
            now = datetime.now(timezone.utc)
            today_str = now.strftime("%Y-%m-%d")

            # Campaigns where drive_date is in the past
            past_campaigns = db.query(Campaign).filter(
                Campaign.drive_date < today_str,
                Campaign.status.in_(["live", "approved"])
            ).all()

            for camp in past_campaigns:
                unattended_regs = db.query(Registration).filter(
                    Registration.campaign_id == camp.id,
                    Registration.status.in_(["registered", "confirmed"]),
                    Registration.qr_used == False
                ).all()

                for reg in unattended_regs:
                    before_state = {"status": reg.status}
                    reg.status = "no_show"
                    reg.predicted_attendance_score = 0.0
                    reg.updated_at = now
                    db.commit()

                    audit_service.log_event(
                        db=db,
                        action="donor.no_show",
                        entity_type="registration",
                        entity_id=reg.id,
                        actor_id="system_worker",
                        actor_role="system",
                        before_state=before_state,
                        after_state={"status": "no_show"}
                    )
        finally:
            db.close()

production_worker = ProductionWorker()
