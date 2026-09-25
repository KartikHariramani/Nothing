export type Role = 'donor' | 'organizer' | 'volunteer' | 'admin' | 'blood_bank';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  bloodType?: string;
  city?: string;
  organization?: string;
  avatar?: string;
  authProvider?: 'google' | 'email' | 'phone' | 'demo';
}

export interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  remaining: number;
}

export interface Campaign {
  id: string;
  name: string;
  organizer: string;
  organizerPhone?: string;
  organizerBadge?: string;
  location: string;
  city: string;
  district?: string;
  date: string;
  time: string;
  targetUnits: number;
  registeredCount: number;
  confirmedCount: number;
  attendedCount: number;
  predictedTurnout: number;
  status: 'pending' | 'approved' | 'live' | 'completed' | 'cancelled';
  urgentShortageGroups: string[];
  slots: Slot[];
  description?: string;
  isEmergencySurge?: boolean;
}

export interface Registration {
  id: string;
  campaignId: string;
  campaignName: string;
  campaignDate: string;
  campaignLocation: string;
  donorName: string;
  donorPhone: string;
  donorBloodType: string;
  slotTime: string;
  status: 'registered' | 'confirmed' | 'attended' | 'waitlisted' | 'cancelled';
  qrToken: string;
  mlProbability: number;
  registeredAt: string;
  attendedAt?: string;
}

export interface ConsentRecord {
  tier1ServiceReminders: boolean;
  tier2EmergencySurge: boolean;
  telegramLinked: boolean;
  telegramUsername?: string;
  emergencyRadiusKm: number;
  lastUpdated: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  resource: string;
  merkleHash: string;
  status: 'VERIFIED' | 'TAMPER_PROOF';
}

export interface InventoryItem {
  bloodGroup: string;
  component: 'Whole Blood' | 'PRBC' | 'Platelets' | 'FFP';
  unitsAvailable: number;
  minimumSafeLevel: number;
  status: 'OPTIMAL' | 'ADEQUATE' | 'CRITICAL' | 'SURGE_REQUIRED';
  lastUpdated: string;
}
