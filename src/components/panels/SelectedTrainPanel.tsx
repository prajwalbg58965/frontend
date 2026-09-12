import { useTrain, POPULAR_TRAINS } from '../../context/TrainContext';
import { useLivePositionsStatus } from '../../hooks/useLivePositions';
import { useETAPredictionStatus } from '../../hooks/useEta';
import { useIncidentAlertsStatus } from '../../hooks/useIncident';
import { useSimulation } from '../../context/SimulationContext';
import { DemoControls } from '../../demo/DemoControls';

export function SelectedTrainPanel() {
  const { selectedTrainId } = useTrain();
  const { positions, trackDistMeters } = useLivePositionsStatus(selectedTrainId);
  const { etaPrediction } = useETAPredictionStatus(selectedTrainId);
  const { incidents } = useIncidentAlertsStatus();
  const { mode, startSimulation, stopSimulation, simulatedPosition } = useSimulation();

  const trainInfo = POPULAR_TRAINS.find(t => t.id === selectedTrainId) || { name: 'Unknown Train', id: selectedTrainId };
  const pos = positions[0];

  const speed = pos?.speedKmh || 0;
  const status = pos?.status || 'UNKNOWN';

  // ETA parsing
  const formatTime = (iso?: string) => {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  const confidence = etaPrediction?.confidencePct || 85;
  const confidenceColor = confidence > 80 ? 'bg-green-500' : confidence > 60 ? 'bg-yellow-500' : 'bg-red-500';

  // Safety Status Mock Logic (since no explicit conflict API exists)
  const isSafetyIncident = incidents && incidents.length > 0;

  return (
    <div className="w-80 lg:w-[350px] flex-shrink-0 flex flex-col gap-3 h-full overflow-y-auto scrollbar-hide">
      
      {/* Primary Train Card */}
      <div className="panel p-4 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[10px] font-mono text-rail-textMuted uppercase tracking-widest mb-1">SELECTED TRAIN</h2>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-rail-accent font-mono tracking-tight">{selectedTrainId}</span>
              <span className="text-sm font-semibold truncate max-w-[150px]">{trainInfo.name}</span>
            </div>
          </div>
          <span className={`badge ${status === 'MOVING' ? 'badge-green' : 'badge-yellow'} font-mono text-[10px]`}>
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-rail-bg/50 rounded-lg border border-rail-border/50">
          <div>
            <div className="text-[9px] text-rail-textMuted font-mono uppercase mb-0.5">Speed</div>
            <div className="font-mono font-bold text-rail-text">{speed.toFixed(0)} <span className="text-[10px] text-rail-textMuted font-normal">km/h</span></div>
          </div>
          <div>
            <div className="text-[9px] text-rail-textMuted font-mono uppercase mb-0.5">Current Delay</div>
            <div className="font-mono font-bold text-rail-text">+{etaPrediction?.delayMinutes || 0} <span className="text-[10px] text-rail-textMuted font-normal">min</span></div>
          </div>
          <div>
            <div className="text-[9px] text-rail-textMuted font-mono uppercase mb-0.5">Predicted Delay</div>
            <div className="font-mono font-bold text-rail-warning">+{etaPrediction?.liveDelayMinutes || etaPrediction?.delayMinutes || 0} <span className="text-[10px] text-rail-textMuted font-normal">min</span></div>
          </div>
          <div>
            <div className="text-[9px] text-rail-textMuted font-mono uppercase mb-0.5">Track Dist. Err</div>
            <div className="font-mono font-bold text-rail-text">{trackDistMeters.toFixed(1)} <span className="text-[10px] text-rail-textMuted font-normal">m</span></div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <div className="text-[10px] font-mono text-rail-textMuted uppercase">Predicted ETA</div>
            <div className="text-lg font-mono font-bold text-rail-accent">{formatTime(etaPrediction?.predictedArrival)}</div>
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-mono text-rail-textMuted">
            <span>Range: {formatTime(etaPrediction?.confidenceRange?.earliest)} — {formatTime(etaPrediction?.confidenceRange?.latest)}</span>
            <span>{confidence}% Conf</span>
          </div>
          <div className="h-1.5 w-full bg-rail-bg rounded-full overflow-hidden">
            <div className={`h-full ${confidenceColor} rounded-full`} style={{ width: `${confidence}%` }} />
          </div>
        </div>

        <div className="pt-3 border-t border-rail-border/50">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-rail-textMuted">Next: <span className="text-rail-text font-medium">{etaPrediction?.nextJunction?.name || 'Kharagpur Jn'}</span></span>
            <span className="text-rail-text font-mono">14 km</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-rail-textMuted whitespace-nowrap">Route Progress:</span>
            <div className="flex-1 font-mono text-[10px] tracking-tighter text-rail-accent/70">
              ████████████░░ 85%
            </div>
          </div>
        </div>
      </div>

      {/* Safety Status */}
      <div className={`panel p-4 flex flex-col gap-3 border ${isSafetyIncident ? 'border-rail-danger bg-rail-danger/5' : ''}`}>
        <h2 className="text-[10px] font-mono text-rail-textMuted uppercase tracking-widest">SAFETY STATUS</h2>
        
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between items-center border-b border-rail-border/50 pb-2">
            <span className="text-rail-textMuted">Current Section</span>
            <span className="badge badge-green">CLEAR</span>
          </div>
          <div className="flex justify-between items-center border-b border-rail-border/50 pb-2">
            <span className="text-rail-textMuted">Next Junction</span>
            <span className="text-rail-text font-medium">Bhubaneswar (BBS)</span>
          </div>
          <div className="flex justify-between items-center border-b border-rail-border/50 pb-2">
            <span className="text-rail-textMuted">Section Status</span>
            {isSafetyIncident ? (
              <span className="badge badge-red animate-pulse">HOLD</span>
            ) : (
              <span className="badge badge-green">CLEAR</span>
            )}
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-rail-textMuted">Last Confirmation</span>
            <span className="text-green-400 font-mono">✓ CLEAR @ {formatTime(new Date().toISOString())}</span>
          </div>
        </div>

        <div className="mt-2 pt-3 border-t border-rail-border/50">
          <h3 className="text-[10px] font-mono text-rail-textMuted uppercase mb-2">CONFLICT MONITOR</h3>
          <div className="bg-rail-bg/50 rounded-lg p-3 border border-rail-border flex flex-col gap-2 items-center text-xs font-mono">
            <div className="flex items-center justify-between w-full">
              <span className="text-rail-accent">{selectedTrainId}</span>
              <span className="text-[10px] text-rail-textMuted">↓</span>
            </div>
            <div className="w-full text-center py-1 border-y border-rail-border/50 text-rail-textMuted text-[10px]">
              Shared Section (SEG_02)
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="text-rail-info">12245</span>
              <span className="text-[10px] text-rail-textMuted">↑</span>
            </div>
            <div className="w-full flex justify-between items-center mt-2 pt-2 border-t border-rail-border/50">
              <span className="text-rail-textMuted">Risk:</span>
              <span className="badge badge-green bg-transparent border-none px-0">LOW</span>
            </div>
          </div>
        </div>
      </div>

      {/* GPS Simulation Controls */}
      <div className="panel p-3">
        <h2 className="text-[10px] font-mono text-rail-textMuted uppercase tracking-widest mb-2 px-1">SIMULATION CONTROLS</h2>
        <div className="flex flex-col gap-2">
          {mode === 'LIVE' ? (
            <button onClick={startSimulation} className="btn bg-rail-panelHover border border-rail-border hover:border-rail-accent/50 text-xs py-1.5 w-full flex justify-center items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              Start GPS Simulation
            </button>
          ) : (
            <button onClick={stopSimulation} className="btn bg-rail-accent/10 border border-rail-accent/50 text-rail-accent text-xs py-1.5 w-full flex justify-center items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rail-accent animate-pulse"></span>
              Stop Simulation
            </button>
          )}
          {mode === 'SIMULATION' && (
            <div className="px-2 pb-1 text-[10px] font-mono text-rail-textMuted flex justify-between">
              <span>Sim Progress:</span>
              <span>{(simulatedPosition?.segmentProgress || 0).toFixed(2)}</span>
            </div>
          )}
          {/* Include DemoControls from header so they are accessible */}
          <div className="mt-2 flex justify-center scale-90 origin-top">
            <DemoControls />
          </div>
        </div>
      </div>
    </div>
  );
}
