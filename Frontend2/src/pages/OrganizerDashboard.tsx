import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  AlertTriangle,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const OrganizerDashboard: React.FC = () => {
  const { campaigns, currentUser, navigateTo } = useApp();

  const hourlyTurnoutData = [
    { hour: '09:00 AM', actual: 15, predicted: 14, capacity: 15 },
    { hour: '10:00 AM', actual: 28, predicted: 27, capacity: 30 },
    { hour: '11:00 AM', actual: 44, predicted: 43, capacity: 45 },
    { hour: '12:00 PM', actual: 58, predicted: 56, capacity: 60 },
    { hour: '01:00 PM', actual: 68, predicted: 72, capacity: 75 },
    { hour: '02:00 PM', actual: 84, predicted: 90, capacity: 90 },
    { hour: '03:00 PM', actual: null, predicted: 108, capacity: 120 },
    { hour: '04:00 PM', actual: null, predicted: 122, capacity: 150 },
  ];

  const primaryCamp = campaigns[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-trust-blue-50 text-trust-blue-700 border border-trust-blue-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Camp Host Operations
            </span>
            <span className="text-xs font-mono text-emerald-600 font-semibold">● ML Engine Active</span>
          </div>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-trust-blue-700">
            Camp Coordinator Console
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Indian Red Cross Society, Nagpur Chapter · License #SBTC-MH-401
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/organizer/drives/new')}
            className="px-4 py-2.5 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-xs transition shadow-sm flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Camp</span>
          </button>

          <button
            onClick={() => navigateTo('/organizer/drives/camp-101/roster')}
            className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-semibold text-xs transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Live Donor Roster</span>
          </button>
        </div>
      </div>

      {/* Real-Time Operational Turnout KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card">
          <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block mb-1">Target Units</span>
          <p className="font-headline font-bold text-2xl text-neutral-900">{primaryCamp.targetUnits}</p>
          <span className="text-[10px] text-neutral-500 font-medium">Hospital Quota</span>
        </div>

        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card">
          <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block mb-1">Booked Donors</span>
          <p className="font-headline font-bold text-2xl text-trust-blue-700">{primaryCamp.registeredCount}</p>
          <span className="text-[10px] text-trust-blue-600 font-medium">92% Slot Occupancy</span>
        </div>

        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card">
          <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block mb-1">Verified Arrivals</span>
          <p className="font-headline font-bold text-2xl text-emerald-600">{primaryCamp.attendedCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Single-use Scans</span>
        </div>

        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card">
          <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block mb-1">ML Predicted Total</span>
          <p className="font-headline font-bold text-2xl text-purple-700">{primaryCamp.predictedTurnout}</p>
          <span className="text-[10px] text-purple-600 font-medium font-mono">GradientBoosting v2</span>
        </div>

        <div className="bg-surface-white rounded-2xl p-5 border border-neutral-200 shadow-card col-span-2 md:col-span-1">
          <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block mb-1">Forecast Variance</span>
          <p className="font-headline font-bold text-2xl text-emerald-600">± 3.2%</p>
          <span className="text-[10px] text-neutral-500 font-medium">High Confidence</span>
        </div>
      </div>

      {/* ML TURNOUT FORECAST & PACING HISTOGRAM */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-trust-blue-700" />
              <h2 className="font-headline font-bold text-xl text-neutral-900">
                Live Turnout Pacing vs. Scikit-Learn Prediction Model
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Hourly arrival accumulation curve comparing verified check-ins against ML projected attendance.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Actual Arrivals
            </span>
            <span className="flex items-center gap-1.5 text-purple-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span> ML Prediction
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyTurnoutData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="actual" stroke="#16A34A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActual)" />
              <Area type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={2.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPred)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ACTIVE HOSTED CAMPS ROSTER TABLE */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <h3 className="font-headline font-bold text-lg text-neutral-900">
            Hosted Drives Under Your Management
          </h3>
          <span className="text-xs font-mono font-semibold text-neutral-500">
            {campaigns.length} Camps Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-mono uppercase text-[10px]">
                <th className="pb-3 font-semibold">Camp Title</th>
                <th className="pb-3 font-semibold">Date & Timing</th>
                <th className="pb-3 font-semibold">Target Units</th>
                <th className="pb-3 font-semibold">Registered</th>
                <th className="pb-3 font-semibold">Attended</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-3.5 font-medium text-neutral-900">
                    <p className="font-semibold text-sm">{camp.name}</p>
                    <p className="text-[11px] text-neutral-500">{camp.location}</p>
                  </td>
                  <td className="py-3.5 text-neutral-600 font-mono">
                    <p>{camp.date}</p>
                    <p className="text-[11px] text-neutral-400">{camp.time}</p>
                  </td>
                  <td className="py-3.5 font-mono font-bold text-neutral-900">{camp.targetUnits}</td>
                  <td className="py-3.5 font-mono text-trust-blue-700 font-semibold">{camp.registeredCount}</td>
                  <td className="py-3.5 font-mono text-emerald-600 font-semibold">{camp.attendedCount}</td>
                  <td className="py-3.5">
                    {camp.status === 'live' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-red-50 text-brand-red-600 border border-brand-red-200 animate-pulse">
                        ● LIVE TODAY
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        APPROVED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => navigateTo('/organizer/drives/camp-101/roster', { driveId: camp.id })}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-semibold text-xs transition"
                    >
                      Donor Roster
                    </button>
                    <button
                      onClick={() => navigateTo('/drives/' + camp.id, { driveId: camp.id })}
                      className="px-3 py-1.5 bg-trust-blue-700 hover:bg-trust-blue-500 text-white rounded-lg font-semibold text-xs transition"
                    >
                      Public View
                    </button>
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
