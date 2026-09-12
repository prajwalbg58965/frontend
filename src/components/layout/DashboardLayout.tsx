import { useState } from 'react';
import { Header } from './Header';
import { MapProvider, MapView } from '../map/MapView';
import { Sidebar } from '../panels/Sidebar';
import { KpiRow } from '../panels/KpiRow';
import { SelectedTrainPanel } from '../panels/SelectedTrainPanel';
import { BottomDashboard } from '../panels/BottomDashboard';
import { BalasoreCaseStudyModal } from '../pitch/BalasoreCaseStudyModal';
import { useIncidentAlertsStatus } from '../../hooks/useIncident';
import { useDemo } from '../../demo/DemoContext';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

import { IncidentPanel } from '../panels/IncidentPanel';
import { RiskPanel } from '../panels/RiskPanel';
import { EtaPanel } from '../panels/EtaPanel';
import { ConfirmationPanel } from '../panels/ConfirmationPanel';

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isPitchModalOpen, setIsPitchModalOpen] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  
  const { incidents } = useIncidentAlertsStatus();
  const { state } = useDemo();
  
  const isDemoIncident = ['INCIDENT_TRIGGERED', 'INCIDENT_RESPONSE', 'REUNIFICATION'].includes(state.currentPhase);
  const hasActiveIncident = (incidents && incidents.length > 0) || isDemoIncident;

  const renderRightPanel = () => {
    switch (activeNav) {
      case 'safety':
        return (
          <div className="w-80 lg:w-[350px] flex-shrink-0 flex flex-col gap-3 h-full overflow-y-auto scrollbar-hide">
            <RiskPanel />
            <IncidentPanel />
          </div>
        );
      case 'incidents':
        return (
          <div className="w-80 lg:w-[350px] flex-shrink-0 flex flex-col gap-3 h-full overflow-y-auto scrollbar-hide">
            <IncidentPanel />
          </div>
        );
      case 'analytics':
        return (
          <div className="w-80 lg:w-[350px] flex-shrink-0 flex flex-col gap-3 h-full overflow-y-auto scrollbar-hide">
            <EtaPanel />
          </div>
        );
      case 'confirmations':
        return (
          <div className="w-80 lg:w-[350px] flex-shrink-0 flex flex-col gap-3 h-full overflow-y-auto scrollbar-hide">
            <ConfirmationPanel />
          </div>
        );
      case 'reports':
        return (
          <div className="w-80 lg:w-[350px] flex-shrink-0 flex flex-col gap-3 h-full">
            <div className="panel p-4 flex flex-col items-center justify-center h-full text-rail-textMuted">
              <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Reports Module</p>
              <p className="text-[10px] uppercase font-mono mt-1">Coming Soon</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="w-80 lg:w-[350px] flex-shrink-0 flex flex-col gap-3 h-full">
            <div className="panel p-4 flex flex-col items-center justify-center h-full text-rail-textMuted">
              <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
              <p>System Settings</p>
              <p className="text-[10px] uppercase font-mono mt-1">Coming Soon</p>
            </div>
          </div>
        );
      case 'dashboard':
      case 'trains':
      case 'map':
      default:
        return <SelectedTrainPanel />;
    }
  };

  return (
    <div className={`min-h-screen bg-rail-bg text-rail-text font-sans flex overflow-hidden ${hasActiveIncident ? 'incident-mode' : ''}`}>
      
      {/* Fixed Left Sidebar */}
      <Sidebar activeId={activeNav} onNavChange={setActiveNav} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen relative">
        <Header onOpenPitchModal={() => setIsPitchModalOpen(true)} />
        
        <main className="flex-1 flex flex-col min-h-0 p-3 pb-0 gap-3">
          {/* KPI Row */}
          <KpiRow />
          
          {/* Middle Row: Map + Train Panel */}
          <div className="flex-1 flex gap-3 min-h-0 relative">
            
            {/* Map Area */}
            <div className="flex-1 min-w-0 bg-rail-bg rounded-lg overflow-hidden border border-rail-border shadow-sm relative flex flex-col h-full">
              <MapProvider>
                <MapView />
              </MapProvider>
            </div>
            
            {/* Right Train Panel */}
            {renderRightPanel()}
          </div>
          
          {/* Bottom Row */}
          <BottomDashboard />
        </main>
      </div>

      <BalasoreCaseStudyModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
      />

      {children}
    </div>
  );
}