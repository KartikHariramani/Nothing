import axios from 'axios';
import { User, Campaign, Registration, ConsentLog, Attendance, CampaignAnalytics, AuditLog, ActivityItem, MessageLog } from '../types';

// Normalize base URL to prevent duplicate slashes or malformed paths
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
      // Clear token if expired or invalid
      const currentToken = localStorage.getItem('lifeshare_token');
      if (currentToken) {
        localStorage.removeItem('lifeshare_token');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Production-safe error extraction helper:
 * Extracts user-friendly messages without exposing database traces or internal paths.
 */
export function getApiErrorMessage(error: any, fallbackMessage = 'Unable to connect to Life Share services. Please try again.'): string {
  if (!error) return fallbackMessage;
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      // Network failure / server offline
      return 'Unable to connect to Life Share backend. Please check your network connection or verify that the API server is online.';
    }
    const detail = error.response.data?.detail || error.response.data?.message;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    if (error.response.status === 404) return 'The requested resource was not found.';
    if (error.response.status === 403) return 'You do not have permission to perform this action.';
    if (error.response.status === 401) return 'Session expired or invalid credentials. Please sign in again.';
    if (error.response.status >= 500) return 'Life Share service is temporarily encountering an issue. Please try again shortly.';
  }
  return error.message || fallbackMessage;
}

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData: any) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (profileData: any): Promise<User> => {
    const res = await api.put('/auth/profile', profileData);
    return res.data;
  },
  updatePassword: async (passwordData: { current_password: string; new_password: string }) => {
    const res = await api.post('/auth/update-password', passwordData);
    return res.data;
  },
  getAdminUsers: async (): Promise<User[]> => {
    const res = await api.get('/auth/admin/users');
    return res.data;
  },
  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const res = await api.put(`/auth/admin/users/${userId}/role`, null, { params: { role } });
    return res.data;
  }
};

export const campaignService = {
  getPublicCampaigns: async (search?: string): Promise<Campaign[]> => {
    const res = await api.get('/campaigns', { params: { search } });
    return res.data;
  },
  getAllCampaignsAdmin: async (): Promise<Campaign[]> => {
    const res = await api.get('/campaigns/admin/all');
    return res.data;
  },
  getMyCampaignsOrganizer: async (): Promise<Campaign[]> => {
    const res = await api.get('/campaigns/organizer/mine');
    return res.data;
  },
  getCampaignById: async (id: string): Promise<Campaign> => {
    const res = await api.get(`/campaigns/${id}`);
    return res.data;
  },
  createCampaign: async (campaignData: any): Promise<Campaign> => {
    const res = await api.post('/campaigns', campaignData);
    return res.data;
  },
  updateCampaign: async (id: string, campaignData: any): Promise<Campaign> => {
    const res = await api.put(`/campaigns/${id}`, campaignData);
    return res.data;
  },
  approveCampaign: async (id: string): Promise<Campaign> => {
    const res = await api.post(`/campaigns/${id}/approve`);
    return res.data;
  },
  rejectCampaign: async (id: string, rejectionReason?: string): Promise<Campaign> => {
    const res = await api.post(`/campaigns/${id}/reject`, { status: 'rejected', rejection_reason: rejectionReason });
    return res.data;
  }
};

export const registrationService = {
  registerDonor: async (data: {
    campaign_id: string;
    slot_time: string;
    consent_campaign_comm: boolean;
    consent_future_comm: boolean;
    full_name?: string;
    email?: string;
    phone?: string;
    telegram_chat_id?: string;
    preferred_language?: string;
  }): Promise<Registration> => {
    const res = await api.post('/registrations', data);
    return res.data;
  },
  confirmRegistration: async (id: string): Promise<Registration> => {
    const res = await api.patch(`/registrations/${id}/confirm`);
    return res.data;
  },
  cancelRegistration: async (id: string): Promise<Registration> => {
    const res = await api.patch(`/registrations/${id}/cancel`);
    return res.data;
  },
  getMyRegistrations: async (): Promise<Registration[]> => {
    const res = await api.get('/registrations/my');
    return res.data;
  },
  getCampaignRegistrations: async (campaignId: string): Promise<Registration[]> => {
    const res = await api.get(`/registrations/campaign/${campaignId}`);
    return res.data;
  }
};

export const consentService = {
  getMyConsents: async (): Promise<ConsentLog[]> => {
    const res = await api.get('/consent/my');
    return res.data;
  },
  updateConsent: async (consent_type: string, granted: boolean, campaign_id?: string): Promise<ConsentLog> => {
    const res = await api.post('/consent/update', { consent_type, granted, campaign_id });
    return res.data;
  }
};

export const attendanceService = {
  checkInQR: async (qr_token: string, campaign_id?: string) => {
    const res = await api.post('/attendance/check-in', { qr_token, campaign_id });
    return res.data;
  },
  getCampaignAttendance: async (campaignId: string): Promise<Attendance[]> => {
    const res = await api.get(`/attendance/campaign/${campaignId}`);
    return res.data;
  },
  getQRImage: async (qr_token: string): Promise<{ data_url: string; qr_token: string }> => {
    const res = await api.get(`/attendance/qr-image/${qr_token}`);
    return res.data;
  }
};

export const analyticsService = {
  getCampaignAnalytics: async (campaignId: string): Promise<CampaignAnalytics> => {
    const res = await api.get(`/analytics/campaign/${campaignId}`);
    return res.data;
  },
  getPlatformOverview: async () => {
    const res = await api.get('/analytics/platform/overview');
    return res.data;
  }
};

export const auditService = {
  getAuditLogs: async (limit = 50): Promise<AuditLog[]> => {
    const res = await api.get('/audit', { params: { limit } });
    return res.data;
  },
  getActivityFeed: async (limit = 20): Promise<ActivityItem[]> => {
    const res = await api.get('/audit/activity-feed', { params: { limit } });
    return res.data;
  }
};

export const aiAssistantService = {
  queryAssistant: async (prompt: string, campaign_id?: string) => {
    const res = await api.post('/ai-assistant/query', { prompt, campaign_id });
    return res.data;
  }
};

export const telegramService = {
  sendReminder: async (registration_id: string, reminder_type = 't_minus_1_reminder') => {
    const res = await api.post(`/telegram/send-reminder/${registration_id}`, null, { params: { reminder_type } });
    return res.data;
  },
  getMessageLogs: async (campaign_id?: string): Promise<MessageLog[]> => {
    const res = await api.get('/telegram/logs', { params: { campaign_id } });
    return res.data;
  }
};

