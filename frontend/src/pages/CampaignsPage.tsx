import React, { useState, useEffect } from 'react';
import { Campaign } from '../types';
import { campaignService, getApiErrorMessage } from '../services/api';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { RegistrationModal } from '../components/campaigns/RegistrationModal';
import { Search, Droplet, RefreshCw, AlertCircle } from 'lucide-react';

interface CampaignsPageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedCampaign: (c: Campaign) => void;
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({ setCurrentTab, setSelectedCampaign }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegCamp, setSelectedRegCamp] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await campaignService.getPublicCampaigns(searchTerm);
      setCampaigns(data);
    } catch (e) {
      setError(getApiErrorMessage(e));
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Find a Campaign Near You
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Browse verified blood drives, select your preferred time window, and make a direct impact in your community.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by drive name, venue, or location..."
            className="w-full pl-12 pr-4 py-4 text-sm rounded-2xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load campaigns</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <button onClick={fetchCampaigns} className="px-3 py-1.5 bg-rose-900/50 hover:bg-rose-800/50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center gap-3 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Searching campaigns...</span>
            </div>
          </div>
        ) : !error && campaigns.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <Droplet className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            <p className="text-xl font-bold text-slate-300 mb-2">No campaigns found</p>
            <p className="text-sm text-slate-500">Try a different search term or check back later.</p>
          </div>
        ) : (
          campaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              onSelect={(c) => {
                setSelectedCampaign(c);
                setCurrentTab('campaign_detail');
              }}
              onQuickRegister={(c) => setSelectedRegCamp(c)}
            />
          ))
        )}
      </div>

      {/* Registration Modal */}
      {selectedRegCamp && (
        <RegistrationModal
          campaign={selectedRegCamp}
          onClose={() => setSelectedRegCamp(null)}
          onSuccess={(reg) => {
            setSelectedRegCamp(null);
            setCurrentTab('donor');
          }}
        />
      )}
    </div>
  );
};
