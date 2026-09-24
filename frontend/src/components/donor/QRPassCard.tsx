import React, { useState, useEffect } from 'react';
import { Registration } from '../../types';
import { attendanceService } from '../../services/api';
import { QrCode, CheckCircle2, AlertTriangle, Calendar, Clock, MapPin, Download, ShieldCheck } from 'lucide-react';

interface QRPassCardProps {
  registration: Registration;
}

export const QRPassCard: React.FC<QRPassCardProps> = ({ registration }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (registration.qr_token) {
      attendanceService.getQRImage(registration.qr_token)
        .then(res => setQrDataUrl(res.data_url))
        .catch(err => console.error("Failed to load QR image", err));
    }
  }, [registration.qr_token]);

  const isAttended = registration.status === 'attended';
  const isCancelled = registration.status === 'cancelled';
  const isWaitlist = registration.status === 'waitlisted';

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-md overflow-hidden max-w-sm mx-auto">
      {/* Header Pass Banner */}
      <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-rose-600 text-white p-5 text-center relative">
        <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3 h-3 text-white" />
          <span>Verified Donor Digital Pass</span>
        </div>

        <h3 className="text-lg font-extrabold leading-tight">
          {registration.campaign_name || 'Blood Donation Drive'}
        </h3>
        <p className="text-xs text-brand-100 mt-0.5">{registration.donor_name}</p>
      </div>

      {/* QR Code Center Box */}
      <div className="p-6 flex flex-col items-center justify-center text-center bg-slate-950/50">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-800 relative mb-3">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="Donor QR Pass" 
              className={`w-44 h-44 object-contain ${isAttended ? 'opacity-40 grayscale' : ''}`}
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-slate-300">
              <QrCode className="w-24 h-24" />
            </div>
          )}

          {/* Status Overlay Badge */}
          {isAttended && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-1" />
              <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Check-in Verified
              </span>
            </div>
          )}

          {isCancelled && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-2xl">
              <AlertTriangle className="w-12 h-12 text-rose-600 mb-1" />
              <span className="text-xs font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                Slot Cancelled
              </span>
            </div>
          )}
        </div>

        <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-md">
          {registration.qr_token}
        </span>
      </div>

      {/* Slot Logistics & Security Note */}
      <div className="p-5 border-t border-slate-800 space-y-3 bg-slate-900/80 text-xs">
        <div className="grid grid-cols-2 gap-2 text-slate-300">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
            <span className="font-semibold">{registration.campaign_date || 'Drive Date'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
            <span className="font-semibold">{registration.slot_time}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
          <span className="truncate">{registration.campaign_venue || 'Designated Venue'}</span>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          Single-use administrative check-in token. Present to volunteer scanner upon arrival at venue.
        </div>
      </div>
    </div>
  );
};
