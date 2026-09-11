import { useDemo } from './DemoContext';

export function DemoControls() {
  const { state, timeline, start, pause, resume, reset, jumpToIncident, setSpeedMultiplier, isDemoMode } = useDemo();

  if (!isDemoMode && state.state === 'IDLE') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rail-bg border border-rail-border">
        <button
          onClick={start}
          className="btn-primary text-xs px-3 py-1 flex items-center gap-1.5 font-bold uppercase tracking-wider"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
          <span>Start Demo Simulation</span>
        </button>

        <button
          onClick={jumpToIncident}
          className="btn bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs px-2.5 py-1 flex items-center gap-1 font-mono"
          title="Jump directly to Incident Mode simulation"
        >
          <span>🚨 Trigger Incident</span>
        </button>
      </div>
    );
  }

  const currentEvent = timeline[state.currentPhaseIndex];
  const isRunning = state.state === 'RUNNING';

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rail-bg border border-rail-accent/40 text-xs font-mono">
      <div className="flex items-center gap-1.5">
        <span className="text-rail-accent font-bold uppercase">DEMO MODE</span>
        <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-ping' : 'bg-yellow-500'}`} />
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={isRunning ? pause : resume}
          className="btn-secondary text-[11px] px-2 py-0.5 flex items-center gap-1 font-medium"
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>

        <button
          onClick={reset}
          className="btn-danger text-[11px] px-2 py-0.5 flex items-center gap-1 font-medium"
        >
          Reset
        </button>

        <button
          onClick={jumpToIncident}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-[11px] px-2 py-0.5 rounded font-medium"
        >
          🚨 Incident
        </button>
      </div>

      {/* Speed Multipliers */}
      <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-rail-border">
        <span className="text-[10px] text-rail-textMuted">Speed:</span>
        {[1, 2, 5].map((speed) => (
          <button
            key={speed}
            onClick={() => setSpeedMultiplier(speed)}
            className={`px-1.5 py-0.5 rounded text-[10px] ${
              state.speedMultiplier === speed
                ? 'bg-rail-accent text-rail-bg font-bold'
                : 'text-rail-textMuted hover:text-rail-text'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-rail-border">
        <span className="text-rail-textMuted text-[11px] truncate max-w-[120px]">{currentEvent?.label}</span>
        <div className="w-16 h-1.5 bg-rail-panel rounded-full overflow-hidden border border-rail-border">
          <div
            className="h-full bg-rail-accent transition-all duration-300"
            style={{ width: `${state.overallProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function DemoTimelineIndicator() {
  const { state, timeline, jumpToPhase } = useDemo();

  if (state.state === 'IDLE') return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-fade-in w-full max-w-lg px-4">
      <div className="panel px-4 py-2.5 shadow-panel bg-rail-panel/95 backdrop-blur-md border border-rail-accent/40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-xs text-rail-accent font-bold uppercase tracking-wider flex items-center gap-2">
            <span>🎬 Stage Demo Simulation Phase</span>
          </span>
          <span className="font-mono text-xs text-rail-text font-bold">{state.overallProgress.toFixed(0)}%</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 pt-1">
          {timeline.map((event, index) => {
            const isActive = index === state.currentPhaseIndex;
            const isPassed = index < state.currentPhaseIndex;
            return (
              <button
                key={event.phase}
                onClick={() => jumpToPhase(index)}
                title={`Jump to ${event.label}`}
                className={`py-1 px-1 rounded text-[9px] font-mono font-semibold truncate transition-colors border ${
                  isActive
                    ? 'bg-rail-accent text-rail-bg border-rail-accent'
                    : isPassed
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-rail-bg text-rail-textMuted border-rail-border hover:border-rail-accent/50'
                }`}
              >
                P{index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}