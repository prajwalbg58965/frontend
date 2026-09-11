import { PanelCard } from './PanelCard';
import { ETAPanel } from './ETAPanel';
import { RiskPanel } from './RiskPanel';
import { ConfirmationPanel } from './ConfirmationPanel';
import { IncidentPanel } from './IncidentPanel';
import { ResponderPanel } from './ResponderPanel';
import { PassengerSafetyPanel } from './PassengerSafetyPanel';

interface PanelPlaceholder {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: 'ready' | 'pending' | 'demo';
  description: string;
  badgeText?: string;
}

const panelPlaceholders: PanelPlaceholder[] = [];

export function Sidebar() {
  return (
    <aside className="w-80 lg:w-96 flex-shrink-0 flex flex-col gap-3 p-4 overflow-y-auto border-l border-rail-border bg-rail-panel/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="font-mono text-xs font-semibold text-rail-textMuted uppercase tracking-wider">MODULES</h2>
      </div>
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <ETAPanel />
        <RiskPanel />
        <ConfirmationPanel />
        <IncidentPanel />
        <ResponderPanel />
        <PassengerSafetyPanel />
      </div>
      <div className="pt-2 border-t border-rail-border px-1">
        <p className="text-xs text-rail-textMuted/60 text-center">
          Modules marked <span className="text-rail-accent">pending</span> connect to teammate APIs.
          <span className="text-yellow-500">demo</span> modules use local mock data.
        </p>
      </div>
    </aside>
  );
}