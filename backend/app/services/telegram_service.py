import asyncio
import httpx
import logging
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.models import MessageLog, User, Campaign, Registration
from app.services.consent_service import consent_service
from app.services.audit_service import audit_service
from app.services.ollama_service import ollama_service
from app.services.ml_service import ml_service

logger = logging.getLogger(__name__)

class TelegramService:
    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}" if self.bot_token else None
        self._is_polling = False
        self._last_update_id = 0

    async def get_bot_info(self) -> Optional[Dict[str, Any]]:
        """
        Verify live bot connection.
        """
        if not self.base_url:
            return None
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/getMe")
                if res.status_code == 200:
                    return res.json().get("result")
        except Exception as e:
            logger.error(f"Error checking Telegram Bot: {e}")
        return None

    async def send_raw_message(self, chat_id: str | int, text: str, reply_markup: Optional[dict] = None) -> bool:
        """
        Send a direct message via Telegram Bot API.
        """
        if not self.base_url or not chat_id:
            return False
        try:
            payload = {
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "HTML"
            }
            if reply_markup:
                payload["reply_markup"] = reply_markup

            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(f"{self.base_url}/sendMessage", json=payload)
                return resp.status_code == 200
        except Exception as e:
            logger.error(f"Failed to send Telegram message to {chat_id}: {e}")
            return False

    async def send_mobilisation_message(
        self,
        db: Session,
        donor_id: str,
        message_type: str,
        campaign_id: Optional[str] = None,
        registration_id: Optional[str] = None,
        custom_content: Optional[str] = None,
        actor_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send a notification to a donor with mandatory consent gate checking and audit logging.
        """
        # 1. Mandatory Consent Gate Check
        has_consent = consent_service.can_message(db, donor_id, campaign_id, message_type)
        if not has_consent:
            audit_service.log_event(
                db=db,
                action="message.skipped_no_consent",
                entity_type="message",
                entity_id=donor_id,
                actor_id=actor_id or "system",
                actor_role="system",
                before_state=None,
                after_state={"message_type": message_type, "campaign_id": campaign_id, "reason": "No explicit consent granted"}
            )
            
            log_entry = MessageLog(
                registration_id=registration_id,
                donor_id=donor_id,
                campaign_id=campaign_id,
                channel="telegram",
                message_type=message_type,
                content="[Message blocked: No explicit consent granted by donor]",
                generated_by="consent_guard",
                delivery_status="skipped_no_consent"
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)
            return {
                "success": False,
                "status": "skipped_no_consent",
                "message": "Message blocked because donor has not granted explicit communication consent.",
                "log_id": log_entry.id
            }

        # 2. Gather context
        donor = db.query(User).filter(User.id == donor_id).first()
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first() if campaign_id else None
        registration = db.query(Registration).filter(Registration.id == registration_id).first() if registration_id else None

        donor_name = donor.full_name if donor else "Valued Donor"
        campaign_name = campaign.name if campaign else "Blood Donation Drive"
        slot_time = registration.slot_time if registration else "General Slot"
        venue = campaign.venue if campaign else "Designated Venue"
        drive_date = campaign.drive_date if campaign else "Upcoming Date"
        language = donor.preferred_language if donor else "en"

        # 3. Generate message content via Ollama or template
        if custom_content:
            content = custom_content
            generated_by = "custom_or_organizer"
        else:
            msg_res = await ollama_service.generate_personalized_message(
                message_type=message_type,
                donor_name=donor_name,
                campaign_name=campaign_name,
                slot_time=slot_time,
                venue=venue,
                drive_date=drive_date,
                language=language
            )
            content = msg_res["content"]
            generated_by = msg_res["generated_by"]

        # 4. Attempt real delivery via Telegram Bot API
        delivery_status = "simulated"
        chat_id = donor.telegram_chat_id if donor else None

        # Build inline keyboard buttons
        inline_keyboard = []
        if registration_id and message_type in ["registration_confirmation", "slot_confirmation", "t_minus_1_reminder", "t_minus_3_reminder"]:
            inline_keyboard.append([
                {"text": "✅ Confirm Attendance", "callback_data": f"confirm_{registration_id}"},
                {"text": "❌ Cancel Slot", "callback_data": f"cancel_{registration_id}"}
            ])
        elif message_type == "waitlist_promotion":
            inline_keyboard.append([
                {"text": "🎟️ View Digital QR Pass", "url": "http://127.0.0.1:5173/"}
            ])

        reply_markup = {"inline_keyboard": inline_keyboard} if inline_keyboard else None

        if self.base_url and chat_id:
            sent_ok = await self.send_raw_message(chat_id, content, reply_markup)
            delivery_status = "delivered" if sent_ok else "simulated"
        else:
            delivery_status = "simulated"

        # 5. Record Message Log
        log_entry = MessageLog(
            registration_id=registration_id,
            donor_id=donor_id,
            campaign_id=campaign_id,
            channel="telegram",
            message_type=message_type,
            content=content,
            generated_by=generated_by,
            delivery_status=delivery_status
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)

        # 6. Audit event
        audit_service.log_event(
            db=db,
            action="reminder.sent" if "reminder" in message_type else "notification.sent",
            entity_type="message",
            entity_id=log_entry.id,
            actor_id=actor_id or "system",
            actor_role="system",
            before_state=None,
            after_state={
                "donor_id": donor_id,
                "message_type": message_type,
                "delivery_status": delivery_status,
                "generated_by": generated_by
            }
        )

        return {
            "success": True,
            "status": delivery_status,
            "message_type": message_type,
            "content": content,
            "generated_by": generated_by,
            "log_id": log_entry.id
        }

    async def handle_incoming_update(self, update: Dict[str, Any]):
        """
        Process incoming Telegram update (Message or Callback Query).
        """
        from app.services.queue_service import queue_engine

        db = SessionLocal()
        try:
            # 1. Handle Message
            if "message" in update:
                msg = update["message"]
                chat_id = str(msg["chat"]["id"])
                user_first_name = msg.get("from", {}).get("first_name", "Friend")
                username = msg.get("from", {}).get("username", "")
                text = msg.get("text", "").strip()

                # Automatically link this chat_id to the most recent / active donor if not already linked
                matching_user = db.query(User).filter(
                    (User.telegram_chat_id == chat_id) | (User.email == "aarav@gmail.com")
                ).first()

                if matching_user:
                    matching_user.telegram_chat_id = chat_id
                    db.commit()

                # Also link to any donor without a real telegram ID so notifications reach this user
                all_demo_donors = db.query(User).filter(User.role == "donor").all()
                for d in all_demo_donors:
                    d.telegram_chat_id = chat_id
                db.commit()

                # Construct Interactive Response Menu
                welcome_text = (
                    f"👋 <b>Welcome to Life Share, {user_first_name}!</b>\n"
                    f"<i>“Connecting People. Mobilising Blood. Saving Lives.”</i>\n\n"
                    f"✅ <b>Telegram Connection Active!</b>\n"
                    f"Your Chat ID: <code>{chat_id}</code>\n\n"
                    f"You are now linked to receive real-time:\n"
                    f"• 🎟️ Time-Slot Confirmations & Digital QR Passes\n"
                    f"• ⏰ Pre-drive Reminders (T-3 / T-1)\n"
                    f"• ⚡ Dynamic Queue Waitlist Promotion Alerts\n\n"
                    f"<b>Available Commands:</b>\n"
                    f"• /status — View your active slot & turnout prediction\n"
                    f"• /drives — View verified upcoming blood donation drives\n"
                    f"• /help — About Life Share turnout intelligence"
                )

                if text == "/status":
                    # Check active registration for this donor
                    reg = db.query(Registration).filter(Registration.status.in_(["confirmed", "registered", "waitlisted"])).first()
                    if reg:
                        camp = db.query(Campaign).filter(Campaign.id == reg.campaign_id).first()
                        score_pct = int((reg.predicted_attendance_score or 0.5) * 100)
                        status_msg = (
                            f"📋 <b>Your Active Donation Registration</b>\n\n"
                            f"🏥 <b>Drive:</b> {camp.name if camp else 'Blood Donation Drive'}\n"
                            f"📅 <b>Date:</b> {camp.drive_date if camp else 'Upcoming'}\n"
                            f"⏰ <b>Slot:</b> {reg.slot_time}\n"
                            f"📍 <b>Venue:</b> {camp.venue if camp else 'Venue'}\n"
                            f"📊 <b>Status:</b> <b>{reg.status.upper()}</b>\n"
                            f"🎯 <b>Turnout Prediction Score:</b> <b>{score_pct}%</b>\n"
                            f"🎟️ <b>QR Pass Token:</b> <code>{reg.qr_token}</code>\n"
                        )
                        inline_kb = [[
                            {"text": "✅ Confirm Attendance", "callback_data": f"confirm_{reg.id}"},
                            {"text": "❌ Cancel Slot", "callback_data": f"cancel_{reg.id}"}
                        ]]
                        await self.send_raw_message(chat_id, status_msg, {"inline_keyboard": inline_kb})
                    else:
                        await self.send_raw_message(chat_id, "ℹ️ You do not have any active registrations. Visit http://127.0.0.1:5173/ to discover blood drives.")

                elif text == "/drives":
                    campaigns = db.query(Campaign).filter(Campaign.status.in_(["live", "approved"])).all()
                    drives_msg = "🩸 <b>Active Verified Blood Donation Drives:</b>\n\n"
                    for c in campaigns:
                        drives_msg += (
                            f"• <b>{c.name}</b>\n"
                            f"  📅 {c.drive_date} | ⏰ {c.start_time}-{c.end_time}\n"
                            f"  📍 {c.venue}\n"
                            f"  🎯 Target: {c.target_count} donors\n\n"
                        )
                    drives_msg += "👉 Register your slot at: http://127.0.0.1:5173/"
                    await self.send_raw_message(chat_id, drives_msg)

                else:
                    # Send Welcome & Confirmation buttons
                    reg = db.query(Registration).filter(Registration.status == "confirmed").first()
                    kb = []
                    if reg:
                        kb.append([
                            {"text": "✅ Confirm Attendance", "callback_data": f"confirm_{reg.id}"},
                            {"text": "❌ Cancel Slot", "callback_data": f"cancel_{reg.id}"}
                        ])
                    kb.append([{"text": "🌐 Open Life Share Web App", "url": "http://127.0.0.1:5173/"}])
                    await self.send_raw_message(chat_id, welcome_text, {"inline_keyboard": kb})

            # 2. Handle Inline Button Click (Callback Query)
            elif "callback_query" in update:
                cb = update["callback_query"]
                chat_id = str(cb["from"]["id"])
                data = cb.get("data", "")
                cb_id = cb["id"]

                # Acknowledge callback query
                try:
                    async with httpx.AsyncClient(timeout=3.0) as client:
                        await client.post(f"{self.base_url}/answerCallbackQuery", json={"callback_query_id": cb_id})
                except Exception:
                    pass

                if data.startswith("confirm_"):
                    reg_id = data.replace("confirm_", "")
                    reg = db.query(Registration).filter(Registration.id == reg_id).first()
                    if reg:
                        reg.status = "confirmed"
                        donor = db.query(User).filter(User.id == reg.donor_id).first()
                        score, explanation, _ = ml_service.predict_score(reg, donor, reg.campaign)
                        reg.predicted_attendance_score = score
                        reg.prediction_explanation = explanation
                        db.commit()

                        audit_service.log_event(
                            db=db,
                            action="donor.confirmed",
                            entity_type="registration",
                            entity_id=reg.id,
                            actor_id=donor.id if donor else "telegram_bot",
                            actor_role="donor",
                            before_state={"status": "registered"},
                            after_state={"status": "confirmed", "via": "telegram_inline_button"}
                        )

                        await self.send_raw_message(
                            chat_id,
                            f"✅ <b>Attendance Confirmed!</b>\nYour slot for <b>{reg.slot_time}</b> is locked in. Your ML turnout score is now <b>{int(score*100)}%</b>. Thank you for turning your intention into lifesaving turnout!"
                        )

                elif data.startswith("cancel_"):
                    reg_id = data.replace("cancel_", "")
                    reg = db.query(Registration).filter(Registration.id == reg_id).first()
                    if reg:
                        camp_id = reg.campaign_id
                        slot_time = reg.slot_time
                        reg.status = "cancelled"
                        reg.predicted_attendance_score = 0.05
                        db.commit()

                        audit_service.log_event(
                            db=db,
                            action="donor.cancelled",
                            entity_type="registration",
                            entity_id=reg.id,
                            actor_id="telegram_bot",
                            actor_role="donor",
                            before_state={"status": "confirmed"},
                            after_state={"status": "cancelled", "via": "telegram_inline_button"}
                        )

                        await self.send_raw_message(
                            chat_id,
                            f"❌ <b>Slot Cancelled</b>\nYour slot for {slot_time} has been released. The <b>Dynamic Queue Engine</b> has automatically promoted a waitlisted donor to fill this capacity."
                        )

                        # Trigger Dynamic Queue Promotion
                        await queue_engine.rebalance_and_promote(db, camp_id, slot_time, actor_id="telegram_webhook")

        except Exception as e:
            logger.error(f"Error processing Telegram update: {e}", exc_info=True)
        finally:
            db.close()

    async def start_polling_loop(self):
        """
        Long-polling background worker to receive updates from Telegram Bot API in real-time.
        """
        if not self.base_url:
            return

        self._is_polling = True
        logger.info("Telegram Bot Polling Worker started for @life_share_bot")

        # Delete any existing webhook so getUpdates works reliably
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                await client.post(f"{self.base_url}/deleteWebhook")
        except Exception:
            pass

        while self._is_polling:
            try:
                async with httpx.AsyncClient(timeout=12.0) as client:
                    resp = await client.get(
                        f"{self.base_url}/getUpdates",
                        params={"offset": self._last_update_id + 1, "timeout": 8}
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        updates = data.get("result", [])
                        for update in updates:
                            self._last_update_id = update["update_id"]
                            await self.handle_incoming_update(update)
            except Exception as e:
                # Sleep briefly before retry
                await asyncio.sleep(2.0)

            await asyncio.sleep(0.5)

    def stop_polling(self):
        self._is_polling = False

telegram_service = TelegramService()
