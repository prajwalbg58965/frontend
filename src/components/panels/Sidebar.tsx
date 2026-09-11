import { EtaPanel } from './EtaPanel';
import { RiskPanel } from './RiskPanel';
import { ConfirmationPanel } from './ConfirmationPanel';
import { IncidentPanel } from './IncidentPanel';
import { ResponderPanel } from './ResponderPanel';
import { PassengerSafetyPanel } from './PassengerSafetyPanel';

export function Sidebar() {
  return (
    <aside className="w-80 lg:w-96 flex-shrink-0 flex flex-col gap-3 p-4 overflow-y-auto border-l border-rail-border bg-rail-panel/50 backdrop-blur-sm scrollbar-thin">
      <div className="flex items-center justify-between mb-1 px-1">
        <h2 className="font-mono text-xs font-bold text-rail-accent uppercase tracking-wider flex items-center gap-2">
          <span>⚡ Command Center Intelligence Panels</span>
        </h2>
        <span className="text-[10px] font-mono text-rail-textMuted">6 Modules</span>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <EtaPanel />
        <RiskPanel />
        <ConfirmationPanel />
        <IncidentPanel />
        <ResponderPanel />
        <PassengerSafetyPanel />
      </div>

      <div className="pt-2 border-t border-rail-border px-1">
        <p className="text-[10px] text-rail-textMuted font-mono text-center">
          RailSentinel Command Center • Person 4 Integration Layer
        </p>
      </div>
    </aside>
  );
}