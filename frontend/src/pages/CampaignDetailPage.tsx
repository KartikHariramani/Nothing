import React, { useState } from 'react';
import { Campaign } from '../types';
import { SlotSelector } from '../components/campaigns/SlotSelector';
import { RegistrationModal } from '../components/campaigns/RegistrationModal';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  ExternalLink,
  Phone
} from 'lucide-react';

interface CampaignDetailPageProps {
  campaign: Campaign | null;
  setCurrentTab: (tab: string) => void;
}

export const CampaignDetailPage: React.FC<CampaignDetailPageProps> = ({ campaign, setCurrentTab }) => {
  const [showRegModal, setShowRegModal] = useState(false);

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <p className="text-sm text-slate-500">No campaign selected.</p>
        <button
          onClick={() => setCurrentTab('campaigns')}
          className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  const confirmedCount = campaign.confirmed_count || 0;
  const targetCount = campaign.target_count || 100;
  const progressPct = Math.min(100, Math.round((confirmedCount / targetCount) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => setCurrentTab('campaigns')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Campaigns</span>
      </button>

      {/* Main Campaign Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Verified Blood Drive
          </span>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Target: {campaign.target_count} Donors
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
            {campaign.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            {campaign.description || 'Community blood donation drive coordinated for maximum turnout and lives saved.'}
          </p>
        </div>

        {/* Key Logistics Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-100 text-brand-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
              <p className="text-xs font-bold text-slate-900">{campaign.drive_date}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-100 text-brand-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Operating Hours</p>
              <p className="text-xs font-bold text-slate-900">{campaign.start_time} - {campaign.end_time}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-100 text-brand-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Venue</p>
              <p className="text-xs font-bold text-slate-900 truncate max-w-[180px]">{campaign.venue}</p>
            </div>
          </div>
        </div>

        {/* Turnout Progress Bar */}
        <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-800">Current Mobilisation Progress</span>
            <span className="font-bold text-brand-700">{confirmedCount} confirmed / {campaign.predicted_attendance || 0} ML predicted</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-brand-600 to-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Call to Action Button */}
        <div className="pt-2 flex items-center gap-4">
          <button
            onClick={() => setShowRegModal(true)}
            className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Book My Time Slot</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Available Slots Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Campaign Time Slots & Capacity
        </h2>
        <p className="text-xs text-slate-500">
          Each slot accommodates a target number of donors to eliminate waiting queues and ensure smooth turnout flow.
        </p>

        <SlotSelector
          slots={campaign.slots}
          selectedSlot={null}
          onSelectSlot={() => setShowRegModal(true)}
        />
      </div>

      {/* Organizer & Trust Details */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Organizer Information</h3>
          <p className="font-semibold text-slate-800">{campaign.organizer_name || 'Organizing Coordinator'}</p>
          <p className="flex items-center gap-1 text-slate-500">
            <Phone className="w-3.5 h-3.5 text-brand-600" />
            <span>{campaign.organizer_contact || 'organizer@lifeshare.org'}</span>
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Health Platform Notice</span>
          </h3>
          <p className="text-slate-500 leading-relaxed">
            Life Share coordinates donor arrivals and administrative check-ins. Certified phlebotomy and health screenings are conducted in person at the drive venue.
          </p>
        </div>
      </div>

      {/* Registration Modal Popup */}
      {showRegModal && (
        <RegistrationModal
          campaign={campaign}
          onClose={() => setShowRegModal(false)}
          onSuccess={(reg) => {
            setShowRegModal(false);
            setCurrentTab('donor');
          }}
        />
      )}
    </div>
  );
};
