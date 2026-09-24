import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, UserX } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Governance & Ethics
        </span>
        <h1 className="text-3xl font-black text-slate-900">
          Privacy & Consent Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Donor autonomy, explicit communication consent, and data integrity.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">1. Explicit 2-Tier Consent Architecture</h2>
          <p>
            Life Share treats donor consent as a core architectural primitive. We separate consent into:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-500">
            <li><strong>Campaign-Specific Notifications:</strong> Slot confirmations, day-before reminders, and waitlist promotion alerts for an enrolled drive.</li>
            <li><strong>Future Campaign Alerts:</strong> Notifications regarding upcoming donation camps in your municipal area.</li>
          </ul>
          <p>
            Both consent checkboxes are unchecked by default during registration. Donors maintain absolute control to modify or revoke consent at any time via their profile settings.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">2. Central Backend Consent Enforcement</h2>
          <p>
            Before any Telegram notification or reminder message is created or dispatched, the server evaluates our centralized gatekeeper function:
          </p>
          <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs">
            can_message(donor_id, campaign_id, message_type) -&gt; bool
          </div>
          <p>
            If consent is missing or has been revoked, message generation is cancelled and recorded in the audit trail as <code>message.skipped_no_consent</code>.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">3. Non-Medical Data Guarantee</h2>
          <p>
            Life Share does not request, store, or process sensitive medical health records, blood test results, or clinical diagnostic questionnaires. QR check-in tokens contain only cryptographically secure random identifiers without exposing personal medical information.
          </p>
        </div>
      </div>
    </div>
  );
};
