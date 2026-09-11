import { useDemo } from './DemoContext';

export function DemoControls() {
  const { state, timeline, start, pause, resume, reset, isDemoMode } = useDemo();

  if (!isDemoMode && state.state === 'IDLE') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rail-bg border border-rail-border">
        <button
          onClick={start}
          className="btn-primary text-sm px-3 py-1.5 flex items-center gap-2"
          disabled={state.state !== 'IDLE'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Start Demo</span>
        </button>
        <span className="text-xs text-rail-textMuted font-mono">DEMO MODE</span>
      </div>
    );
  }

  const currentEvent = timeline[state.currentPhaseIndex];
  const isComplete = state.state === 'COMPLETE';
  const isRunning = state.state === 'RUNNING';
  const isPaused = state.state === 'PAUSED';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rail-bg border border-rail-border/50 border-rail-accent">
      <div className="flex items-center gap-2">
        <span className="text-xs text-rail-accent font-mono uppercase tracking-wider">DEMO MODE</span>
        <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : isPaused ? 'bg-yellow-500' : 'bg-red-500'}`} aria-hidden="true" />
      </div>

      <div className="flex items-center gap-1.5">
        {state.state !== 'IDLE' && state.state !== 'COMPLETE' && (
          <button
            onClick={isRunning ? pause : resume}
            className="btn-secondary text-xs px-2 py-1 flex items-center gap-1"
            disabled={isComplete}
          >
            {isRunning ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Pause</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Resume</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={reset}
          className="btn-danger text-xs px-2 py-1 flex items-center gap-1"
          disabled={state.state === 'IDLE'}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reset</span>
        </button>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 ml-2 border-l border-rail-border pl-2">
        <span className="text-xs text-rail-textMuted font-mono">{currentEvent?.label ?? 'Idle'}</span>
        <div className="w-24 h-1.5 bg-rail-bg rounded-full overflow-hidden">
          <div 
            className="h-full bg-rail-accent transition-all duration-300 ease-out" 
            style={{ width: `${state.overallProgress}%` }}
          />
        </div>
        <span className="text-xs text-rail-textMuted font-mono tabular-nums">{state.overallProgress.toFixed(0)}%</span>
      </div>
    </div>
  );
}

export function DemoTimelineIndicator() {
  const { state, timeline } = useDemo();

  if (state.state === 'IDLE') return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fade-in w-full max-w-md px-4">
      <div className="panel px-3 py-2 shadow-panel">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-rail-textMuted uppercase tracking-wider">Demo Progress</span>
          <span className="font-mono text-xs text-rail-accent">{state.overallProgress.toFixed(0)}%</span>
        </div>
        <div className="space-y-1">
          {timeline.map((event, index) => (
            <div key={event.phase} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                index < state.currentPhaseIndex ? 'bg-green-500' :
                index === state.currentPhaseIndex ? 'bg-rail-accent animate-pulse' :
                'bg-rail-border'
              }`} aria-hidden="true" />
              <span className={`text-rail-textMuted truncate ${index === state.currentPhaseIndex ? 'text-rail-accent font-medium' : ''}`}>
                {event.label}
              </span>
              {index === state.currentPhaseIndex && state.state === 'RUNNING' && (
                <span className="text-[10px] text-rail-accent font-mono ml-auto">
                  {Math.max(0, Math.ceil((timeline[index].duration - state.phaseElapsed) / 1000))}s
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}