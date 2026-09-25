import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Truck
} from 'lucide-react';

export const BloodBankDashboard: React.FC = () => {
  const { inventory, campaigns, navigateTo, addNotification } = useApp();

  const handleRequestSurge = (bloodGroup: string) => {
    addNotification('Surge Requested', `Automated mobilization alert triggered for ${bloodGroup} across regional camps`, 'warning');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Regional Blood Transfusion Centre (RBTC)
            </span>
            <span className="text-xs font-mono text-neutral-500">Government Medical College, Nagpur</span>
          </div>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-trust-blue-700">
            Blood Component Storage & Reserve Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Real-time component fraction inventories, cold-chain camp batch intakes, and emergency trauma supply lines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/organizer/drives/new')}
            className="px-4 py-2.5 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-xs transition shadow-sm"
          >
            + Request Hospital Drive
          </button>
        </div>
      </div>

      {/* Component Inventory Stock Grid */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="font-headline font-bold text-xl text-neutral-900">
              Live Component Fractions & Safety Thresholds
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Automated telemetry linked with regional storage units. Red indicates dangerous supply dips below 48-hour buffers.
            </p>
          </div>

          <span className="text-xs font-mono text-neutral-400">
            Synced: 2 mins ago
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {inventory.map((item, idx) => {
            const isCritical = item.status === 'CRITICAL' || item.status === 'SURGE_REQUIRED';
            const percentage = Math.min(100, Math.round((item.unitsAvailable / item.minimumSafeLevel) * 100));

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isCritical 
                    ? 'bg-rose-50/60 border-rose-200' 
                    : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-lg font-mono font-extrabold text-neutral-900">
                    {item.bloodGroup}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    isCritical 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs font-semibold text-neutral-600">{item.component}</p>

                <div className="mt-4 flex items-baseline justify-between">
                  <p className="font-headline font-extrabold text-3xl text-neutral-900">
                    {item.unitsAvailable} <span className="text-xs font-normal text-neutral-500 font-mono">Units</span>
                  </p>
                  <span className="text-xs font-mono text-neutral-500">
                    Min Safe: {item.minimumSafeLevel}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isCritical ? 'bg-brand-red-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {isCritical && (
                  <div className="mt-4 pt-3 border-t border-rose-200 flex items-center justify-between">
                    <span className="text-[11px] text-rose-700 font-medium">Below Emergency Buffer</span>
                    <button
                      onClick={() => handleRequestSurge(item.bloodGroup)}
                      className="px-2.5 py-1 bg-brand-red-500 hover:bg-brand-red-600 text-white rounded text-[11px] font-semibold transition"
                    >
                      Trigger Surge
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* INBOUND CAMP BATCHES & LOGISTICS */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-trust-blue-700" />
            <h3 className="font-headline font-bold text-lg text-neutral-900">
              Inbound Cold-Chain Transit Batches from Active Drives
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {campaigns.length} Source Camps Today
          </span>
        </div>

        <div className="space-y-3">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <p className="font-headline font-bold text-sm text-neutral-900">{camp.name}</p>
                <p className="text-neutral-500 mt-0.5">{camp.location} · Transit Destination: GMC Trauma Center</p>
              </div>

              <div className="flex items-center gap-4 font-mono">
                <span className="text-emerald-700 font-semibold">{camp.attendedCount} Units Collected</span>
                <span className="px-2.5 py-1 rounded bg-neutral-200 text-neutral-800 font-bold">
                  Cold-Chain 4°C Maintained
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
