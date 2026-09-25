import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  QrCode,
  UserCheck
} from 'lucide-react';

export const RosterPage: React.FC = () => {
  const { registrations, campaigns, routeParams, navigateTo, checkInQR, addNotification } = useApp();
  const driveId = routeParams.driveId || 'camp-101';
  const campaign = campaigns.find(c => c.id === driveId) || campaigns[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = r.donorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.qrToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.donorPhone.includes(searchTerm);
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleManualCheckIn = (qrToken: string) => {
    const res = checkInQR(qrToken);
    if (res.success) {
      addNotification('Arrival Recorded', res.message, 'success');
    } else {
      addNotification('Check-in Alert', res.message, 'warning');
    }
  };

  const exportCSV = () => {
    const headers = "Name,Phone,BloodType,Slot,Status,QRToken,MLProbability,RegisteredAt\n";
    const rows = registrations.map(r => 
      `"${r.donorName}","${r.donorPhone}","${r.donorBloodType}","${r.slotTime}","${r.status}","${r.qrToken}","${r.mlProbability}","${r.registeredAt}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donor_roster_${campaign.id}.csv`;
    a.click();
    addNotification('CSV Exported', 'Donor ledger downloaded with cryptographic audit tokens', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigateTo('/organizer/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-trust-blue-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Host Overview</span>
      </button>

      {/* Header */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-trust-blue-50 text-trust-blue-700 border border-trust-blue-200">
            Camp Operational Donor Roster
          </span>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-trust-blue-700 mt-2">
            {campaign.name}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {campaign.date} · {campaign.location} · {campaign.confirmedCount} Booked Donors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-semibold text-xs transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Roster (CSV)</span>
          </button>

          <button
            onClick={() => navigateTo('/volunteer/scanner')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Open Check-in Kiosk</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface-white rounded-2xl border border-neutral-200 p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, or token..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
          >
            <option value="">All Donor Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="attended">Attended (Verified)</option>
            <option value="registered">Registered (Pending)</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <span className="text-xs font-mono text-neutral-500">
            {filteredRegistrations.length} Donors
          </span>
        </div>
      </div>

      {/* Main Donor Table */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                <th className="py-3 px-5 font-semibold">Donor Details</th>
                <th className="py-3 px-4 font-semibold">Slot Window</th>
                <th className="py-3 px-4 font-semibold">Blood Type</th>
                <th className="py-3 px-4 font-semibold">Verification Token</th>
                <th className="py-3 px-4 font-semibold">ML Turnout Probability</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-5 font-semibold text-right">Field Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRegistrations.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <p className="font-semibold text-neutral-900 text-sm">{r.donorName}</p>
                    <p className="text-[11px] text-neutral-500 font-mono">{r.donorPhone}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-700">{r.slotTime}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-brand-red-50 text-brand-red-600 border border-brand-red-100">
                      {r.donorBloodType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-trust-blue-700">{r.qrToken}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${Math.round(r.mlProbability * 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-purple-700 font-bold">
                        {Math.round(r.mlProbability * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {r.status === 'attended' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ ATTENDED
                      </span>
                    )}
                    {r.status === 'confirmed' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-trust-blue-50 text-trust-blue-700 border border-trust-blue-200">
                        CONFIRMED
                      </span>
                    )}
                    {r.status === 'registered' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-700">
                        REGISTERED
                      </span>
                    )}
                    {r.status === 'waitlisted' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        WAITLISTED
                      </span>
                    )}
                    {r.status === 'cancelled' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        CANCELLED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {r.status !== 'attended' && r.status !== 'cancelled' ? (
                      <button
                        onClick={() => handleManualCheckIn(r.qrToken)}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold text-xs transition inline-flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Manual Check-in</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-neutral-400 font-mono">Completed</span>
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
