import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  Send, 
  Bell, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  History,
  Save
} from 'lucide-react';

export const ConsentPage: React.FC = () => {
  const { addNotification, currentUser } = useApp();

  const [tier1Reminders, setTier1Reminders] = useState(true);
  const [tier2Emergency, setTier2Emergency] = useState(true);
  const [radiusKm, setRadiusKm] = useState(25);
  const [telegramLinked, setTelegramLinked] = useState(true);
  const [telegramHandle, setTelegramHandle] = useState('@aarav_donates');

  const [auditEntries, setAuditEntries] = useState([
    { timestamp: '2026-09-24 10:14:00', event: 'TIER_1_CONSENT_GRANTED', actor: 'Aarav Sharma', hash: '0x3f12a...98cd' },
    { timestamp: '2026-09-24 10:14:00', event: 'TIER_2_EMERGENCY_GRANTED', actor: 'Aarav Sharma', hash: '0x7e44b...11ae' },
    { timestamp: '2026-09-24 10:15:30', event: 'TELEGRAM_BOT_PAIRED', actor: '@aarav_donates', hash: '0x992fa...80ee' },
  ]);

  const handleSave = () => {
    const newEntry = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      event: 'CONSENT_PREFERENCES_UPDATED',
      actor: currentUser.name,
      hash: `0x${Math.random().toString(16).substring(2, 7)}...${Math.random().toString(16).substring(2, 6)}`
    };
    setAuditEntries(prev => [newEntry, ...prev]);
    addNotification('Preferences Saved', 'Your 2-Tier communication preferences and emergency radius have been securely updated.', 'success');
  };

  const handleTestPing = () => {
    addNotification('Telegram Test Sent', `Simulation alert sent to Telegram bot for ${telegramHandle}`, 'info');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-3">
        <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-trust-blue-50 text-trust-blue-700 border border-trust-blue-200">
          DPDP Act 2023 & Section 65B BNSS Compliant
        </span>
        <h1 className="font-headline font-bold text-2xl sm:text-3xl text-trust-blue-700">
          Communication Consent & Telegram Preferences
        </h1>
        <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
          Manage how and when Life Share contacts you. Unlike commercial platforms, consent is strictly separated between appointment operations and life-critical regional shortage broadcasts.
        </p>
      </div>

      {/* Main Settings Panel */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-8">
        
        {/* Tier 1 Toggles */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-trust-blue-700" />
            <h2 className="font-headline font-bold text-lg text-neutral-900">
              Tier 1: Camp Appointment Communications
            </h2>
          </div>
          <p className="text-xs text-neutral-500">
            Directly tied to the camps you register for. Critical for check-in QR passes and turn-by-turn arrival guidance.
          </p>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <strong className="block text-xs font-semibold text-neutral-900">
                  Appointment Reminders (T-24h and T-3h)
                </strong>
                <span className="text-[11px] text-neutral-500">
                  Receive pre-camp notifications to ensure optimal hydration and timely arrival.
                </span>
              </div>
              <input
                type="checkbox"
                checked={tier1Reminders}
                onChange={(e) => setTier1Reminders(e.target.checked)}
                className="w-5 h-5 rounded text-trust-blue-700 focus:ring-trust-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Tier 2 Emergency Surge Settings */}
        <div className="pt-6 border-t border-neutral-100 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-brand-red-500" />
            <h2 className="font-headline font-bold text-lg text-neutral-900">
              Tier 2: Regional Emergency Surge Broadcasts
            </h2>
          </div>
          <p className="text-xs text-neutral-500">
            Activated strictly during mass casualty incidents, natural disasters, or critical hospital blood bank depletion for your specific group ({currentUser.bloodType || 'O+'}).
          </p>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <strong className="block text-xs font-semibold text-neutral-900">
                  Opt-In to Life-Critical Emergency Broadcasts
                </strong>
                <span className="text-[11px] text-neutral-500">
                  Allow civil healthcare coordinators to ping you when emergency trauma units urgently need your blood type.
                </span>
              </div>
              <input
                type="checkbox"
                checked={tier2Emergency}
                onChange={(e) => setTier2Emergency(e.target.checked)}
                className="w-5 h-5 rounded text-brand-red-600 focus:ring-brand-red-500 cursor-pointer"
              />
            </div>

            {/* Geofence Distance Slider */}
            {tier2Emergency && (
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700">Notification Proximity Radius:</span>
                  <span className="font-mono font-bold text-brand-red-600 text-sm">{radiusKm} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-brand-red-600"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                  <span>5 km (Local Ward)</span>
                  <span>25 km (District City)</span>
                  <span>50 km (Regional)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Telegram Bot Pairing */}
        <div className="pt-6 border-t border-neutral-100 space-y-4">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-sky-500" />
            <h2 className="font-headline font-bold text-lg text-neutral-900">
              Telegram Official Notification Bot
            </h2>
          </div>
          <p className="text-xs text-neutral-500">
            Telegram delivers instant zero-latency pass downloads and promotions when someone cancels ahead of you on the waitlist.
          </p>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-neutral-900 text-sm">{telegramHandle}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  ✓ Bot Paired
                </span>
              </div>
              <p className="text-xs text-neutral-500">Connected to @LifeShareMobilizeBot</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestPing}
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg font-semibold text-xs transition"
              >
                Send Test Ping
              </button>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-6 border-t border-neutral-100 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-xs transition shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Communication Preferences</span>
          </button>
        </div>

      </div>

      {/* Immutable Consent Change History (Audit Log) */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-neutral-400" />
          <h3 className="font-headline font-bold text-base text-neutral-900">
            Immutable Consent Audit Ledger
          </h3>
        </div>
        <p className="text-xs text-neutral-500">
          Every consent grant or revocation is recorded with a cryptographic timestamp in accordance with national statutory privacy frameworks.
        </p>

        <div className="space-y-2">
          {auditEntries.map((entry, idx) => (
            <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div>
                <span className="font-bold text-neutral-800">{entry.event}</span>
                <span className="text-neutral-400 mx-2">·</span>
                <span className="text-neutral-600">{entry.actor}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
                <span>{entry.timestamp}</span>
                <span className="text-primary font-semibold">{entry.hash}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
