import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  Building2, 
  Users, 
  MapPin, 
  FileText,
  Radio,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { campaigns, approveCampaign, navigateTo, addNotification } = useApp();

  const pendingCampaigns = campaigns.filter(c => c.status === 'pending');
  const liveCampaigns = campaigns.filter(c => c.status === 'live' || c.status === 'approved');

  const triggerEmergencyBroadcast = () => {
    addNotification('State Emergency Surge Broadcasted', 'Mass casualty alert broadcasted to 1,420 registered O+ & B- donors across Nagpur district via Telegram.', 'warning');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              State Blood Transfusion Council (SBTC)
            </span>
            <span className="text-xs font-mono text-neutral-500">Government of Maharashtra</span>
          </div>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-trust-blue-700">
            National Health Governance Console
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Supervisory oversight for NGO accreditations, camp statutory compliance, and emergency surge activation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerEmergencyBroadcast}
            className="px-4 py-2.5 bg-brand-red-500 hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-xs transition shadow-sm flex items-center gap-2 animate-pulse"
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast Regional Surge</span>
          </button>

          <button
            onClick={() => navigateTo('/admin/audit')}
            className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-semibold text-xs transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Governance KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card">
          <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block mb-1">Total Accredited Hosts</span>
          <p className="font-headline font-bold text-2xl text-trust-blue-700">28 NGOs</p>
          <span className="text-[10px] text-emerald-600 font-medium">100% CDSCO Compliant</span>
        </div>

        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card">
          <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block mb-1">Pending Approvals</span>
          <p className="font-headline font-bold text-2xl text-amber-600">{pendingCampaigns.length} Camps</p>
          <span className="text-[10px] text-neutral-500 font-medium">Awaiting statutory review</span>
        </div>

        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card">
          <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block mb-1">ML Model Reliability</span>
          <p className="font-headline font-bold text-2xl text-purple-700">93.8% F1</p>
          <span className="text-[10px] text-neutral-500 font-mono">Drift: 1.2% (Optimal)</span>
        </div>

        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card">
          <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block mb-1">State Turnout Conversion</span>
          <p className="font-headline font-bold text-2xl text-emerald-600">89.4%</p>
          <span className="text-[10px] text-emerald-600 font-medium">↑ 34% vs Traditional Camps</span>
        </div>
      </div>

      {/* PENDING ACCREDITATION QUEUE */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="font-headline font-bold text-xl text-neutral-900">
              Pending Blood Drive Verification Queue
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Review and accredit camp venues, hospital phlebotomy partnerships, and statutory safety plans.
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {pendingCampaigns.length} Pending Actions
          </span>
        </div>

        {pendingCampaigns.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-neutral-700 font-semibold text-sm">All Camps Verified & Accredited</p>
            <p className="text-neutral-400 text-xs">No pending applications in the state regulatory queue.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-bold text-base text-neutral-900">{camp.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                      Needs Verification
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Host: <strong className="text-neutral-700">{camp.organizer}</strong> · Contact: {camp.organizerPhone}
                  </p>
                  <p className="text-xs text-neutral-600">
                    Venue: {camp.location}, {camp.city} · Date: {camp.date} · Target: {camp.targetUnits} Units
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => approveCampaign(camp.id)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Accredit</span>
                  </button>
                  <button
                    onClick={() => addNotification('Camp Rejected', 'Campaign sent back to host with compliance feedback.', 'warning')}
                    className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg font-semibold text-xs transition"
                  >
                    Reject with Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STATEWIDE LIVE CAMPAIGNS DIRECTORY */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <h3 className="font-headline font-bold text-lg text-neutral-900">
            Active Statewide Camp Registry
          </h3>
          <span className="text-xs font-mono text-neutral-500">
            {liveCampaigns.length} Approved Drives
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                <th className="pb-3 font-semibold">Camp / Facility</th>
                <th className="pb-3 font-semibold">Host Organization</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Quota</th>
                <th className="pb-3 font-semibold">Attended Arrivals</th>
                <th className="pb-3 font-semibold">Compliance State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {liveCampaigns.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="py-3 font-medium text-neutral-900">{c.name}</td>
                  <td className="py-3 text-neutral-600">{c.organizer}</td>
                  <td className="py-3 font-mono text-neutral-600">{c.date}</td>
                  <td className="py-3 font-mono font-bold">{c.targetUnits}</td>
                  <td className="py-3 font-mono text-emerald-600 font-semibold">{c.attendedCount} Units</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ ACCREDITED
                    </span>
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
