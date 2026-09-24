import React from 'react';
import { 
  Heart, 
  Calendar, 
  Sparkles, 
  Bell, 
  Zap, 
  QrCode, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';

interface HowItWorksPageProps {
  setCurrentTab: (tab: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ setCurrentTab }) => {
  const steps = [
    {
      step: '01',
      title: 'Campaign Creation & Administrative Verification',
      desc: 'Organizers set up target donors, drive venue, and segmented 30-minute arrival windows. Platform administrators verify legitimacy before the campaign goes live publicly.',
      badge: 'Admin Approved',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      step: '02',
      title: 'Donor Discovery & 2-Tier Explicit Consent',
      desc: 'Donors browse verified campaigns and select their optimal slot. Explicit opt-in consent is recorded before any Telegram reminder or notification can be dispatched.',
      badge: 'Privacy First',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      step: '03',
      title: 'Machine-Learning Turnout Prediction',
      desc: 'Scikit-learn Gradient Boosting models predict real-time arrival probabilities based on historical participation, confirmation status, and reminder responsiveness.',
      badge: 'Scikit-Learn ML',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      step: '04',
      title: 'Automated Reminders & Multi-Channel Engagement',
      desc: 'Timely T-3 and T-1 notifications prompt donors to confirm or release their slots, preventing last-minute empty stations at the venue.',
      badge: 'Telegram Bot API',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      step: '05',
      title: 'Autonomous Dynamic Queue Engine',
      desc: 'The moment a donor cancels, the engine scores all waitlisted candidates by turnout likelihood and automatically promotes the highest-probability donor, notifying them instantly.',
      badge: 'Auto Rebalancing',
      color: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      step: '06',
      title: 'QR Code Administrative Attendance Verification',
      desc: 'Volunteers scan single-use cryptographic QR passes at the venue. Attendance is logged instantaneously while strictly safeguarding non-medical boundaries.',
      badge: 'Anti-Duplicate QR',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
          The Turnout Intelligence Engine
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900">
          How Life Share Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          From the initial registration spark to verified arrival at the venue — Life Share connects organizers, donors, and volunteers into an unbroken loop of accountability.
        </p>
      </div>

      {/* 6 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div
            key={s.step}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-300">{s.step}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.color}`}>
                  {s.badge}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {s.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-bold">Ready to experience the turnout difference?</h3>
          <p className="text-xs text-slate-400">Join verified blood donation drives or set up your own college drive today.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('campaigns')}
            className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-xs shadow-md transition-all"
          >
            Find a Drive
          </button>
          <button
            onClick={() => setCurrentTab('organizer')}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
          >
            Organize Drive
          </button>
        </div>
      </div>
    </div>
  );
};
