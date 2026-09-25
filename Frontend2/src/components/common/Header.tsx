import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Heart, 
  ShieldCheck, 
  User as UserIcon, 
  Bell, 
  Menu, 
  X, 
  QrCode, 
  Calendar, 
  Building2, 
  Activity, 
  LogOut,
  LogIn
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    isAuthenticated, 
    logout, 
    currentRoute, 
    navigateTo, 
    notifications, 
    dismissNotification 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', route: '/' },
        { label: 'Find a Drive', route: '/drives' },
        { label: 'Statutory FAQ & Demarcation', route: '/about-faq' },
      ];
    }

    switch (currentUser.role) {
      case 'organizer':
        return [
          { label: 'Host Dashboard', route: '/organizer/dashboard' },
          { label: 'Create Camp', route: '/organizer/drives/new' },
          { label: 'Live Roster', route: '/organizer/drives/camp-101/roster' },
          { label: 'Volunteers', route: '/organizer/volunteers' },
          { label: 'Browse Camps', route: '/drives' },
        ];
      case 'volunteer':
        return [
          { label: 'QR Scanner Kiosk', route: '/volunteer/scanner' },
          { label: 'Arrival Roster', route: '/organizer/drives/camp-101/roster' },
          { label: 'Find Drives', route: '/drives' },
        ];
      case 'admin':
        return [
          { label: 'Governance Console', route: '/admin/dashboard' },
          { label: 'Accredited Organizers', route: '/admin/organizers' },
          { label: 'Audit Trail', route: '/admin/audit' },
          { label: 'Browse Camps', route: '/drives' },
        ];
      case 'blood_bank':
        return [
          { label: 'Component Telemetry', route: '/blood-bank/dashboard' },
          { label: 'Camp Batches', route: '/organizer/drives/camp-101/roster' },
          { label: 'Browse Camps', route: '/drives' },
        ];
      case 'donor':
      default:
        return [
          { label: 'Home', route: '/' },
          { label: 'Find a Drive', route: '/drives' },
          { label: 'My Appointments & Pass', route: '/donor/dashboard' },
          { label: 'Consent & Telegram', route: '/donor/consent' },
          { label: 'FAQ & Statutory Info', route: '/about-faq' },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* 1. TOP SOVEREIGN TELEMETRY STRIP */}
      <aside className="bg-neutral-900 text-neutral-200 border-b border-neutral-800 text-xs px-4 md:px-8 py-1.5 flex flex-wrap items-center justify-between font-mono tracking-wide">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center gap-1.5 text-success-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-success-600 animate-pulse"></span>
            NODE #SPEC-NAV-DEL-00
          </span>
          <span className="text-neutral-700">|</span>
          <span className="hidden sm:inline text-neutral-300">MOBILIZE CIVIC HEALTH ARCHITECTURE</span>
          <span className="text-neutral-700 hidden sm:inline">|</span>
          <span className="hidden md:inline text-neutral-400">SECTION 65B BNSS COMPLIANT · 256-BIT TLS</span>
        </div>
        <div className="flex items-center space-x-4 text-neutral-400">
          <span className="hidden lg:inline">
            MERKLE ANCHOR: <span className="text-primary-fixed text-neutral-200">#8,941,260</span>
          </span>
          <span className="text-[11px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
            STITCH SPEC v3.4
          </span>
        </div>
      </aside>

      {/* 2. MAIN HEADER */}
      <header className="sticky top-0 z-40 bg-surface-white border-b border-neutral-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo & National System Name */}
            <div 
              onClick={() => navigateTo('/')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-brand-red-500 to-primary flex items-center justify-center text-white shadow-md shadow-brand-red-500/20 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-lg sm:text-xl text-trust-blue-700 tracking-tight">
                    Life<span className="text-brand-red-500">Share</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-brand-red-50 text-brand-red-600 font-semibold border border-brand-red-100">
                    Official
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 font-body leading-none hidden sm:block">
                  Mobilize Civic Health System
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = currentRoute === link.route;
                return (
                  <button
                    key={link.route}
                    onClick={() => navigateTo(link.route)}
                    className={`px-3 py-2 rounded-lg font-body text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-brand-red-600 bg-brand-red-50 font-semibold'
                        : 'text-neutral-600 hover:text-trust-blue-700 hover:bg-neutral-50'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {!isAuthenticated ? (
                /* GUEST HEADER CONTROLS (Only Sign In / Register, no Google button on Home) */
                <button
                  onClick={() => navigateTo('/login')}
                  className="px-4 py-2 bg-primary hover:bg-brand-red-600 text-white rounded-lg font-headline font-semibold text-xs transition shadow-sm flex items-center gap-1.5 active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In / Sign Up</span>
                </button>
              ) : (
                /* AUTHENTICATED USER CONTROLS (No interactive role switcher; shows fixed portal badge & sign out) */
                <>
                  {/* Fixed Read-Only Role Badge */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-700 select-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-neutral-400 font-mono text-[10px] uppercase">Portal:</span>
                    <span className="font-semibold text-trust-blue-700 capitalize">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
                      className="p-2 rounded-lg text-neutral-600 hover:text-trust-blue-700 hover:bg-neutral-100 relative transition-colors"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {notifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red-500 ring-2 ring-white"></span>
                      )}
                    </button>

                    {/* Notification Dropdown Panel */}
                    {notifDrawerOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-white rounded-2xl shadow-modal border border-neutral-200 p-4 z-50 animate-in fade-in"
                        onMouseLeave={() => setNotifDrawerOpen(false)}
                      >
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-brand-red-500" />
                            <h4 className="font-headline font-semibold text-sm text-neutral-900">System Telemetry & Alerts</h4>
                          </div>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-brand-red-50 text-brand-red-600 font-semibold">
                            {notifications.length} Active
                          </span>
                        </div>

                        <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                          {notifications.length === 0 ? (
                            <p className="text-xs text-neutral-500 text-center py-6">No pending notifications</p>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`p-3 rounded-xl border text-xs relative group ${
                                  n.type === 'warning'
                                    ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                                    : n.type === 'success'
                                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                    : n.type === 'error'
                                    ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                                    : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-semibold">{n.title}</p>
                                  <button
                                    onClick={() => dismissNotification(n.id)}
                                    className="text-neutral-400 hover:text-neutral-600"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">{n.message}</p>
                                <p className="text-[10px] font-mono text-neutral-400 mt-1.5">{n.timestamp}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Avatar / Name (Read-Only) */}
                  <div 
                    onClick={() => {
                      if (currentUser.role === 'donor') navigateTo('/donor/dashboard');
                      else if (currentUser.role === 'organizer') navigateTo('/organizer/dashboard');
                      else if (currentUser.role === 'volunteer') navigateTo('/volunteer/scanner');
                      else if (currentUser.role === 'admin') navigateTo('/admin/dashboard');
                      else if (currentUser.role === 'blood_bank') navigateTo('/blood-bank/dashboard');
                    }}
                    className="hidden md:flex items-center gap-2.5 pl-2 border-l border-neutral-200 cursor-pointer group"
                    title={`View ${currentUser.role.replace('_', ' ')} Dashboard`}
                  >
                    {currentUser.avatar ? (
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.name} 
                        className="w-8 h-8 rounded-full object-cover border border-neutral-200" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-trust-blue-700 text-white flex items-center justify-center font-headline text-xs font-semibold shadow-sm">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <div className="text-left leading-tight">
                      <p className="text-xs font-semibold text-neutral-900 group-hover:text-brand-red-600 transition-colors">
                        {currentUser.name}
                      </p>
                      <p className="text-[10px] text-neutral-500 truncate max-w-[110px]">
                        {currentUser.organization || currentUser.city || 'Citizen'}
                      </p>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <button
                    onClick={() => logout()}
                    className="p-2 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-surface-white px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2">
            {isAuthenticated ? (
              <div className="px-3 py-2 rounded-xl bg-neutral-50 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-trust-blue-700 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900">{currentUser.name}</p>
                    <p className="text-[11px] text-neutral-500 capitalize">{currentUser.role.replace('_', ' ')} Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mb-3">
                <button
                  onClick={() => {
                    navigateTo('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-primary text-white rounded-lg text-xs font-semibold text-center"
                >
                  Sign In / Create Account
                </button>
              </div>
            )}

            {navLinks.map((link) => {
              const isActive = currentRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => {
                    navigateTo(link.route);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-brand-red-600 bg-brand-red-50 font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
        )}
      </header>
    </>
  );
};
