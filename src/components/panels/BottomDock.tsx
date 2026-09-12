import { ConfirmationPanel } from './ConfirmationPanel';
import { ResponderPanel } from './ResponderPanel';
import { PassengerSafetyPanel } from './PassengerSafetyPanel';

export function BottomDock() {
  return (
    <div className="h-48 flex-shrink-0 flex gap-3 p-4 border-t border-rail-border bg-rail-panel/50 backdrop-blur-sm overflow-x-auto scrollbar-thin">
      <div className="flex-1 min-w-[300px]">
        <ConfirmationPanel />
      </div>
      <div className="flex-1 min-w-[300px]">
        <ResponderPanel />
      </div>
      <div className="flex-1 min-w-[300px]">
        <PassengerSafetyPanel />
      </div>
    </div>
  );
}
