import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowLeft,
  Calendar,
  Award
} from 'lucide-react';

export const OrganizersDirectoryPage: React.FC = () => {
  const { navigateTo, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const organizers = [
    {
      id: 'org-01',
      name: 'Indian Red Cross Society, Nagpur',
      type: 'Statutory Body / NGO',
      license: 'SBTC-MH-401',
      contact: 'Dr. Alok Verma',
      phone: '+91 94221 44556',
      email: 'alok@redcrossnagpur.org',
      drivesCount: 18,
      unitsCollected: 2450,
      status: 'VERIFIED_ACTIVE'
    },
    {
      id: 'org-02',
      name: 'Rotary Club of Nagpur Elite',
      type: 'Civic Service Organization',
      license: 'SBTC-MH-882',
      contact: 'Pooja Shenoy',
      phone: '+91 98900 12345',
      email: 'blood@rotarynagpur.org',
      drivesCount: 12,
      unitsCollected: 1280,
      status: 'VERIFIED_ACTIVE'
    },
    {
      id: 'org-03',
      name: 'GMC Medical Student Association',
      type: 'Healthcare Academic Affiliate',
      license: 'SBTC-MH-109',
      contact: 'Dr. Rohan Iyer',
      phone: '+91 97654 00987',
      email: 'msa@gmcngp.edu',
      drivesCount: 8,
      unitsCollected: 1600,
      status: 'VERIFIED_ACTIVE'
    },
    {
      id: 'org-04',
      name: 'Nagpur Metro Rail Corporation (MahaMetro)',
      type: 'Public Sector Entity',
      license: 'SBTC-MH-554',
      contact: 'S. N. Joshi',
      phone: '+91 712 2889900',
      email: 'csr@mahametro.org',
      drivesCount: 4,
      unitsCollected: 480,
      status: 'UNDER_RENEWAL'
    }
  ];

  const filtered = organizers.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.license.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => navigateTo('/admin/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-trust-blue-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Console</span>
      </button>

      {/* Header */}
      <div className="bg-surface-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            State Council Directory
          </span>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-trust-blue-700 mt-2">
            Accredited Drive Organizers & Hosts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Registered NGOs, healthcare institutions, and civic bodies authorized to hold community blood collection camps.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search host or license..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-trust-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Organizers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((org) => (
          <div
            key={org.id}
            className="bg-surface-white rounded-3xl border border-neutral-200 p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-5"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {org.license}
                </span>
                <span className="text-xs font-mono font-semibold text-neutral-500">{org.type}</span>
              </div>

              <h3 className="font-headline font-bold text-lg text-neutral-900">{org.name}</h3>

              <div className="mt-4 space-y-1.5 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Representative:</span>
                  <span className="font-semibold text-neutral-900">{org.contact}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="font-mono">{org.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{org.email}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-neutral-50 rounded-xl">
                  <span className="text-[10px] text-neutral-400 uppercase block">Camps Hosted</span>
                  <span className="font-bold text-neutral-900 text-sm">{org.drivesCount} Drives</span>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-xl">
                  <span className="text-[10px] text-neutral-400 uppercase block">Units Mobilized</span>
                  <span className="font-bold text-trust-blue-700 text-sm">{org.unitsCollected} Units</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold font-mono text-[11px]">● Audit Compliance Current</span>
              <button
                onClick={() => addNotification('Accreditation View', `Inspecting credentials file for ${org.name}`, 'info')}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-semibold text-xs transition"
              >
                View Dossier
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
