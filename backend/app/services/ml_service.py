from datetime import datetime, timezone
from typing import Tuple, Dict, Any, List
from app.models.models import Registration, User, Campaign

class RuleBasedAttendancePredictor:
    def __init__(self):
        pass

    def predict_score(self, registration: Registration, donor: User, campaign: Campaign) -> Tuple[float, str, List[str]]:
        """
        Calculate attendance probability score [0.0 - 1.0] using a transparent rule engine.
        """
        if registration.status == "cancelled":
            return 0.00, "Registration is cancelled.", ["Slot is marked cancelled"]
        if registration.status == "attended":
            return 1.00, "Donor has already completed physical QR check-in.", ["Attendance verified"]
        if registration.status == "no_show":
            return 0.00, "Donor did not show up.", ["Marked as no show"]

        score = 50.0  # Base Score
        factors = []
        
        is_confirmed = (registration.status == "confirmed")
        previous_donations = donor.previous_donations_count if donor and donor.previous_donations_count else 0
        has_telegram = 1 if (donor and donor.telegram_chat_id) else 0
        reminder_responsive = 1 if (registration.reminder_stage in ["t_minus_1", "t_day"] or is_confirmed) else 0

        # Calculate time difference
        hours_before = 48.0
        if campaign and campaign.drive_date:
            try:
                drive_dt = datetime.strptime(f"{campaign.drive_date} {campaign.start_time}", "%Y-%m-%d %H:%M")
                now = datetime.now()
                delta = drive_dt - now
                hours_before = max(1.0, delta.total_seconds() / 3600.0)
            except Exception:
                pass

        if is_confirmed:
            score += 25.0
            factors.append("Confirmed attendance (+25)")
        else:
            factors.append("Awaiting final slot confirmation (+0)")

        if reminder_responsive:
            score += 10.0
            factors.append("Responded to reminder (+10)")

        if previous_donations > 0:
            score += 8.0
            factors.append(f"Previous successful participation ({previous_donations}) (+8)")

        if has_telegram:
            score += 5.0
            factors.append("Connected Telegram (+5)")

        if hours_before < 24 and not is_confirmed:
            score -= 10.0
            factors.append("Registration old without confirmation (-10)")

        # clamp
        score = max(0.0, min(100.0, score))
        prob = score / 100.0

        if prob >= 0.80:
            explanation = f"High turnout probability ({int(score)}%). Driven by positive engagement signals."
        elif prob >= 0.60:
            explanation = f"Moderate turnout probability ({int(score)}%). Awaiting pre-drive reminder response to confirm attendance."
        else:
            explanation = f"Turnout risk detected ({int(score)}%). Follow-up reminder needed."
            
        return round(prob, 2), explanation, factors

ml_service = RuleBasedAttendancePredictor()
