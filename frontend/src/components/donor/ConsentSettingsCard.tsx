import React, { useState, useEffect } from 'react';
import { ConsentLog } from '../../types';
import { consentService } from '../../services/api';
import { Shield, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

export const ConsentSettingsCard: React.FC = () => {
  const [consents, setConsents] = useState<ConsentLog[]>([]);
  const [campaignConsent, setCampaignConsent] = useState(true);
  const [futureConsent, setFutureConsent] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchConsents = async () => {
    try {
      const data = await consentService.getMyConsents();
      setConsents(data);
      if (data.length > 0) {
        const c1 = data.find(c => c.consent_type === 'campaign_communication');
        const c2 = data.find(c => c.consent_type === 'future_campaigns');
        if (c1) setCampaignConsent(c1.granted);
        if (c2) setFutureConsent(c2.granted);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  const handleToggle = async (type: 'campaign_communication' | 'future_campaigns', currentVal: boolean) => {
    const newVal = !currentVal;
    if (type === 'campaign_communication') setCampaignConsent(newVal);
    if (type === 'future_campaigns') setFutureConsent(newVal);

    try {
      await consentService.updateConsent(type, newVal);
      setStatusMsg(`Consent preference updated: ${newVal ? 'Granted' : 'Revoked'}.`);
      fetchConsents();
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-900/30 text-emerald-400 border border-emerald-800">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Communication & Consent Governance</h3>
            <p className="text-xs text-slate-400">Fine-grained opt-in control over automated reminders and alerts</p>
          </div>
        </div>

        {statusMsg && (
          <span className="text-xs text-emerald-600 font-semibold animate-pulse">{statusMsg}</span>
        )}
      </div>

      <div className="divide-y divide-slate-800 text-xs space-y-3 pt-1">
        {/* Toggle 1: Active Campaign Reminders */}
        <div className="flex items-center justify-between pt-3 gap-4">
          <div>
            <p className="font-bold text-slate-200">Active Campaign Reminders & Waitlist Alerts</p>
            <p className="text-slate-400 leading-snug">
              Receive Telegram and SMS notifications for slot confirmations, reminders, and auto-promoted waitlist spots.
            </p>
          </div>

          <button
            onClick={() => handleToggle('campaign_communication', campaignConsent)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              campaignConsent
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {campaignConsent ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            <span>{campaignConsent ? 'Granted' : 'Revoked'}</span>
          </button>
        </div>

        {/* Toggle 2: Future Blood Drives */}
        <div className="flex items-center justify-between pt-3 gap-4">
          <div>
            <p className="font-bold text-slate-200">Future Blood Donation Drives in Area</p>
            <p className="text-slate-400 leading-snug">
              Allow organizers in your city to notify you when upcoming community donation camps go live.
            </p>
          </div>

          <button
            onClick={() => handleToggle('future_campaigns', futureConsent)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              futureConsent
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {futureConsent ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            <span>{futureConsent ? 'Granted' : 'Revoked'}</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-300">Strict Backend Gatekeeper:</strong> If consent is revoked, the system automatically blocks message generation (Logged as <code className="text-brand-400">message.skipped_no_consent</code> in the audit trail).
        </span>
      </div>
    </div>
  );
};
