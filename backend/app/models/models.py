import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="donor")  # admin, organizer, donor, volunteer
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    telegram_chat_id = Column(String(100), nullable=True)
    preferred_language = Column(String(10), default="en")
    previous_donations_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    campaigns = relationship("Campaign", back_populates="organizer", foreign_keys="Campaign.organizer_id")
    registrations = relationship("Registration", back_populates="donor", foreign_keys="Registration.donor_id")
    consents = relationship("ConsentLog", back_populates="donor", foreign_keys="ConsentLog.donor_id")


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organizer_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    drive_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    start_time = Column(String(20), nullable=False)  # HH:MM
    end_time = Column(String(20), nullable=False)    # HH:MM
    venue = Column(String(255), nullable=False)
    target_count = Column(Integer, nullable=False, default=100)
    slot_duration = Column(Integer, default=30)      # Minutes
    max_donors_per_slot = Column(Integer, default=15)
    organizer_contact = Column(String(255), nullable=True)
    info_link = Column(String(255), nullable=True)
    status = Column(String(50), default="pending_verification")  # draft, pending_verification, approved, live, completed, rejected
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    organizer = relationship("User", back_populates="campaigns", foreign_keys=[organizer_id])
    slots = relationship("Slot", back_populates="campaign", cascade="all, delete-orphan")
    registrations = relationship("Registration", back_populates="campaign", cascade="all, delete-orphan")


class Slot(Base):
    __tablename__ = "slots"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=False)
    slot_time = Column(String(50), nullable=False) # e.g. "10:00 - 10:30"
    start_time = Column(String(20), nullable=False)
    end_time = Column(String(20), nullable=False)
    capacity = Column(Integer, default=15)
    status = Column(String(50), default="available") # available, full, waitlist, closed

    # Relationships
    campaign = relationship("Campaign", back_populates="slots")
    registrations = relationship("Registration", back_populates="slot")


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=False)
    donor_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    slot_id = Column(String(36), ForeignKey("slots.id"), nullable=True)
    slot_time = Column(String(50), nullable=False)
    status = Column(String(50), default="registered") # registered, confirmed, waitlisted, cancelled, attended, no_show
    predicted_attendance_score = Column(Float, default=0.5)
    prediction_explanation = Column(Text, nullable=True)
    last_scored_at = Column(DateTime, default=utc_now)
    reminder_stage = Column(String(50), default="none") # none, t_minus_3, t_minus_1, t_day
    qr_token = Column(String(100), unique=True, index=True, default=generate_uuid)
    qr_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    campaign = relationship("Campaign", back_populates="registrations")
    donor = relationship("User", back_populates="registrations")
    slot = relationship("Slot", back_populates="registrations")
    attendance = relationship("Attendance", back_populates="registration", uselist=False)


class ConsentLog(Base):
    __tablename__ = "consent_log"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    donor_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    consent_type = Column(String(100), nullable=False) # "campaign_communication", "future_campaigns"
    campaign_id = Column(String(36), nullable=True)
    granted = Column(Boolean, default=False)
    changed_at = Column(DateTime, default=utc_now)

    # Relationships
    donor = relationship("User", back_populates="consents")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    registration_id = Column(String(36), ForeignKey("registrations.id"), unique=True, nullable=False)
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=False)
    donor_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    checked_in_at = Column(DateTime, default=utc_now)
    verified_by = Column(String(36), nullable=False) # User ID of volunteer or admin
    checkin_method = Column(String(50), default="qr_scan") # qr_scan, manual_token

    # Relationships
    registration = relationship("Registration", back_populates="attendance")


class MessageLog(Base):
    __tablename__ = "messages_log"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    registration_id = Column(String(36), nullable=True)
    donor_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    campaign_id = Column(String(36), nullable=True)
    channel = Column(String(50), default="telegram") # telegram, sms, email
    message_type = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    generated_by = Column(String(50), default="template_fallback") # ollama_qwen, template_fallback
    sent_at = Column(DateTime, default=utc_now)
    delivery_status = Column(String(50), default="sent") # sent, delivered, simulated, failed, skipped_no_consent


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(36), nullable=True)
    actor_role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False, index=True) # e.g. campaign.approved, waitlist.promoted
    entity_type = Column(String(50), nullable=False) # campaign, registration, consent, qr
    entity_id = Column(String(36), nullable=False)
    before_state = Column(Text, nullable=True) # JSON
    after_state = Column(Text, nullable=True)  # JSON
    created_at = Column(DateTime, default=utc_now, index=True)
