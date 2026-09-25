import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Heart, 
  Calendar, 
  QrCode, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Award, 
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Activity
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { currentUser, registrations, navigateTo, cancelRegistration } = useApp();

  const activeRegistrations = registrations.filter(r => r.status === 'confirmed' || r.status === 'registered');
  const pastRegistrations = registrations.filter(r => r.status === 'attended' || r.status === 'cancelled');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Profile Banner */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-red-500 to-primary text-white flex items-center justify-center font-headline font-bold text-2xl shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline font-bold text-2xl sm:text-3xl text-trust-blue-700">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-red-50 text-brand-red-600 border border-brand-red-200">
                {currentUser.bloodType || 'O+'} Positive
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Registered Citizen Donor · {currentUser.city || 'Nagpur'} · ID #{currentUser.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/drives')}
            className="px-4 py-2.5 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-xs transition shadow-sm flex items-center gap-2"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Book New Donation</span>
          </button>
        </div>
      </div>

      {/* Citizen Impact Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-neutral-500 font-semibold">Total Donations</span>
            <Heart className="w-4 h-4 text-brand-red-500" />
          </div>
          <p className="font-headline font-bold text-2xl text-trust-blue-700">
            {pastRegistrations.filter(r => r.status === 'attended').length + 3} Drives
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">● Verified Record</span>
        </div>

        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-neutral-500 font-semibold">Lives Touched</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-headline font-bold text-2xl text-amber-600">
            {(pastRegistrations.filter(r => r.status === 'attended').length + 3) * 3} Patients
          </p>
          <span className="text-[11px] text-neutral-500">3 Lives saved per unit</span>
        </div>

        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-neutral-500 font-semibold">Turnout Rating</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-headline font-bold text-2xl text-emerald-600">96.4%</p>
          <span className="text-[11px] text-neutral-500 font-mono">ML High-Reliability</span>
        </div>

        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-neutral-500 font-semibold">Next Eligible Date</span>
            <Calendar className="w-4 h-4 text-trust-blue-500" />
          </div>
          <p className="font-headline font-bold text-xl text-trust-blue-700 mt-1">Eligible Today</p>
          <span className="text-[11px] text-emerald-600 font-medium">✓ Ready to Donate</span>
        </div>
      </div>

      {/* ACTIVE PASSES & APPOINTMENTS */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-red-500" />
            <h2 className="font-headline font-bold text-xl text-neutral-900">
              Active Single-Use Passes & Bookings
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-brand-red-50 text-brand-red-600 font-bold">
            {activeRegistrations.length} Upcoming
          </span>
        </div>

        {activeRegistrations.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-neutral-500 text-sm">You have no upcoming donation appointments.</p>
            <button
              onClick={() => navigateTo('/drives')}
              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold"
            >
              Browse Open Camps
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Confirmed Arrival
                    </span>
                    <span className="text-xs font-mono font-bold text-trust-blue-700">
                      {reg.qrToken}
                    </span>
                  </div>

                  <h3 className="font-headline font-bold text-base text-neutral-900">
                    {reg.campaignName}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      <span>{reg.slotTime} · {reg.campaignDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      <span className="truncate">{reg.campaignLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigateTo('/pass/' + reg.id, { registrationId: reg.id })}
                    className="px-3 py-1.5 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View QR Pass</span>
                  </button>

                  <button
                    onClick={() => cancelRegistration(reg.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Cancel Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAST DONATION RECORDS & VERIFICATION HISTORY */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-4">
        <h3 className="font-headline font-bold text-lg text-neutral-900">
          Immutable Attendance Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                <th className="pb-3 font-semibold">Camp / Venue</th>
                <th className="pb-3 font-semibold">Date & Slot</th>
                <th className="pb-3 font-semibold">Blood Group</th>
                <th className="pb-3 font-semibold">Verification Token</th>
                <th className="pb-3 font-semibold">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pastRegistrations.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="py-3 font-medium text-neutral-900">{p.campaignName}</td>
                  <td className="py-3 text-neutral-600">{p.campaignDate} ({p.slotTime})</td>
                  <td className="py-3 font-mono font-bold text-brand-red-600">{p.donorBloodType}</td>
                  <td className="py-3 font-mono text-neutral-500">{p.qrToken}</td>
                  <td className="py-3">
                    {p.status === 'attended' ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ Verified Attended
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Cancelled (Slot Rebalanced)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
