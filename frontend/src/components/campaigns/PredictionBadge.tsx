import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PredictionBadgeProps {
  score: number;
  explanation?: string;
  showDetails?: boolean;
}

export const PredictionBadge: React.FC<PredictionBadgeProps> = ({ score, explanation, showDetails = false }) => {
  const percentage = Math.round((score || 0.5) * 100);

  let style = 'bg-emerald-900/30 text-emerald-400 border-emerald-800';
  let icon = CheckCircle2;
  let statusText = 'High Likelihood';

  if (percentage < 60) {
    style = 'bg-rose-900/30 text-rose-400 border-rose-800';
    icon = AlertCircle;
    statusText = 'Turnout Risk';
  } else if (percentage < 75) {
    style = 'bg-amber-900/30 text-amber-500 border-amber-800';
    icon = TrendingUp;
    statusText = 'Moderate Turnout';
  }

  const IconComponent = icon;

  return (
    <div className="inline-flex flex-col gap-1">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${style}`}>
        <Sparkles className="w-3 h-3 text-current" />
        <span>ML Turnout: {percentage}%</span>
        <span className="text-[10px] font-medium opacity-80">({statusText})</span>
      </div>

      {showDetails && explanation && (
        <p className="text-[11px] text-slate-400 leading-snug max-w-sm mt-0.5">
          {explanation}
        </p>
      )}
    </div>
  );
};
