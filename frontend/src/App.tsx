import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Campaign } from './types';

// Pages
import { LandingPage } from './pages/LandingPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { VolunteerScannerPage } from './pages/VolunteerScannerPage';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const renderActivePage = () => {
    switch (currentTab) {
      case 'landing':
        return <LandingPage setCurrentTab={setCurrentTab} setSelectedCampaign={setSelectedCampaign} />;
      case 'campaigns':
        return <CampaignsPage setCurrentTab={setCurrentTab} setSelectedCampaign={setSelectedCampaign} />;
      case 'campaign_detail':
        return <CampaignDetailPage campaign={selectedCampaign} setCurrentTab={setCurrentTab} />;
      case 'how-it-works':
        return <HowItWorksPage setCurrentTab={setCurrentTab} />;
      case 'about':
        return <AboutPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'login':
        return <LoginPage setCurrentTab={setCurrentTab} />;
      case 'register':
        return <RegisterPage setCurrentTab={setCurrentTab} />;
      case 'donor':
        if (!user) return <LoginPage setCurrentTab={setCurrentTab} />;
        return <DonorDashboard setCurrentTab={setCurrentTab} />;
      case 'organizer':
        if (!user) return <LoginPage setCurrentTab={setCurrentTab} />;
        if (user.role !== 'organizer' && user.role !== 'admin') {
          return <LandingPage setCurrentTab={setCurrentTab} setSelectedCampaign={setSelectedCampaign} />;
        }
        return <OrganizerDashboard />;
      case 'admin':
        if (!user || user.role !== 'admin') {
          return <LoginPage setCurrentTab={setCurrentTab} />;
        }
        return <AdminDashboard />;
      case 'volunteer':
        if (!user || (user.role !== 'volunteer' && user.role !== 'admin')) {
          return <LoginPage setCurrentTab={setCurrentTab} />;
        }
        return <VolunteerScannerPage />;
      default:
        return <LandingPage setCurrentTab={setCurrentTab} setSelectedCampaign={setSelectedCampaign} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Primary Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Viewport */}
      <main className="flex-1">
        {renderActivePage()}
      </main>

      {/* Public Healthcare Governance Footer */}
      <Footer setCurrentTab={setCurrentTab} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
