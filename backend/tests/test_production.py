import pytest
import asyncio
import uuid
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import app
from app.models.models import User, Campaign, Slot, Registration, ConsentLog, Attendance, AuditLog
from app.core.security import get_password_hash, create_access_token
from app.services.consent_service import consent_service
from app.services.qr_service import qr_service

TEST_DB_FILE = "./test_lifeshare.db"
if os.path.exists(TEST_DB_FILE):
    os.remove(TEST_DB_FILE)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass

class UserDto:
    def __init__(self, user_id, email, role, full_name):
        self.id = user_id
        self.email = email
        self.role = role
        self.full_name = full_name

def create_user_record(email: str, role: str, name: str):
    db = TestingSessionLocal()
    try:
        user_id = str(uuid.uuid4())
        u = User(
            id=user_id,
            email=email.lower(),
            hashed_password=get_password_hash("password123"),
            role=role,
            full_name=name,
            preferred_language="en",
            previous_donations_count=2
        )
        db.add(u)
        db.commit()
        return UserDto(user_id, email.lower(), role, name)
    finally:
        db.close()

def get_auth_header(user: UserDto):
    token = create_access_token(data={"sub": user.id, "role": user.role, "email": user.email})
    return {"Authorization": f"Bearer {token}"}

# ==========================================
# 1. AUTH & RBAC TESTS
# ==========================================
def test_user_registration_and_login():
    unique_email = f"donor_{uuid.uuid4().hex[:6]}@test.com"
    # Register as donor
    res = client.post("/api/v1/auth/register", json={
        "email": unique_email,
        "password": "securepassword123",
        "full_name": "Test Donor",
        "role": "donor",
        "phone": "+91 99999 11111"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "donor"

    # Attempt to self-register as admin (Must be sanitized to donor)
    hacker_email = f"hacker_{uuid.uuid4().hex[:6]}@test.com"
    res_admin = client.post("/api/v1/auth/register", json={
        "email": hacker_email,
        "password": "securepassword123",
        "full_name": "Hacker",
        "role": "admin"
    })
    assert res_admin.status_code == 200
    assert res_admin.json()["user"]["role"] == "donor"

    # Login
    res_login = client.post("/api/v1/auth/login", json={
        "email": unique_email,
        "password": "securepassword123"
    })
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

def test_rbac_restrictions():
    donor = create_user_record(f"donor_{uuid.uuid4().hex[:6]}@test.com", "donor", "Donor One")
    admin = create_user_record(f"admin_{uuid.uuid4().hex[:6]}@test.com", "admin", "Admin One")

    donor_headers = get_auth_header(donor)
    admin_headers = get_auth_header(admin)

    # Donor attempts to access admin endpoint -> 403 Forbidden
    res_forbidden = client.get("/api/v1/campaigns/admin/all", headers=donor_headers)
    assert res_forbidden.status_code == 403

    # Admin accesses admin endpoint -> 200 OK
    res_admin = client.get("/api/v1/campaigns/admin/all", headers=admin_headers)
    assert res_admin.status_code == 200

# ==========================================
# 2. CONCURRENT SLOT BOOKING & WAITLIST
# ==========================================
def test_slot_capacity_and_dynamic_waitlist():
    organizer = create_user_record(f"org_{uuid.uuid4().hex[:6]}@test.com", "organizer", "Organizer One")
    donor1 = create_user_record(f"d1_{uuid.uuid4().hex[:6]}@test.com", "donor", "Donor Alpha")
    donor2 = create_user_record(f"d2_{uuid.uuid4().hex[:6]}@test.com", "donor", "Donor Beta")

    camp_id = str(uuid.uuid4())
    db = TestingSessionLocal()
    try:
        camp = Campaign(
            id=camp_id,
            organizer_id=organizer.id,
            name="Capacity Limit Test Camp",
            drive_date="2026-10-15",
            start_time="10:00",
            end_time="11:00",
            venue="Community Center",
            target_count=10,
            slot_duration=30,
            max_donors_per_slot=1,
            status="live"
        )
        db.add(camp)

        slot = Slot(
            id=str(uuid.uuid4()),
            campaign_id=camp_id,
            slot_time="10:00 - 10:30",
            start_time="10:00",
            end_time="10:30",
            capacity=1,
            status="available"
        )
        db.add(slot)
        db.commit()
    finally:
        db.close()

    # Donor 1 registers for the slot -> Status should be 'registered'
    h1 = get_auth_header(donor1)
    res1 = client.post("/api/v1/registrations", json={
        "campaign_id": camp_id,
        "slot_time": "10:00 - 10:30",
        "consent_campaign_comm": True,
        "consent_future_comm": True
    }, headers=h1)
    assert res1.status_code == 200
    assert res1.json()["status"] == "registered"

    # Donor 2 attempts to register for the exact same full slot -> Status should be 'waitlisted'
    h2 = get_auth_header(donor2)
    res2 = client.post("/api/v1/registrations", json={
        "campaign_id": camp_id,
        "slot_time": "10:00 - 10:30",
        "consent_campaign_comm": True,
        "consent_future_comm": True
    }, headers=h2)
    assert res2.status_code == 200
    assert res2.json()["status"] == "waitlisted"

    # ==========================================
    # 3. CANCELLATION & DYNAMIC QUEUE PROMOTION
    # ==========================================
    reg1_id = res1.json()["id"]
    reg2_id = res2.json()["id"]

    # Donor 1 cancels their slot
    cancel_res = client.patch(f"/api/v1/registrations/{reg1_id}/cancel", headers=h1)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # Verify that Dynamic Queue Engine automatically promoted Donor 2 to 'confirmed'
    db = TestingSessionLocal()
    try:
        reg2_db = db.query(Registration).filter(Registration.id == reg2_id).first()
        assert reg2_db.status == "confirmed"
        
        # Verify Audit Log
        promoted_audit = db.query(AuditLog).filter(
            AuditLog.action == "waitlist.promoted",
            AuditLog.entity_id == reg2_id
        ).first()
        assert promoted_audit is not None
    finally:
        db.close()

# ==========================================
# 4. CONSENT GATE & MESSAGE BLOCKING
# ==========================================
def test_consent_gate_enforcement():
    donor = create_user_record(f"noconsent_{uuid.uuid4().hex[:6]}@test.com", "donor", "No Consent User")

    db = TestingSessionLocal()
    try:
        # Consent is False
        can_send = consent_service.can_message(db, donor.id, None, "t_minus_1_reminder")
        assert can_send is False

        # Grant consent
        consent_service.update_consent(db, donor.id, "campaign_communication", True, None, donor.id)
        can_send_now = consent_service.can_message(db, donor.id, None, "t_minus_1_reminder")
        assert can_send_now is True
    finally:
        db.close()

# ==========================================
# 5. SINGLE-USE QR ATTENDANCE & ANTI-DUPLICATE
# ==========================================
def test_single_use_qr_checkin():
    async def run_qr_test():
        organizer = create_user_record(f"org_qr_{uuid.uuid4().hex[:6]}@test.com", "organizer", "Org QR")
        volunteer = create_user_record(f"vol_qr_{uuid.uuid4().hex[:6]}@test.com", "volunteer", "Vol QR")
        donor = create_user_record(f"donor_qr_{uuid.uuid4().hex[:6]}@test.com", "donor", "Donor QR")

        camp_id = str(uuid.uuid4())
        qr_token = f"LS-QR-{uuid.uuid4().hex[:12].upper()}"
        reg_id = str(uuid.uuid4())

        db = TestingSessionLocal()
        try:
            camp = Campaign(
                id=camp_id,
                organizer_id=organizer.id,
                name="QR Verification Camp",
                drive_date="2026-10-15",
                start_time="10:00",
                end_time="12:00",
                venue="Medical Center",
                status="live"
            )
            db.add(camp)

            reg = Registration(
                id=reg_id,
                campaign_id=camp_id,
                donor_id=donor.id,
                slot_time="10:00 - 10:30",
                status="confirmed",
                qr_token=qr_token,
                qr_used=False
            )
            db.add(reg)
            db.commit()

            # 1. First Scan (Valid)
            res1 = await qr_service.verify_and_checkin(
                db=db,
                qr_token=qr_token,
                verified_by=volunteer.id,
                campaign_id=camp_id
            )
            assert res1["valid"] is True
            assert res1["status"] == "checked_in"

            # Verify registration marked attended and qr_used=True
            db.refresh(reg)
            assert reg.status == "attended"
            assert reg.qr_used is True

            # 2. Duplicate Scan Attempt (Must be rejected)
            res2 = await qr_service.verify_and_checkin(
                db=db,
                qr_token=qr_token,
                verified_by=volunteer.id,
                campaign_id=camp_id
            )
            assert res2["valid"] is False
            assert res2["status"] == "already_used"

            # Verify duplicate attempt audit log exists
            dup_audit = db.query(AuditLog).filter(
                AuditLog.action == "qr.duplicate_attempt",
                AuditLog.entity_id == reg_id
            ).first()
            assert dup_audit is not None
        finally:
            db.close()

    asyncio.run(run_qr_test())
