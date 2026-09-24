from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import AIAssistantRequest, AIAssistantResponse
from app.models.models import Campaign, Registration, Attendance
from app.services.ollama_service import ollama_service
from app.api.auth import get_current_organizer_or_admin

router = APIRouter(prefix="/ai-assistant", tags=["Organizer AI Assistant"])

@router.post("/query", response_model=AIAssistantResponse)
async def query_ai_assistant(
    query_in: AIAssistantRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_organizer_or_admin)
):
    """
    AI Campaign Assistant answering organizer queries using local Ollama (Qwen) with resilient rule-based fallback.
    """
    campaign_context = {}
    if query_in.campaign_id:
        camp = db.query(Campaign).filter(Campaign.id == query_in.campaign_id).first()
        if camp:
            regs = db.query(Registration).filter(Registration.campaign_id == camp.id).all()
            attendances = db.query(Attendance).filter(Attendance.campaign_id == camp.id).all()
            
            total_registered = len(regs)
            confirmed_count = len([r for r in regs if r.status == "confirmed"])
            waitlisted_count = len([r for r in regs if r.status == "waitlisted"])
            cancelled_count = len([r for r in regs if r.status == "cancelled"])
            
            predicted_sum = sum([
                (r.predicted_attendance_score or 0.7) for r in regs if r.status in ["confirmed", "registered"]
            ]) + len(attendances)
            
            campaign_context = {
                "campaign_name": camp.name,
                "target_count": camp.target_count,
                "drive_date": camp.drive_date,
                "venue": camp.venue,
                "status": camp.status,
                "total_registered": total_registered,
                "confirmed_count": confirmed_count,
                "waitlisted_count": waitlisted_count,
                "cancelled_count": cancelled_count,
                "actual_attendance": len(attendances),
                "predicted_attendance": int(round(predicted_sum))
            }

    res = await ollama_service.answer_organizer_query(
        prompt=query_in.prompt,
        campaign_context=campaign_context
    )
    return AIAssistantResponse(**res)
