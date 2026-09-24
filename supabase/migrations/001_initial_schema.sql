-- ==============================================================================
-- LIFE SHARE: Supabase PostgreSQL Schema & Row Level Security (RLS)
-- Tagline: Connecting People. Mobilising Blood. Saving Lives.
-- Problem Statement: R2-P3 — Intelligent Blood Donation Mobilisation & Turnout Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'organizer', 'donor', 'volunteer')) DEFAULT 'donor',
    full_name TEXT NOT NULL,
    phone TEXT,
    telegram_chat_id TEXT,
    preferred_language TEXT DEFAULT 'en',
    previous_donations_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    drive_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    venue TEXT NOT NULL,
    target_count INTEGER NOT NULL DEFAULT 100,
    slot_duration INTEGER DEFAULT 30,
    max_donors_per_slot INTEGER DEFAULT 15,
    organizer_contact TEXT,
    info_link TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'pending_verification', 'approved', 'live', 'completed', 'rejected')) DEFAULT 'pending_verification',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TIME SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    slot_time TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 15,
    status TEXT NOT NULL CHECK (status IN ('available', 'full', 'waitlist', 'closed')) DEFAULT 'available'
);

-- 4. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    slot_id UUID REFERENCES public.slots(id) ON DELETE SET NULL,
    slot_time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('registered', 'confirmed', 'waitlisted', 'cancelled', 'attended', 'no_show')) DEFAULT 'registered',
    predicted_attendance_score NUMERIC(4, 3) DEFAULT 0.500,
    prediction_explanation TEXT,
    last_scored_at TIMESTAMPTZ DEFAULT NOW(),
    reminder_stage TEXT DEFAULT 'none',
    qr_token TEXT UNIQUE NOT NULL,
    qr_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXPLICIT CONSENT LOG TABLE
CREATE TABLE IF NOT EXISTS public.consent_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL, -- 'campaign_communication', 'future_campaigns'
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    granted BOOLEAN NOT NULL DEFAULT FALSE,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ATTENDANCE TABLE (Administrative check-in, Non-medical)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID UNIQUE NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    verified_by UUID NOT NULL REFERENCES public.profiles(id),
    checkin_method TEXT DEFAULT 'qr_scan'
);

-- 7. MESSAGES LOG TABLE
CREATE TABLE IF NOT EXISTS public.messages_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    channel TEXT DEFAULT 'telegram',
    message_type TEXT NOT NULL,
    content TEXT NOT NULL,
    generated_by TEXT DEFAULT 'template_fallback',
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivery_status TEXT NOT NULL DEFAULT 'sent'
);

-- 8. AUDIT LOGS TABLE (Immutable Event Sourcing)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID,
    actor_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_drive_date ON public.campaigns(drive_date);
CREATE INDEX IF NOT EXISTS idx_registrations_campaign_id ON public.registrations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_registrations_donor_id ON public.registrations(donor_id);
CREATE INDEX IF NOT EXISTS idx_registrations_qr_token ON public.registrations(qr_token);
CREATE INDEX IF NOT EXISTS idx_consent_donor_type ON public.consent_log(donor_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles can read basic info" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Campaigns Policies
CREATE POLICY "Anyone can view live/approved campaigns" ON public.campaigns FOR SELECT USING (status IN ('live', 'approved', 'completed'));
CREATE POLICY "Organizers can view own pending/draft campaigns" ON public.campaigns FOR SELECT USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can insert campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own campaigns" ON public.campaigns FOR UPDATE USING (auth.uid() = organizer_id);

-- 3. Registrations Policies
CREATE POLICY "Donors can view own registrations" ON public.registrations FOR SELECT USING (auth.uid() = donor_id);
CREATE POLICY "Donors can register themselves" ON public.registrations FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Donors can update own status (confirm/cancel)" ON public.registrations FOR UPDATE USING (auth.uid() = donor_id);

-- 4. Consent Policies
CREATE POLICY "Donors can view and manage own consent" ON public.consent_log FOR ALL USING (auth.uid() = donor_id);

-- 5. Audit Log Policies
CREATE POLICY "Admins have full view on audit logs" ON public.audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
