import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Campaign, Slot, Registration, User
from app.schemas.schemas import CampaignCreate, CampaignResponse, CampaignStatusUpdate, SlotResponse, CampaignUpdate
from app.api.auth import get_current_user, get_current_active_admin, get_current_organizer
from app.services.audit_service import audit_service
from app.services.ml_service import ml_service

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

def enrich_campaign_response(camp: Campaign, db: Session) -> CampaignResponse:
    # Get registrations
    regs = db.query(Registration).filter(Registration.campaign_id == camp.id).all()
    registered_count = len([r for r in regs if r.status in ["registered", "confirmed", "attended"]])
    confirmed_count = len([r for r in regs if r.status in ["confirmed", "attended"]])
    waitlisted_count = len([r for r in regs if r.status == "waitlisted"])
    attended_count = len([r for r in regs if r.status == "attended"])
    
    # Calculate predicted attendance sum
    predicted_sum = 0.0
    for r in regs:
        if r.status in ["confirmed", "registered"]:
            predicted_sum += (r.predicted_attendance_score or 0.7)
        elif r.status == "attended":
            predicted_sum += 1.0

    # Build slot responses
    slots_data = []
    for s in camp.slots:
        slot_regs = [r for r in regs if r.slot_time == s.slot_time and r.status in ["confirmed", "registered", "attended"]]
        slot_waitlist = [r for r in regs if r.slot_time == s.slot_time and r.status == "waitlisted"]
        
        slot_status = "available"
        if len(slot_regs) >= s.capacity:
            slot_status = "waitlist"
            
        slots_data.append(SlotResponse(
            id=s.id,
            campaign_id=s.campaign_id,
            slot_time=s.slot_time,
            start_time=s.start_time,
            end_time=s.end_time,
            capacity=s.capacity,
            status=slot_status,
            booked_count=len(slot_regs),
            waitlist_count=len(slot_waitlist)
        ))

    organizer = db.query(User).filter(User.id == camp.organizer_id).first()
    organizer_name = organizer.full_name if organizer else "Organizer"

    resp = CampaignResponse(
        id=camp.id,
        organizer_id=camp.organizer_id,
        name=camp.name,
        description=camp.description,
        drive_date=camp.drive_date,
        start_time=camp.start_time,
        end_time=camp.end_time,
        venue=camp.venue,
        target_count=camp.target_count,
        slot_duration=camp.slot_duration,
        max_donors_per_slot=camp.max_donors_per_slot,
        organizer_contact=camp.organizer_contact,
        info_link=camp.info_link,
        status=camp.status,
        rejection_reason=camp.rejection_reason,
        created_at=camp.created_at,
        slots=slots_data,
        registered_count=registered_count,
        confirmed_count=confirmed_count,
        waitlisted_count=waitlisted_count,
        predicted_attendance=int(round(predicted_sum)),
        attended_count=attended_count,
        organizer_name=organizer_name
    )
    return resp

