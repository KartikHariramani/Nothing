import React, { useState, useEffect } from 'react';
import { Campaign, Registration, CampaignAnalytics } from '../types';
import { campaignService, registrationService, analyticsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TurnoutCharts } from '../components/organizer/TurnoutCharts';
import { LiveActivityFeed } from '../components/organizer/LiveActivityFeed';
import { AIAssistantDrawer } from '../components/organizer/AIAssistantDrawer';
import { 
  Users, 
  PlusCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Bot,
  Zap,
  Activity,
  Layers,
  QrCode,
  Share2
} from 'lucide-react';
import { QRScannerTab } from '../components/organizer/QRScannerTab';
import { CampaignShareModal } from '../components/organizer/CampaignShareModal';

export const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'scanner'>('overview');
  const [createdCampaign, setCreatedCampaign] = useState<Campaign | null>(null);

  // New Campaign Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [driveDate, setDriveDate] = useState('2026-10-15');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:00');
  const [venue, setVenue] = useState('');
  const [targetCount, setTargetCount] = useState(200);
  const [slotDuration, setSlotDuration] = useState(30);
  const [maxPerSlot, setMaxPerSlot] = useState(20);
  const [contact, setContact] = useState(user?.email || 'organizer@lifeshare.org');
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await campaignService.getMyCampaignsOrganizer();
      setCampaigns(data);
      if (data.length > 0) {
        const active = selectedCampaign ? data.find(c => c.id === selectedCampaign.id) || data[0] : data[0];
        setSelectedCampaign(active);
        loadCampaignDetails(active.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignDetails = async (campaignId: string) => {
    try {
      const [analyticsData, regsData] = await Promise.all([
        analyticsService.getCampaignAnalytics(campaignId),
        registrationService.getCampaignRegistrations(campaignId)
      ]);
      setAnalytics(analyticsData);
      setRegistrations(regsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await campaignService.createCampaign({
        name,
        description,
        drive_date: driveDate,
        start_time: startTime,
        end_time: endTime,
        venue,
        target_count: Number(targetCount),
        slot_duration: Number(slotDuration),
        max_donors_per_slot: Number(maxPerSlot),
        organizer_contact: contact,
      });

      setFormMsg('Campaign submitted for administrative verification! Status: pending_verification.');
      setTimeout(() => {
        setShowCreateModal(false);
        setFormMsg(null);
        fetchCampaigns();
        setCreatedCampaign(created);
      }, 2000);
    } catch (e: any) {
      console.error(e);
      setFormMsg(e.response?.data?.detail || 'Failed to create campaign.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">
            <Users className="w-3 h-3" />
            <span>Campaign Mobilisation Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Organizer Panel: {user?.full_name || 'Coordinator'}
          </h1>
          <p className="text-xs text-slate-400">
            Monitor turnout predictions, dynamic slot rebalancing, and live registration telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsAiOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            <span>AI Turnout Assistant</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {selectedCampaign && (
        <div className="flex items-center gap-2 border-b border-slate-200 mb-4 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-bold text-sm ${activeTab === 'overview' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500'}`}
          >
            Overview & Telemetry
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 font-bold text-sm flex items-center gap-2 ${activeTab === 'scanner' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500'}`}
          >
            <QrCode className="w-4 h-4" />
            QR Scanner
          </button>
          <button
            onClick={() => setCreatedCampaign(selectedCampaign)}
            className="px-4 py-2 font-bold text-sm flex items-center gap-2 text-slate-500 hover:text-brand-600 ml-auto"
          >
            <Share2 className="w-4 h-4" />
            Share Campaign
          </button>
        </div>
      )}

      {/* Campaign Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {campaigns.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedCampaign(c);
              loadCampaignDetails(c.id);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
              selectedCampaign?.id === c.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${c.status === 'live' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{c.name}</span>
            <span className="text-[10px] opacity-70">({c.status})</span>
          </button>
        ))}
      </div>

      {selectedCampaign && analytics && activeTab === 'overview' && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Target</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">{analytics.target_count}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Registered</span>
              <p className="text-xl font-black text-blue-600 mt-0.5">{analytics.total_registered}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Confirmed</span>
              <p className="text-xl font-black text-emerald-600 mt-0.5">{analytics.confirmed_count}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">ML Predicted</span>
              <p className="text-xl font-black text-purple-600 mt-0.5">{analytics.predicted_attendance}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Expected Gap</span>
              <p className="text-xl font-black text-amber-600 mt-0.5">{analytics.expected_gap}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Waitlist</span>
              <p className="text-xl font-black text-indigo-600 mt-0.5">{analytics.waitlisted_count}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Queue Promoted</span>
              <p className="text-xl font-black text-teal-600 mt-0.5">{analytics.waitlist_promotions_count}</p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Attended (QR)</span>
              <p className="text-xl font-black text-rose-600 mt-0.5">{analytics.actual_attendance}</p>
            </div>
          </div>

          {/* Turnout Intelligence Visual Charts */}
          <TurnoutCharts analytics={analytics} />

          {/* Registrations Matrix & Live Telemetry Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Registrations Table */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Registered Donors & Prediction Scores
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time individual attendance probabilities computed by Scikit-Learn
                  </p>
                </div>

                <button
                  onClick={() => loadCampaignDetails(selectedCampaign.id)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Donor</th>
                      <th className="py-2.5 px-3">Slot</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">ML Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrations.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">{r.donor_name}</p>
                          <p className="text-[10px] text-slate-400">{r.donor_email}</p>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          {r.slot_time}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            r.status === 'attended'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : r.status === 'waitlisted'
                              ? 'bg-amber-50 text-amber-700'
                              : r.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900">
                            {Math.round((r.predicted_attendance_score || 0.5) * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Live Telemetry Stream */}
            <div className="lg:col-span-5">
              <LiveActivityFeed autoRefreshInterval={3000} />
            </div>
          </div>
        </>
      )}

      {selectedCampaign && activeTab === 'scanner' && (
        <QRScannerTab campaign={selectedCampaign} />
      )}

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        campaignId={selectedCampaign?.id}
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-5">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                Campaign Verification Workflow
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Create Blood Donation Drive</h2>
              <p className="text-xs text-slate-500">Submitted drives require administrative verification before going live publicly.</p>
            </div>

            {formMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                {formMsg}
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. GCOEN Blood Donation Drive 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Drive context, organizing partners, and turnout goals..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Drive Date</label>
                  <input
                    type="date"
                    required
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue & Location</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Main Auditorium, GCOEN, Nagpur"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Donors</label>
                  <input
                    type="number"
                    required
                    value={targetCount}
                    onChange={(e) => setTargetCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slot Duration (Min)</label>
                  <input
                    type="number"
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Donors / Slot</label>
                  <input
                    type="number"
                    value={maxPerSlot}
                    onChange={(e) => setMaxPerSlot(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Share Modal */}
      {createdCampaign && (
        <CampaignShareModal campaign={createdCampaign} onClose={() => setCreatedCampaign(null)} />
      )}
    </div>
  );
};
