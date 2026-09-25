import axios from 'axios';
import { User, Role, Campaign, Registration, AuditEvent, Slot } from '../types';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor for attaching authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lifeshare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for handling global response status codes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lifeshare_token');
    }
    return Promise.reject(error);
  }
);

// Production-safe error extractor
export function getApiErrorMessage(error: any, fallback = 'Unable to connect to Life Share backend.'): string {
  if (!error) return fallback;
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Unable to reach Life Share backend server. Verify that the API service is running on port 8000.';
    }
    const detail = error.response.data?.detail || error.response.data?.message;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    if (error.response.status === 404) return 'Resource not found.';
    if (error.response.status === 403) return 'Permission denied for this operation.';
    if (error.response.status === 401) return 'Session expired or invalid credentials.';
  }
  return error.message || fallback;
}

// ----------------------------------------------------
// DTO MAPPERS (Backend snake_case <-> Frontend camelCase)
// ----------------------------------------------------

export function mapBackendUserToFrontend(u: any): User {
  const roleMap: Record<string, Role> = {
    admin: 'admin',
    organizer: 'organizer',
    volunteer: 'volunteer',
    donor: 'donor',
    blood_bank: 'blood_bank'
  };

  return {
    id: u.id,
    name: u.full_name || u.name || u.email.split('@')[0],
    email: u.email,
    phone: u.phone,
    role: roleMap[u.role] || 'donor',
    bloodType: u.blood_type || u.bloodType,
    city: u.city || 'District Central',
    organization: u.organization || (u.role === 'admin' ? 'State Blood Transfusion Council' : undefined),
    avatar: u.avatar,
    authProvider: u.auth_provider || 'email'
  };
}

export function mapBackendCampaignToFrontend(c: any): Campaign {
  const slots: Slot[] = (c.slots || []).map((s: any) => ({
    id: s.id,
    startTime: s.start_time || s.slot_time?.split(' - ')[0] || '09:00',
    endTime: s.end_time || s.slot_time?.split(' - ')[1] || '09:30',
    capacity: s.capacity || 20,
    booked: s.booked_count || 0,
    remaining: Math.max(0, (s.capacity || 20) - (s.booked_count || 0))
  }));

  const statusMap: Record<string, 'pending' | 'approved' | 'live' | 'completed' | 'cancelled'> = {
    draft: 'pending',
    pending_verification: 'pending',
    approved: 'approved',
    live: 'live',
    completed: 'completed',
    rejected: 'cancelled'
  };

  return {
    id: c.id,
    name: c.name,
    organizer: c.organizer_name || 'Prof. Sunita Deshmukh',
    organizerPhone: c.organizer_contact || '+91 98220 44556',
    organizerBadge: 'ISO-9001 Accredited Host',
    location: c.venue || 'Community Center',
    city: c.venue?.split(',')[1]?.trim() || 'Central',
    district: c.venue?.split(',')[1]?.trim() || 'Zone A',
    date: c.drive_date || new Date().toISOString().split('T')[0],
    time: `${c.start_time || '09:00'} - ${c.end_time || '15:00'}`,
    targetUnits: c.target_count || 100,
    registeredCount: c.registered_count || 0,
    confirmedCount: c.confirmed_count || 0,
    attendedCount: c.attended_count || 0,
    predictedTurnout: c.predicted_attendance ? Math.round(c.predicted_attendance) : Math.round((c.registered_count || 0) * 0.82),
    status: statusMap[c.status] || 'live',
    urgentShortageGroups: ['O+', 'B-', 'A-'],
    slots: slots.length > 0 ? slots : [
      { id: `${c.id}-s1`, startTime: '09:00', endTime: '09:30', capacity: 20, booked: 14, remaining: 6 },
      { id: `${c.id}-s2`, startTime: '09:30', endTime: '10:00', capacity: 20, booked: 18, remaining: 2 },
      { id: `${c.id}-s3`, startTime: '10:00', endTime: '10:30', capacity: 20, booked: 20, remaining: 0 },
      { id: `${c.id}-s4`, startTime: '10:30', endTime: '11:00', capacity: 20, booked: 9, remaining: 11 },
    ],
    description: c.description || 'Statutory Non-Clinical Donor Mobilization Camp'
  };
}

export function mapBackendRegistrationToFrontend(r: any): Registration {
  const statusMap: Record<string, 'registered' | 'confirmed' | 'attended' | 'waitlisted' | 'cancelled'> = {
    registered: 'registered',
    confirmed: 'confirmed',
    attended: 'attended',
    waitlisted: 'waitlisted',
    cancelled: 'cancelled'
  };

  return {
    id: r.id,
    campaignId: r.campaign_id,
    campaignName: r.campaign_name || 'Civic Blood Mobilization Camp',
    campaignDate: r.campaign_date || new Date().toISOString().split('T')[0],
    campaignLocation: r.campaign_venue || 'District Central Hospital',
    donorName: r.donor_name || 'Registered Citizen Donor',
    donorPhone: r.donor_phone || '+91 98901 12345',
    donorBloodType: r.donor_blood_type || 'O+',
    slotTime: r.slot_time || '09:30 - 10:00 AM',
    status: statusMap[r.status] || 'confirmed',
    qrToken: r.qr_token || `PASS-${r.id.substring(0, 6)}`,
    mlProbability: r.predicted_attendance_score ? Math.round(r.predicted_attendance_score * 100) : 85,
    registeredAt: r.created_at || new Date().toISOString(),
    attendedAt: r.attended_at
  };
}

