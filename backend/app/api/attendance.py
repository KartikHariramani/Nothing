from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Attendance, Registration, Campaign, User
from app.schemas.schemas import QRCheckInRequest, AttendanceResponse
from app.api.auth import get_current_user, get_current_volunteer_or_admin
from app.services.qr_service import qr_service

router = APIRouter(prefix="/attendance", tags=["Attendance & QR Verification"])

@router.post("/check-in")
async def process_qr_checkin(
    checkin_in: QRCheckInRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_volunteer_or_admin)
):
    """
    Volunteer scans QR token to record administrative attendance.
    Strictly verifies single-use token, prevents duplicates, and logs all checks.
    """
    result = await qr_service.verify_and_checkin(
        db=db,
        qr_token=checkin_in.qr_token,
        verified_by=current_user.id,
        campaign_id=checkin_in.campaign_id,
        checkin_method="qr_scan"
    )
    if not result.get("valid"):
        # Return 200 with structured failure payload so volunteer scanner UI displays clear contextual alert
        return result
    return result

@router.get("/campaign/{campaign_id}", response_model=List[AttendanceResponse])
def get_campaign_attendance(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_volunteer_or_admin)
):
    attendances = db.query(Attendance).filter(Attendance.campaign_id == campaign_id).order_by(Attendance.checked_in_at.desc()).all()
    res = []
    for att in attendances:
        reg = db.query(Registration).filter(Registration.id == att.registration_id).first()
        donor = db.query(User).filter(User.id == att.donor_id).first()
        camp = db.query(Campaign).filter(Campaign.id == att.campaign_id).first()
        res.append(AttendanceResponse(
            id=att.id,
            registration_id=att.registration_id,
            campaign_id=att.campaign_id,
            donor_id=att.donor_id,
            checked_in_at=att.checked_in_at,
            verified_by=att.verified_by,
            checkin_method=att.checkin_method,
            donor_name=donor.full_name if donor else "Donor",
            campaign_name=camp.name if camp else "Campaign",
            slot_time=reg.slot_time if reg else ""
        ))
    return res

@router.get("/qr-image/{qr_token}")
def get_qr_image(qr_token: str):
    """
    Return Base64 QR code PNG for the given secure token.
    """
    data_url = qr_service.generate_qr_image_base64(qr_token)
    return {"data_url": data_url, "qr_token": qr_token}
