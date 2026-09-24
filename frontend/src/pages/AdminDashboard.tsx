import React, { useState, useEffect } from 'react';
import { Campaign, AuditLog } from '../types';
import { campaignService, analyticsService, auditService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Activity, 
  Users, 
  Layers, 
  Calendar, 
  FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'verification' | 'audit' | 'all_campaigns'>('verification');
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campaignsData, overviewData, logsData] = await Promise.all([
        campaignService.getAllCampaignsAdmin(),
        analyticsService.getPlatformOverview(),
        auditService.getAuditLogs(60)
      ]);
      setAllCampaigns(campaignsData);
      setOverview(overviewData);
      setAuditLogs(logsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    try {
      await campaignService.approveCampaign(id);
      setActionNotice(`Campaign '${name}' verified and approved! Status: LIVE.`);
      fetchData();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: string, name: string) => {
    const reason = prompt('Please enter the reason for rejection:');
    if (!reason) return;

    try {
      await campaignService.rejectCampaign(id, reason);
      setActionNotice(`Campaign '${name}' marked rejected.`);
      fetchData();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const pendingCampaigns = allCampaigns.filter(c => c.status === 'pending_verification');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-700/60">
            <ShieldCheck className="w-3 h-3" />
            <span>Platform Governance & Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Admin Portal: {user?.full_name || 'Administrator'}
          </h1>
          <p className="text-xs text-slate-400">
            Verify drive legitimacy, oversee turnout mobilisation telemetry, and inspect platform audit logs.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Platform Overview Metrics Grid */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Drives</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{overview.total_campaigns}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-600">Pending Review</span>
            <p className="text-xl font-black text-amber-600 mt-0.5">{overview.pending_campaigns}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-600">Live Drives</span>
            <p className="text-xl font-black text-emerald-600 mt-0.5">{overview.live_campaigns}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Donors Enrolled</span>
            <p className="text-xl font-black text-blue-600 mt-0.5">{overview.total_donors}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Registrations</span>
            <p className="text-xl font-black text-indigo-600 mt-0.5">{overview.total_registrations}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Queue Promoted</span>
            <p className="text-xl font-black text-teal-600 mt-0.5">{overview.waitlist_promotions}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">QR Check-ins</span>
            <p className="text-xl font-black text-rose-600 mt-0.5">{overview.total_attended}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
            <p className="text-xl font-black text-slate-700 mt-0.5">{overview.total_users}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'verification'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Verification Queue</span>
          {pendingCampaigns.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-white text-brand-700 text-[10px] font-black">
              {pendingCampaigns.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all_campaigns')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all_campaigns'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Platform Campaigns ({allCampaigns.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audit Trail Inspector</span>
        </button>
      </div>

      {/* 1. Verification Queue View */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Pending Campaign Verification Requests
            </h2>
            <span className="text-xs text-slate-500">
              Only admin-approved campaigns become visible to public donors
            </span>
          </div>

          {pendingCampaigns.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800">Verification Queue Clear</p>
              <p>All submitted campaigns have been reviewed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-white rounded-3xl border border-amber-200/90 shadow-sm p-6 space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Verification
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{camp.name}</h3>
                      <p className="text-xs text-slate-500">{camp.organizer_name} ({camp.organizer_contact})</p>
                    </div>

                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
                      Target: {camp.target_count}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {camp.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      <span>{camp.drive_date}</span>
                    </div>
                    <div>
                      <span>{camp.start_time} - {camp.end_time}</span>
                    </div>
                    <div className="col-span-2 truncate">
                      <span>Venue: {camp.venue}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleApprove(camp.id, camp.name)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Make Live</span>
                    </button>

                    <button
                      onClick={() => handleReject(camp.id, camp.name)}
                      className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. All Campaigns View */}
      {activeTab === 'all_campaigns' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Drive Name</th>
                  <th className="py-3 px-4">Date & Venue</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Confirmed</th>
                  <th className="py-3 px-4">ML Predicted</th>
                  <th className="py-3 px-4">Attended</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.organizer_name}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-semibold">{c.drive_date}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{c.venue}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{c.target_count}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{c.confirmed_count || 0}</td>
                    <td className="py-3 px-4 font-bold text-purple-600">{c.predicted_attendance || 0}</td>
                    <td className="py-3 px-4 font-bold text-rose-600">{c.attended_count || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'live'
                          ? 'bg-emerald-50 text-emerald-700'
                          : c.status === 'pending_verification'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Full Audit Trail Inspector */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Immutable Platform Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Verifiable event sourcing logs capturing state transitions, actors, and payloads
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Actor Role</th>
                  <th className="py-2.5 px-3">After State / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {log.entity_type}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                        {log.actor_role || 'system'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-slate-500 max-w-xs truncate">
                      {log.after_state || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
