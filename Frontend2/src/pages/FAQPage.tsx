import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Scale, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  ArrowLeft, 
  FileText,
  HeartHandshake
} from 'lucide-react';

export const FAQPage: React.FC = () => {
  const { navigateTo } = useApp();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the precise boundary of Life Share (Statutory Non-Clinical Scope)?',
      a: 'Life Share is strictly an intelligent mobilization, booking, and turnout coordination layer. We DO NOT provide medical advice, evaluate clinical donor fitness, perform hemoglobin/pathology testing, operate blood banks, or execute phlebotomy collections. All medical screening and phlebotomy are carried out on-site exclusively by accredited medical officers from partner blood banks registered under the Drugs and Cosmetics Act.'
    },
    {
      q: 'How does the single-use QR pass prevent duplicate attendance or proxy fraud?',
      a: 'Each registration generates a cryptographically signed UUID token mapped to your identity and slot. Upon scanning by an accredited volunteer, the pass status transitions to ATTENDED and is locked forever. Any secondary scan triggers an immediate duplicate rejection alert with the exact original timestamp and is logged to the tamper-evident audit ledger.'
    },
    {
      q: 'What is the 2-Tier Communication Consent model?',
      a: 'In adherence to the DPDP Act 2023, consent is bifurcated: Tier 1 covers appointment-specific confirmations and turn-by-turn check-in reminders. Tier 2 is completely optional and enables emergency surge alerts when there is a critical shortage of your blood group in your district due to mass-casualty incidents.'
    },
    {
      q: 'How does Autonomous Dynamic Queue Rebalancing work?',
      a: 'When an active donor cancels their appointment, Life Share does not let the phlebotomy capacity go unused. The optimization algorithm scores the waitlist using ML turnout confidence metrics and immediately dispatches an automated Telegram promotion offer to the top waitlisted citizen.'
    },
    {
      q: 'What is the Section 65B BNSS compliance mentioned on the portal?',
      a: 'Every system transition—from camp accreditation and donor booking to QR redemption and queue promotions—generates an immutable SHA-256 hash stored in an append-only Merkle ledger, providing statutory legal admissibility under Section 65B of the Bharatiya Nagarik Suraksha Sanhita (BNSS).'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigateTo('/')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-trust-blue-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>

      {/* STATUTORY DEMARCATION HERO BANNER */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
            Statutory Legal Declaration & Non-Clinical Demarcation
          </span>
        </div>

        <h1 className="font-headline font-bold text-2xl sm:text-3xl text-trust-blue-700">
          Statutory Framework & Compliance Charter
        </h1>

        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-neutral-800 space-y-3 leading-relaxed">
          <p>
            <strong>Statutory Boundary Notice:</strong> Life Share operates strictly as a digital civic mobilisation, slot scheduling, and cryptographic turnout verification software utility.
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-neutral-700 text-xs">
            <li><strong>Non-Clinical Scope:</strong> Life Share does NOT perform blood testing, pathogen screening, cross-matching, blood fraction storage, or phlebotomy.</li>
            <li><strong>Medical Responsibility:</strong> All donor suitability assessments, vital sign evaluations, and collection procedures are performed solely by accredited medical teams from licensed blood banks.</li>
            <li><strong>Statutory Alignment:</strong> Designed in compliance with National Blood Transfusion Council (NBTC) protocols, the Drugs and Cosmetics Act (1940), and the Digital Personal Data Protection (DPDP) Act (2023).</li>
          </ul>
        </div>
      </div>

      {/* FAQ ACCORDION */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-4">
          <HelpCircle className="w-5 h-5 text-trust-blue-700" />
          <h2 className="font-headline font-bold text-xl text-neutral-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-neutral-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 bg-neutral-50/60 hover:bg-neutral-50 transition"
                >
                  <span className="font-headline font-semibold text-sm text-neutral-900">{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 bg-white border-t border-neutral-100 text-xs sm:text-sm text-neutral-600 leading-relaxed animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* STATUTORY GRIEVANCE CONTACT */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="font-headline font-bold text-lg text-white">
          State Transfusion Council Nodal Grievance Office
        </h3>
        <p className="text-xs text-neutral-300 leading-relaxed max-w-xl">
          For statutory audit inquiries, NGO compliance reports, or emergency inter-hospital blood bank allocations, contact the state nodal registry.
        </p>
        <div className="flex flex-wrap gap-4 text-xs font-mono text-neutral-300 pt-2">
          <span>Helpline: 104 (Toll-Free)</span>
          <span>·</span>
          <span>Email: compliance@sbtc.gov.in</span>
          <span>·</span>
          <span>Nagpur Division Node #401</span>
        </div>
      </div>

    </div>
  );
};
