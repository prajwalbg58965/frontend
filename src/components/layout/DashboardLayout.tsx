import { Header } from './Header';
import { MapProvider, MapView } from '../map/MapView';
import { Sidebar } from '../panels/Sidebar';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-rail-bg text-rail-text font-sans flex flex-col">
      <Header />
      <main className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-w-0 lg:pr-0">
          <MapProvider>
            <MapView />
          </MapProvider>
        </div>
        <Sidebar />
      </main>
      {children}
    </div>
  );
}