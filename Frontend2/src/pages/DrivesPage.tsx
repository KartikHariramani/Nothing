import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  SlidersHorizontal,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const DrivesPage: React.FC = () => {
  const { campaigns, navigateTo, routeParams } = useApp();
  const [cityFilter, setCityFilter] = useState(routeParams.city || '');
  const [selectedBlood, setSelectedBlood] = useState(routeParams.blood || '');
  const [urgencyOnly, setUrgencyOnly] = useState(routeParams.shortageFilter === 'true');

  const filteredCampaigns = campaigns.filter(c => {
    const matchesCity = !cityFilter || c.city.toLowerCase().includes(cityFilter.toLowerCase()) || c.location.toLowerCase().includes(cityFilter.toLowerCase());
    const matchesBlood = !selectedBlood || c.urgentShortageGroups.includes(selectedBlood);
    const matchesUrgency = !urgencyOnly || c.isEmergencySurge;
    return matchesCity && matchesBlood && matchesUrgency;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-neutral-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-red-50 text-brand-red-600 border border-brand-red-200">
              National Camp Directory
            </span>
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-trust-blue-700 mt-2">
              Browse Verified Blood Donation Drives
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Find accessible camps, check real-time phlebotomy slot availability, and book single-use appointment passes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('/organizer/drives/new')}
              className="px-4 py-2 bg-trust-blue-700 hover:bg-trust-blue-500 text-white rounded-lg font-headline font-semibold text-xs shadow-sm transition"
            >
              + Host a Drive in Your Area
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Search by city, landmark, or campus..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedBlood}
              onChange={(e) => setSelectedBlood(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
            >
              <option value="">Filter by Blood Group Need (All)</option>
              <option value="O+">O+ (Critical Need)</option>
              <option value="O-">O- (Universal)</option>
              <option value="B+">B+ Positive</option>
              <option value="B-">B- (Surge Required)</option>
              <option value="A+">A+ Positive</option>
              <option value="A-">A- Negative</option>
              <option value="AB+">AB+ Positive</option>
              <option value="AB-">AB- (Emergency)</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700 select-none">
              <input
                type="checkbox"
                checked={urgencyOnly}
                onChange={(e) => setUrgencyOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-red-600 focus:ring-brand-red-500"
              />
              <span>Emergency Surge Only</span>
            </label>
          </div>

        </div>

        {/* Quick Tags */}
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Showing {filteredCampaigns.length} verified camps</span>
          {(cityFilter || selectedBlood || urgencyOnly) && (
            <button
              onClick={() => {
                setCityFilter('');
                setSelectedBlood('');
                setUrgencyOnly(false);
              }}
              className="text-brand-red-600 hover:underline font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((camp) => {
          const bookedPercent = Math.min(100, Math.round((camp.confirmedCount / camp.targetUnits) * 100));

          return (
            <div
              key={camp.id}
              className="bg-surface-white rounded-2xl border border-neutral-200 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Drive
                  </span>
                  {camp.isEmergencySurge && (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-red-50 text-brand-red-600 border border-brand-red-200">
                      Emergency Surge
                    </span>
                  )}
                </div>

                <h3 
                  onClick={() => navigateTo('/drives/' + camp.id, { driveId: camp.id })}
                  className="font-headline font-bold text-lg text-neutral-900 hover:text-brand-red-600 cursor-pointer transition-colors"
                >
                  {camp.name}
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">{camp.organizer}</p>

                <div className="mt-4 space-y-2 text-xs text-neutral-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{camp.location}, {camp.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{camp.date} · {camp.time}</span>
                  </div>
                </div>

                {/* Urgently seeking tags */}
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Critical Needs:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {camp.urgentShortageGroups.map(bg => (
                      <span key={bg} className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-brand-red-50 text-brand-red-600 border border-brand-red-100">
                        {bg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Capacity */}
                <div className="mt-4 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-500">Booked Capacity</span>
                    <span className="font-mono font-semibold text-trust-blue-700">
                      {camp.confirmedCount} / {camp.targetUnits} ({bookedPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-red-500 rounded-full"
                      style={{ width: `${bookedPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-3">
                <span className="text-xs text-neutral-500 font-mono">
                  {camp.slots.reduce((a, b) => a + b.remaining, 0)} slots open
                </span>
                <button
                  onClick={() => navigateTo('/drives/' + camp.id, { driveId: camp.id })}
                  className="px-4 py-2 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Select Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
