import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Registration, Campaign, Slot, User, ConsentLog
from app.schemas.schemas import RegistrationCreate, RegistrationResponse, RegistrationStatusUpdate
from app.api.auth import get_current_user, get_current_organizer
from app.services.consent_service import consent_service
from app.services.ml_service import ml_service
from app.services.telegram_service import telegram_service
from app.services.queue_service import queue_engine
from app.services.audit_service import audit_service

router = APIRouter(prefix="/registrations", tags=["Registrations"])

def enrich_registration_response(reg: Registration, db: Session) -> RegistrationResponse:
    donor = db.query(User).filter(User.id == reg.donor_id).first()
    campaign = db.query(Campaign).filter(Campaign.id == reg.campaign_id).first()
    
    return RegistrationResponse(
        id=reg.id,
        campaign_id=reg.campaign_id,
        donor_id=reg.donor_id,
        slot_id=reg.slot_id,
        slot_time=reg.slot_time,
        status=reg.status,
        predicted_attendance_score=reg.predicted_attendance_score or 0.5,
        prediction_explanation=reg.prediction_explanation,
        last_scored_at=reg.last_scored_at,
        reminder_stage=reg.reminder_stage or "none",
        qr_token=reg.qr_token,
        qr_used=reg.qr_used,
        created_at=reg.created_at,
        donor_name=donor.full_name if donor else "Donor",
        donor_email=donor.email if donor else "",
        donor_phone=donor.phone if donor else "",
        campaign_name=campaign.name if campaign else "Campaign",
        campaign_venue=campaign.venue if campaign else "",
        campaign_date=campaign.drive_date if campaign else ""
    )

