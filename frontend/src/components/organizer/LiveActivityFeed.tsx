import React, { useState, useEffect } from 'react';
import { ActivityItem } from '../../types';
import { auditService } from '../../services/api';
import { 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  UserCheck, 
  MessageSquare, 
  Zap, 
  QrCode,
  Shield
} from 'lucide-react';

interface LiveActivityFeedProps {
  autoRefreshInterval?: number;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ autoRefreshInterval = 4000 }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFeed = async () => {
    try {
      const data = await auditService.getActivityFeed(20);
      setActivities(data);
    } catch (e) {
      console.error('Failed to fetch activity feed', e);
    }
  };

  useEffect(() => {
    fetchFeed();
    const timer = setInterval(fetchFeed, autoRefreshInterval);
    return () => clearInterval(timer);
  }, [autoRefreshInterval]);

  const getActionIcon = (action: string) => {
    if (action.includes('checked_in') || action.includes('confirmed')) return CheckCircle2;
    if (action.includes('cancelled') || action.includes('rejected')) return XCircle;
    if (action.includes('promoted') || action.includes('queue')) return Zap;
    if (action.includes('qr')) return QrCode;
    if (action.includes('notification') || action.includes('reminder') || action.includes('message')) return MessageSquare;
    if (action.includes('consent')) return Shield;
    return Activity;
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'indigo': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'rose': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'sky': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Live Intelligence Telemetry Stream
          </h3>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchFeed().finally(() => setLoading(false));
          }}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No recent activity recorded yet. Run a simulation or register a donor to see live stream.
          </div>
        ) : (
          activities.map((item) => {
            const Icon = getActionIcon(item.action);
            return (
              <div key={item.id} className="p-3.5 hover:bg-slate-50/60 transition-colors flex items-start gap-3 text-xs">
                <div className={`p-1.5 rounded-lg border flex-shrink-0 ${getBadgeColor(item.color)}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{item.time_str}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      {item.actor_role}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate font-mono">
                      {item.action}
                    </span>
                  </div>

                  {item.after_state && (
                    <p className="text-[11px] text-slate-600 mt-1 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 break-all line-clamp-2">
                      {typeof item.after_state === 'string' ? item.after_state : JSON.stringify(item.after_state)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
