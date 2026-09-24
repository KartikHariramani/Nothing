import React, { useState, useEffect } from 'react';
import { Registration } from '../types';
import { registrationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PredictionBadge } from '../components/campaigns/PredictionBadge';
import { QRPassCard } from '../components/donor/QRPassCard';
import { ConsentSettingsCard } from '../components/donor/ConsentSettingsCard';
import { 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  MessageSquare, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  Send,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonorDashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ setCurrentTab }) => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const data = await registrationService.getMyRegistrations();
      setRegistrations(data);
      if (data.length > 0 && !selectedReg) {
        setSelectedReg(data[0]);
      } else if (data.length > 0 && selectedReg) {
        const updated = data.find(r => r.id === selectedReg.id);
        if (updated) setSelectedReg(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleConfirm = async (id: string) => {
    try {
      const updated = await registrationService.confirmRegistration(id);
      setActionSuccess(`Slot attendance confirmed! ML prediction score updated to ${Math.round(updated.predicted_attendance_score * 100)}%.`);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      fetchRegistrations();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await registrationService.cancelRegistration(id);
      setActionSuccess(`Slot cancelled. The Dynamic Queue Engine has automatically promoted the next waitlisted candidate.`);
      fetchRegistrations();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-navy-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-900/60 text-brand-300 border border-brand-700/60">
            <Heart className="w-3 h-3 fill-current" />
            <span>Donor Mobilisation Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome back, {user?.full_name || 'Valued Donor'}!
          </h1>
          <p className="text-xs text-slate-400">
            Track your upcoming donation slot, access your digital check-in pass, and manage consent.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('campaigns')}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Find More Campaigns</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Telegram Bot Connection Status Card */}
      <div className="bg-sky-950/30 rounded-2xl border border-sky-900/50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-sm flex-shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Official Telegram Mobilisation Bot</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-800 text-[10px] font-bold">ACTIVE</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect with <strong className="text-white">@life_share_bot</strong> to receive instant slot confirmations, reminders, and waitlist promotion alerts.
            </p>
          </div>
        </div>

        <a
          href="https://t.me/life_share_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all flex-shrink-0"
        >
          <span>Open @life_share_bot</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Grid: Left Slot Card & Right Pass */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Registrations List & Slot Management */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-500" />
              <span>My Enrolled Drives</span>
            </h2>

            <button
              onClick={fetchRegistrations}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {registrations.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-xs text-slate-400 space-y-3">
              <p className="font-bold text-slate-300">You have no active drive registrations.</p>
              <button
                onClick={() => setCurrentTab('campaigns')}
                className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl"
              >
                Browse Verified Campaigns
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => {
                const isConfirmed = reg.status === 'confirmed';
                const isWaitlisted = reg.status === 'waitlisted';
                const isAttended = reg.status === 'attended';
                const isCancelled = reg.status === 'cancelled';
                const isSelected = selectedReg?.id === reg.id;

                return (
                  <div
                    key={reg.id}
                    onClick={() => setSelectedReg(reg)}
                    className={`bg-slate-900 rounded-3xl border p-6 transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isAttended
                            ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                            : isConfirmed
                            ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                            : isWaitlisted
                            ? 'bg-amber-900/30 text-amber-500 border border-amber-800'
                            : isCancelled
                            ? 'bg-rose-900/30 text-rose-400 border border-rose-800'
                            : 'bg-blue-900/30 text-blue-400 border border-blue-800'
                        }`}>
                          {reg.status}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1">
                          {reg.campaign_name}
                        </h3>
                      </div>

                      {/* ML Prediction Badge */}
                      <PredictionBadge 
                        score={reg.predicted_attendance_score} 
                        explanation={reg.prediction_explanation}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-4 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-500" />
                        <span className="font-semibold text-white">{reg.campaign_date || 'Upcoming'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        <span className="font-semibold text-white">{reg.slot_time}</span>
                      </div>

                      <div className="flex items-center gap-1.5 col-span-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                        <span className="truncate">{reg.campaign_venue || 'Designated Venue'}</span>
                      </div>
                    </div>

                    {/* Prediction Explanation Note */}
                    {reg.prediction_explanation && (
                      <p className="text-[11px] text-slate-400 mb-4 bg-purple-950/30 p-2.5 rounded-xl border border-purple-900/50 leading-normal">
                        <strong className="text-purple-400">Turnout Intelligence:</strong> {reg.prediction_explanation}
                      </p>
                    )}

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                      {!isConfirmed && !isAttended && !isCancelled && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirm(reg.id);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Attendance</span>
                        </button>
                      )}

                      {!isCancelled && !isAttended && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(reg.id);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/30 hover:text-rose-400 text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Release / Cancel Slot</span>
                        </button>
                      )}

                      {isAttended && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-900/30 px-3 py-1.5 rounded-xl border border-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Attendance Verified by Volunteer</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Explicit Consent Governance Card */}
          <ConsentSettingsCard />
        </div>

        {/* Right Column: Digital QR Pass Display */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-brand-500" />
              <span>Digital Attendance QR Pass</span>
            </h2>
          </div>

          {selectedReg ? (
            <QRPassCard registration={selectedReg} />
          ) : (
            <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-xs text-slate-400">
              Select an enrolled campaign on the left to display your QR pass.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
