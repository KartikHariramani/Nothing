import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Heart, 
  Activity,
  QrCode,
  Zap,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { campaigns, navigateTo, switchRole } = useApp();
  const [searchCity, setSearchCity] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | null>(null);

  const bloodGroups = [
    { type: 'O+', status: 'CRITICAL', units: 14, min: 30, color: 'text-brand-red-600 bg-brand-red-50 border-brand-red-200' },
    { type: 'O-', status: 'CRITICAL', units: 6, min: 15, color: 'text-brand-red-600 bg-brand-red-50 border-brand-red-200' },
    { type: 'B-', status: 'SURGE_REQUIRED', units: 8, min: 15, color: 'text-brand-red-600 bg-brand-red-50 border-brand-red-200' },
    { type: 'AB-', status: 'CRITICAL', units: 5, min: 10, color: 'text-brand-red-600 bg-brand-red-50 border-brand-red-200' },
    { type: 'A+', status: 'OPTIMAL', units: 42, min: 25, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { type: 'B+', status: 'ADEQUATE', units: 28, min: 20, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { type: 'A-', status: 'ADEQUATE', units: 12, min: 12, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { type: 'AB+', status: 'OPTIMAL', units: 24, min: 15, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  ];

  const filteredCampaigns = campaigns.filter(c => {
    const matchesCity = searchCity === '' || c.city.toLowerCase().includes(searchCity.toLowerCase()) || c.location.toLowerCase().includes(searchCity.toLowerCase());
    const matchesBlood = !selectedBloodGroup || c.urgentShortageGroups.includes(selectedBloodGroup);
    return matchesCity && matchesBlood;
  });

  return (
    <div className="space-y-10 pb-16">
      
      {/* 1. HERO SECTION WITH SEARCH & URGENCY ANCHOR */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-surface to-neutral-50 border-b border-neutral-200 pt-8 sm:pt-14 pb-12 sm:pb-20">
        
        {/* Decorative background grid and gradients */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb15_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-red-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-96 h-96 bg-secondary-fixed/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* Badge & Official Demarcation */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-brand-red-50 text-brand-red-600 border border-brand-red-200">
              <span className="w-2 h-2 rounded-full bg-brand-red-500 animate-ping"></span>
              Live Mobilization Mesh
            </span>
            <span className="text-xs font-body text-neutral-500">
              National Health Mission · Nagpur Regional Hub
            </span>
          </div>

          {/* Display Headline */}
          <div className="max-w-3xl space-y-4">
            <h1 className="font-headline font-extrabold text-3xl sm:text-5xl lg:text-6xl text-trust-blue-700 tracking-tight leading-[1.12]">
              Connecting People. <br />
              <span className="text-brand-red-500">Mobilising Blood.</span> <br />
              Saving Precious Lives.
            </h1>
            <p className="font-body text-neutral-600 text-base sm:text-lg leading-relaxed max-w-2xl">
              Life Share eliminates donation drop-off through AI attendance prediction, single-use cryptographic QR passes, and automated waitlist queue rebalancing.
            </p>
          </div>

          {/* SEARCH & QUICK DISCOVERY CONSOLE */}
          <div className="mt-8 bg-surface-white rounded-2xl shadow-modal border border-neutral-200 p-4 sm:p-5 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* City / Location Input */}
              <div className="md:col-span-5 relative">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                  Location or Camp
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Enter city (e.g., Nagpur, Wardha)"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Blood Group Selector */}
              <div className="md:col-span-4 relative">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                  Blood Group
                </label>
                <select
                  value={selectedBloodGroup || ''}
                  onChange={(e) => setSelectedBloodGroup(e.target.value || null)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white transition"
                >
                  <option value="">All Blood Groups</option>
                  <option value="O+">O+ (Critical Need)</option>
                  <option value="O-">O- (Universal Donor)</option>
                  <option value="B+">B+ Positive</option>
                  <option value="B-">B- (Surge Required)</option>
                  <option value="A+">A+ Positive</option>
                  <option value="A-">A- Negative</option>
                  <option value="AB+">AB+ Positive</option>
                  <option value="AB-">AB- (Critical Shortage)</option>
                </select>
              </div>

              {/* Search Trigger Button */}
              <div className="md:col-span-3 md:self-end">
                <button
                  onClick={() => navigateTo('/drives', { city: searchCity, blood: selectedBloodGroup || '' })}
                  className="w-full py-2.5 px-4 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-sm transition-all shadow-md shadow-brand-red-500/20 flex items-center justify-center gap-2 active:scale-98"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Open Slots</span>
                </button>
              </div>

            </div>

            {/* Quick blood group pills */}
            <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-neutral-500 font-medium">Quick Filter:</span>
              {['O+', 'B-', 'AB-', 'O-', 'A+'].map(bg => (
                <button
                  key={bg}
                  onClick={() => setSelectedBloodGroup(selectedBloodGroup === bg ? null : bg)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono transition-all ${
                    selectedBloodGroup === bg
                      ? 'bg-brand-red-500 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {bg}
                </button>
              ))}
              {selectedBloodGroup && (
                <button
                  onClick={() => setSelectedBloodGroup(null)}
                  className="text-neutral-500 hover:text-neutral-800 underline text-[11px] ml-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* TELEMETRY KPI COUNTER RIBBON */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
            <div className="bg-surface-white/90 backdrop-blur rounded-xl p-3.5 border border-neutral-200">
              <p className="text-[11px] font-mono text-neutral-500 uppercase">Active Camps Today</p>
              <p className="font-headline font-bold text-2xl text-trust-blue-700 mt-0.5">14 Drives</p>
              <span className="text-[10px] text-emerald-600 font-medium">● 100% Accredited</span>
            </div>
            <div className="bg-surface-white/90 backdrop-blur rounded-xl p-3.5 border border-neutral-200">
              <p className="text-[11px] font-mono text-neutral-500 uppercase">Confirmed Donors</p>
              <p className="font-headline font-bold text-2xl text-brand-red-500 mt-0.5">384 Citizens</p>
              <span className="text-[10px] text-neutral-500 font-medium">92% AI Predicted Turnout</span>
            </div>
            <div className="bg-surface-white/90 backdrop-blur rounded-xl p-3.5 border border-neutral-200">
              <p className="text-[11px] font-mono text-neutral-500 uppercase">Units Mobilized</p>
              <p className="font-headline font-bold text-2xl text-trust-blue-700 mt-0.5">1,240 Units</p>
              <span className="text-[10px] text-emerald-600 font-medium">↑ 18% vs Monthly Avg</span>
            </div>
            <div className="bg-surface-white/90 backdrop-blur rounded-xl p-3.5 border border-neutral-200">
              <p className="text-[11px] font-mono text-neutral-500 uppercase">Queue Rebalances</p>
              <p className="font-headline font-bold text-2xl text-purple-700 mt-0.5">48 Instant</p>
              <span className="text-[10px] text-neutral-500 font-medium">Zero Waste Optimization</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. REGIONAL REAL-TIME BLOOD INVENTORY & SHORTAGE MATRIX */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface-white rounded-2xl border border-neutral-200 p-6 shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red-500 animate-pulse"></span>
                <h3 className="font-headline font-bold text-lg sm:text-xl text-neutral-900">
                  Nagpur District Blood Reserve Telemetry
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Real-time regional blood bank stock indicators for emergency trauma, surgery & oncology needs.
              </p>
            </div>
            <button 
              onClick={() => navigateTo('/blood-bank/dashboard')}
              className="text-xs font-semibold text-trust-blue-700 hover:text-brand-red-600 flex items-center gap-1"
            >
              <span>View Full Facility Grid</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {bloodGroups.map((bg) => (
              <div
                key={bg.type}
                onClick={() => setSelectedBloodGroup(selectedBloodGroup === bg.type ? null : bg.type)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer hover:shadow-card-hover ${
                  selectedBloodGroup === bg.type ? 'ring-2 ring-brand-red-500 scale-105' : ''
                } ${bg.color}`}
              >
                <p className="font-headline font-extrabold text-xl">{bg.type}</p>
                <p className="text-[10px] font-mono uppercase tracking-wider font-semibold mt-1">
                  {bg.status.replace('_', ' ')}
                </p>
                <div className="mt-2 pt-2 border-t border-current/20 text-xs font-mono font-medium">
                  <span>{bg.units}</span>
                  <span className="text-[10px] opacity-70"> / {bg.min} units</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 pt-2 border-t border-neutral-100 font-mono">
            <span>● RED: High deficit (Emergency donations urgently requested)</span>
            <span>● GREEN: Safe hospital buffer levels maintained</span>
          </div>
        </div>
      </section>

      {/* 3. FEATURED ACTIVE & ACCREDITED CAMPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-red-500" />
              <h2 className="font-headline font-bold text-2xl text-trust-blue-700">
                Featured Blood Mobilization Drives
              </h2>
            </div>
            <p className="text-sm text-neutral-600 mt-1">
              Statutorily accredited camps with dedicated cold-chain transport and verified phlebotomy staff.
            </p>
          </div>

          <button
            onClick={() => navigateTo('/drives')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg font-semibold text-xs transition"
          >
            <span>Browse All {campaigns.length} Drives</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Campaign Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.slice(0, 3).map((camp) => {
            const bookedPercent = Math.min(100, Math.round((camp.confirmedCount / camp.targetUnits) * 100));

            return (
              <div 
                key={camp.id}
                className="bg-surface-white rounded-2xl border border-neutral-200 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Header Strip */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Accredited
                    </span>
                    {camp.isEmergencySurge && (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-red-50 text-brand-red-600 border border-brand-red-200 animate-pulse">
                        Surge Priority
                      </span>
                    )}
                  </div>

                  <h3 
                    onClick={() => navigateTo('/drives/' + camp.id, { driveId: camp.id })}
                    className="font-headline font-bold text-lg text-neutral-900 group-hover:text-brand-red-600 transition-colors cursor-pointer leading-snug"
                  >
                    {camp.name}
                  </h3>

                  <p className="text-xs text-neutral-500 font-medium mt-1">
                    By {camp.organizer}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 mt-4 text-xs text-neutral-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="truncate">{camp.location}, {camp.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>{camp.date} · {camp.time}</span>
                    </div>
                  </div>

                  {/* Urgently needed blood groups */}
                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    <p className="text-[11px] font-semibold text-neutral-500 mb-1.5 uppercase tracking-wider">
                      Urgently Seeking:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {camp.urgentShortageGroups.map(bg => (
                        <span 
                          key={bg}
                          className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-brand-red-50 text-brand-red-600 border border-brand-red-100"
                        >
                          {bg}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Slot Capacity Meter */}
                  <div className="mt-4 pt-3 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-500 font-medium">Slot Bookings</span>
                      <span className="font-mono font-semibold text-trust-blue-700">
                        {camp.confirmedCount} / {camp.targetUnits} ({bookedPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          bookedPercent >= 90 ? 'bg-amber-500' : 'bg-brand-red-500'
                        }`}
                        style={{ width: `${bookedPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-3">
                  <span className="text-xs text-neutral-500">
                    {camp.slots.reduce((acc, s) => acc + s.remaining, 0)} open slots remaining
                  </span>
                  <button
                    onClick={() => navigateTo('/drives/' + camp.id, { driveId: camp.id })}
                    className="px-4 py-2 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
                  >
                    <span>Reserve Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 4. THE CONTINUOUS MOBILIZATION LOOP (Architecture from README) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-trust-blue-700 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-modal">
          
          {/* Subtle glow backdrop */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mb-10">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
              The Life Share Assurance
            </span>
            <h2 className="font-headline font-extrabold text-2xl sm:text-4xl text-white mt-3 tracking-tight">
              An Unbroken Loop: From Intention to Actual Arrival
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base mt-2 leading-relaxed">
              Standard blood drives suffer a 40% drop-off between registration and attendance. Life Share replaces uncertainty with a closed-loop algorithmic coordination mesh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 relative space-y-3">
              <div className="w-9 h-9 rounded-xl bg-brand-red-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                1
              </div>
              <h4 className="font-headline font-bold text-base text-white">2-Tier Consent & Slot Booking</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Donors choose exact 30-minute arrival windows and toggle granular consent for reminders and emergency shortage alerts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 relative space-y-3">
              <div className="w-9 h-9 rounded-xl bg-trust-blue-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                2
              </div>
              <h4 className="font-headline font-bold text-base text-white">ML Attendance Prediction</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Gradient Boosting algorithms evaluate historical arrival patterns to forecast turnout pacing and prevent bed overcrowding.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 relative space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                3
              </div>
              <h4 className="font-headline font-bold text-base text-white">Dynamic Queue Optimization</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                If a donor cancels, waitlisted donors are autonomously promoted in seconds via Telegram notifications.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 relative space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                4
              </div>
              <h4 className="font-headline font-bold text-base text-white">Single-Use QR Verification</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                On-site volunteers scan cryptographic QR passes in under 2 seconds, with absolute anti-duplicate scan rejection.
              </p>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Immutable cryptographic telemetry logged with Section 65B BNSS tamper-evidence.</span>
            </div>
            <button
              onClick={() => navigateTo('/about-faq')}
              className="px-4 py-2 bg-white text-trust-blue-700 hover:bg-neutral-100 rounded-lg font-headline font-bold text-xs transition shadow"
            >
              Explore Full Technical Architecture
            </button>
          </div>

        </div>
      </section>

      {/* 5. MULTI-ROLE ACCESS OPTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-100 rounded-3xl p-6 sm:p-8 border border-neutral-200">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-neutral-600 font-bold border border-neutral-200">
              Role-Specific Access
            </span>
            <h3 className="font-headline font-bold text-xl text-neutral-900 mt-2">
              Healthcare Stakeholder Login Portals
            </h3>
            <p className="text-xs text-neutral-600 mt-1">
              Select your role option to authenticate with Google or credentials and open your specific workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <button
              onClick={() => navigateTo('/login', { role: 'donor' })}
              className="p-3 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 text-center transition group shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-red-50 text-brand-red-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Heart className="w-4 h-4" />
              </div>
              <p className="font-semibold text-xs text-neutral-900">Citizen Donor</p>
              <p className="text-[10px] text-neutral-500">Sign In / Register</p>
            </button>

            <button
              onClick={() => navigateTo('/login', { role: 'organizer' })}
              className="p-3 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 text-center transition group shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-trust-blue-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <p className="font-semibold text-xs text-neutral-900">Camp Host</p>
              <p className="text-[10px] text-neutral-500">Host Dashboard</p>
            </button>

            <button
              onClick={() => navigateTo('/login', { role: 'volunteer' })}
              className="p-3 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 text-center transition group shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <QrCode className="w-4 h-4" />
              </div>
              <p className="font-semibold text-xs text-neutral-900">Field Volunteer</p>
              <p className="text-[10px] text-neutral-500">Kiosk Scanner</p>
            </button>

            <button
              onClick={() => navigateTo('/login', { role: 'admin' })}
              className="p-3 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 text-center transition group shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="font-semibold text-xs text-neutral-900">State Council</p>
              <p className="text-[10px] text-neutral-500">Governance Portal</p>
            </button>

            <button
              onClick={() => navigateTo('/login', { role: 'blood_bank' })}
              className="p-3 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 text-center transition group shadow-sm col-span-2 sm:col-span-1"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <p className="font-semibold text-xs text-neutral-900">Blood Bank</p>
              <p className="text-[10px] text-neutral-500">Component Reserve</p>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
