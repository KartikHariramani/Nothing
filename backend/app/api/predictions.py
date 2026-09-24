from typing import Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Registration, User, Campaign
from app.services.ml_service import ml_service
from app.services.audit_service import audit_service
from app.api.auth import get_current_user

router = APIRouter(prefix="/predictions", tags=["Attendance Predictions"])

@router.post("/score/{registration_id}")
def recalculate_prediction_score(
    registration_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    On-demand re-scoring of attendance probability using Scikit-Learn model.
    """
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    donor = db.query(User).filter(User.id == reg.donor_id).first()
    campaign = db.query(Campaign).filter(Campaign.id == reg.campaign_id).first()
    
    before_score = reg.predicted_attendance_score
    score, explanation, factors = ml_service.predict_score(reg, donor, campaign)
    
    reg.predicted_attendance_score = score
    reg.prediction_explanation = explanation
    reg.last_scored_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(reg)
    
    audit_service.log_event(
        db=db,
        action="prediction.updated",
        entity_type="registration",
        entity_id=reg.id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        before_state={"score": before_score},
        after_state={"score": score, "explanation": explanation}
    )
    
    return {
        "registration_id": reg.id,
        "predicted_attendance_score": score,
        "prediction_percentage": f"{int(score * 100)}%",
        "prediction_explanation": explanation,
        "contributing_factors": factors,
        "last_scored_at": reg.last_scored_at.isoformat()
    }
