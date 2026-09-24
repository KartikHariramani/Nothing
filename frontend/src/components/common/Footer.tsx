import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Heart, Users, Activity, ExternalLink } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="cursor-pointer" onClick={() => setCurrentTab('landing')}>
              <Logo size="md" className="brightness-125" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent blood donation mobilisation and turnout platform. Turning donor intentions into verified actual arrivals through automated prediction and dynamic slot queueing.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Consent-First Architecture</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('campaigns')} className="hover:text-brand-400 transition-colors">
                  Find Blood Drives
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('how-it-works')} className="hover:text-brand-400 transition-colors">
                  How Life Share Works
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('organizer')} className="hover:text-brand-400 transition-colors">
                  Organize a Campaign
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('volunteer')} className="hover:text-brand-400 transition-colors">
                  Volunteer QR Check-in
                </button>
              </li>
            </ul>
          </div>

          {/* Turnout Intelligence */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Turnout Intelligence</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span>Scikit-Learn ML Prediction</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Dynamic Queue Rebalancing</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>2-Tier Explicit Consent Gate</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Single-Use QR Tokens</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Immutable Audit Trails</span>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Trust & Governance</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('privacy')} className="hover:text-brand-400 transition-colors">
                  Privacy & Consent Policy
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('about')} className="hover:text-brand-400 transition-colors">
                  About the Platform
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('admin')} className="hover:text-brand-400 transition-colors">
                  Administrative Verification
                </button>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                Inspired by the trust & scale of national public healthcare infrastructure.
              </li>
            </ul>
          </div>
        </div>

        {/* Explicit Non-Medical Boundary Banner */}
        <div className="mt-8 pt-6 border-t border-slate-800 bg-slate-950/60 rounded-xl p-4 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            IMPORTANT PRODUCT BOUNDARY & NON-MEDICAL NOTICE:
          </p>
          <p>
            Life Share is an intelligent campaign mobilisation, turnout prediction, and administrative check-in platform. Life Share is <strong>not a medical system</strong> and does not provide clinical screening, donor health eligibility decisions, medical diagnosis, blood testing, or hospital blood banking. Medical eligibility and clinical phlebotomy remain strictly under certified healthcare medical personnel at the campaign venue.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 Life Share. Connecting People. Mobilising Blood. Saving Lives.</p>
          <p>Intelligent Blood Donation Mobilisation & Turnout Platform</p>
        </div>
      </div>
    </footer>
  );
};
