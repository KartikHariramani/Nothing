import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  AlertCircle, 
  Phone, 
  Share2, 
  HeartHandshake,
  ArrowRight
} from 'lucide-react';

export const DriveDetailPage: React.FC = () => {
  const { campaigns, routeParams, navigateTo } = useApp();
  const driveId = routeParams.driveId || 'camp-101';
  const campaign = campaigns.find(c => c.id === driveId) || campaigns[0];

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigateTo('/drives')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-trust-blue-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Camp Directory</span>
      </button>

      {/* Main Hero Header */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {campaign.organizerBadge || 'SBTC Accredited Camp'}
              </span>
              {campaign.isEmergencySurge && (
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-brand-red-50 text-brand-red-600 border border-brand-red-200 animate-pulse">
                  Emergency Shortage Priority
                </span>
              )}
            </div>

            <h1 className="font-headline font-bold text-2xl sm:text-4xl text-trust-blue-700 tracking-tight">
              {campaign.name}
            </h1>

            <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
              {campaign.description || 'Statutory blood donation camp with temperature-controlled transit and accredited healthcare staff.'}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-neutral-600 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-red-500 shrink-0" />
                <span>{campaign.location}, {campaign.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>{campaign.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>{campaign.time}</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 min-w-[260px] text-center space-y-2">
            <p className="text-xs font-mono uppercase text-neutral-500 font-semibold">Organizing Authority</p>
            <p className="font-headline font-bold text-neutral-900 text-sm">{campaign.organizer}</p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600 font-mono">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span>{campaign.organizerPhone || '+91 94221 44556'}</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium pt-1">
              ✓ Verified Cold-Chain Storage & Phlebotomists
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Slot Selection + Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Slot Matrix (8 Cols) */}
        <div className="lg:col-span-8 bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-6">
          <div>
            <h2 className="font-headline font-bold text-xl text-neutral-900">
              Select an Arrival Time Window
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Slots are capped at 15 donors per 30 minutes to eliminate waiting lines and ensure personalized care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {campaign.slots.map((slot) => {
              const slotString = `${slot.startTime} - ${slot.endTime}`;
              const isSelected = selectedSlot === slotString;
              const isFull = slot.remaining === 0;

              return (
                <div
                  key={slot.id}
                  onClick={() => !isFull && setSelectedSlot(slotString)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isFull
                      ? 'bg-neutral-50 border-neutral-200 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-brand-red-50/70 border-brand-red-500 ring-2 ring-brand-red-500/20 shadow-sm'
                      : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isSelected ? 'text-brand-red-600' : 'text-neutral-400'}`} />
                      <p className={`font-headline font-semibold text-sm ${isSelected ? 'text-brand-red-600' : 'text-neutral-900'}`}>
                        {slotString}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 font-mono">
                      {isFull ? (
                        <span className="text-amber-600 font-semibold">Capacity Full (Waitlist Open)</span>
                      ) : (
                        <span>{slot.remaining} of {slot.capacity} spots remaining</span>
                      )}
                    </p>
                  </div>

                  <div>
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-brand-red-500 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-neutral-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-600">
              {selectedSlot ? (
                <span>Selected Window: <strong className="text-neutral-900 font-mono">{selectedSlot}</strong></span>
              ) : (
                <span className="text-neutral-500 italic">Please select an available slot window to proceed</span>
              )}
            </div>

            <button
              disabled={!selectedSlot}
              onClick={() => navigateTo('/register/' + campaign.id, { driveId: campaign.id, slotTime: selectedSlot || '' })}
              className={`px-6 py-2.5 rounded-lg font-headline font-semibold text-xs transition-all shadow-md flex items-center gap-2 ${
                selectedSlot
                  ? 'bg-primary hover:bg-brand-red-600 text-white shadow-brand-red-500/20 active:scale-98'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Continue to Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Guidelines & Preparation (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 shadow-card space-y-4">
            <h3 className="font-headline font-bold text-base text-neutral-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-brand-red-500" />
              <span>Pre-Donation Guidelines</span>
            </h3>

            <ul className="space-y-3 text-xs text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Age 18 to 65 years, body weight minimum 45 kg.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Drink at least 500ml water prior to arrival.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Avoid heavy alcohol intake 24 hours before donation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Carry Government Photo ID (Aadhaar, Voter ID, Driving License).</span>
              </li>
            </ul>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong className="font-semibold block mb-0.5">Note on Health Screening:</strong>
              Your hemoglobin check and blood pressure will be measured on-site by accredited medical officers before donation.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
