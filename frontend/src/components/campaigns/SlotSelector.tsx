import React from 'react';
import { Slot } from '../../types';
import { Clock, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SlotSelectorProps {
  slots: Slot[];
  selectedSlot: string | null;
  onSelectSlot: (slotTime: string) => void;
}

export const SlotSelector: React.FC<SlotSelectorProps> = ({ slots, selectedSlot, onSelectSlot }) => {
  if (!slots || slots.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
        No specific slots segmented. General arrival is open.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Select Preferred Time Slot
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {slots.map((s) => {
          const isSelected = selectedSlot === s.slot_time;
          const isWaitlist = s.status === 'waitlist' || (s.booked_count && s.booked_count >= s.capacity);
          
          return (
            <button
              key={s.id || s.slot_time}
              type="button"
              onClick={() => onSelectSlot(s.slot_time)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  <span>{s.slot_time}</span>
                </div>

                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                ) : isWaitlist ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Waitlist
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Available
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Capacity: {s.capacity} donors</span>
                <span className="font-semibold text-slate-700">
                  {s.booked_count || 0} booked {s.waitlist_count ? `(${s.waitlist_count} waitlisted)` : ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
