import React from 'react';
import { Campaign } from '../../types';
import { Calendar, Clock, MapPin, Users, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
  onQuickRegister?: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onSelect, onQuickRegister }) => {
  const isPending = campaign.status === 'pending_verification';
  const confirmedCount = campaign.confirmed_count || 0;
  const targetCount = campaign.target_count || 100;
  const progressPct = Math.min(100, Math.round((confirmedCount / targetCount) * 100));

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm hover:shadow-lg hover:border-slate-700 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Status */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              campaign.status === 'live'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : campaign.status === 'pending_verification'
                ? 'bg-amber-900/30 text-amber-500 border border-amber-800'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {campaign.status === 'live' ? 'Verified & Live' : campaign.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            <Sparkles className="w-3 h-3 text-brand-500" />
            <span>Target: {campaign.target_count} Donors</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-brand-500 transition-colors line-clamp-1">
          {campaign.name}
        </h3>
        
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {campaign.description || 'Community blood donation drive coordinated for maximum turnout and lives saved.'}
        </p>
      </div>

      {/* Logistics Pills */}
      <div className="px-5 py-2.5 bg-slate-950/70 border-y border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
          <span className="font-semibold text-white">{campaign.drive_date}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
          <span>{campaign.start_time} - {campaign.end_time}</span>
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
          <span className="truncate">{campaign.venue}</span>
        </div>
      </div>

      {/* Progress & Actions */}
      <div className="p-5 pt-3 space-y-3">
        {/* Turnout Mobilisation Meter */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-400">Mobilised Turnout</span>
            <span className="font-bold text-white">{confirmedCount} confirmed / {campaign.predicted_attendance || 0} predicted</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-brand-600 to-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onSelect(campaign)}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {onQuickRegister && (
            <button
              onClick={() => onQuickRegister(campaign)}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all flex items-center justify-center gap-1"
            >
              <span>I'm Interested</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
