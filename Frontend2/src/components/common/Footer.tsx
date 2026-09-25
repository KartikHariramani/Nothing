import React from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, ShieldCheck, PhoneCall, Scale, ExternalLink, QrCode } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 text-xs sm:text-sm mt-auto">
      {/* 1. STATUTORY DEMARCATION HIGHLIGHT BOX (Mandatory per README & Screen 4 spec) */}
      <div className="bg-neutral-950/80 border-b border-neutral-800/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-neutral-300">
            <Scale className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="leading-relaxed">
              <strong className="text-white font-semibold">Statutory Product Boundary:</strong> Life Share is strictly a civic mobilization, turnout forecasting, and volunteer check-in coordination platform. It does not perform clinical blood testing, phlebotomy, blood banking storage, or medical eligibility determinations.
            </p>
          </div>
          <button
            onClick={() => navigateTo('/about-faq')}
            className="text-brand-red-100 hover:text-white underline underline-offset-2 shrink-0 font-medium text-xs flex items-center gap-1"
          >
            <span>Read Non-Clinical Demarcation</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. MAIN FOOTER DIRECTORY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: System Identification */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-red-500 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <span className="font-headline font-bold text-white text-base">
                Life<span className="text-brand-red-500">Share</span>
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Intelligent Civic Blood Mobilization, Dynamic Queue Rebalancing, and Single-Use QR Attendance Infrastructure.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Central Node: Online</span>
              <span>·</span>
              <span>TLS 256-bit</span>
            </div>
          </div>

          {/* Col 2: Citizen & Donor Portals */}
          <div>
            <h5 className="font-headline font-semibold text-white uppercase tracking-wider text-xs mb-3">
              Citizen & Donor Flows
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/drives')} className="text-neutral-400 hover:text-white transition-colors">
                  Find Blood Donation Drives
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/donor/dashboard')} className="text-neutral-400 hover:text-white transition-colors">
                  My Appointments & Digital QR Pass
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/donor/consent')} className="text-neutral-400 hover:text-white transition-colors">
                  2-Tier Consent & Telegram Alerts
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/about-faq')} className="text-neutral-400 hover:text-white transition-colors">
                  Donor Guidelines & FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Host & Field Operations */}
          <div>
            <h5 className="font-headline font-semibold text-white uppercase tracking-wider text-xs mb-3">
              Operations & Field Tools
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('/organizer/dashboard')} className="text-neutral-400 hover:text-white transition-colors">
                  Camp Organizer Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/organizer/drives/new')} className="text-neutral-400 hover:text-white transition-colors">
                  Accredit & Schedule New Drive
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/volunteer/scanner')} className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Volunteer QR Scanner Kiosk</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/admin/audit')} className="text-neutral-400 hover:text-white transition-colors">
                  Transparency & Merkle Audit Trail
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional & Helpline */}
          <div>
            <h5 className="font-headline font-semibold text-white uppercase tracking-wider text-xs mb-3">
              Emergency Contact & Regulatory
            </h5>
            <div className="bg-neutral-800/80 rounded-xl p-3 border border-neutral-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-brand-red-100">
                <PhoneCall className="w-4 h-4 text-brand-red-500" />
                <span className="font-semibold text-white">Emergency Blood Line: 104</span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-tight">
                24x7 State Transfusion Coordination Toll-Free Assistance
              </p>
              <div className="pt-1.5 border-t border-neutral-700/80 flex items-center gap-1.5 text-[10px] text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Compliant with NBTC & CDSCO Norms</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & build specs */}
        <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 font-mono">
          <p>© 2026 Life Share Civic Health Initiative. Open Governance System.</p>
          <p>Branch: FrontendV2 · Codebase: Frontend2</p>
        </div>
      </div>
    </footer>
  );
};
