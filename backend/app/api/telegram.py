from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Registration, MessageLog, User
from app.schemas.schemas import MessageResponse
from app.api.auth import get_current_user, get_current_organizer
from app.services.telegram_service import telegram_service
from app.services.queue_service import queue_engine
from app.services.audit_service import audit_service
from app.services.ml_service import ml_service

router = APIRouter(prefix="/telegram", tags=["Telegram Bot"])

@router.get("/bot-status")
async def get_bot_status():
    """
    Check active status of the official Telegram Bot (@life_share_bot).
    """
    info = await telegram_service.get_bot_info()
    if info:
        return {
            "online": True,
            "bot_name": info.get("first_name", "LifeShare"),
            "username": f"@{info.get('username', 'life_share_bot')}",
            "bot_id": info.get("id"),
            "link": f"https://t.me/{info.get('username', 'life_share_bot')}"
        }
    return {
        "online": False,
        "bot_name": "LifeShare Bot",
        "username": "@life_share_bot",
        "link": "https://t.me/life_share_bot"
    }

@router.post("/webhook")
async def telegram_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle incoming Telegram Bot updates (callback queries from interactive inline buttons).
    """
    data = await request.json()
    
    # Check if callback_query
    if "callback_query" in data:
        callback = data["callback_query"]
        callback_data = callback.get("data", "")
        
        if callback_data.startswith("confirm_"):
            reg_id = callback_data.replace("confirm_", "")
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
                    after_state={"status": "confirmed", "via": "telegram_button"}
                )
                return {"status": "ok", "action": "confirmed", "registration_id": reg_id}
                
        elif callback_data.startswith("cancel_"):
            reg_id = callback_data.replace("cancel_", "")
            reg = db.query(Registration).filter(Registration.id == reg_id).first()
            if reg:
                campaign_id = reg.campaign_id
                slot_time = reg.slot_time
                reg.status = "cancelled"
                reg.predicted_attendance_score = 0.05
                db.commit()
                
                donor = db.query(User).filter(User.id == reg.donor_id).first()
                audit_service.log_event(
                    db=db,
                    action="donor.cancelled",
                    entity_type="registration",
                    entity_id=reg.id,
                    actor_id=donor.id if donor else "telegram_bot",
                    actor_role="donor",
                    before_state={"status": "confirmed"},
                    after_state={"status": "cancelled", "via": "telegram_button"}
                )
                
                # Auto promote waitlist
                await queue_engine.rebalance_and_promote(db, campaign_id, slot_time, actor_id="telegram_webhook")
                return {"status": "ok", "action": "cancelled", "registration_id": reg_id}

    return {"status": "ok"}

@router.post("/send-reminder/{registration_id}")
async def send_reminder(
    registration_id: str,
    reminder_type: str = "t_minus_1_reminder",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_organizer)
):
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    res = await telegram_service.send_mobilisation_message(
        db=db,
        donor_id=reg.donor_id,
        message_type=reminder_type,
        campaign_id=reg.campaign_id,
        registration_id=reg.id,
        actor_id=current_user.id
    )
    
    if res.get("success"):
        reg.reminder_stage = "t_minus_1" if "1" in reminder_type else "t_minus_3"
        db.commit()
        
    return res

@router.get("/logs", response_model=List[MessageResponse])
def get_message_logs(
    campaign_id: Optional[str] = None,
    donor_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(MessageLog)
    if current_user.role == "donor":
        query = query.filter(MessageLog.donor_id == current_user.id)
    else:
        if campaign_id:
            query = query.filter(MessageLog.campaign_id == campaign_id)
        if donor_id:
            query = query.filter(MessageLog.donor_id == donor_id)
            
    logs = query.order_by(MessageLog.sent_at.desc()).limit(100).all()
    return logs
