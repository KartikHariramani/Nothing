from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import ConsentLog, User
from app.schemas.schemas import ConsentUpdate, ConsentResponse
from app.api.auth import get_current_user
from app.services.consent_service import consent_service

router = APIRouter(prefix="/consent", tags=["Consent Management"])

@router.get("/my", response_model=List[ConsentResponse])
def get_my_consent_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current donor's communication consent logs and settings.
    """
    logs = db.query(ConsentLog).filter(ConsentLog.donor_id == current_user.id).order_by(ConsentLog.changed_at.desc()).all()
    return logs

@router.post("/update", response_model=ConsentResponse)
def update_donor_consent(
    consent_data: ConsentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Explicitly grant or revoke communication consent for campaign or future notifications.
    """
    updated = consent_service.update_consent(
        db=db,
        donor_id=current_user.id,
        consent_type=consent_data.consent_type,
        granted=consent_data.granted,
        campaign_id=consent_data.campaign_id,
        actor_id=current_user.id
    )
    return updated
