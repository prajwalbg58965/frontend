import { useState } from 'react';
import { useIncidentAlertsStatus } from '../../hooks/useIncident';
import { useLivePositionsStatus } from '../../hooks/useLivePositions';

export function PassengerSafetyPanel() {
  const { activeIncident } = useIncidentAlertsStatus();
  const { positions } = useLivePositionsStatus();

  const [selectedCoachId, setSelectedCoachId] = useState<string>('B2');
  const [safeCount, setSafeCount] = useState<number>(3);
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(false);

  const activeCoach = activeIncident?.coachId || selectedCoachId;
  const estimatedCount = activeIncident?.passengerEstimate || 5;
  const pendingCount = Math.max(0, estimatedCount - safeCount);
  const safePercentage = Math.round((safeCount / estimatedCount) * 100);

  const handleImSafeClick = () => {
    if (!hasCheckedIn && safeCount < estimatedCount) {
      setSafeCount(prev => prev + 1);
      setHasCheckedIn(true);
    }
  };

  const handleReset = () => {
    setSafeCount(3);
    setHasCheckedIn(false);
  };

  return (
    <section className="panel p-4 transition-all duration-200" data-panel-id="passenger-safety font-sans">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-rail-border">
        <h3 className="font-bold text-rail-text flex items-center gap-2 uppercase tracking-wider text-sm">
          <span className="bg-rail-info text-rail-bg px-1.5 py-0.5 rounded-sm text-[11px] font-black leading-none">3</span>
          Passenger Safety
        </h3>

        <span className="badge badge-blue text-[10px] uppercase font-mono">UI Mockup</span>
      </div>

      {/* Coach Selection Tabs */}
      <div className="mb-3">
        <label className="text-[11px] text-rail-textMuted uppercase font-mono block mb-1">Select Coach Identifier</label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {['B2', 'B3', 'A1', 'S4'].map((coachId) => (
            <button
              key={coachId}
              onClick={() => {
                setSelectedCoachId(coachId);
                setSafeCount(3);
                setHasCheckedIn(false);
              }}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                activeCoach === coachId
                  ? 'bg-rail-accent text-rail-bg'
                  : 'bg-rail-bg border border-rail-border text-rail-textMuted hover:text-rail-text'
              }`}
            >
              COACH {coachId} {activeIncident?.coachId === coachId ? '⚠️' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Status Card */}
      <div className="bg-rail-bg/80 border border-rail-border p-3 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-rail-textMuted uppercase font-mono block">Target Coach</span>
            <span className="text-xl font-bold font-mono text-rail-text">COACH {activeCoach}</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-rail-textMuted uppercase font-mono block">Safety Check Rate</span>
            <span className="text-xl font-bold font-mono text-green-400">{safePercentage}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2.5 bg-rail-panel rounded-full overflow-hidden border border-rail-border flex">
            <div
              className="bg-green-500 transition-all duration-300"
              style={{ width: `${(safeCount / estimatedCount) * 100}%` }}
            ></div>
            <div
              className="bg-yellow-500/60 transition-all duration-300"
              style={{ width: `${(pendingCount / estimatedCount) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <span className="text-green-400 font-medium">✓ {safeCount} Safe</span>
            <span className="text-yellow-400 font-medium">⏳ {pendingCount} Pending</span>
            <span className="text-rail-textMuted">Est: {estimatedCount}</span>
          </div>
        </div>
      </div>

      {/* Interactive Mock Action Button */}
      <div className="mt-3 space-y-2">
        <button
          onClick={handleImSafeClick}
          disabled={hasCheckedIn || safeCount >= estimatedCount}
          className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm uppercase tracking-wider font-mono transition-all shadow-md flex items-center justify-center gap-2 ${
            hasCheckedIn
              ? 'bg-green-500/20 text-green-400 border border-green-500/40 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-rail-bg active:scale-[0.98]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>{hasCheckedIn ? "Checked In Safe ✓" : "[ I'M SAFE ]"}</span>
        </button>

        {hasCheckedIn && (
          <button
            onClick={handleReset}
            className="w-full text-center text-[11px] text-rail-textMuted hover:text-rail-text underline font-mono py-1"
          >
            Reset Check-in Counter
          </button>
        )}
      </div>

      {/* Mandatory Honesty Rule Label */}
      <div className="mt-3 pt-2 border-t border-rail-border/60 text-[10px] text-rail-textMuted font-mono text-center">
        ⚠️ Passenger Safety Status Mockup — UI demonstration only
      </div>
    </section>
  );
}