@router.post("", response_model=RegistrationResponse)
async def create_registration(
    reg_in: RegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Donor registers for a campaign slot with explicit consent checkboxes.
    Slot capacity is checked and allocated atomically.
    """
    donor = current_user

    # Verify Campaign
    campaign = db.query(Campaign).filter(Campaign.id == reg_in.campaign_id).first()
    if not campaign or campaign.status not in ["live", "approved"]:
        raise HTTPException(status_code=400, detail="Campaign is not active or verified for registration.")

    # Prevent duplicate active registration by the same donor for the same campaign
    existing_reg = db.query(Registration).filter(
        Registration.campaign_id == campaign.id,
        Registration.donor_id == donor.id,
        Registration.status.in_(["registered", "confirmed", "waitlisted"])
    ).first()
    if existing_reg:
        raise HTTPException(status_code=400, detail="You already have an active registration for this campaign.")

    # Record Explicit Consent
    if reg_in.consent_campaign_comm:
        consent_service.update_consent(db, donor.id, "campaign_communication", True, campaign.id, donor.id)
    if reg_in.consent_future_comm:
        consent_service.update_consent(db, donor.id, "future_campaigns", True, None, donor.id)

    # Check Slot Capacity atomically
    slot = db.query(Slot).filter(
        Slot.campaign_id == campaign.id,
        Slot.slot_time == reg_in.slot_time
    ).first()

    existing_active_regs = db.query(Registration).filter(
        Registration.campaign_id == campaign.id,
        Registration.slot_time == reg_in.slot_time,
        Registration.status.in_(["registered", "confirmed", "attended"])
    ).count()

    slot_capacity = slot.capacity if slot else campaign.max_donors_per_slot
    initial_status = "registered"
    if existing_active_regs >= slot_capacity:
        initial_status = "waitlisted"

    # Generate secure random token
    qr_token = f"LS-QR-{uuid.uuid4().hex[:12].upper()}"

    new_reg = Registration(
        campaign_id=campaign.id,
        donor_id=donor.id,
        slot_id=slot.id if slot else None,
        slot_time=reg_in.slot_time,
        status=initial_status,
        qr_token=qr_token,
        qr_used=False
    )
    db.add(new_reg)
    db.commit()
    db.refresh(new_reg)

    # Run ML Model to predict initial turnout score
    score, explanation, _ = ml_service.predict_score(new_reg, donor, campaign)
    new_reg.predicted_attendance_score = score
    new_reg.prediction_explanation = explanation
    new_reg.last_scored_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(new_reg)

    # Audit log registration
    audit_service.log_event(
        db=db,
        action="donor.registered",
        entity_type="registration",
        entity_id=new_reg.id,
        actor_id=donor.id,
        actor_role="donor",
        before_state=None,
        after_state={
            "slot": new_reg.slot_time,
            "status": new_reg.status,
            "predicted_score": score
        }
    )

    # Send confirmation/waitlist message via Telegram
    try:
        msg_type = "registration_confirmation" if initial_status == "registered" else "waitlist_notification"
        await telegram_service.send_mobilisation_message(
            db=db,
            donor_id=donor.id,
            message_type=msg_type,
            campaign_id=campaign.id,
            registration_id=new_reg.id,
            actor_id=donor.id
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Telegram service failed: {e}")

    return enrich_registration_response(new_reg, db)

@router.patch("/{registration_id}/confirm", response_model=RegistrationResponse)
async def confirm_registration(
    registration_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    # Authorization / IDOR Protection
    if current_user.role == "donor" and reg.donor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to confirm this registration.")

    before_state = {"status": reg.status, "predicted_score": reg.predicted_attendance_score}

    reg.status = "confirmed"
    reg.updated_at = datetime.now(timezone.utc)

    # Recalculate ML Score
    donor = db.query(User).filter(User.id == reg.donor_id).first()
    campaign = db.query(Campaign).filter(Campaign.id == reg.campaign_id).first()
    score, explanation, _ = ml_service.predict_score(reg, donor, campaign)
    reg.predicted_attendance_score = score
    reg.prediction_explanation = explanation
    reg.last_scored_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(reg)

    # Audit
    audit_service.log_event(
        db=db,
        action="donor.confirmed",
        entity_type="registration",
        entity_id=reg.id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        before_state=before_state,
        after_state={"status": "confirmed", "predicted_score": score}
    )

    # Telegram Slot Confirmation
    try:
        await telegram_service.send_mobilisation_message(
            db=db,
            donor_id=reg.donor_id,
            message_type="slot_confirmation",
            campaign_id=reg.campaign_id,
            registration_id=reg.id,
            actor_id=current_user.id
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Telegram service failed: {e}")

    return enrich_registration_response(reg, db)

@router.patch("/{registration_id}/cancel", response_model=RegistrationResponse)
async def cancel_registration(
    registration_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Donor cancels slot.
    Triggers immediate Dynamic Queue Engine to promote the top waitlisted candidate!
    """
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    # Authorization / IDOR Protection
    if current_user.role == "donor" and reg.donor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to cancel this registration.")

    before_state = {"status": reg.status, "slot": reg.slot_time}

    campaign_id = reg.campaign_id
    cancelled_slot_time = reg.slot_time

    reg.status = "cancelled"
    reg.predicted_attendance_score = 0.05
    reg.prediction_explanation = "Registration cancelled by donor. Slot returned to dynamic pool."
    reg.last_scored_at = datetime.now(timezone.utc)
    reg.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(reg)

    # Audit cancellation
    audit_service.log_event(
        db=db,
        action="donor.cancelled",
        entity_type="registration",
        entity_id=reg.id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        before_state=before_state,
        after_state={"status": "cancelled"}
    )

    # Send cancellation acknowledgement to donor
    try:
        await telegram_service.send_mobilisation_message(
            db=db,
            donor_id=reg.donor_id,
            message_type="cancellation_ack",
            campaign_id=campaign_id,
            registration_id=reg.id,
            actor_id=current_user.id
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Telegram service failed: {e}")

    # 🚀 TRIGGER DYNAMIC QUEUE ENGINE TO FILL FREED CAPACITY
    try:
        await queue_engine.rebalance_and_promote(
            db=db,
            campaign_id=campaign_id,
            slot_time=cancelled_slot_time,
            actor_id=current_user.id
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Queue engine failed: {e}")

    return enrich_registration_response(reg, db)

@router.get("/my", response_model=List[RegistrationResponse])
def get_my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    regs = db.query(Registration).filter(Registration.donor_id == current_user.id).order_by(Registration.created_at.desc()).all()
    return [enrich_registration_response(r, db) for r in regs]

@router.get("/campaign/{campaign_id}", response_model=List[RegistrationResponse])
def get_campaign_registrations(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if current_user.role != "admin" and campaign.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to view registrations for this campaign.")

    regs = db.query(Registration).filter(Registration.campaign_id == campaign_id).order_by(Registration.created_at.desc()).all()
    return [enrich_registration_response(r, db) for r in regs]
