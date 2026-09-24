import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.models import User, Campaign, Slot, Registration, ConsentLog, Attendance, MessageLog, AuditLog
from app.core.security import get_password_hash

def seed_database(db: Session):
    """
    Populate realistic, high-fidelity demo data for Life Share hackathon evaluation.
    """
    # Check if already seeded
    existing_admin = db.query(User).filter(User.email == "admin@lifeshare.org").first()
    if existing_admin:
        return

    now = datetime.now(timezone.utc)
    drive_date = (now + timedelta(days=5)).strftime("%Y-%m-%d")

    # 1. Create Core Users
    admin_user = User(
        id=str(uuid.uuid4()),
        email="admin@lifeshare.org",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        full_name="Dr. Rajesh Sharma",
        phone="+91 98230 11223",
        telegram_chat_id="100001",
        preferred_language="en",
        previous_donations_count=12
    )

    organizer_user = User(
        id=str(uuid.uuid4()),
        email="organizer@lifeshare.org",
        hashed_password=get_password_hash("organizer123"),
        role="organizer",
        full_name="Prof. Sunita Deshmukh",
        phone="+91 98220 44556",
        telegram_chat_id="100002",
        preferred_language="en",
        previous_donations_count=8
    )

    volunteer_user = User(
        id=str(uuid.uuid4()),
        email="volunteer@lifeshare.org",
        hashed_password=get_password_hash("volunteer123"),
        role="volunteer",
        full_name="Arjun Verma",
        phone="+91 98110 77889",
        telegram_chat_id="100003",
        preferred_language="en",
        previous_donations_count=3
    )

    # Donors
    donor_aarav = User(
        id=str(uuid.uuid4()),
        email="aarav@gmail.com",
        hashed_password=get_password_hash("donor123"),
        role="donor",
        full_name="Aarav Patel",
        phone="+91 98901 12345",
        telegram_chat_id="200001",
        preferred_language="en",
        previous_donations_count=4
    )

    donor_priya = User(
        id=str(uuid.uuid4()),
        email="priya@gmail.com",
        hashed_password=get_password_hash("donor123"),
        role="donor",
        full_name="Priya Nair",
        phone="+91 98902 23456",
        telegram_chat_id="200002",
        preferred_language="en",
        previous_donations_count=1
    )

    donor_rahul = User(
        id=str(uuid.uuid4()),
        email="rahul@gmail.com",
        hashed_password=get_password_hash("donor123"),
        role="donor",
        full_name="Rahul Mehra",
        phone="+91 98903 34567",
        telegram_chat_id="200003",
        preferred_language="en",
        previous_donations_count=6
    )

    donor_sneha = User(
        id=str(uuid.uuid4()),
        email="sneha@gmail.com",
        hashed_password=get_password_hash("donor123"),
        role="donor",
        full_name="Sneha Kulkarni",
        phone="+91 98904 45678",
        telegram_chat_id="200004",
        preferred_language="en",
        previous_donations_count=5
    )

    donor_vikram = User(
        id=str(uuid.uuid4()),
        email="vikram@gmail.com",
        hashed_password=get_password_hash("donor123"),
        role="donor",
        full_name="Vikram Joshi",
        phone="+91 98905 56789",
        telegram_chat_id="200005",
        preferred_language="en",
        previous_donations_count=2
    )

    donor_meera = User(
        id=str(uuid.uuid4()),
        email="meera@gmail.com",
        hashed_password=get_password_hash("donor123"),
        role="donor",
        full_name="Meera Sen",
        phone="+91 98906 67890",
        telegram_chat_id="200006",
        preferred_language="en",
        previous_donations_count=0
    )

    all_users = [admin_user, organizer_user, volunteer_user, donor_aarav, donor_priya, donor_rahul, donor_sneha, donor_vikram, donor_meera]
    for u in all_users:
        db.add(u)
    db.commit()

    # 2. Create Flagship Campaign
    flagship_campaign = Campaign(
        id=str(uuid.uuid4()),
        organizer_id=organizer_user.id,
        name="GCOEN Blood Donation Drive 2026",
        description="Annual community blood donation drive at Government College of Engineering, Nagpur in coordination with regional blood centers. Dedicated to turning donor intentions into lifesaving turnout.",
        drive_date=drive_date,
        start_time="10:00",
        end_time="13:00",
        venue="Main Auditorium, Government College of Engineering, Nagpur (GCOEN)",
        target_count=200,
        slot_duration=30,
        max_donors_per_slot=25,
        organizer_contact="organizer@lifeshare.org | +91 98220 44556",
        info_link="https://lifeshare.org/campaigns/gcoen-2026",
        status="live"
    )
    
    # Secondary pending campaign for admin verification testing
    pending_campaign = Campaign(
        id=str(uuid.uuid4()),
        organizer_id=organizer_user.id,
        name="Nagpur Metro Red Ribbon Mobilisation Camp",
        description="Metro station youth blood mobilization drive targeting commuters and university students.",
        drive_date=(now + timedelta(days=12)).strftime("%Y-%m-%d"),
        start_time="09:00",
        end_time="15:00",
        venue="Sitabuldi Interchange Station, Nagpur",
        target_count=150,
        slot_duration=30,
        max_donors_per_slot=20,
        organizer_contact="organizer@lifeshare.org",
        status="pending_verification"
    )

    db.add(flagship_campaign)
    db.add(pending_campaign)
    db.commit()

    # 3. Create Time Slots for Flagship Campaign
    slot_times = [
        ("10:00 - 10:30", "10:00", "10:30"),
        ("10:30 - 11:00", "10:30", "11:00"),
        ("11:00 - 11:30", "11:00", "11:30"),
        ("11:30 - 12:00", "11:30", "12:00"),
        ("12:00 - 12:30", "12:00", "12:30"),
        ("12:30 - 13:00", "12:30", "13:00"),
    ]
    slots = []
    for st, s_start, s_end in slot_times:
        slot_obj = Slot(
            id=str(uuid.uuid4()),
            campaign_id=flagship_campaign.id,
            slot_time=st,
            start_time=s_start,
            end_time=s_end,
            capacity=25,
            status="available"
        )
        db.add(slot_obj)
        slots.append(slot_obj)
    db.commit()

    # 4. Create Explicit Consent Entries
    donors_list = [donor_aarav, donor_priya, donor_rahul, donor_sneha, donor_vikram, donor_meera]
    for d in donors_list:
        c1 = ConsentLog(
            id=str(uuid.uuid4()),
            donor_id=d.id,
            consent_type="campaign_communication",
            campaign_id=flagship_campaign.id,
            granted=True,
            changed_at=now - timedelta(days=2)
        )
        c2 = ConsentLog(
            id=str(uuid.uuid4()),
            donor_id=d.id,
            consent_type="future_campaigns",
            campaign_id=None,
            granted=True,
            changed_at=now - timedelta(days=2)
        )
        db.add(c1)
        db.add(c2)
    db.commit()

    # 5. Create Donor Registrations
    reg_aarav = Registration(
        id=str(uuid.uuid4()),
        campaign_id=flagship_campaign.id,
        donor_id=donor_aarav.id,
        slot_id=slots[2].id,
        slot_time="11:00 - 11:30",
        status="confirmed",
        predicted_attendance_score=0.84,
        prediction_explanation="High turnout probability (84%). Driven by explicit confirmation, 4 past donations, and active Telegram channel.",
        reminder_stage="t_minus_1",
        qr_token=f"LS-QR-{uuid.uuid4().hex[:12].upper()}",
        qr_used=False,
        created_at=now - timedelta(days=2)
    )

    reg_priya = Registration(
        id=str(uuid.uuid4()),
        campaign_id=flagship_campaign.id,
        donor_id=donor_priya.id,
        slot_id=slots[2].id,
        slot_time="11:00 - 11:30",
        status="registered",
        predicted_attendance_score=0.61,
        prediction_explanation="Moderate turnout probability (61%). Awaiting pre-drive confirmation response.",
        reminder_stage="none",
        qr_token=f"LS-QR-{uuid.uuid4().hex[:12].upper()}",
        qr_used=False,
        created_at=now - timedelta(days=1)
    )

    reg_rahul = Registration(
        id=str(uuid.uuid4()),
        campaign_id=flagship_campaign.id,
        donor_id=donor_rahul.id,
        slot_id=slots[3].id,
        slot_time="11:30 - 12:00",
        status="confirmed",
        predicted_attendance_score=0.91,
        prediction_explanation="Very high turnout probability (91%). Verified donor with 6 previous donations and early confirmation.",
        reminder_stage="t_minus_1",
        qr_token=f"LS-QR-{uuid.uuid4().hex[:12].upper()}",
        qr_used=False,
        created_at=now - timedelta(days=3)
    )

    reg_sneha = Registration(
        id=str(uuid.uuid4()),
        campaign_id=flagship_campaign.id,
        donor_id=donor_sneha.id,
        slot_id=slots[2].id,
        slot_time="11:00 - 11:30",
        status="waitlisted",
        predicted_attendance_score=0.88,
        prediction_explanation="Top waitlist candidate (88%). Repeat donor ready to fill any freed capacity immediately.",
        reminder_stage="none",
        qr_token=f"LS-QR-{uuid.uuid4().hex[:12].upper()}",
        qr_used=False,
        created_at=now - timedelta(hours=14)
    )

    reg_vikram = Registration(
        id=str(uuid.uuid4()),
        campaign_id=flagship_campaign.id,
        donor_id=donor_vikram.id,
        slot_id=slots[1].id,
        slot_time="10:30 - 11:00",
        status="cancelled",
        predicted_attendance_score=0.05,
        prediction_explanation="Registration was cancelled by donor. Slot returned to pool.",
        reminder_stage="none",
        qr_token=f"LS-QR-{uuid.uuid4().hex[:12].upper()}",
        qr_used=False,
        created_at=now - timedelta(days=4)
    )

    reg_meera = Registration(
        id=str(uuid.uuid4()),
        campaign_id=flagship_campaign.id,
        donor_id=donor_meera.id,
        slot_id=slots[0].id,
        slot_time="10:00 - 10:30",
        status="attended",
        predicted_attendance_score=1.0,
        prediction_explanation="Donor completed administrative QR check-in at venue.",
        reminder_stage="t_day",
        qr_token=f"LS-QR-{uuid.uuid4().hex[:12].upper()}",
        qr_used=True,
        created_at=now - timedelta(days=4)
    )

    db.add_all([reg_aarav, reg_priya, reg_rahul, reg_sneha, reg_vikram, reg_meera])
    db.commit()

    # 6. Create Initial Attendance for Meera
    att_meera_id = str(uuid.uuid4())
    att_meera = Attendance(
        id=att_meera_id,
        registration_id=reg_meera.id,
        campaign_id=flagship_campaign.id,
        donor_id=donor_meera.id,
        checked_in_at=now - timedelta(hours=2),
        verified_by=volunteer_user.id,
        checkin_method="qr_scan"
    )
    db.add(att_meera)
    db.commit()

    # 7. Audit Trail Entries
    audit_events = [
        AuditLog(
            id=str(uuid.uuid4()),
            actor_id=organizer_user.id,
            actor_role="organizer",
            action="campaign.created",
            entity_type="campaign",
            entity_id=flagship_campaign.id,
            before_state=None,
            after_state="{'status': 'pending_verification', 'name': 'GCOEN Blood Donation Drive 2026'}",
            created_at=now - timedelta(days=5)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            actor_id=admin_user.id,
            actor_role="admin",
            action="campaign.approved",
            entity_type="campaign",
            entity_id=flagship_campaign.id,
            before_state="{'status': 'pending_verification'}",
            after_state="{'status': 'live'}",
            created_at=now - timedelta(days=4)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            actor_id=donor_aarav.id,
            actor_role="donor",
            action="donor.registered",
            entity_type="registration",
            entity_id=reg_aarav.id,
            before_state=None,
            after_state="{'slot': '11:00 - 11:30', 'status': 'registered'}",
            created_at=now - timedelta(days=2)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            actor_id=donor_aarav.id,
            actor_role="donor",
            action="donor.confirmed",
            entity_type="registration",
            entity_id=reg_aarav.id,
            before_state="{'status': 'registered'}",
            after_state="{'status': 'confirmed'}",
            created_at=now - timedelta(days=1)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            actor_id=volunteer_user.id,
            actor_role="volunteer",
            action="attendance.checked_in",
            entity_type="attendance",
            entity_id=att_meera_id,
            before_state="{'status': 'confirmed', 'qr_used': False}",
            after_state="{'status': 'attended', 'qr_used': True}",
            created_at=now - timedelta(hours=2)
        )
    ]
    db.add_all(audit_events)
    db.commit()
    print("Life Share realistic demo dataset seeded successfully!")