@router.get("", response_model=List[CampaignResponse])
def get_campaigns(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Public or filtered campaign discovery. By default, public sees live/approved drives.
    """
    query = db.query(Campaign)
    
    if status_filter:
        query = query.filter(Campaign.status == status_filter)
    else:
        # Default public discovery
        query = query.filter(Campaign.status.in_(["live", "approved"]))

    if search:
        s = f"%{search}%"
        query = query.filter((Campaign.name.ilike(s)) | (Campaign.venue.ilike(s)))

    campaigns = query.order_by(Campaign.drive_date.asc()).all()
    return [enrich_campaign_response(c, db) for c in campaigns]

@router.get("/admin/all", response_model=List[CampaignResponse])
def get_all_campaigns_admin(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_active_admin)
):
    campaigns = db.query(Campaign).order_by(Campaign.created_at.desc()).all()
    return [enrich_campaign_response(c, db) for c in campaigns]

@router.get("/organizer/mine", response_model=List[CampaignResponse])
def get_my_campaigns_organizer(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer)
):
    campaigns = db.query(Campaign).filter(Campaign.organizer_id == current_user.id).order_by(Campaign.created_at.desc()).all()
    return [enrich_campaign_response(c, db) for c in campaigns]

@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign_by_id(campaign_id: str, db: Session = Depends(get_db)):
    camp = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return enrich_campaign_response(camp, db)

@router.post("", response_model=CampaignResponse)
def create_campaign(
    campaign_in: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer)
):
    """
    Create campaign. Automatically segments time windows into slots and sets status to pending_verification.
    """
    new_campaign = Campaign(
        organizer_id=current_user.id,
        name=campaign_in.name,
        description=campaign_in.description,
        drive_date=campaign_in.drive_date,
        start_time=campaign_in.start_time,
        end_time=campaign_in.end_time,
        venue=campaign_in.venue,
        target_count=campaign_in.target_count,
        slot_duration=campaign_in.slot_duration or 30,
        max_donors_per_slot=campaign_in.max_donors_per_slot or 15,
        organizer_contact=campaign_in.organizer_contact or current_user.email,
        info_link=campaign_in.info_link,
        status="pending_verification" # Strict verification workflow
    )
    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)

    # Generate Time Slots automatically
    try:
        start_dt = datetime.strptime(campaign_in.start_time, "%H:%M")
        end_dt = datetime.strptime(campaign_in.end_time, "%H:%M")
        cur_dt = start_dt
        duration = timedelta(minutes=new_campaign.slot_duration)
        
        while cur_dt + duration <= end_dt:
            next_dt = cur_dt + duration
            slot_str = f"{cur_dt.strftime('%H:%M')} - {next_dt.strftime('%H:%M')}"
            slot = Slot(
                campaign_id=new_campaign.id,
                slot_time=slot_str,
                start_time=cur_dt.strftime("%H:%M"),
                end_time=next_dt.strftime("%H:%M"),
                capacity=new_campaign.max_donors_per_slot,
                status="available"
            )
            db.add(slot)
            cur_dt = next_dt
        db.commit()
    except Exception:
        # Default single slot if time parsing fails
        slot = Slot(
            campaign_id=new_campaign.id,
            slot_time=f"{campaign_in.start_time} - {campaign_in.end_time}",
            start_time=campaign_in.start_time,
            end_time=campaign_in.end_time,
            capacity=new_campaign.max_donors_per_slot,
            status="available"
        )
        db.add(slot)
        db.commit()

    db.refresh(new_campaign)

    audit_service.log_event(
        db=db,
        action="campaign.created",
        entity_type="campaign",
        entity_id=new_campaign.id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        before_state=None,
        after_state={"name": new_campaign.name, "venue": new_campaign.venue, "status": new_campaign.status}
    )

    return enrich_campaign_response(new_campaign, db)

@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(
    campaign_id: str,
    camp_in: CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer)
):
    camp = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Ownership verification
    if current_user.role != "admin" and camp.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to edit this campaign.")

    before_state = {
        "name": camp.name,
        "venue": camp.venue,
        "drive_date": camp.drive_date,
        "start_time": camp.start_time,
        "end_time": camp.end_time,
        "target_count": camp.target_count
    }

    if camp_in.name is not None:
        camp.name = camp_in.name
    if camp_in.description is not None:
        camp.description = camp_in.description
    if camp_in.drive_date is not None:
        camp.drive_date = camp_in.drive_date
    if camp_in.start_time is not None:
        camp.start_time = camp_in.start_time
    if camp_in.end_time is not None:
        camp.end_time = camp_in.end_time
    if camp_in.venue is not None:
        camp.venue = camp_in.venue
    if camp_in.target_count is not None:
        camp.target_count = camp_in.target_count
    if camp_in.organizer_contact is not None:
        camp.organizer_contact = camp_in.organizer_contact
    if camp_in.info_link is not None:
        camp.info_link = camp_in.info_link

    camp.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(camp)

    audit_service.log_event(
        db=db,
        action="campaign.updated",
        entity_type="campaign",
        entity_id=camp.id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        before_state=before_state,
        after_state={
            "name": camp.name,
            "venue": camp.venue,
            "drive_date": camp.drive_date,
            "start_time": camp.start_time,
            "end_time": camp.end_time,
            "target_count": camp.target_count
        }
    )

    return enrich_campaign_response(camp, db)

@router.post("/{campaign_id}/approve", response_model=CampaignResponse)
def approve_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_active_admin)
):
    camp = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")

    before_state = {"status": camp.status}
    camp.status = "live"
    camp.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(camp)

    audit_service.log_event(
        db=db,
        action="campaign.approved",
        entity_type="campaign",
        entity_id=camp.id,
        actor_id=admin_user.id,
        actor_role="admin",
        before_state=before_state,
        after_state={"status": "live"}
    )

    return enrich_campaign_response(camp, db)

@router.post("/{campaign_id}/reject", response_model=CampaignResponse)
def reject_campaign(
    campaign_id: str,
    status_update: CampaignStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_active_admin)
):
    camp = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")

    before_state = {"status": camp.status}
    camp.status = "rejected"
    camp.rejection_reason = status_update.rejection_reason or "Does not meet community guidelines."
    camp.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(camp)

    audit_service.log_event(
        db=db,
        action="campaign.rejected",
        entity_type="campaign",
        entity_id=camp.id,
        actor_id=admin_user.id,
        actor_role="admin",
        before_state=before_state,
        after_state={"status": "rejected", "rejection_reason": camp.rejection_reason}
    )

    return enrich_campaign_response(camp, db)
