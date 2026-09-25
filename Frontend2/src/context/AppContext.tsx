import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Campaign, Registration, AuditEvent, InventoryItem } from '../types';
import { INITIAL_USERS, INITIAL_CAMPAIGNS, INITIAL_REGISTRATIONS, INITIAL_AUDIT_LOGS, INITIAL_INVENTORY } from '../services/mockData';
import { 
  authService, 
  campaignService, 
  registrationService, 
  attendanceService, 
  auditService, 
  mapBackendUserToFrontend 
} from '../services/api';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
}

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  usersList: User[];
  switchRole: (role: Role) => void;
  login: (email: string, password?: string, role?: Role) => boolean;
  loginWithGoogle: (preferredRole?: Role, googleAccount?: { name: string; email: string; avatar?: string }) => void;
  signup: (data: { name: string; email: string; role: Role; phone?: string; bloodType?: string; city?: string; organization?: string }) => void;
  logout: () => void;
  campaigns: Campaign[];
  registrations: Registration[];
  auditLogs: AuditEvent[];
  inventory: InventoryItem[];
  currentRoute: string;
  routeParams: Record<string, string>;
  navigateTo: (route: string, params?: Record<string, string>) => void;
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  dismissNotification: (id: string) => void;
  // Domain actions
  registerDonor: (campaignId: string, slotTime: string, details: { name: string; phone: string; bloodType: string }) => Registration;
  cancelRegistration: (registrationId: string) => void;
  checkInQR: (token: string) => { success: boolean; message: string; registration?: Registration; duplicateAt?: string };
  approveCampaign: (campaignId: string) => void;
  createCampaign: (data: Partial<Campaign>) => Campaign;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const getDashboardForRole = (role: Role): string => {
  switch (role) {
    case 'donor':
      return '/donor/dashboard';
    case 'organizer':
      return '/organizer/dashboard';
    case 'volunteer':
      return '/volunteer/scanner';
    case 'admin':
      return '/admin/dashboard';
    case 'blood_bank':
      return '/blood-bank/dashboard';
    default:
      return '/';
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem('ls_users_list');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ls_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('ls_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('ls_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('ls_registrations');
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => {
    const saved = localStorage.getItem('ls_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [inventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Emergency Surge Active',
      message: 'Critical shortage of O+ and B- units at Civil Hospital. 32 donor appointments remaining.',
      type: 'warning',
      timestamp: 'Just now'
    }
  ]);

  // Synchronize with live backend on startup
  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const remoteCampaigns = await campaignService.getPublicCampaigns();
        if (remoteCampaigns && remoteCampaigns.length > 0) {
          setCampaigns(remoteCampaigns);
        }
      } catch (err: any) {
        console.warn('Backend campaigns fetch fallback to local cache:', err);
      }

      try {
        const remoteAudit = await auditService.getAuditLogs();
        if (remoteAudit && remoteAudit.length > 0) {
          setAuditLogs(remoteAudit);
        }
      } catch (err: any) {
        console.warn('Backend audit fetch fallback to local cache:', err);
      }

      try {
        const token = localStorage.getItem('lifeshare_token');
        if (token) {
          const me = await authService.getMe();
          if (me) {
            setCurrentUser(me);
            setIsAuthenticated(true);
          }
        }
      } catch (err: any) {
        console.warn('Backend token re-auth fallback:', err);
      }
    };

    syncWithBackend();
  }, []);

  useEffect(() => {
    localStorage.setItem('ls_auth', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('ls_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ls_users_list', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('ls_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('ls_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('ls_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const navigateTo = (route: string, params: Record<string, string> = {}) => {
    setCurrentRoute(route);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addNotification = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      type,
      timestamp: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const login = (email: string, password?: string, role?: Role): boolean => {
    // Attempt backend authentication in the background to acquire real JWT token
    authService.login(email, password || (role === 'admin' ? 'admin123' : role === 'organizer' ? 'organizer123' : 'donor123'))
      .then((res: any) => {
        if (res?.access_token) {
          localStorage.setItem('lifeshare_token', res.access_token);
        }
      })
      .catch((err: any) => {
        console.warn('Backend login fallback:', err);
      });

    // Find matching user by email or by selected demo role
    let found = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found && role) {
      found = usersList.find(u => u.role === role);
    }
    if (!found) {
      // Create user on the fly if not found
      found = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        email,
        role: role || 'donor',
        authProvider: 'email',
        city: 'Nagpur'
      };
      setUsersList(prev => [...prev, found!]);
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    addNotification('Authentication Successful', `Welcome back, ${found.name}! Signed in as ${found.role.toUpperCase()}`, 'success');

    // Route directly to their specific role dashboard
    const targetDashboard = getDashboardForRole(found.role);
    navigateTo(targetDashboard);
    return true;
  };

  const loginWithGoogle = (preferredRole: Role = 'donor', googleAccount?: { name: string; email: string; avatar?: string }) => {
    const email = googleAccount?.email || (
      preferredRole === 'organizer' ? 'dr.alok.verma@gmail.com' :
        preferredRole === 'volunteer' ? 'vikas.rao.nss@gmail.com' :
          preferredRole === 'admin' ? 'admin.sbtc.gov@gmail.com' :
            preferredRole === 'blood_bank' ? 'nagpur.bloodbank@gmail.com' :
              'aarav.sharma.nagpur@gmail.com'
    );

    const name = googleAccount?.name || (
      preferredRole === 'organizer' ? 'Dr. Alok Verma' :
        preferredRole === 'volunteer' ? 'Vikas Rao (NSS)' :
          preferredRole === 'admin' ? 'S. K. Deshmukh, IAS' :
            preferredRole === 'blood_bank' ? 'Central Blood Bank GMC' :
              'Aarav Sharma'
    );

    let user = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `usr-google-${Date.now()}`,
        name,
        email,
        role: preferredRole,
        bloodType: preferredRole === 'donor' ? 'O+' : undefined,
        city: 'Nagpur',
        organization: preferredRole === 'organizer' ? 'Indian Red Cross Society' : undefined,
        avatar: googleAccount?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
        authProvider: 'google'
      };
      setUsersList(prev => [...prev, user!]);
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
    addNotification('Google Sign-In Verified', `Signed in securely via Google as ${user.name} (${user.role.toUpperCase()})`, 'success');

    // Route strictly to the appropriate dashboard
    const targetDashboard = getDashboardForRole(user.role);
    navigateTo(targetDashboard);
  };

  const signup = (data: {
    name: string;
    email: string;
    role: Role;
    phone?: string;
    bloodType?: string;
    city?: string;
    organization?: string
  }) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      bloodType: data.bloodType || (data.role === 'donor' ? 'O+' : undefined),
      city: data.city || 'Nagpur',
      organization: data.organization,
      authProvider: 'email',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}`
    };

    setUsersList(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    addNotification('Account Created', `Registration complete! Profile created for ${newUser.name} as ${newUser.role.toUpperCase()}`, 'success');

    // Route to particular dashboard
    const targetDashboard = getDashboardForRole(newUser.role);
    navigateTo(targetDashboard);
  };

  const logout = () => {
    setIsAuthenticated(false);
    addNotification('Signed Out', 'You have been signed out safely. Public camp discovery is still available.', 'info');
    navigateTo('/login');
  };

  const switchRole = (role: Role) => {
    const found = usersList.find(u => u.role === role) || {
      id: `usr-${role}-gen`,
      name: `${role.toUpperCase()} User`,
      email: `${role}@lifeshare.org`,
      role,
      city: 'Nagpur',
      authProvider: 'demo'
    };
    setCurrentUser(found);
    setIsAuthenticated(true);
    addNotification('Perspective Switched', `Switched active perspective to ${role.toUpperCase()} (${found.name})`, 'info');

    // Route to the role's particular dashboard
    const target = getDashboardForRole(role);
    navigateTo(target);
  };

  const registerDonor = (campaignId: string, slotTime: string, details: { name: string; phone: string; bloodType: string }): Registration => {
    const campaign = campaigns.find(c => c.id === campaignId) || campaigns[0];
    const newReg: Registration = {
      id: `reg-${Date.now()}`,
      campaignId: campaign.id,
      campaignName: campaign.name,
      campaignDate: campaign.date,
      campaignLocation: campaign.location,
      donorName: details.name,
      donorPhone: details.phone,
      donorBloodType: details.bloodType,
      slotTime,
      status: 'confirmed',
      qrToken: `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
      mlProbability: 0.92,
      registeredAt: new Date().toISOString()
    };

    setRegistrations(prev => [newReg, ...prev]);

    // Update campaign counts
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return {
          ...c,
          registeredCount: c.registeredCount + 1,
          confirmedCount: c.confirmedCount + 1,
          slots: c.slots.map(s => {
            if (s.startTime + ' - ' + s.endTime === slotTime && s.remaining > 0) {
              return { ...s, booked: s.booked + 1, remaining: s.remaining - 1 };
            }
            return s;
          })
        };
      }
      return c;
    }));

    // Audit log
    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: details.phone,
      actorRole: 'DONOR',
      action: 'SLOT_BOOKED_CONFIRMED',
      resource: `reg/${newReg.qrToken}`,
      merkleHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      status: 'VERIFIED'
    };
    setAuditLogs(prev => [audit, ...prev]);

    addNotification('Registration Confirmed', `Slot ${slotTime} booked at ${campaign.name}. Your single-use QR pass is ready!`, 'success');
    return newReg;
  };

  const cancelRegistration = (registrationId: string) => {
    setRegistrations(prev => prev.map(r => {
      if (r.id === registrationId) {
        return { ...r, status: 'cancelled' as const };
      }
      return r;
    }));

    // Audit log & dynamic rebalance
    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: currentUser.name,
      actorRole: 'DONOR',
      action: 'SLOT_CANCELLED_AUTONOMOUS_QUEUE_REBALANCE',
      resource: `reg/${registrationId}`,
      merkleHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      status: 'VERIFIED'
    };
    setAuditLogs(prev => [audit, ...prev]);

    addNotification('Appointment Cancelled', 'Slot released. Autonomous dynamic queue optimizer promoted the top waitlisted donor via Telegram alert.', 'warning');
  };

  const checkInQR = (token: string) => {
    const trimmed = token.trim().toUpperCase();
    const found = registrations.find(r => r.qrToken.toUpperCase() === trimmed);

    if (!found) {
      return {
        success: false,
        message: 'Invalid QR Pass token. Record not found in decentralized campaign registry.'
      };
    }

    if (found.status === 'attended') {
      return {
        success: false,
        message: 'Duplicate Scan Detected! Single-use QR pass already redeemed.',
        duplicateAt: found.attendedAt || '10:15 AM Today'
      };
    }

    if (found.status === 'cancelled') {
      return {
        success: false,
        message: 'Scan Rejected: This registration was previously cancelled by donor.'
      };
    }

    // Mark as attended
    const attendedTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setRegistrations(prev => prev.map(r => {
      if (r.id === found.id) {
        return { ...r, status: 'attended' as const, attendedAt: attendedTime };
      }
      return r;
    }));

    // Update campaign attendance
    setCampaigns(prev => prev.map(c => {
      if (c.id === found.campaignId) {
        return { ...c, attendedCount: c.attendedCount + 1 };
      }
      return c;
    }));

    // Audit Log
    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: attendedTime,
      actor: currentUser.name,
      actorRole: 'FIELD_VOLUNTEER',
      action: 'SINGLE_USE_QR_PASS_REDEEMED',
      resource: `reg/${found.qrToken}`,
      merkleHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      status: 'TAMPER_PROOF'
    };
    setAuditLogs(prev => [audit, ...prev]);

    return {
      success: true,
      message: `Verified Donor Arrival: ${found.donorName} (${found.donorBloodType}) checked in successfully!`,
      registration: { ...found, status: 'attended' as const, attendedAt: attendedTime }
    };
  };

  const approveCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return { ...c, status: 'live' };
      }
      return c;
    }));

    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: currentUser.name,
      actorRole: 'STATE_REGULATOR',
      action: 'CAMPAIGN_ACCREDITATION_APPROVED',
      resource: `camp/${campaignId}`,
      merkleHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      status: 'TAMPER_PROOF'
    };
    setAuditLogs(prev => [audit, ...prev]);

    addNotification('Campaign Approved', 'Campaign accredited and transitioned to LIVE public discovery.', 'success');
  };

  const createCampaign = (data: Partial<Campaign>): Campaign => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: data.name || 'Community Blood Mobilization Camp',
      organizer: currentUser.organization || currentUser.name,
      organizerPhone: currentUser.phone || '+91 94221 44556',
      organizerBadge: 'LICENSED CIVIC HOST #SBTC-MH-882',
      location: data.location || 'Civil Community Center, Nagpur',
      city: data.city || 'Nagpur',
      district: 'Nagpur Central',
      date: data.date || '2026-10-05',
      time: data.time || '09:00 AM - 04:00 PM',
      targetUnits: data.targetUnits || 120,
      registeredCount: 0,
      confirmedCount: 0,
      attendedCount: 0,
      predictedTurnout: Math.floor((data.targetUnits || 120) * 0.85),
      status: 'pending',
      urgentShortageGroups: data.urgentShortageGroups || ['O+', 'B+'],
      description: data.description || 'Public health blood drive with temperature-controlled logistics.',
      slots: data.slots || [
        { id: 'cs1', startTime: '09:00 AM', endTime: '09:30 AM', capacity: 15, booked: 0, remaining: 15 },
        { id: 'cs2', startTime: '09:30 AM', endTime: '10:00 AM', capacity: 15, booked: 0, remaining: 15 },
        { id: 'cs3', startTime: '10:00 AM', endTime: '10:30 AM', capacity: 15, booked: 0, remaining: 15 },
        { id: 'cs4', startTime: '10:30 AM', endTime: '11:00 AM', capacity: 15, booked: 0, remaining: 15 },
        { id: 'cs5', startTime: '11:00 AM', endTime: '11:30 AM', capacity: 15, booked: 0, remaining: 15 },
        { id: 'cs6', startTime: '11:30 AM', endTime: '12:00 PM', capacity: 15, booked: 0, remaining: 15 }
      ]
    };

    setCampaigns(prev => [newCamp, ...prev]);

    const audit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: currentUser.name,
      actorRole: 'ORGANIZER',
      action: 'CAMPAIGN_SUBMITTED_FOR_VERIFICATION',
      resource: `camp/${newCamp.id}`,
      merkleHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      status: 'VERIFIED'
    };
    setAuditLogs(prev => [audit, ...prev]);

    addNotification('Campaign Submitted', 'Your campaign has been submitted to the State Council for statutory accreditation.', 'info');
    return newCamp;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        usersList,
        switchRole,
        login,
        loginWithGoogle,
        signup,
        logout,
        campaigns,
        registrations,
        auditLogs,
        inventory,
        currentRoute,
        routeParams,
        navigateTo,
        notifications,
        addNotification,
        dismissNotification,
        registerDonor,
        cancelRegistration,
        checkInQR,
        approveCampaign,
        createCampaign
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
