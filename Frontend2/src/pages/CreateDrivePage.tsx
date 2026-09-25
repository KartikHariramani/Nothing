import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Building2, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';

export const CreateDrivePage: React.FC = () => {
  const { createCampaign, navigateTo, currentUser } = useApp();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Nagpur');
  const [date, setDate] = useState('2026-10-10');
  const [targetUnits, setTargetUnits] = useState(150);
  const [description, setDescription] = useState('');
  const [isSurge, setIsSurge] = useState(false);
  const [shortageGroups, setShortageGroups] = useState<string[]>(['O+', 'B-']);

  const bloodGroupOptions = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const toggleGroup = (bg: string) => {
    setShortageGroups(prev => 
      prev.includes(bg) ? prev.filter(g => g !== bg) : [...prev, bg]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    createCampaign({
      name,
      location,
      city,
      date,
      targetUnits: Number(targetUnits),
      description,
      isEmergencySurge: isSurge,
      urgentShortageGroups: shortageGroups
    });

    navigateTo('/organizer/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigateTo('/organizer/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-trust-blue-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Organizer Dashboard</span>
      </button>

      {/* Header */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-3">
        <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-trust-blue-50 text-trust-blue-700 border border-trust-blue-200">
          Campaign Accreditation Intake
        </span>
        <h1 className="font-headline font-bold text-2xl sm:text-3xl text-trust-blue-700">
          Schedule & Accredit a Blood Mobilization Drive
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
          Submit your camp parameters to the State Blood Transfusion Council. Once verified, auto-segmented 30-minute booking slots will be unlocked for public donor discovery.
        </p>
      </div>

      {/* Drive Form */}
      <form onSubmit={handleSubmit} className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-8">
        
        {/* Core Info */}
        <div className="space-y-4">
          <h3 className="font-headline font-bold text-base text-neutral-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-red-500" />
            <span>Camp Identity & Host Facility</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Official Camp Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., VNIT Campus Blood Donation Drive"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Venue Address / Landmark</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Auditorium Hall, South Ambazari Road"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">City / District</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Quotas */}
        <div className="pt-6 border-t border-neutral-100 space-y-4">
          <h3 className="font-headline font-bold text-base text-neutral-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-trust-blue-700" />
            <span>Date & Capacity Quotas</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Camp Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Target Mobilization (Units)</label>
              <input
                type="number"
                min="50"
                max="1000"
                step="10"
                required
                value={targetUnits}
                onChange={(e) => setTargetUnits(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Operating Hours</label>
              <input
                type="text"
                readOnly
                value="09:00 AM - 04:00 PM (Auto 30m slots)"
                className="w-full px-3 py-2 text-sm bg-neutral-100 border border-neutral-200 rounded-lg font-mono text-neutral-500"
              />
            </div>
          </div>
        </div>

        {/* Urgent Shortage Groups */}
        <div className="pt-6 border-t border-neutral-100 space-y-3">
          <label className="block text-xs font-semibold text-neutral-700">
            Target Shortage Blood Types for this Drive:
          </label>
          <div className="flex flex-wrap gap-2">
            {bloodGroupOptions.map(bg => {
              const active = shortageGroups.includes(bg);
              return (
                <button
                  type="button"
                  key={bg}
                  onClick={() => toggleGroup(bg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                    active
                      ? 'bg-brand-red-500 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {bg}
                </button>
              );
            })}
          </div>
        </div>

        {/* Emergency Surge Checkbox */}
        <div className="pt-6 border-t border-neutral-100">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <input
              id="surge"
              type="checkbox"
              checked={isSurge}
              onChange={(e) => setIsSurge(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-brand-red-600 focus:ring-brand-red-500"
            />
            <label htmlFor="surge" className="text-xs text-amber-900 cursor-pointer select-none">
              <strong className="block font-semibold mb-0.5">Emergency Surge Priority Designation</strong>
              Mark this drive with critical alert badges and trigger automated Telegram broadcasts to registered donors within a 25 km radius.
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
          <p className="text-xs text-neutral-500 font-mono">
            Requires approval by State Council before public listing.
          </p>

          <button
            type="submit"
            className="px-8 py-3 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-xs transition shadow-md shadow-brand-red-500/20 active:scale-98"
          >
            Submit for Statutory Accreditation
          </button>
        </div>

      </form>

    </div>
  );
};
