import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import Registration, Slot, Campaign, User
from app.services.audit_service import audit_service
from app.services.ml_service import ml_service
from app.services.telegram_service import telegram_service

logger = logging.getLogger(__name__)

class DynamicQueueEngine:
    @staticmethod
    async def rebalance_and_promote(
        db: Session,
        campaign_id: str,
        slot_time: Optional[str] = None,
        actor_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Dynamic Queue Engine:
        Detects freed capacity in a campaign or slot, ranks waitlisted donors using ML attendance probabilities,
        and automatically promotes the top candidate to 'confirmed' status with instant Telegram notification and audit logs.
        """
        # 1. Query candidate waitlisted registrations
        query = db.query(Registration).filter(
            Registration.campaign_id == campaign_id,
            Registration.status == "waitlisted"
        )
        
        if slot_time:
            # First look for candidates requesting this specific slot
            slot_candidates = query.filter(Registration.slot_time == slot_time).all()
            if not slot_candidates:
                # If none for exact slot, look for general waitlist in campaign
                slot_candidates = query.all()
        else:
            slot_candidates = query.all()

        if not slot_candidates:
            logger.info(f"Dynamic Queue: No waitlisted donors found for campaign {campaign_id}")
            return None

        # 2. Score and Rank candidates
        # Ranking formula: predicted_attendance_score (DESC), then registration created_at (ASC)
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        
        scored_candidates = []
        for reg in slot_candidates:
            donor = db.query(User).filter(User.id == reg.donor_id).first()
            score, explanation, _ = ml_service.predict_score(reg, donor, campaign)
            reg.predicted_attendance_score = score
            reg.prediction_explanation = explanation
            reg.last_scored_at = datetime.now(timezone.utc)
            db.commit()
            
            scored_candidates.append({
                "registration": reg,
                "donor": donor,
                "score": score,
                "created_at": reg.created_at
            })

        # Sort: Highest score first, then earliest created_at
        scored_candidates.sort(key=lambda x: (-x["score"], x["created_at"]))

        selected = scored_candidates[0]
        promoted_reg: Registration = selected["registration"]
        donor: User = selected["donor"]

        before_state = {
            "registration_id": promoted_reg.id,
            "donor_name": donor.full_name if donor else "Unknown",
            "status": promoted_reg.status,
            "predicted_score": promoted_reg.predicted_attendance_score
        }

        # 3. Promote Candidate to Confirmed
        promoted_reg.status = "confirmed"
        if slot_time:
            promoted_reg.slot_time = slot_time
            
        # Re-score as confirmed donor (confirmed donors typically gain higher turnout confidence)
        new_score, new_explanation, _ = ml_service.predict_score(promoted_reg, donor, campaign)
        promoted_reg.predicted_attendance_score = new_score
        promoted_reg.prediction_explanation = f"Promoted from waitlist by Dynamic Queue Engine. {new_explanation}"
        promoted_reg.last_scored_at = datetime.now(timezone.utc)
        promoted_reg.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(promoted_reg)

        after_state = {
            "registration_id": promoted_reg.id,
            "donor_name": donor.full_name if donor else "Unknown",
            "status": promoted_reg.status,
            "promoted_slot": promoted_reg.slot_time,
            "new_predicted_score": promoted_reg.predicted_attendance_score
        }

        # 4. Audit Log Entry
        audit_service.log_event(
            db=db,
            action="waitlist.promoted",
            entity_type="registration",
            entity_id=promoted_reg.id,
            actor_id=actor_id or "queue_engine",
            actor_role="system",
            before_state=before_state,
            after_state=after_state
        )

        # 5. Send Telegram Promotion Notification
        tele_res = await telegram_service.send_mobilisation_message(
            db=db,
            donor_id=promoted_reg.donor_id,
            message_type="waitlist_promotion",
            campaign_id=campaign_id,
            registration_id=promoted_reg.id,
            actor_id=actor_id or "queue_engine"
        )

        return {
            "promoted_registration_id": promoted_reg.id,
            "donor_id": promoted_reg.donor_id,
            "donor_name": donor.full_name if donor else "Donor",
            "slot_time": promoted_reg.slot_time,
            "new_score": promoted_reg.predicted_attendance_score,
            "telegram_result": tele_res,
            "message": f"Successfully promoted {donor.full_name if donor else 'waitlisted donor'} to confirmed slot ({promoted_reg.slot_time})."
        }

queue_engine = DynamicQueueEngine()
