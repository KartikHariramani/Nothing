import numpy as np
import pandas as pd
from datetime import datetime, timezone
from typing import Tuple, Dict, Any, List
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from app.models.models import Registration, User, Campaign

class MLAttendancePredictor:
    def __init__(self):
        self.model = None
        self._initialize_and_train_baseline_model()

    def _generate_synthetic_training_data(self, n_samples: int = 1500) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic RSVP and turnout training data reflecting real-world public health mobilisation trends:
        - Donors who explicitly confirm have ~85-95% attendance probability.
        - Previous repeat donors have significantly higher arrival rates.
        - Connected telegram/responsive donors have higher arrival rates.
        - Unconfirmed registrations closer to event date without confirmation have lower arrival rates.
        """
        np.random.seed(42)
        
        # Features:
        # [0] is_confirmed (0 = registered only, 1 = explicitly confirmed)
        # [1] previous_donations_count (0 to 15)
        # [2] has_telegram_connected (0 or 1)
        # [3] reminder_responsive (0 or 1)
        # [4] hours_before_drive_registered (1 to 168)
        # [5] is_morning_slot (0 or 1)
        
        is_confirmed = np.random.choice([0, 1], size=n_samples, p=[0.35, 0.65])
        previous_donations = np.random.poisson(lam=2.5, size=n_samples)
        has_telegram = np.random.choice([0, 1], size=n_samples, p=[0.25, 0.75])
        reminder_responsive = np.where(is_confirmed == 1, np.random.choice([0, 1], size=n_samples, p=[0.1, 0.9]), np.random.choice([0, 1], size=n_samples, p=[0.6, 0.4]))
        hours_before = np.random.uniform(2, 168, size=n_samples)
        is_morning = np.random.choice([0, 1], size=n_samples, p=[0.45, 0.55])
        
        X = np.column_stack([
            is_confirmed,
            previous_donations,
            has_telegram,
            reminder_responsive,
            hours_before / 168.0, # Normalized
            is_morning
        ])
        
        # Log-odds calculation
        logits = (
            -1.2 +
            2.3 * is_confirmed +
            0.35 * np.minimum(previous_donations, 6) +
            0.65 * has_telegram +
            1.1 * reminder_responsive +
            0.2 * (hours_before / 168.0) +
            0.2 * is_morning
        )
        probabilities = 1.0 / (1.0 + np.exp(-logits))
        y = (np.random.rand(n_samples) < probabilities).astype(int)
        
        return X, y

    def _initialize_and_train_baseline_model(self):
        """
        Train Scikit-Learn GradientBoostingClassifier on baseline mobilisation data.
        """
        X, y = self._generate_synthetic_training_data()
        self.model = GradientBoostingClassifier(n_estimators=60, max_depth=3, random_state=42)
        self.model.fit(X, y)

    def extract_features(self, registration: Registration, donor: User, campaign: Campaign) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Extract numerical features and metadata descriptors from database models.
        """
        is_confirmed = 1 if registration.status == "confirmed" else (0 if registration.status in ["registered", "waitlisted"] else 0)
        previous_donations = donor.previous_donations_count if donor and donor.previous_donations_count else 0
        has_telegram = 1 if (donor and donor.telegram_chat_id) else 0
        reminder_responsive = 1 if (registration.reminder_stage in ["t_minus_1", "t_day"] or registration.status == "confirmed") else 0
        
        # Calculate time difference
        hours_before = 48.0
        if campaign and campaign.drive_date:
            try:
                drive_dt = datetime.strptime(f"{campaign.drive_date} {campaign.start_time}", "%Y-%m-%d %H:%M")
                now = datetime.now()
                delta = drive_dt - now
                hours_before = max(1.0, delta.total_seconds() / 3600.0)
            except Exception:
                hours_before = 48.0
                
        is_morning = 1 if registration.slot_time and ("10:" in registration.slot_time or "11:" in registration.slot_time or "09:" in registration.slot_time) else 0
        
        features_array = np.array([[
            is_confirmed,
            previous_donations,
            has_telegram,
            reminder_responsive,
            min(1.0, hours_before / 168.0),
            is_morning
        ]])
        
        metadata = {
            "is_confirmed": bool(is_confirmed),
            "previous_donations": int(previous_donations),
            "has_telegram": bool(has_telegram),
            "reminder_responsive": bool(reminder_responsive),
            "hours_before": round(hours_before, 1),
            "is_morning": bool(is_morning)
        }
        
        return features_array, metadata

    def predict_score(self, registration: Registration, donor: User, campaign: Campaign) -> Tuple[float, str, List[str]]:
        """
        Calculate attendance probability score [0.0 - 1.0] and generating key explanatory factors.
        """
        if registration.status == "cancelled":
            return 0.05, "Registration is cancelled.", ["Slot is marked cancelled"]
        if registration.status == "attended":
            return 1.0, "Donor has already completed physical QR check-in.", ["Attendance verified"]
            
        feats, meta = self.extract_features(registration, donor, campaign)
        
        prob = float(self.model.predict_proba(feats)[0][1])
        # Bound sensibly
        prob = max(0.15, min(0.98, prob))
        
        # Construct explanatory factor items
        factors = []
        if meta["is_confirmed"]:
            factors.append("Explicit slot confirmation provided")
        else:
            factors.append("Awaiting final slot confirmation")
            
        if meta["previous_donations"] > 0:
            factors.append(f"Proven donor reliability ({meta['previous_donations']} previous donations)")
        if meta["has_telegram"]:
            factors.append("Direct Telegram channel connected for automated reminders")
            
        if prob >= 0.80:
            explanation = f"High turnout probability ({int(prob*100)}%). Driven by explicit confirmation and strong communication engagement."
        elif prob >= 0.60:
            explanation = f"Moderate turnout probability ({int(prob*100)}%). Awaiting pre-drive reminder response to confirm attendance."
        else:
            explanation = f"Turnout risk detected ({int(prob*100)}%). Follow-up reminder needed to secure slot commitment."
            
        return round(prob, 2), explanation, factors

ml_service = MLAttendancePredictor()
