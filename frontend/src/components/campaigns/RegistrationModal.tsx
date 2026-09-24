import React, { useState } from 'react';
import { Campaign, Registration } from '../../types';
import { SlotSelector } from './SlotSelector';
import { registrationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldCheck, CheckCircle2, Send, AlertTriangle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: (reg: Registration) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ campaign, onClose, onSuccess }) => {
  const { user } = useAuth();
  
  const [selectedSlot, setSelectedSlot] = useState<string>(
    campaign.slots && campaign.slots.length > 0 ? campaign.slots[0].slot_time : '10:00 - 10:30'
  );
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98901 12345');
  const [telegramChatId, setTelegramChatId] = useState(user?.telegram_chat_id || '200001');
  const [language, setLanguage] = useState(user?.preferred_language || 'en');
  
  // Explicit Consent Checkboxes (Unchecked by default)
  const [consentCampaign, setConsentCampaign] = useState(false);
  const [consentFuture, setConsentFuture] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reg = await registrationService.registerDonor({
        campaign_id: campaign.id,
        slot_time: selectedSlot,
        consent_campaign_comm: consentCampaign,
        consent_future_comm: consentFuture,
        full_name: fullName,
        email: email,
        phone: phone,
        telegram_chat_id: telegramChatId,
        preferred_language: language,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onSuccess(reg);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
              Donor Mobilisation Registration
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{campaign.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{campaign.venue} • {campaign.drive_date}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Slot Selection */}
          <SlotSelector
            slots={campaign.slots}
            selectedSlot={selectedSlot}
            onSelectSlot={(st) => setSelectedSlot(st)}
          />

          {/* Donor Contact & Profile Details */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Donor Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Patel"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@gmail.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone (SMS / WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98901 12345"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Telegram Chat ID / Username</label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="e.g. @aarav_donor or 200001"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Explicit 2-Tier Consent Engine */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Communication & Consent Preferences</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              Life Share operates strictly on explicit consent. You can modify or revoke permissions anytime in your donor profile.
            </p>

            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={consentCampaign}
                  onChange={(e) => setConsentCampaign(e.target.checked)}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>
                  I agree to receive automated slot confirmations, reminders, and waitlist promotion alerts for <strong>{campaign.name}</strong> via Telegram/SMS.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={consentFuture}
                  onChange={(e) => setConsentFuture(e.target.checked)}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>
                  I agree to receive notifications about upcoming blood donation drives in my local area.
                </span>
              </label>
            </div>
          </div>

          {/* Non-Medical Boundary Reminder */}
          <div className="text-[11px] text-slate-400 bg-slate-100/60 p-3 rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>No medical or clinical screening is conducted in this form. Medical eligibility will be assessed in-person at the venue.</span>
          </div>

          {/* Footer CTA */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Slot...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm Slot Registration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
