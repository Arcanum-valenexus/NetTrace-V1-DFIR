import React, { useState } from 'react';
import { InvestigationProvider, useInvestigation } from './context/InvestigationContext';
import { BackgroundCanvas } from './components/common/BackgroundCanvas';
import { SplashScreen } from './components/splash/SplashScreen';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ContainmentModal } from './components/common/ContainmentModal';
import { ToastNotification } from './components/common/ToastNotification';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { IncidentList } from './components/incidents/IncidentList';
import { IncidentWorkbench } from './components/incidents/IncidentWorkbench';
import { NewIncidentModal } from './components/incidents/NewIncidentModal';
import { PcapAnalyzer } from './components/pcap/PcapAnalyzer';
import { IocIntelligenceDesk } from './components/ioc/IocIntelligenceDesk';
import { EvidenceLocker } from './components/evidence/EvidenceLocker';
import { ForensicsReportGenerator } from './components/reports/ForensicsReportGenerator';
import { SettingsPage } from './components/settings/SettingsPage';
import { ProfilePage } from './components/profile/ProfilePage';

const AppContent: React.FC = () => {
  const { activeTab, appFlowStage, isAuthenticated } = useInvestigation();
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState<boolean>(false);

  // 1. Splash Screen
  if (appFlowStage === 'splash') {
    return <SplashScreen />;
  }

  // 2. Stitch Landing Page
  if (appFlowStage === 'landing') {
    return <LandingPage />;
  }

  // 3. Auth Modal (Login / Register / Forgot Password)
  if (!isAuthenticated || appFlowStage === 'login' || appFlowStage === 'register' || appFlowStage === 'forgot_password') {
    return <AuthModal />;
  }

  // 4. Authenticated Workspace Layout
  return (
    <div className="min-h-screen bg-[#070a12] text-slate-200 flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative">
      <BackgroundCanvas />

      {/* Top Header */}
      <Header onOpenNewIncident={() => setIsNewIncidentOpen(true)} />

      {/* Main Body with Sidebar & Content View */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <OverviewDashboard onOpenNewIncident={() => setIsNewIncidentOpen(true)} />
          )}
          {activeTab === 'incidents' && (
            <IncidentList onOpenNewIncident={() => setIsNewIncidentOpen(true)} />
          )}
          {activeTab === 'workbench' && <IncidentWorkbench />}
          {activeTab === 'pcap' && <PcapAnalyzer />}
          {activeTab === 'ioc' && <IocIntelligenceDesk />}
          {activeTab === 'evidence' && <EvidenceLocker />}
          {activeTab === 'reports' && <ForensicsReportGenerator />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ContainmentModal />
      <NewIncidentModal
        isOpen={isNewIncidentOpen}
        onClose={() => setIsNewIncidentOpen(false)}
      />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <InvestigationProvider>
      <AppContent />
    </InvestigationProvider>
  );
}
