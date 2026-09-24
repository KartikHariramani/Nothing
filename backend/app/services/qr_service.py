import uuid
import io
import base64
import qrcode
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Registration, Attendance, Campaign, User
from app.services.audit_service import audit_service
from app.services.telegram_service import telegram_service

class QRService:
    @staticmethod
    def generate_qr_image_base64(qr_token: str) -> str:
        """
        Generate PNG QR code data URL containing the secure token string.
        """
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=8,
            border=2,
        )
        qr.add_data(qr_token)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")
        
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{img_str}"

    @staticmethod
    async def verify_and_checkin(
        db: Session,
        qr_token: str,
        verified_by: str,
        campaign_id: Optional[str] = None,
        checkin_method: str = "qr_scan"
    ) -> Dict[str, Any]:
        """
        Volunteer administrative attendance check-in verification.
        Validates token, enforces single-use, blocks duplicate scans, and records attendance.
        """
        # Find registration by secure token
        reg = db.query(Registration).filter(Registration.qr_token == qr_token.strip()).first()
        
        if not reg:
            return {
                "valid": False,
                "status": "invalid_token",
                "message": "Invalid QR Token. No matching registration found in Life Share."
            }

        if campaign_id and reg.campaign_id != campaign_id:
            return {
                "valid": False,
                "status": "wrong_campaign",
                "message": "This QR pass belongs to a different campaign."
            }

        # Check for Duplicate Scan
        if reg.qr_used or reg.status == "attended":
            # Audit log duplicate attempt
            audit_service.log_event(
                db=db,
                action="qr.duplicate_attempt",
                entity_type="qr",
                entity_id=reg.id,
                actor_id=verified_by,
                actor_role="volunteer",
                before_state={"qr_used": True, "status": reg.status},
                after_state={"rejected_reason": "QR Already Used"}
            )
            
            existing_att = db.query(Attendance).filter(Attendance.registration_id == reg.id).first()
            check_time_str = existing_att.checked_in_at.strftime("%I:%M %p") if existing_att and existing_att.checked_in_at else "Earlier today"
            
            return {
                "valid": False,
                "status": "already_used",
                "message": f"QR Already Used! This pass was already checked in at {check_time_str}.",
                "donor_name": reg.donor.full_name if reg.donor else "Donor",
                "slot_time": reg.slot_time
            }

        if reg.status == "cancelled":
            return {
                "valid": False,
                "status": "cancelled",
                "message": "This registration was cancelled and the slot is no longer valid."
            }

        # Valid First-time Scan
        reg.status = "attended"
        reg.qr_used = True
        reg.updated_at = datetime.now(timezone.utc)

        attendance = Attendance(
            registration_id=reg.id,
            campaign_id=reg.campaign_id,
            donor_id=reg.donor_id,
            checked_in_at=datetime.now(timezone.utc),
            verified_by=verified_by,
            checkin_method=checkin_method
        )
        db.add(attendance)
        db.commit()
        db.refresh(attendance)

        # Audit log successful check-in
        audit_service.log_event(
            db=db,
            action="attendance.checked_in",
            entity_type="attendance",
            entity_id=attendance.id,
            actor_id=verified_by,
            actor_role="volunteer",
            before_state={"status": "confirmed", "qr_used": False},
            after_state={"status": "attended", "qr_used": True, "attendance_id": attendance.id}
        )

        # Trigger Thank-You notification if consented
        await telegram_service.send_mobilisation_message(
            db=db,
            donor_id=reg.donor_id,
            message_type="thank_you",
            campaign_id=reg.campaign_id,
            registration_id=reg.id,
            actor_id=verified_by
        )

        donor_name = reg.donor.full_name if reg.donor else "Donor"
        campaign_name = reg.campaign.name if reg.campaign else "Drive"

        return {
            "valid": True,
            "status": "checked_in",
            "message": f"Attendance Confirmed for {donor_name} ({reg.slot_time})",
            "donor_name": donor_name,
            "campaign_name": campaign_name,
            "slot_time": reg.slot_time,
            "attendance_id": attendance.id,
            "checked_in_at": attendance.checked_in_at.isoformat()
        }

qr_service = QRService()
