import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  Heart, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  QrCode, 
  Activity, 
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, loginWithGoogle, signup, navigateTo, routeParams } = useApp();

  const [selectedRole, setSelectedRole] = useState<Role>(() => {
    return (routeParams.role as Role) || 'donor';
  });

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [organization, setOrganization] = useState('');
  const [city, setCity] = useState('Nagpur');

  // Google Modal Simulation State
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  useEffect(() => {
    if (routeParams.role) {
      setSelectedRole(routeParams.role as Role);
    }
  }, [routeParams.role]);

  const rolePortals: {
    role: Role;
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    color: string;
    accentBg: string;
    borderColor: string;
    demoUser: { name: string; email: string; details: string };
  }[] = [
    {
      role: 'donor',
      title: 'Citizen Donor Portal',
      subtitle: 'Donors & Volunteers',
      description: 'Book 30-min camp arrival slots, manage 2-tier consent, and access digital single-use QR passes.',
      icon: Heart,
      color: 'text-brand-red-500',
      accentBg: 'bg-brand-red-50',
      borderColor: 'border-brand-red-500',
      demoUser: { name: 'Aarav Sharma', email: 'aarav@gmail.com', details: 'Blood Type: O+ Positive' }
    },
    {
      role: 'organizer',
      title: 'Camp Host & Organizer Portal',
      subtitle: 'NGOs & Healthcare Hosts',
      description: 'Accredit community drives, inspect Scikit-learn turnout pacing forecasts, and manage live donor rosters.',
      icon: Building2,
      color: 'text-trust-blue-700',
      accentBg: 'bg-trust-blue-50',
      borderColor: 'border-trust-blue-700',
      demoUser: { name: 'Dr. Alok Verma', email: 'organizer@lifeshare.org', details: 'Indian Red Cross Chapter #401' }
    },
    {
      role: 'volunteer',
      title: 'Field Volunteer Kiosk Portal',
      subtitle: 'On-Site Verification Staff',
      description: 'Ultra-fast QR check-in scanner PWA with cryptographic single-use redemption and anti-duplicate scan rejection.',
      icon: QrCode,
      color: 'text-emerald-700',
      accentBg: 'bg-emerald-50',
      borderColor: 'border-emerald-700',
      demoUser: { name: 'Vikas Rao', email: 'volunteer@lifeshare.org', details: 'NSS Field Volunteer Desk #01' }
    },
    {
      role: 'admin',
      title: 'State Council Regulatory Portal',
      subtitle: 'Government & Transfusion Council',
      description: 'Statutory camp approvals, regional emergency surge broadcasts, and Section 65B BNSS Merkle audit logs.',
      icon: ShieldCheck,
      color: 'text-purple-700',
      accentBg: 'bg-purple-50',
      borderColor: 'border-purple-700',
      demoUser: { name: 'S. K. Deshmukh, IAS', email: 'admin@lifeshare.org', details: 'State Blood Transfusion Council' }
    },
    {
      role: 'blood_bank',
      title: 'Blood Bank Facility Portal',
      subtitle: 'Hospitals & Storage Centers',
      description: 'Track real-time component fractions (PRBC, Whole Blood, Platelets, FFP) and cold-chain camp intake batches.',
      icon: Activity,
      color: 'text-amber-700',
      accentBg: 'bg-amber-50',
      borderColor: 'border-amber-700',
      demoUser: { name: 'Nagpur Central Blood Bank', email: 'central@bloodbank.gov.in', details: 'Government Medical College & Hospital' }
    }
  ];

  const currentPortal = rolePortals.find(p => p.role === selectedRole) || rolePortals[0];

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || currentPortal.demoUser.email, password, selectedRole);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    signup({
      name: fullName || 'New Registered User',
      email: email || `${selectedRole}.user@lifeshare.org`,
      role: selectedRole,
      phone,
      bloodType,
      city,
      organization: selectedRole !== 'donor' ? organization : undefined
    });
  };

  const handleGoogleAuth = () => {
    loginWithGoogle(selectedRole, {
      name: currentPortal.demoUser.name,
      email: `${selectedRole}.${currentPortal.demoUser.email.split('@')[0]}@gmail.com`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${currentPortal.demoUser.name}`
    });
  };

  const handleQuickDemoLogin = () => {
    login(currentPortal.demoUser.email, 'demo123', selectedRole);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative">
      
      {/* Ambient background decoration */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-red-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-secondary-fixed/40 rounded-full blur-3xl pointer-events-none" />

      {/* Page Title & Context */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-trust-blue-50 text-trust-blue-700 border border-trust-blue-200">
          Section 65B BNSS Authenticated Access
        </span>
        <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-trust-blue-700 tracking-tight">
          Select Your Healthcare Access Portal
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed">
          Life Share strictly isolates permissions by stakeholder. Select your role option below to sign in or register into your dedicated operational workspace.
        </p>
      </div>

      {/* 1. ROLE FEATURE AS DIFFERENT LOGIN OPTIONS (CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {rolePortals.map((portal) => {
          const Icon = portal.icon;
          const isSelected = selectedRole === portal.role;

          return (
            <button
              key={portal.role}
              type="button"
              onClick={() => {
                setSelectedRole(portal.role);
                setEmail('');
                setPassword('');
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between overflow-hidden group ${
                isSelected
                  ? `${portal.borderColor} ${portal.accentBg} ring-2 ring-current/20 shadow-md scale-[1.02]`
                  : 'border-neutral-200 bg-surface-white hover:border-neutral-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${portal.color} bg-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-600">
                      Option
                    </span>
                  )}
                </div>

                <h3 className="font-headline font-bold text-sm text-neutral-900 leading-tight">
                  {portal.title}
                </h3>
                <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                  {portal.subtitle}
                </p>
                <p className="text-[11px] text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                  {portal.description}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-current/10 flex items-center justify-between text-[11px] font-semibold">
                <span className={portal.color}>
                  {isSelected ? 'Active Portal' : 'Select Option'}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 ${portal.color}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. AUTHENTICATION CONSOLE FOR THE SELECTED ROLE */}
      <div className="max-w-xl mx-auto bg-surface-white rounded-3xl border border-neutral-200 shadow-modal overflow-hidden">
        
        {/* Portal Header Strip */}
        <div className={`p-6 border-b border-neutral-200 ${currentPortal.accentBg} flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center ${currentPortal.color}`}>
              <currentPortal.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-neutral-800 shadow-xs">
                  {currentPortal.role.replace('_', ' ')} Option
                </span>
              </div>
              <h2 className="font-headline font-bold text-lg text-neutral-900 mt-0.5">
                {currentPortal.title}
              </h2>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono text-neutral-500">Target Workspace:</span>
            <p className="text-xs font-semibold text-neutral-800 capitalize">
              /{currentPortal.role.replace('_', '-')}/dashboard
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Sign In vs Sign Up Tabs */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => setTab('signin')}
              className={`py-2 text-xs font-headline font-semibold rounded-lg transition-all ${
                tab === 'signin'
                  ? 'bg-surface-white text-trust-blue-700 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Sign In as {currentPortal.subtitle.split('&')[0]}
            </button>
            <button
              type="button"
              onClick={() => setTab('signup')}
              className={`py-2 text-xs font-headline font-semibold rounded-lg transition-all ${
                tab === 'signup'
                  ? 'bg-surface-white text-trust-blue-700 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Register New Profile
            </button>
          </div>

          {/* GOOGLE AUTHENTICATION BUTTON FOR THIS SELECTED ROLE */}
          <div>
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-3 px-4 bg-white hover:bg-neutral-50 border border-neutral-300 hover:border-neutral-400 rounded-xl font-headline font-semibold text-xs text-neutral-800 shadow-sm transition-all flex items-center justify-center gap-3 active:scale-98"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google as {currentPortal.subtitle.split('&')[0]}</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-[11px] text-neutral-400 font-mono uppercase">or use official credentials</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
          </div>

          {/* TAB CONTENT */}
          {tab === 'signin' ? (
            /* SIGN IN FORM */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address / Registered Identifier
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={currentPortal.demoUser.email}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700">Password / Access PIN</label>
                  <span className="text-[11px] text-neutral-400 font-mono">Demo: Any password</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Authorize & Open {currentPortal.title.replace('Portal', '')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* 1-Click Instant Demo Login for this role */}
              <div className="pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className={`w-full p-3 rounded-xl border border-neutral-200 ${currentPortal.accentBg} hover:opacity-95 transition text-left flex items-center justify-between text-xs`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        1-Click Demo Login as {currentPortal.demoUser.name}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono">
                        {currentPortal.demoUser.email} · {currentPortal.demoUser.details}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name / Official Rep</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Contact Mobile</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98230 XXXXX"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white font-mono"
                  />
                </div>

                {selectedRole === 'donor' ? (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Blood Group</label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white font-mono font-bold"
                    >
                      <option value="O+">O+ Positive</option>
                      <option value="O-">O- Negative</option>
                      <option value="A+">A+ Positive</option>
                      <option value="A-">A- Negative</option>
                      <option value="B+">B+ Positive</option>
                      <option value="B-">B- Negative</option>
                      <option value="AB+">AB+ Positive</option>
                      <option value="AB-">AB- Negative</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Organization / Statutory License
                    </label>
                    <input
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Red Cross Chapter #401"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Register & Open {currentPortal.title.replace('Portal', '')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
