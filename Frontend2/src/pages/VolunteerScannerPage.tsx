import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Camera, 
  ShieldCheck, 
  ArrowLeft,
  RefreshCw,
  Hash,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VolunteerScannerPage: React.FC = () => {
  const { checkInQR, routeParams, navigateTo } = useApp();
  const [tokenInput, setTokenInput] = useState(routeParams.testToken || '');
  const [scanResult, setScanResult] = useState<{
    success?: boolean;
    message?: string;
    donorName?: string;
    donorBlood?: string;
    slotTime?: string;
    duplicateAt?: string;
  } | null>(null);

  const [sessionCount, setSessionCount] = useState(14);

  const handleScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) return;

    const res = checkInQR(tokenInput.trim());
    if (res.success && res.registration) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      setScanResult({
        success: true,
        message: res.message,
        donorName: res.registration.donorName,
        donorBlood: res.registration.donorBloodType,
        slotTime: res.registration.slotTime
      });
      setSessionCount(prev => prev + 1);
    } else {
      setScanResult({
        success: false,
        message: res.message,
        duplicateAt: res.duplicateAt
      });
    }
  };

  const testValidPass = () => {
    setTokenInput('PASS-1001');
  };

  const testDuplicatePass = () => {
    setTokenInput('PASS-1002'); // Priya was already attended at 10:15 AM!
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigateTo('/organizer/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-trust-blue-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>

      {/* Header */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            Field Volunteer Verification Kiosk
          </span>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-trust-blue-700 mt-2">
            On-Site QR Attendance Check-In
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Red Cross Central Emergency Camp · Venue Checkpoint #01
          </p>
        </div>

        <div className="bg-neutral-50 px-5 py-3 rounded-2xl border border-neutral-200 text-center">
          <p className="text-[11px] font-mono uppercase text-neutral-500 font-semibold">Shift Verified Arrivals</p>
          <p className="font-headline font-extrabold text-2xl text-emerald-600">{sessionCount} Donors</p>
        </div>
      </div>

      {/* MAIN SCANNER / SIMULATOR CARD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Camera Reticle Viewport (7 Cols) */}
        <div className="md:col-span-7 bg-neutral-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-modal flex flex-col items-center justify-center min-h-[380px]">
          
          {/* Simulated scanning optical reticle */}
          <div className="relative w-64 h-64 border-2 border-emerald-500/40 rounded-2xl flex items-center justify-center">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br" />

            {/* Scanning line animation */}
            <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce opacity-80" />

            <div className="text-center space-y-2 select-none">
              <Camera className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
              <p className="text-xs font-mono text-neutral-300">Align Donor QR Pass Here</p>
              <span className="text-[10px] text-neutral-500 block">Auto-detection 60fps</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Camera Active · Single-Use Anti-Replay Shield Engaged</span>
          </div>
        </div>

        {/* Right: Manual Token Input & Verification Result (5 Cols) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Token entry */}
          <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 shadow-card space-y-4">
            <h3 className="font-headline font-bold text-sm text-neutral-900 flex items-center gap-2">
              <Hash className="w-4 h-4 text-trust-blue-700" />
              <span>Manual Pass Token Input</span>
            </h3>

            <form onSubmit={handleScanSubmit} className="space-y-3">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                placeholder="LS-2026-NAG-XXXX"
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono font-bold tracking-wider"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-headline font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Verify & Record Attendance</span>
              </button>
            </form>

            {/* Quick Demo Test Buttons */}
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Quick Test Scenarios:
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={testValidPass}
                  className="px-2.5 py-1.5 text-left rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-mono font-semibold transition"
                >
                  ✓ Load Valid Pass (Aarav - LS-2026-NAG-9021)
                </button>
                <button
                  type="button"
                  onClick={testDuplicatePass}
                  className="px-2.5 py-1.5 text-left rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-mono font-semibold transition"
                >
                  ⚠ Test Duplicate Rejection (LS-2026-NAG-9022)
                </button>
              </div>
            </div>
          </div>

          {/* VERIFICATION RESULT CARD */}
          {scanResult && (
            <div className={`p-6 rounded-3xl border shadow-card transition-all animate-in fade-in duration-200 ${
              scanResult.success 
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-rose-50/90 border-rose-300 text-rose-950'
            }`}>
              {scanResult.success ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <strong className="font-headline font-bold text-base">
                      Verified Donor Arrival
                    </strong>
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl space-y-1 text-xs">
                    <p className="font-headline font-bold text-sm text-neutral-900">{scanResult.donorName}</p>
                    <p className="text-neutral-600">Arrival Window: <strong className="font-mono text-neutral-900">{scanResult.slotTime}</strong></p>
                    <p className="text-neutral-600">Blood Type: <strong className="font-mono text-brand-red-600">{scanResult.donorBlood}</strong></p>
                  </div>

                  <p className="text-[11px] text-emerald-800 font-mono">
                    ✓ Single-use pass redeemed. +1 added to live venue count.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-rose-700">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <strong className="font-headline font-bold text-base">
                      Scan Denied / Duplicate Token
                    </strong>
                  </div>

                  <p className="text-xs font-medium text-rose-900 leading-relaxed">
                    {scanResult.message}
                  </p>

                  {scanResult.duplicateAt && (
                    <div className="p-3 bg-white/80 rounded-xl text-xs font-mono text-rose-800">
                      Original Check-in: <strong>{scanResult.duplicateAt}</strong>
                    </div>
                  )}

                  <p className="text-[11px] text-rose-700 font-mono">
                    Anti-duplicate scan violation recorded in immutable audit stream.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
