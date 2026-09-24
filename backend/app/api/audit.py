from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import AuditLog
from app.schemas.schemas import AuditLogResponse
from app.core.security import security_bearer

router = APIRouter(prefix="/audit", tags=["Audit Trail & Activity"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_logs(
    entity_type: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    """
    Retrieve chronological audit logs for platform transparency and verification inspection.
    """
    query = db.query(AuditLog)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
        
    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs

@router.get("/activity-feed")
def get_live_activity_feed(
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db)
):
    """
    Real-time formatted activity feed for live dashboard streams during hackathon demonstrations.
    """
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    
    feed = []
    action_titles = {
        "campaign.created": "Campaign Created",
        "campaign.approved": "Admin Verified Campaign",
        "campaign.rejected": "Campaign Rejected",
        "donor.registered": "Donor Registered",
        "donor.confirmed": "Slot Confirmed",
        "donor.cancelled": "Slot Cancelled",
        "prediction.updated": "ML Turnout Rescored",
        "waitlist.promoted": "Dynamic Queue: Waitlist Promoted",
        "attendance.checked_in": "QR Check-in Verified",
        "qr.duplicate_attempt": "Duplicate QR Rejected",
        "notification.sent": "Telegram Alert Dispatched",
        "reminder.sent": "Automated Reminder Sent",
        "message.skipped_no_consent": "Message Blocked (No Consent)",
        "consent.updated": "Donor Consent Granted",
        "consent.revoked": "Donor Consent Revoked"
    }

    action_colors = {
        "campaign.approved": "emerald",
        "donor.confirmed": "emerald",
        "attendance.checked_in": "emerald",
        "waitlist.promoted": "indigo",
        "donor.cancelled": "rose",
        "qr.duplicate_attempt": "amber",
        "prediction.updated": "sky",
        "notification.sent": "blue",
        "message.skipped_no_consent": "amber"
    }

    for item in logs:
        feed.append({
            "id": item.id,
            "title": action_titles.get(item.action, item.action.replace(".", " ").title()),
            "action": item.action,
            "entity_type": item.entity_type,
            "entity_id": item.entity_id,
            "actor_role": item.actor_role or "system",
            "created_at": item.created_at.isoformat(),
            "time_str": item.created_at.strftime("%I:%M:%S %p"),
            "color": action_colors.get(item.action, "slate"),
            "before_state": item.before_state,
            "after_state": item.after_state
        })

    return feed
