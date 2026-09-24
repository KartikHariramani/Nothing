from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Campaign, Registration, Attendance, User, Slot, AuditLog
from app.schemas.schemas import CampaignAnalytics
from app.api.auth import get_current_organizer_or_admin, get_current_active_admin, get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])

@router.get("/campaign/{campaign_id}", response_model=CampaignAnalytics)
def get_campaign_analytics(campaign_id: str, db: Session = Depends(get_db)):
    camp = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")

    regs = db.query(Registration).filter(Registration.campaign_id == campaign_id).all()
    attendances = db.query(Attendance).filter(Attendance.campaign_id == campaign_id).all()

    total_registered = len(regs)
    confirmed_count = len([r for r in regs if r.status == "confirmed"])
    waitlisted_count = len([r for r in regs if r.status == "waitlisted"])
    cancelled_count = len([r for r in regs if r.status == "cancelled"])
    actual_attendance = len(attendances)

    # Predicted turnout: Sum of predicted probabilities for confirmed + registered + actual attendances
    predicted_sum = 0.0
    for r in regs:
        if r.status == "attended":
            predicted_sum += 1.0
        elif r.status in ["confirmed", "registered"]:
            predicted_sum += (r.predicted_attendance_score or 0.70)

    predicted_int = int(round(predicted_sum))
    target = camp.target_count or 100
    expected_gap = max(0, target - predicted_int)

    confirmation_rate = round((confirmed_count + actual_attendance) / max(1, total_registered - waitlisted_count) * 100, 1)
    cancellation_rate = round(cancelled_count / max(1, total_registered) * 100, 1)

    # Waitlist promotions count from audit log
    waitlist_promotions = db.query(AuditLog).filter(
        AuditLog.action == "waitlist.promoted",
        AuditLog.entity_id.in_([r.id for r in regs])
    ).count()

    # Slot distribution
    slot_distribution = []
    for s in camp.slots:
        s_regs = [r for r in regs if r.slot_time == s.slot_time]
        s_confirmed = len([r for r in s_regs if r.status in ["confirmed", "attended"]])
        s_waitlisted = len([r for r in s_regs if r.status == "waitlisted"])
        s_attended = len([r for r in s_regs if r.status == "attended"])
        
        slot_distribution.append({
            "slot_time": s.slot_time,
            "capacity": s.capacity,
            "confirmed": s_confirmed,
            "waitlisted": s_waitlisted,
            "attended": s_attended,
            "occupancy_pct": min(100, round((s_confirmed / max(1, s.capacity)) * 100, 1))
        })

    # Attendance Funnel
    funnel = [
        {"stage": "Total Registered", "count": total_registered},
        {"stage": "Confirmed Donors", "count": confirmed_count + actual_attendance},
        {"stage": "Predicted Turnout", "count": predicted_int},
        {"stage": "Actual QR Check-in", "count": actual_attendance}
    ]

    # Comparison
    predicted_vs_actual = {
        "target": target,
        "predicted": predicted_int,
        "actual": actual_attendance,
        "variance": actual_attendance - predicted_int if actual_attendance > 0 else 0,
        "accuracy_rate": round(min(1.0, actual_attendance / max(1, predicted_int)) * 100, 1) if actual_attendance > 0 else None
    }

    return CampaignAnalytics(
        campaign_id=camp.id,
        campaign_name=camp.name,
        target_count=target,
        total_registered=total_registered,
        confirmed_count=confirmed_count,
        waitlisted_count=waitlisted_count,
        cancelled_count=cancelled_count,
        predicted_attendance=predicted_int,
        actual_attendance=actual_attendance,
        expected_gap=expected_gap,
        confirmation_rate=confirmation_rate,
        cancellation_rate=cancellation_rate,
        waitlist_promotions_count=waitlist_promotions,
        slot_distribution=slot_distribution,
        attendance_funnel=funnel,
        predicted_vs_actual=predicted_vs_actual
    )

@router.get("/platform/overview")
def get_platform_overview(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_active_admin)
):
    total_campaigns = db.query(Campaign).count()
    pending_campaigns = db.query(Campaign).filter(Campaign.status == "pending_verification").count()
    live_campaigns = db.query(Campaign).filter(Campaign.status == "live").count()
    completed_campaigns = db.query(Campaign).filter(Campaign.status == "completed").count()
    
    total_users = db.query(User).count()
    total_donors = db.query(User).filter(User.role == "donor").count()
    total_registrations = db.query(Registration).count()
    total_attended = db.query(Attendance).count()
    
    waitlist_promotions = db.query(AuditLog).filter(AuditLog.action == "waitlist.promoted").count()

    return {
        "total_campaigns": total_campaigns,
        "pending_campaigns": pending_campaigns,
        "live_campaigns": live_campaigns,
        "completed_campaigns": completed_campaigns,
        "total_users": total_users,
        "total_donors": total_donors,
        "total_registrations": total_registrations,
        "total_attended": total_attended,
        "waitlist_promotions": waitlist_promotions
    }
