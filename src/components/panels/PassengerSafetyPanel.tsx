import { useIncidentAlertsStatus } from '../../hooks/useIncident';
import { useLivePositionsStatus } from '../../hooks/useLivePositions';
import { useState } from 'react';

export function PassengerSafetyPanel() {
  const { activeIncident } = useIncidentAlertsStatus();
  const { positions } = useLivePositionsStatus();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  const affectedCoachId = activeIncident?.coachId ?? null;
  const hasActiveIncident = !!activeIncident;

  const getCoachData = (coachId: string) => {
    return positions.find(c => c.coachId === coachId);
  };

  const affectedCoach = affectedCoachId ? getCoachData(affectedCoachId) : null;

  const [safeCount, setSafeCount] = useState(0);
  const [isSafeConfirmed, setIsSafeConfirmed] = useState(false);

  const estimatedPassengers = affectedCoach ? 5 : 0;
  const pendingCount = Math.max(0, estimatedPassengers - safeCount);
  const allSafe = safeCount >= estimatedPassengers && estimatedPassengers > 0;
  const progressPercent = estimatedPassengers > 0 ? (safeCount / estimatedPassengers) * 100 : 0;

  const handleSafeClick = () => {
    if (!isSafeConfirmed && safeCount < estimatedPassengers) {
      setSafeCount(prev => prev + 1);
      setIsSafeConfirmed(true);
    }
  };

  const handleReset = () => {
    setSafeCount(0);
    setIsSafeConfirmed(false);
  };

  if (!hasActiveIncident) {
    return (
      <section className="panel panel-hover p-4" data-panel-id="passenger-safety">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-rail-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Passenger Safety
          </h3>
          <span className="badge badge-blue">Demo Mockup</span>
        </div>
        <div className="text-center py-6">
          <svg className="mx-auto mb-2 w-10 h-10 text-green-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-500 font-medium">NO ACTIVE INCIDENT</p>
          <p className="text-xs text-rail-textMuted mt-1">Passenger safety activates during Incident Mode</p>
        </div>
        <div className="pt-2 border-t border-rail-border flex items-center justify-between text-xs">
          <span className="text-rail-textMuted/60 font-mono">
            Awaiting incident
          </span>
          <span className="badge badge-blue text-xs">Demo Mockup</span>
        </div>
      </section>
    );
  }

  if (!affectedCoach) {
    return (
      <section className="panel panel-hover p-4" data-panel-id="passenger-safety">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-rail-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Passenger Safety
          </h3>
          <span className="badge badge-yellow">Demo Mockup</span>
        </div>
        <div className="text-center py-4 text-rail-textMuted">
          <p className="text-sm">Incident active but coach data unavailable</p>
          <p className="text-xs mt-1">Affected coach: {affectedCoachId}</p>
        </div>
        <div className="pt-2 border-t border-rail-border flex items-center justify-between text-xs">
          <span className="text-rail-textMuted/60 font-mono">
            Coach data missing
          </span>
          <span className="badge badge-yellow text-xs">Demo Mockup</span>
        </div>
      </section>
    );
  }

  const progressColor = allSafe ? '#22c55e' : '#00d4aa';

  return (
    <section className="panel panel-hover p-4 border-l-4" style={{ borderLeftColor: progressColor }} data-panel-id="passenger-safety">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-rail-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: progressColor }} />
          Passenger Safety
        </h3>
        <span className="badge badge-blue">Demo Mockup</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-rail-textMuted">Coach</span>
          <span className="font-mono text-lg font-semibold text-rail-text">{affectedCoach.coachId}</span>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-rail-border">
          <span className="text-xs text-rail-textMuted">Estimated passengers</span>
          <span className="font-mono text-lg font-semibold text-rail-text">{estimatedPassengers}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-rail-textMuted">Checked in safe</span>
          <span className="font-mono text-lg font-semibold" style={{ color: progressColor }}>{safeCount}</span>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-rail-border">
          <span className="text-xs text-rail-textMuted">Pending</span>
          <span className="font-mono text-lg font-semibold text-yellow-500">{pendingCount}</span>
        </div>

        <div className="pt-2 border-t border-rail-border">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-rail-textMuted">Progress</span>
            <span className="font-mono text-rail-textMuted">{safeCount} / {estimatedPassengers}</span>
          </div>
          <div className="h-2 bg-rail-bg rounded-full overflow-hidden" role="progressbar" aria-valuenow={safeCount} aria-valuemin={0} aria-valuemax={estimatedPassengers} aria-label="Safe check-in progress">
            <div 
              className="h-full rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-rail-textMuted mt-1 font-mono">
            <span>Safe: {safeCount}</span>
            <span>Pending: {pendingCount}</span>
          </div>
        </div>

        {allSafe && estimatedPassengers > 0 && (
          <div className="pt-2 border-t border-rail-border text-center p-3" style={{ backgroundColor: `${progressColor}15`, borderRadius: '6px' }}>
            <svg className="mx-auto mb-1 w-5 h-5" fill="none" stroke={progressColor} strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="font-mono text-sm font-semibold" style={{ color: progressColor }}>
              ALL ESTIMATED PASSENGERS CHECKED SAFE
            </div>
            <div className="text-[10px] text-rail-textMuted mt-1">
              DEMO REUNIFICATION STATUS
            </div>
          </div>
        )}

        {!allSafe && estimatedPassengers > 0 && (
          <button
            onClick={handleSafeClick}
            disabled={isSafeConfirmed}
            className="w-full py-3 mt-2 rounded-lg font-semibold text-lg transition-all duration-200"
            style={{
              backgroundColor: isSafeConfirmed ? '#161f2b' : '#00d4aa',
              color: isSafeConfirmed ? '#7a8d9c' : '#0a0f14',
              border: '2px solid',
              borderColor: isSafeConfirmed ? '#1e2a38' : '#00d4aa',
              cursor: isSafeConfirmed ? 'not-allowed' : 'pointer',
              opacity: isSafeConfirmed ? 0.7 : 1,
            }}
            aria-pressed={isSafeConfirmed}
            aria-label={isSafeConfirmed ? 'Safe confirmed - demo passenger checked in' : 'Mark demo passenger as safe'}
          >
            {isSafeConfirmed ? 'SAFE CONFIRMED' : 'I\'M SAFE'}
          </button>
        )}

        {allSafe && estimatedPassengers > 0 && (
          <button
            onClick={handleReset}
            className="w-full py-2 mt-2 rounded-lg font-medium text-sm text-rail-textMuted border border-rail-border hover:border-rail-accent hover:text-rail-accent transition-colors"
          >
            Reset Demo
          </button>
        )}

        <div className="pt-2 border-t border-rail-border flex items-center justify-between text-xs">
          <span className="text-rail-textMuted/60 font-mono">
            Coach {affectedCoach.coachId} • Estimated: {estimatedPassengers}
          </span>
          <div className="flex items-center gap-2">
            <span className="badge badge-blue text-xs">Demo Mockup</span>
            <span className="text-red-500/80 text-[10px] font-mono">
              UI Mockup — Not a live passenger system
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}