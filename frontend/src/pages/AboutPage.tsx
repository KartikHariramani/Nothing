import React from 'react';
import { Logo } from '../components/common/Logo';
import { ShieldCheck, Heart, Users, Target, Activity } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <Logo size="lg" className="justify-center mb-4" />
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          About Life Share
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          “Connecting People. Mobilising Blood. Saving Lives.”
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Our Mission</h2>
          <p>
            The fundamental bottleneck in blood donation drives is not a lack of generous people willing to help — it is the conversion drop-off between intention, registration, confirmation, and actual physical arrival at the venue.
          </p>
          <p>
            Life Share provides the intelligent mobilisation layer that bridges this gap. By utilizing attendance prediction, personalized communication, explicit consent governance, and automated dynamic queue rebalancing, we ensure no donor slot is wasted.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Multi-Role Harmony</span>
            </h3>
            <p className="text-xs text-slate-500">
              Seamlessly integrates Administrators, Drive Organizers, Donors, and Volunteer Check-in staff on a single unified platform.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Dynamic Queue Rebalancing</span>
            </h3>
            <p className="text-xs text-slate-500">
              Instantaneous waitlist promotion when confirmed donors cancel, maintaining optimal clinic bed occupancy throughout the drive.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 space-y-2">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>Strict Healthcare System Boundaries</span>
          </h3>
          <p className="text-xs text-slate-400 leading-normal">
            Life Share is strictly an intelligent mobilisation and administrative check-in system. It does not perform clinical eligibility determinations, medical screening, laboratory testing, or hospital blood banking. All clinical decisions remain exclusively with certified medical doctors and healthcare staff at the venue.
          </p>
        </div>
      </div>
    </div>
  );
};
