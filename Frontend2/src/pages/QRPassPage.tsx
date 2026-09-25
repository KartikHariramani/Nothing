import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  MapPin, 
  Calendar, 
  Clock, 
  Heart, 
  ShieldCheck, 
  Copy, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const QRPassPage: React.FC = () => {
  const { registrations, routeParams, navigateTo, cancelRegistration, addNotification } = useApp();
  const regId = routeParams.registrationId || registrations[0]?.id;
  const registration = registrations.find(r => r.id === regId) || registrations[0];

  useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  }, []);

  if (!registration) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <p className="text-sm text-neutral-500">No active registration found.</p>
        <button onClick={() => navigateTo('/drives')} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold">
          Browse Camps
        </button>
      </div>
    );
  }

  const copyToken = () => {
    navigator.clipboard.writeText(registration.qrToken);
    addNotification('Token Copied', `Copied token ${registration.qrToken} to clipboard`, 'success');
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this appointment? Your slot will be immediately reallocated to the top waitlisted donor.')) {
      cancelRegistration(registration.id);
      navigateTo('/donor/dashboard');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigateTo('/donor/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-trust-blue-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Go to Donor Dashboard</span>
      </button>

      {/* Confirmation Hero Banner */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4" />
          Single-Use Verification Pass Issued
        </span>
        <h1 className="font-headline font-extrabold text-2xl sm:text-4xl text-trust-blue-700 tracking-tight">
          Thank You, {registration.donorName}!
        </h1>
        <p className="text-sm text-neutral-600 max-w-lg mx-auto">
          Your donation slot is officially confirmed. Show this cryptographic QR pass to the volunteer desk at the venue.
        </p>
      </div>

      {/* HIGH-CONTRAST DIGITAL QR PASS CARD (From Stitch Design Spec) */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 shadow-modal overflow-hidden max-w-lg mx-auto">
        
        {/* Pass Header */}
        <div className="bg-gradient-to-r from-trust-blue-700 to-trust-blue-500 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-red-500 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div>
                <p className="font-headline font-bold text-sm">LIFE SHARE PASS</p>
                <p className="text-[10px] text-neutral-200 font-mono">NON-TRANSFERABLE SINGLE-USE</p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white text-brand-red-600 shadow">
                {registration.donorBloodType}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="p-8 text-center space-y-4">
          <div className="inline-block p-4 bg-white rounded-2xl border-2 border-neutral-200 shadow-sm">
            <QRCodeSVG
              value={registration.qrToken}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>

          <div>
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              Pass Verification Token
            </p>
            <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-neutral-100 rounded-lg border border-neutral-200">
              <span className="font-mono font-bold text-sm text-neutral-900 tracking-wider">
                {registration.qrToken}
              </span>
              <button
                onClick={copyToken}
                className="text-neutral-500 hover:text-neutral-800"
                title="Copy Token"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-3 text-left text-xs">
            <div className="p-3 bg-neutral-50 rounded-xl">
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">Arrival Window</span>
              <span className="font-headline font-semibold text-neutral-900">{registration.slotTime}</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl">
              <span className="text-[10px] text-neutral-500 uppercase font-mono block">Date</span>
              <span className="font-headline font-semibold text-neutral-900">{registration.campaignDate}</span>
            </div>
          </div>

          <div className="text-left p-3 bg-neutral-50 rounded-xl text-xs space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase font-mono block">Venue Location</span>
            <p className="font-semibold text-neutral-900">{registration.campaignName}</p>
            <p className="text-neutral-500 text-[11px]">{registration.campaignLocation}</p>
          </div>

        </div>

        {/* Pass Actions Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg font-semibold text-xs transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save / Print Pass</span>
          </button>

          <button
            onClick={handleCancel}
            className="w-full sm:w-auto px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold text-xs transition"
          >
            Cancel Appointment
          </button>
        </div>

      </div>

      {/* Volunteer Check-In Simulated Test */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 max-w-lg mx-auto flex items-center justify-between gap-4 text-xs text-emerald-900">
        <div>
          <strong className="block font-semibold text-emerald-950">Volunteer PWA Scanner Ready</strong>
          <span>Switch to the Field Volunteer persona to simulate scanning this token.</span>
        </div>
        <button
          onClick={() => navigateTo('/volunteer/scanner', { testToken: registration.qrToken })}
          className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold text-xs shrink-0 shadow-sm hover:bg-emerald-800 transition"
        >
          Test Scanner
        </button>
      </div>

    </div>
  );
};
