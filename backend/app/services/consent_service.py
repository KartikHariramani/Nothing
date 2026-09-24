from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import ConsentLog, User
from app.services.audit_service import audit_service

class ConsentService:
    @staticmethod
    def can_message(
        db: Session,
        donor_id: str,
        campaign_id: Optional[str],
        message_type: str
    ) -> bool:
        """
        Central gatekeeper function: Checks explicit donor consent before any message can be created or sent.
        If message_type is related to a specific campaign, checks 'campaign_communication' consent for that campaign.
        If message_type is a future campaign broadcast, checks 'future_campaigns' consent.
        """
        if message_type in [
            "registration_confirmation",
            "slot_confirmation",
            "t_minus_3_reminder",
            "t_minus_1_reminder",
            "cancellation_ack",
            "waitlist_promotion",
            "slot_change",
            "thank_you"
        ]:
            # Campaign specific consent
            consent = db.query(ConsentLog).filter(
                ConsentLog.donor_id == donor_id,
                ConsentLog.consent_type == "campaign_communication",
                (ConsentLog.campaign_id == campaign_id) | (ConsentLog.campaign_id.is_(None))
            ).order_by(ConsentLog.changed_at.desc()).first()
            
            if consent and consent.granted:
                return True
            return False
            
        elif message_type in ["future_broadcast", "community_alert"]:
            consent = db.query(ConsentLog).filter(
                ConsentLog.donor_id == donor_id,
                ConsentLog.consent_type == "future_campaigns"
            ).order_by(ConsentLog.changed_at.desc()).first()
            
            if consent and consent.granted:
                return True
            return False
            
        return False

    @staticmethod
    def update_consent(
        db: Session,
        donor_id: str,
        consent_type: str,
        granted: bool,
        campaign_id: Optional[str] = None,
        actor_id: Optional[str] = None
    ) -> ConsentLog:
        """
        Record granted or revoked consent with full audit logging.
        """
        consent_entry = ConsentLog(
            donor_id=donor_id,
            consent_type=consent_type,
            campaign_id=campaign_id,
            granted=granted
        )
        db.add(consent_entry)
        db.commit()
        db.refresh(consent_entry)
        
        # Log to audit trail
        audit_service.log_event(
            db=db,
            action="consent.updated" if granted else "consent.revoked",
            entity_type="consent",
            entity_id=consent_entry.id,
            actor_id=actor_id or donor_id,
            actor_role="donor",
            before_state=None,
            after_state={"consent_type": consent_type, "granted": granted, "campaign_id": campaign_id}
        )
        return consent_entry

consent_service = ConsentService()
