import React from 'react';
import { CampaignAnalytics } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface TurnoutChartsProps {
  analytics: CampaignAnalytics;
}

export const TurnoutCharts: React.FC<TurnoutChartsProps> = ({ analytics }) => {
  const funnelData = analytics.attendance_funnel || [];
  const slotData = analytics.slot_distribution || [];

  const comparisonData = [
    { name: 'Target', donors: analytics.target_count, fill: '#64748B' },
    { name: 'Total Registered', donors: analytics.total_registered, fill: '#3B82F6' },
    { name: 'Confirmed Slots', donors: analytics.confirmed_count, fill: '#10B981' },
    { name: 'ML Predicted Turnout', donors: analytics.predicted_attendance, fill: '#8B5CF6' },
    { name: 'Actual Attended (QR)', donors: analytics.actual_attendance, fill: '#E11D48' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Primary Comparison: Target vs. Confirmed vs. Predicted vs. Attended */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Predicted vs. Actual Mobilisation Funnel
            </h3>
            <p className="text-xs text-slate-500">
              Machine learning attendance probability vs. ground-truth QR verified check-ins
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Predicted: {analytics.predicted_attendance}
            </span>
            <span className="px-2 py-0.5 rounded font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Actual: {analytics.actual_attendance}
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
              />
              <Bar dataKey="donors" radius={[6, 6, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Slot Capacity & Dynamic Queue Occupancy Matrix */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            Time Slot Occupancy & Dynamic Queue Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Real-time confirmed slots, active waitlists, and completed physical check-ins per window
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={slotData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="slot_time" tick={{ fontSize: 10, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '12px', border: 'none', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="confirmed" name="Confirmed" fill="#10B981" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="attended" name="Attended (QR)" fill="#059669" stackId="a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="waitlisted" name="Waitlist Queue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
