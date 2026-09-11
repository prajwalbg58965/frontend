import { useState } from 'react';
import { Header } from './Header';
import { MapProvider, MapView } from '../map/MapView';
import { Sidebar } from '../panels/Sidebar';
import { BalasoreCaseStudyModal } from '../pitch/BalasoreCaseStudyModal';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isPitchModalOpen, setIsPitchModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-rail-bg text-rail-text font-sans flex flex-col">
      <Header onOpenPitchModal={() => setIsPitchModalOpen(true)} />

      <main className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-w-0 lg:pr-0 relative">
          <MapProvider>
            <MapView />
          </MapProvider>
        </div>
        <Sidebar />
      </main>

      <BalasoreCaseStudyModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
      />

      {children}
    </div>
  );
}