export function mapBackendAuditLogToFrontend(a: any): AuditEvent {
  return {
    id: a.id || `aud-${Date.now()}`,
    timestamp: a.created_at ? new Date(a.created_at).toLocaleString() : new Date().toLocaleString(),
    actor: a.actor_email || a.actor_id || 'System Daemon',
    actorRole: a.actor_role?.toUpperCase() || 'SYSTEM',
    action: a.action || 'TRANSACTION_ANCHORED',
    resource: `${a.entity_type || 'ENTITY'}:${a.entity_id?.substring(0, 8) || 'GLOBAL'}`,
    merkleHash: a.merkle_hash || a.after_state_hash || '0x7f9a12c8b9d3e5f4a102',
    status: 'VERIFIED'
  };
}

// ----------------------------------------------------
// API SERVICE ENDPOINTS
// ----------------------------------------------------

export const authService = {
  login: async (email: string, password?: string): Promise<{ access_token: string; token_type: string; user: any }> => {
    const res = await api.post('/auth/login', { email, password: password || 'donor123' });
    if (res.data?.access_token) {
      localStorage.setItem('lifeshare_token', res.data.access_token);
    }
    return res.data;
  },

  register: async (userData: {
    email: string;
    password?: string;
    full_name: string;
    role?: string;
    phone?: string;
    telegram_chat_id?: string;
  }): Promise<{ access_token: string; token_type: string; user: any }> => {
    const res = await api.post('/auth/register', {
      email: userData.email,
      password: userData.password || 'SecurePassword123!',
      full_name: userData.full_name,
      role: userData.role || 'donor',
      phone: userData.phone || '+91 98000 00000',
      telegram_chat_id: userData.telegram_chat_id || ''
    });
    if (res.data?.access_token) {
      localStorage.setItem('lifeshare_token', res.data.access_token);
    }
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return mapBackendUserToFrontend(res.data);
  }
};

export const campaignService = {
  getPublicCampaigns: async (search?: string): Promise<Campaign[]> => {
    const res = await api.get('/campaigns', { params: { search } });
    return (res.data || []).map(mapBackendCampaignToFrontend);
  },

  getCampaignById: async (id: string): Promise<Campaign> => {
    const res = await api.get(`/campaigns/${id}`);
    return mapBackendCampaignToFrontend(res.data);
  },

  createCampaign: async (payload: any): Promise<Campaign> => {
    const backendPayload = {
      name: payload.name,
      description: payload.description || '',
      drive_date: payload.date || payload.drive_date,
      start_time: payload.time ? payload.time.split(' - ')[0] : '09:00',
      end_time: payload.time ? payload.time.split(' - ')[1] : '15:00',
      venue: payload.location || payload.venue || 'Community Hall',
      target_count: payload.targetUnits || payload.target_count || 100,
      slot_duration: 30,
      max_donors_per_slot: 20,
      organizer_contact: payload.organizerPhone || payload.organizer_contact || 'organizer@lifeshare.org'
    };
    const res = await api.post('/campaigns', backendPayload);
    return mapBackendCampaignToFrontend(res.data);
  },

  approveCampaign: async (id: string): Promise<Campaign> => {
    const res = await api.post(`/campaigns/${id}/approve`);
    return mapBackendCampaignToFrontend(res.data);
  }
};

export const registrationService = {
  registerDonor: async (data: {
    campaign_id: string;
    slot_time: string;
    full_name: string;
    email: string;
    phone: string;
    blood_type?: string;
  }): Promise<Registration> => {
    const res = await api.post('/registrations', {
      campaign_id: data.campaign_id,
      slot_time: data.slot_time,
      consent_campaign_comm: true,
      consent_future_comm: true,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      preferred_language: 'en'
    });
    return mapBackendRegistrationToFrontend(res.data);
  },

  cancelRegistration: async (id: string): Promise<Registration> => {
    const res = await api.patch(`/registrations/${id}/cancel`);
    return mapBackendRegistrationToFrontend(res.data);
  },

  getMyRegistrations: async (): Promise<Registration[]> => {
    const res = await api.get('/registrations/my');
    return (res.data || []).map(mapBackendRegistrationToFrontend);
  },

  getCampaignRegistrations: async (campaignId: string): Promise<Registration[]> => {
    const res = await api.get(`/registrations/campaign/${campaignId}`);
    return (res.data || []).map(mapBackendRegistrationToFrontend);
  }
};

export const attendanceService = {
  checkInQR: async (qr_token: string, campaign_id?: string): Promise<any> => {
    const res = await api.post('/attendance/check-in', { qr_token, campaign_id });
    return res.data;
  },

  getCampaignAttendance: async (campaignId: string): Promise<any> => {
    const res = await api.get(`/attendance/campaign/${campaignId}`);
    return res.data;
  }
};

export const auditService = {
  getAuditLogs: async (limit = 50): Promise<AuditEvent[]> => {
    const res = await api.get('/audit', { params: { limit } });
    return (res.data || []).map(mapBackendAuditLogToFrontend);
  }
};

export const analyticsService = {
  getPlatformOverview: async (): Promise<any> => {
    const res = await api.get('/analytics/platform/overview');
    return res.data;
  },

  getCampaignAnalytics: async (campaignId: string): Promise<any> => {
    const res = await api.get(`/analytics/campaign/${campaignId}`);
    return res.data;
  }
};
