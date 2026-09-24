export type UserRole = 'admin' | 'organizer' | 'donor' | 'volunteer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  telegram_chat_id?: string;
  preferred_language: string;
  previous_donations_count: number;
  created_at: string;
}

export interface Slot {
  id: string;
  campaign_id: string;
  slot_time: string;
  start_time: string;
  end_time: string;
  capacity: number;
  status: 'available' | 'full' | 'waitlist' | 'closed';
  booked_count?: number;
  waitlist_count?: number;
}

export interface Campaign {
  id: string;
  organizer_id: string;
  name: string;
  description?: string;
  drive_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  target_count: number;
  slot_duration: number;
  max_donors_per_slot: number;
  organizer_contact?: string;
  info_link?: string;
  status: 'draft' | 'pending_verification' | 'approved' | 'live' | 'completed' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  slots: Slot[];
  registered_count: number;
  confirmed_count: number;
  waitlisted_count: number;
  predicted_attendance: number;
  attended_count: number;
  organizer_name?: string;
}

export interface Registration {
  id: string;
  campaign_id: string;
  donor_id: string;
  slot_id?: string;
  slot_time: string;
  status: 'registered' | 'confirmed' | 'waitlisted' | 'cancelled' | 'attended' | 'no_show';
  predicted_attendance_score: number;
  prediction_explanation?: string;
  last_scored_at?: string;
  reminder_stage: string;
  qr_token: string;
  qr_used: boolean;
  created_at: string;
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  campaign_name?: string;
  campaign_venue?: string;
  campaign_date?: string;
}

export interface ConsentLog {
  id: string;
  donor_id: string;
  consent_type: string;
  campaign_id?: string;
  granted: boolean;
  changed_at: string;
}

export interface Attendance {
  id: string;
  registration_id: string;
  campaign_id: string;
  donor_id: string;
  checked_in_at: string;
  verified_by: string;
  checkin_method: string;
  donor_name?: string;
  campaign_name?: string;
  slot_time?: string;
}

export interface MessageLog {
  id: string;
  donor_id: string;
  campaign_id?: string;
  channel: string;
  message_type: string;
  content: string;
  generated_by: string;
  sent_at: string;
  delivery_status: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_role?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_state?: string;
  after_state?: string;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor_role: string;
  created_at: string;
  time_str: string;
  color: 'emerald' | 'amber' | 'rose' | 'indigo' | 'sky' | 'blue' | 'slate';
  before_state?: string;
  after_state?: string;
}

export interface CampaignAnalytics {
  campaign_id: string;
  campaign_name: string;
  target_count: number;
  total_registered: number;
  confirmed_count: number;
  waitlisted_count: number;
  cancelled_count: number;
  predicted_attendance: number;
  actual_attendance: number;
  expected_gap: number;
  confirmation_rate: number;
  cancellation_rate: number;
  waitlist_promotions_count: number;
  slot_distribution: {
    slot_time: string;
    capacity: number;
    confirmed: number;
    waitlisted: number;
    attended: number;
    occupancy_pct: number;
  }[];
  attendance_funnel: {
    stage: string;
    count: number;
  }[];
  predicted_vs_actual: {
    target: number;
    predicted: number;
    actual: number;
    variance: number;
    accuracy_rate?: number;
  };
}
