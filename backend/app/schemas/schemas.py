from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field

# User & Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "donor" # admin, organizer, donor, volunteer
    phone: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    preferred_language: str = "en"
    previous_donations_count: int = 0

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    preferred_language: Optional[str] = None
    previous_donations_count: Optional[int] = None

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    drive_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    venue: Optional[str] = None
    target_count: Optional[int] = None
    organizer_contact: Optional[str] = None
    info_link: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Consent Schemas
class ConsentUpdate(BaseModel):
    consent_type: str # "campaign_communication" or "future_campaigns"
    campaign_id: Optional[str] = None
    granted: bool

class ConsentResponse(BaseModel):
    id: str
    donor_id: str
    consent_type: str
    campaign_id: Optional[str]
    granted: bool
    changed_at: datetime

    class Config:
        from_attributes = True

# Slot Schemas
class SlotCreate(BaseModel):
    slot_time: str
    start_time: str
    end_time: str
    capacity: int = 15

class SlotResponse(BaseModel):
    id: str
    campaign_id: str
    slot_time: str
    start_time: str
    end_time: str
    capacity: int
    status: str
    booked_count: Optional[int] = 0
    waitlist_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Campaign Schemas
class CampaignCreate(BaseModel):
    name: str
    description: Optional[str] = None
    drive_date: str # YYYY-MM-DD
    start_time: str # HH:MM
    end_time: str # HH:MM
    venue: str
    target_count: int = 100
    slot_duration: int = 30
    max_donors_per_slot: int = 15
    organizer_contact: Optional[str] = None
    info_link: Optional[str] = None

class CampaignStatusUpdate(BaseModel):
    status: str # approved, rejected, live, completed
    rejection_reason: Optional[str] = None

class CampaignResponse(BaseModel):
    id: str
    organizer_id: str
    name: str
    description: Optional[str]
    drive_date: str
    start_time: str
    end_time: str
    venue: str
    target_count: int
    slot_duration: int
    max_donors_per_slot: int
    organizer_contact: Optional[str]
    info_link: Optional[str]
    status: str
    rejection_reason: Optional[str]
    created_at: datetime
    slots: Optional[List[SlotResponse]] = []
    registered_count: Optional[int] = 0
    confirmed_count: Optional[int] = 0
    waitlisted_count: Optional[int] = 0
    predicted_attendance: Optional[int] = 0
    attended_count: Optional[int] = 0
    organizer_name: Optional[str] = None

    class Config:
        from_attributes = True

# Registration Schemas
class RegistrationCreate(BaseModel):
    campaign_id: str
    slot_time: str
    consent_campaign_comm: bool = False
    consent_future_comm: bool = False
    preferred_language: str = "en"
    telegram_chat_id: Optional[str] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None

class RegistrationStatusUpdate(BaseModel):
    status: str # confirmed, cancelled

class RegistrationResponse(BaseModel):
    id: str
    campaign_id: str
    donor_id: str
    slot_id: Optional[str]
    slot_time: str
    status: str
    predicted_attendance_score: float
    prediction_explanation: Optional[str]
    last_scored_at: Optional[datetime]
    reminder_stage: str
    qr_token: str
    qr_used: bool
    created_at: datetime
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    donor_phone: Optional[str] = None
    campaign_name: Optional[str] = None
    campaign_venue: Optional[str] = None
    campaign_date: Optional[str] = None

    class Config:
        from_attributes = True

# QR & Attendance Schemas
class QRCheckInRequest(BaseModel):
    qr_token: str
    campaign_id: Optional[str] = None

class AttendanceResponse(BaseModel):
    id: str
    registration_id: str
    campaign_id: str
    donor_id: str
    checked_in_at: datetime
    verified_by: str
    checkin_method: str
    donor_name: Optional[str] = None
    campaign_name: Optional[str] = None
    slot_time: Optional[str] = None

# Message Schemas
class MessageResponse(BaseModel):
    id: str
    donor_id: str
    campaign_id: Optional[str]
    channel: str
    message_type: str
    content: str
    generated_by: str
    sent_at: datetime
    delivery_status: str

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: str
    actor_id: Optional[str]
    actor_role: Optional[str]
    action: str
    entity_type: str
    entity_id: str
    before_state: Optional[str]
    after_state: Optional[str]
    created_at: datetime

# Analytics Schemas
class CampaignAnalytics(BaseModel):
    campaign_id: str
    campaign_name: str
    target_count: int
    total_registered: int
    confirmed_count: int
    waitlisted_count: int
    cancelled_count: int
    predicted_attendance: int
    actual_attendance: int
    expected_gap: int
    confirmation_rate: float
    cancellation_rate: float
    waitlist_promotions_count: int
    slot_distribution: List[dict]
    attendance_funnel: List[dict]
    predicted_vs_actual: dict

# AI Assistant Schemas
class AIAssistantRequest(BaseModel):
    prompt: str
    campaign_id: Optional[str] = None

class AIAssistantResponse(BaseModel):
    reply: str
    source: str # "ollama_qwen" or "rule_based_fallback"
    data_context: Optional[dict] = None
