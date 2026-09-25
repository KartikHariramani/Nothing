import { Campaign, Registration, AuditEvent, InventoryItem, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-donor-1',
    name: 'Aarav Sharma',
    email: 'aarav@gmail.com',
    phone: '+91 98230 11223',
    role: 'donor',
    bloodType: 'O+',
    city: 'Nagpur'
  },
  {
    id: 'usr-org-1',
    name: 'Dr. Alok Verma',
    email: 'organizer@lifeshare.org',
    phone: '+91 94221 44556',
    role: 'organizer',
    organization: 'Indian Red Cross Society, Nagpur Chapter',
    city: 'Nagpur'
  },
  {
    id: 'usr-vol-1',
    name: 'Vikas Rao',
    email: 'volunteer@lifeshare.org',
    phone: '+91 97654 33210',
    role: 'volunteer',
    organization: 'National Service Scheme (NSS)',
    city: 'Nagpur'
  },
  {
    id: 'usr-adm-1',
    name: 'S. K. Deshmukh, IAS',
    email: 'admin@lifeshare.org',
    phone: '+91 712 2561234',
    role: 'admin',
    organization: 'State Blood Transfusion Council (SBTC)',
    city: 'Nagpur'
  },
  {
    id: 'usr-bb-1',
    name: 'Nagpur Central Blood Bank',
    email: 'central@bloodbank.gov.in',
    phone: '+91 712 2745678',
    role: 'blood_bank',
    organization: 'Government Medical College & Hospital',
    city: 'Nagpur'
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-101',
    name: 'Red Cross Central Emergency Camp',
    organizer: 'Indian Red Cross Society (Nagpur)',
    organizerPhone: '+91 94221 44556',
    organizerBadge: 'LICENSED CIVIC PARTNER #SBTC-MH-401',
    location: 'Civil Hospital Premises, Wardha Road',
    city: 'Nagpur',
    district: 'Nagpur Urban',
    date: '2026-09-28',
    time: '09:00 AM - 05:00 PM',
    targetUnits: 150,
    registeredCount: 138,
    confirmedCount: 112,
    attendedCount: 84,
    predictedTurnout: 122,
    status: 'live',
    urgentShortageGroups: ['O+', 'B-', 'AB-'],
    isEmergencySurge: true,
    description: 'High-urgency replacement mobilization for trauma center & regional pediatric surgeries. 6 dedicated phlebotomy stations with cold-chain transit.',
    slots: [
      { id: 's1', startTime: '09:00 AM', endTime: '09:30 AM', capacity: 15, booked: 15, remaining: 0 },
      { id: 's2', startTime: '09:30 AM', endTime: '10:00 AM', capacity: 15, booked: 14, remaining: 1 },
      { id: 's3', startTime: '10:00 AM', endTime: '10:30 AM', capacity: 15, booked: 15, remaining: 0 },
      { id: 's4', startTime: '10:30 AM', endTime: '11:00 AM', capacity: 15, booked: 12, remaining: 3 },
      { id: 's5', startTime: '11:00 AM', endTime: '11:30 AM', capacity: 15, booked: 13, remaining: 2 },
      { id: 's6', startTime: '11:30 AM', endTime: '12:00 PM', capacity: 15, booked: 11, remaining: 4 },
      { id: 's7', startTime: '01:00 PM', endTime: '01:30 PM', capacity: 15, booked: 8, remaining: 7 },
      { id: 's8', startTime: '01:30 PM', endTime: '02:00 PM', capacity: 15, booked: 10, remaining: 5 }
    ]
  },
  {
    id: 'camp-102',
    name: 'Rotary Club Civic Donation Drive',
    organizer: 'Rotary Club of Nagpur Elite',
    organizerPhone: '+91 98900 12345',
    organizerBadge: 'VERIFIED RECURRING ORGANIZER',
    location: 'Ramdaspeth Community Center, Central Avenue',
    city: 'Nagpur',
    district: 'Nagpur Central',
    date: '2026-09-30',
    time: '10:00 AM - 04:00 PM',
    targetUnits: 100,
    registeredCount: 78,
    confirmedCount: 65,
    attendedCount: 0,
    predictedTurnout: 82,
    status: 'approved',
    urgentShortageGroups: ['A-', 'O-'],
    isEmergencySurge: false,
    description: 'Quarterly community drive supporting local thalassemia transfusions and maternal care wings.',
    slots: [
      { id: 's21', startTime: '10:00 AM', endTime: '10:30 AM', capacity: 12, booked: 12, remaining: 0 },
      { id: 's22', startTime: '10:30 AM', endTime: '11:00 AM', capacity: 12, booked: 10, remaining: 2 },
      { id: 's23', startTime: '11:00 AM', endTime: '11:30 AM', capacity: 12, booked: 9, remaining: 3 },
      { id: 's24', startTime: '11:30 AM', endTime: '12:00 PM', capacity: 12, booked: 8, remaining: 4 }
    ]
  },
  {
    id: 'camp-103',
    name: 'Government Medical College Student Mobilization',
    organizer: 'GMC Medical Student Association',
    organizerPhone: '+91 97654 00987',
    organizerBadge: 'STATE HEALTH AFFILIATE',
    location: 'GMC Auditorium, Medical Square',
    city: 'Nagpur',
    district: 'Nagpur South',
    date: '2026-10-02',
    time: '08:30 AM - 03:30 PM',
    targetUnits: 200,
    registeredCount: 165,
    confirmedCount: 140,
    attendedCount: 0,
    predictedTurnout: 175,
    status: 'approved',
    urgentShortageGroups: ['O+', 'A+', 'B+'],
    isEmergencySurge: false,
    description: 'Gandhi Jayanti youth blood donation camp catering to Vidarbha regional burn and trauma facilities.',
    slots: [
      { id: 's31', startTime: '08:30 AM', endTime: '09:00 AM', capacity: 20, booked: 18, remaining: 2 },
      { id: 's32', startTime: '09:00 AM', endTime: '09:30 AM', capacity: 20, booked: 20, remaining: 0 },
      { id: 's33', startTime: '09:30 AM', endTime: '10:00 AM', capacity: 20, booked: 19, remaining: 1 }
    ]
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-001',
    campaignId: 'camp-101',
    campaignName: 'Red Cross Central Emergency Camp',
    campaignDate: '2026-09-28',
    campaignLocation: 'Civil Hospital Premises, Wardha Road',
    donorName: 'Aarav Sharma',
    donorPhone: '+91 98230 11223',
    donorBloodType: 'O+',
    slotTime: '09:30 AM - 10:00 AM',
    status: 'confirmed',
    qrToken: 'PASS-1001',
    mlProbability: 0.94,
    registeredAt: '2026-09-24T10:14:00Z'
  },
  {
    id: 'reg-002',
    campaignId: 'camp-101',
    campaignName: 'Red Cross Central Emergency Camp',
    campaignDate: '2026-09-28',
    campaignLocation: 'Civil Hospital Premises, Wardha Road',
    donorName: 'Priya Patel',
    donorPhone: '+91 98230 44556',
    donorBloodType: 'B+',
    slotTime: '10:00 AM - 10:30 AM',
    status: 'attended',
    qrToken: 'PASS-1002',
    mlProbability: 0.88,
    registeredAt: '2026-09-24T11:20:00Z',
    attendedAt: '2026-09-25T10:15:32Z'
  },
  {
    id: 'reg-003',
    campaignId: 'camp-101',
    campaignName: 'Red Cross Central Emergency Camp',
    campaignDate: '2026-09-28',
    campaignLocation: 'Civil Hospital Premises, Wardha Road',
    donorName: 'Rahul Deshmukh',
    donorPhone: '+91 94221 99887',
    donorBloodType: 'AB-',
    slotTime: '11:00 AM - 11:30 AM',
    status: 'registered',
    qrToken: 'PASS-1003',
    mlProbability: 0.72,
    registeredAt: '2026-09-25T08:05:00Z'
  },
  {
    id: 'reg-004',
    campaignId: 'camp-101',
    campaignName: 'Red Cross Central Emergency Camp',
    campaignDate: '2026-09-28',
    campaignLocation: 'Civil Hospital Premises, Wardha Road',
    donorName: 'Sneha Kulkarni',
    donorPhone: '+91 91234 56789',
    donorBloodType: 'A+',
    slotTime: '11:30 AM - 12:00 PM',
    status: 'waitlisted',
    qrToken: 'PASS-1004',
    mlProbability: 0.65,
    registeredAt: '2026-09-25T09:30:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-8941260',
    timestamp: '2026-09-25 14:51:24',
    actor: 'system.worker_service',
    actorRole: 'TELEMETRY_ENGINE',
    action: 'ML_RETRAIN_EVALUATION',
    resource: 'model/gradient_boosting_v2.pkl',
    merkleHash: '0x9a8f2c...4e1b',
    status: 'VERIFIED'
  },
  {
    id: 'aud-8941259',
    timestamp: '2026-09-25 10:15:32',
    actor: 'volunteer.vikas_rao',
    actorRole: 'FIELD_VERIFIER',
    action: 'QR_PASS_REDEEMED_ATTENDANCE',
    resource: 'reg/PASS-1002',
    merkleHash: '0x7b12d4...88ef',
    status: 'TAMPER_PROOF'
  },
  {
    id: 'aud-8941258',
    timestamp: '2026-09-25 09:30:11',
    actor: 'organizer.dr_alok',
    actorRole: 'ORGANIZER',
    action: 'DYNAMIC_QUEUE_REBALANCE',
    resource: 'camp/camp-101:slot-s4',
    merkleHash: '0x4f89ac...120d',
    status: 'VERIFIED'
  },
  {
    id: 'aud-8941257',
    timestamp: '2026-09-24 16:45:00',
    actor: 'admin.s_deshmukh',
    actorRole: 'STATE_REGULATOR',
    action: 'CAMPAIGN_ACCREDITATION_APPROVED',
    resource: 'camp/camp-101',
    merkleHash: '0x12c4ba...77fe',
    status: 'TAMPER_PROOF'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { bloodGroup: 'O+', component: 'PRBC', unitsAvailable: 14, minimumSafeLevel: 30, status: 'CRITICAL', lastUpdated: '10 mins ago' },
  { bloodGroup: 'O-', component: 'Whole Blood', unitsAvailable: 6, minimumSafeLevel: 15, status: 'CRITICAL', lastUpdated: '15 mins ago' },
  { bloodGroup: 'A+', component: 'Whole Blood', unitsAvailable: 42, minimumSafeLevel: 25, status: 'OPTIMAL', lastUpdated: '22 mins ago' },
  { bloodGroup: 'B+', component: 'Platelets', unitsAvailable: 28, minimumSafeLevel: 20, status: 'ADEQUATE', lastUpdated: '5 mins ago' },
  { bloodGroup: 'B-', component: 'PRBC', unitsAvailable: 8, minimumSafeLevel: 15, status: 'SURGE_REQUIRED', lastUpdated: '1 hr ago' },
  { bloodGroup: 'AB-', component: 'FFP', unitsAvailable: 5, minimumSafeLevel: 10, status: 'CRITICAL', lastUpdated: '30 mins ago' }
];
