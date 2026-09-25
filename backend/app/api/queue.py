from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_organizer, get_current_user
from app.models.models import User
from app.services.queue_service import queue_engine

router = APIRouter(prefix="/queue", tags=["Dynamic Queue Engine"])

@router.post("/rebalance/{campaign_id}")
async def trigger_queue_rebalance(
    campaign_id: str,
    slot_time: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually or programmatically trigger Dynamic Queue optimization to promote the best waitlisted candidate.
    """
    result = await queue_engine.rebalance_and_promote(
        db=db,
        campaign_id=campaign_id,
        slot_time=slot_time,
        actor_id=current_user.id
    )
    if not result:
        return {"promoted": False, "message": "No waitlisted candidates available or no capacity needs filling."}
    return {"promoted": True, "details": result}
