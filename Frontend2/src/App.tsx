import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { EmergencyBanner } from './components/common/EmergencyBanner';
import { Footer } from './components/common/Footer';
import { RoleGuard } from './components/common/RoleGuard';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DrivesPage } from './pages/DrivesPage';
import { DriveDetailPage } from './pages/DriveDetailPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { QRPassPage } from './pages/QRPassPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { ConsentPage } from './pages/ConsentPage';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { CreateDrivePage } from './pages/CreateDrivePage';
import { RosterPage } from './pages/RosterPage';
import { VolunteerScannerPage } from './pages/VolunteerScannerPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrganizersDirectoryPage } from './pages/OrganizersDirectoryPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { BloodBankDashboard } from './pages/BloodBankDashboard';
import { FAQPage } from './pages/FAQPage';
import { AuthPage } from './pages/AuthPage';

export function AppContent() {
  const { currentRoute } = useApp();

  const renderCurrentPage = () => {
    // 1. Public Unrestricted Pages
    if (currentRoute === '/') return <LandingPage />;
    if (currentRoute === '/drives') return <DrivesPage />;
    if (currentRoute.startsWith('/drives/')) return <DriveDetailPage />;
    if (currentRoute === '/about-faq') return <FAQPage />;
    if (currentRoute === '/login' || currentRoute === '/auth' || currentRoute === '/signup') return <AuthPage />;

    // 2. Donor Role Protected Routes
    if (currentRoute.startsWith('/register/')) return <RegistrationPage />;
    if (currentRoute.startsWith('/pass/')) return <QRPassPage />;
    if (currentRoute === '/donor/dashboard') {
      return (
        <RoleGuard requiredRole="donor" roleTitle="Citizen Donor">
          <DonorDashboard />
        </RoleGuard>
      );
    }
    if (currentRoute === '/donor/consent') {
      return (
        <RoleGuard requiredRole="donor" roleTitle="Citizen Donor">
          <ConsentPage />
        </RoleGuard>
      );
    }

    // 3. Organizer Role Protected Routes
    if (currentRoute === '/organizer/dashboard') {
      return (
        <RoleGuard requiredRole="organizer" roleTitle="Camp Host / Organizer">
          <OrganizerDashboard />
        </RoleGuard>
      );
    }
    if (currentRoute === '/organizer/drives/new') {
      return (
        <RoleGuard requiredRole="organizer" roleTitle="Camp Host / Organizer">
          <CreateDrivePage />
        </RoleGuard>
      );
    }
    if (currentRoute.includes('/roster')) {
      return (
        <RoleGuard requiredRole="organizer" roleTitle="Camp Host / Organizer">
          <RosterPage />
        </RoleGuard>
      );
    }
    if (currentRoute === '/organizer/volunteers') {
      return (
        <RoleGuard requiredRole="organizer" roleTitle="Camp Host / Organizer">
          <OrganizersDirectoryPage />
        </RoleGuard>
      );
    }

    // 4. Volunteer Role Protected Routes
    if (currentRoute === '/volunteer/scanner') {
      return (
        <RoleGuard requiredRole="volunteer" roleTitle="Field Volunteer Kiosk">
          <VolunteerScannerPage />
        </RoleGuard>
      );
    }

    // 5. State Admin Role Protected Routes
    if (currentRoute === '/admin/dashboard') {
      return (
        <RoleGuard requiredRole="admin" roleTitle="State Regulatory Council">
          <AdminDashboard />
        </RoleGuard>
      );
    }
    if (currentRoute === '/admin/organizers') {
      return (
        <RoleGuard requiredRole="admin" roleTitle="State Regulatory Council">
          <OrganizersDirectoryPage />
        </RoleGuard>
      );
    }
    if (currentRoute === '/admin/audit') {
      return (
        <RoleGuard requiredRole="admin" roleTitle="State Regulatory Council">
          <AuditLogPage />
        </RoleGuard>
      );
    }

    // 6. Blood Bank Role Protected Routes
    if (currentRoute === '/blood-bank/dashboard') {
      return (
        <RoleGuard requiredRole="blood_bank" roleTitle="Blood Bank Facility">
          <BloodBankDashboard />
        </RoleGuard>
      );
    }

    return <LandingPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-neutral-900 font-body antialiased">
      {/* 1. Emergency Surge Broadcast Alert Ribbon */}
      <EmergencyBanner />

      {/* 2. Top Navigation & Spec Header */}
      <Header />

      {/* 3. Main Dynamic Route Viewport */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* 4. Statutory Non-Clinical Demarcation & Directory Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
