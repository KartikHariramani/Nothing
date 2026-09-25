import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="bg-gradient-to-r from-primary via-brand-red-600 to-primary text-white border-b border-brand-red-700/60 shadow-sm relative overflow-hidden">
      {/* Subtle pulse backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
            <AlertCircle className="w-4 h-4 text-white" />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-headline font-bold uppercase tracking-wider text-[11px] bg-white text-primary px-2 py-0.5 rounded-full shadow-sm">
              Critical Shortage Broadcast
            </span>
            <span className="font-body text-white/95">
              Urgent need for <span className="font-bold underline decoration-white/60">O+</span>, <span className="font-bold underline decoration-white/60">B-</span>, and <span className="font-bold underline decoration-white/60">AB-</span> units across Nagpur District trauma wings.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigateTo('/drives', { shortageFilter: 'true' })}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-primary hover:bg-neutral-100 rounded-full font-headline font-semibold text-xs transition-all shadow-sm active:scale-95"
          >
            <span>Book Emergency Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
