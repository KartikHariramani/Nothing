import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Clock, 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  Heart, 
  Send, 
  CheckCircle2, 
  Lock,
  ArrowRight
} from 'lucide-react';

export const RegistrationPage: React.FC = () => {
  const { campaigns, routeParams, navigateTo, registerDonor, currentUser } = useApp();
  const driveId = routeParams.driveId || 'camp-101';
  const slotTime = routeParams.slotTime || '09:30 AM - 10:00 AM';
  const campaign = campaigns.find(c => c.id === driveId) || campaigns[0];

  const [name, setName] = useState(currentUser.name || 'Aarav Sharma');
  const [phone, setPhone] = useState(currentUser.phone || '+91 98230 11223');
  const [bloodType, setBloodType] = useState(currentUser.bloodType || 'O+');
  const [age, setAge] = useState('26');
  const [telegramHandle, setTelegramHandle] = useState('@aarav_donates');

  // Mandatory 2-Tier Consent Toggles
  const [tier1Consent, setTier1Consent] = useState(true);
  const [tier2Consent, setTier2Consent] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newReg = registerDonor(campaign.id, slotTime, {
      name,
      phone,
      bloodType
    });

    navigateTo('/pass/' + newReg.id, { registrationId: newReg.id });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigateTo('/drives/' + campaign.id, { driveId: campaign.id })}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-trust-blue-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Slot Selection</span>
      </button>

      {/* Booking Header */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-brand-red-50 text-brand-red-600 border border-brand-red-200">
              Step 2 of 2: Donor Intake & Consent
            </span>
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-trust-blue-700 mt-2">
              Confirm Your Donation Appointment
            </h1>
          </div>

          <div className="bg-neutral-50 px-4 py-2.5 rounded-xl border border-neutral-200 text-right">
            <p className="text-[11px] font-mono text-neutral-500 uppercase font-semibold">Selected Arrival Time</p>
            <p className="font-headline font-bold text-sm text-brand-red-600">{slotTime}</p>
          </div>
        </div>

        {/* Camp summary chip */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
          <span className="font-semibold text-neutral-900">{campaign.name}</span>
          <span>·</span>
          <span>{campaign.location}, {campaign.city}</span>
          <span>·</span>
          <span>{campaign.date}</span>
        </div>
      </div>

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-8">
        
        {/* Personal Details */}
        <div>
          <h3 className="font-headline font-bold text-base text-neutral-900 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-brand-red-500" />
            <span>Donor Identity & Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Mobile Number (For Pass & OTP)</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Blood Group</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white font-mono font-bold"
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

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Age (Years)</label>
              <input
                type="number"
                min="18"
                max="65"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Telegram Integration Option */}
        <div className="pt-6 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline font-bold text-base text-neutral-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-500" />
              <span>Telegram Bot Notifications (Optional)</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-semibold">
              Instant Queue Alerts
            </span>
          </div>
          <p className="text-xs text-neutral-500 mb-3">
            Link your Telegram handle to receive T-3h check-in reminders, instant promotion alerts if promoted from the waitlist, and digital pass download links.
          </p>
          <div className="max-w-xs">
            <input
              type="text"
              value={telegramHandle}
              onChange={(e) => setTelegramHandle(e.target.value)}
              placeholder="@username"
              className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white font-mono"
            />
          </div>
        </div>

        {/* 2-TIER EXPLICIT CONSENT ARCHITECTURE (Mandatory per README) */}
        <div className="pt-6 border-t border-neutral-100 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-trust-blue-700" />
            <h3 className="font-headline font-bold text-base text-neutral-900">
              Statutory 2-Tier Communication Consent
            </h3>
          </div>
          <p className="text-xs text-neutral-500">
            In compliance with DPDP Act 2023 & Section 65B BNSS, your consent is strictly demarcated into two independent opt-ins. You can revoke either anytime from your settings.
          </p>

          <div className="space-y-3">
            
            {/* Tier 1 Toggle */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
              <input
                id="tier1"
                type="checkbox"
                required
                checked={tier1Consent}
                onChange={(e) => setTier1Consent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-trust-blue-700 focus:ring-trust-blue-500"
              />
              <label htmlFor="tier1" className="text-xs text-neutral-700 cursor-pointer select-none">
                <strong className="text-neutral-900 block font-semibold text-xs mb-0.5">
                  Tier 1: Camp Appointment & Turnout Reminders (Required for Booking)
                </strong>
                I consent to receiving appointment confirmation tokens, queue placement updates, and arrival reminders via SMS / Telegram for this specific drive.
              </label>
            </div>

            {/* Tier 2 Toggle */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-start gap-3">
              <input
                id="tier2"
                type="checkbox"
                checked={tier2Consent}
                onChange={(e) => setTier2Consent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-brand-red-600 focus:ring-brand-red-500"
              />
              <label htmlFor="tier2" className="text-xs text-neutral-700 cursor-pointer select-none">
                <strong className="text-neutral-900 block font-semibold text-xs mb-0.5">
                  Tier 2: Regional Emergency Surge Broadcasts (Recommended)
                </strong>
                I consent to receiving alerts when there is a critical shortage of my blood type ({bloodType}) within a 25 km radius due to mass casualty incidents or trauma emergencies.
              </label>
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-neutral-500 font-mono">
            Cryptographic single-use token will be generated on submission.
          </p>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-xs transition-all shadow-md shadow-brand-red-500/20 flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Generate Digital QR Pass</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>

    </div>
  );
};
