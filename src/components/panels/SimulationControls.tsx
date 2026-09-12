import { useSimulation } from '../../context/SimulationContext';

export function SimulationControls() {
  const {
    mode,
    playbackState,
    speedMultiplier,
    followTrain,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    returnToLive,
    setSpeedMultiplier,
    setFollowTrain,
  } = useSimulation();

  return (
    <div className="panel px-4 py-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-rail-text tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4 text-rail-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          SIMULATION CONTROLS
        </h2>
        
        {mode === 'SIMULATION' && (
          <button
            onClick={returnToLive}
            className="text-[10px] font-bold px-2 py-1 bg-rail-panel border border-rail-danger/30 text-rail-danger rounded hover:bg-rail-danger/10 transition-colors"
          >
            RETURN TO LIVE
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {playbackState === 'PLAYING' ? (
          <button
            onClick={pauseSimulation}
            className="flex-1 btn-primary bg-rail-accent/20 text-rail-accent border border-rail-accent/50 hover:bg-rail-accent/30 flex items-center justify-center gap-2 py-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
            PAUSE
          </button>
        ) : (
          <button
            onClick={startSimulation}
            className="flex-1 btn-primary flex items-center justify-center gap-2 py-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            START
          </button>
        )}

        <button
          onClick={resetSimulation}
          className="px-3 py-1.5 bg-rail-panel border border-rail-border text-rail-textMuted rounded hover:bg-rail-border/50 hover:text-rail-text transition-colors"
          title="Reset Simulation"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between text-xs mt-1">
        <span className="text-rail-textMuted font-mono">SPEED</span>
        <div className="flex items-center gap-1">
          {[0.5, 1, 2, 5, 10].map(speed => (
            <button
              key={speed}
              onClick={() => setSpeedMultiplier(speed)}
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                speedMultiplier === speed
                  ? 'bg-rail-accent text-[#040b14] font-bold'
                  : 'bg-rail-panel border border-rail-border text-rail-textMuted hover:bg-rail-border/50'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mt-1">
        <span className="text-rail-textMuted font-mono">FOLLOW TRAIN</span>
        <button
          onClick={() => setFollowTrain(!followTrain)}
          className={`w-10 h-5 rounded-full relative transition-colors ${followTrain ? 'bg-rail-accent' : 'bg-rail-border'}`}
        >
          <span 
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${followTrain ? 'translate-x-5' : 'translate-x-0'}`} 
          />
        </button>
      </div>
    </div>
  );
}
