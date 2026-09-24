# LIFE SHARE
### “Connecting People. Mobilising Blood. Saving Lives.”

> **Problem Statement**: R2-P3 — Intelligent Blood Donation Mobilisation & Turnout Platform  
> **Target Outcome**: Converting **Intention → Registration → Confirmation → Actual Arrival** through machine learning attendance prediction, explicit consent management, dynamic queue rebalancing, and QR-based attendance verification.

---

## 1. Product Vision & Continuous Mobilisation Loop

The fundamental problem in blood donation drives is not a lack of people willing to donate — it is the conversion drop-off between registration and physical attendance. Life Share powers an unbroken loop of accountability:

```
Campaign Creation 
   ↓
Admin Verification (pending → live)
   ↓
Donor Discovery & 2-Tier Explicit Consent
   ↓
Time-Slot Booking
   ↓
ML Attendance Prediction (Scikit-Learn)
   ↓
Telegram Notifications & Reminders (T-3 / T-1)
   ↓
Donor Cancellation
   ↓
Autonomous Dynamic Queue Optimization (Scored Waitlist Promotion)
   ↓
Telegram Instant Promotion Alert
   ↓
Single-Use QR Pass Check-in at Venue
   ↓
Volunteer Validation & Duplicate Scan Rejection
   ↓
Predicted vs. Actual Telemetry & Immutable Audit Trail
```

---

## 2. Product Boundary (Strict Non-Medical System)

Life Share is strictly an **intelligent campaign mobilisation and turnout layer**:
- ❌ **NOT INCLUDED**: Medical eligibility decisions, clinical screening, laboratory diagnosis, blood testing, hospital blood banking, phlebotomy collection workflow.
- ✅ **INCLUDED**: Campaign creation, administrative verification, donor time-slot booking, explicit 2-tier communication consent, machine-learning turnout prediction, automated reminders, dynamic queue rebalancing on cancellation, volunteer QR check-in, and audit logging.

---

## 3. Technology Stack

- **Backend**: Python 3.10+ / FastAPI, Pydantic, SQLAlchemy, Scikit-learn (GradientBoostingClassifier / LogisticRegression), Uvicorn.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti.
- **Database**: SQLite (built-in out-of-the-box demo mode) + PostgreSQL / Supabase with Row Level Security (RLS) migrations.
- **AI & Automation**: Local Ollama (Qwen 2.5) for campaign insights & Telegram messages with graceful template fallback; Telegram Bot API with real and simulated modes.
- **Security & Tokens**: Cryptographic single-use UUID QR passes, anti-duplicate scan prevention, salted password hashing, JWT authorization with Role-Based Access Control (RBAC).

---

## 4. Four Core User Personas (RBAC)

1. **ADMIN** (`admin@lifeshare.org` / `admin123`):
   - Review pending campaign verification queue (`Approve` / `Reject`).
   - Platform-wide telemetry (Total Drives, Donors, Check-ins, Promotions).
   - Immutable audit logs inspector.
2. **ORGANIZER** (`organizer@lifeshare.org` / `organizer123`):
   - Campaign creator with auto-segmented 30-minute time windows.
   - Live turnout analytics (Target vs. Registered vs. Confirmed vs. ML Predicted vs. Attended).
   - Dynamic slot occupancy matrix.
   - Conversational AI Campaign Assistant (Ollama / Qwen).
3. **DONOR** (`aarav@gmail.com` / `donor123`, `priya@gmail.com`, `rahul@gmail.com`, `sneha@gmail.com`):
   - Discover verified campaigns & book slots.
   - 2-Tier explicit opt-in communication consent toggles.
   - Digital QR pass with live single-use status.
   - Slot confirmation and cancellation with instant queue rebalancing.
4. **VOLUNTEER** (`volunteer@lifeshare.org` / `volunteer123`):
   - Mobile-first camera & token QR check-in scanner.
   - Instant single-use redemption (+1 verified attendance).
   - Anti-duplicate scan rejection (`⚠️ QR Already Used`).
   - Strictly zero access to medical information.

---

## 5. Quick Start (Running Locally)

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The database automatically creates and seeds realistic demonstration data on startup.*

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend will be running at `http://127.0.0.1:5173/`.*

---

## 6. Hackathon 14-Step Demo Walkthrough

Life Share includes an integrated **"1-Click Hackathon Scenario"** button in the top demo banner and a dedicated **Demo Studio (`/demo`)**:
1. **Organizer creates campaign**: *GCOEN Blood Donation Drive 2026* (Target: 200 donors). Status: `pending_verification`.
2. **Admin reviews & approves**: Status becomes `live` (Audit logged).
3. **Campaign is discoverable** publicly on `/campaigns`.
4. **Donors register & Scikit-Learn scores turnout probability**:
   - Aarav Patel (Confirmed) → 84%
   - Priya Nair (Registered) → 61%
   - Rahul Mehra (Confirmed) → 91%
   - Sneha Kulkarni (Waitlist) → 88%
5. **Telegram confirmation alerts** sent (passed explicit consent check).
6. **Aarav Patel cancels** 11:00 AM slot.
7. **Dynamic Queue Engine triggers automatically**:
   - Analyzes waitlist for 11:00 AM.
   - Identifies Sneha Kulkarni (88% score).
   - Promotes Sneha from `waitlisted` to `confirmed`.
   - Dispatches Telegram promotion alert: *"Good news! A slot has opened at 11:00 AM. Your slot is now CONFIRMED."*
8. **Volunteer scans Sneha's QR code** at venue → Attendance confirmed (+1).
9. **Duplicate scan attempt** → Rejected with *"QR Already Used"* & audited.
10. **Organizer Dashboard telemetry updates**: Predicted vs Actual, expected gap, and live activity stream.

---

## 7. Supabase Database Schema & RLS

Supabase migration script is located in `supabase/migrations/001_initial_schema.sql`:
- Tables: `profiles`, `campaigns`, `slots`, `registrations`, `consent_log`, `attendance`, `messages_log`, `audit_logs`.
- Row Level Security (RLS) policies enforce strict privacy:
  - Donors can only view/update their own profile, registrations, and consent.
  - Organizers can only manage their own campaigns and view related registrations.
  - Volunteers can only access administrative attendance check-ins.
  - Admins have platform-wide verification and audit inspection privileges.

---

## 8. License
Built for the Hackathon R2-P3 Intelligent Turnout Challenge.  
© 2026 Life Share. All rights reserved.
