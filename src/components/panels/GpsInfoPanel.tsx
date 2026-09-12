import { useSimulation } from '../../context/SimulationContext';
import { useLivePositionsStatus } from '../../hooks/useLivePositions';
import { useTrain } from '../../context/TrainContext';
import { useRoute } from '../../hooks/useRoute';

export function GpsInfoPanel() {
  const { mode, simulatedPosition, progress } = useSimulation();
  const { selectedTrainId } = useTrain();
  const { positions, rawCurrentLocation, trackDistMeters } = useLivePositionsStatus(selectedTrainId);
  const { data: routeData } = useRoute(selectedTrainId);

  const engine = positions.find(c => c.coachId === 'ENGINE' || c.coachId === 'ENG');

  let lat = engine?.coordinates.latitude ?? 0;
  let lng = engine?.coordinates.longitude ?? 0;
  let speed = engine?.speedKmh ?? 0;
  let bearing = engine?.headingDegrees ?? 0;
  let displayProgress = (mode === 'SIMULATION' ? progress : rawCurrentLocation?.segmentProgress) ?? 0;

  let currentStation = 'Unknown';
  let nextStation = 'Unknown';
  let previousStation = 'Unknown';

  if (mode === 'SIMULATION' && routeData && routeData.stops.length > 0) {
    const stops = routeData.stops.sort((a, b) => a.sequence - b.sequence);
    // Rough estimation of current station based on progress
    const idx = Math.floor(progress * stops.length);
    currentStation = stops[idx]?.name || 'Unknown';
    nextStation = stops[idx + 1]?.name || 'Unknown';
    previousStation = stops[idx - 1]?.name || 'Origin';
  } else if (mode === 'LIVE' && rawCurrentLocation) {
    currentStation = rawCurrentLocation.stationName || 'Unknown';
    // Could infer next/prev from routeData stops by looking up currentStation
  }

  const progressPercent = Math.round(displayProgress * 100);
  const totalBlocks = 20;
  const filledBlocks = Math.round(displayProgress * totalBlocks);
  const bar = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return (
    <div className="panel px-4 py-3 flex flex-col gap-3">
      <h2 className="text-xs font-bold text-rail-text tracking-wider flex items-center justify-between">
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-rail-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          LIVE GPS
        </span>
        <span className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 ${
          mode === 'SIMULATION' ? 'bg-rail-accent/20 text-rail-accent border border-rail-accent/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${mode === 'SIMULATION' ? 'bg-rail-accent' : 'bg-green-400'}`} />
          {mode === 'SIMULATION' ? 'SIMULATED' : 'LIVE'}
        </span>
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] text-rail-textMuted font-mono">Latitude</div>
          <div className="text-sm font-bold text-rail-text font-mono">{lat.toFixed(4)}°</div>
        </div>
        <div>
          <div className="text-[10px] text-rail-textMuted font-mono">Longitude</div>
          <div className="text-sm font-bold text-rail-text font-mono">{lng.toFixed(4)}°</div>
        </div>
        <div>
          <div className="text-[10px] text-rail-textMuted font-mono">Speed</div>
          <div className="text-sm font-bold text-rail-text font-mono">{Math.round(speed)} km/h</div>
        </div>
        <div>
          <div className="text-[10px] text-rail-textMuted font-mono">Bearing</div>
          <div className="text-sm font-bold text-rail-text font-mono">{Math.round(bearing)}°</div>
        </div>
      </div>

      <div className="mt-1">
        <div className="text-[10px] text-rail-textMuted font-mono flex justify-between">
          <span>ROUTE PROGRESS</span>
          <span className="text-rail-accent">{progressPercent}%</span>
        </div>
        <div className="text-xs font-mono text-rail-text mt-0.5 tracking-[2px] opacity-80" title={`${progressPercent}% completed`}>
          {bar}
        </div>
      </div>

      <div className="mt-1 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-rail-panel p-1 rounded border border-rail-border/50">
          <div className="text-[9px] text-rail-textMuted font-mono uppercase">Previous</div>
          <div className="font-semibold text-rail-text truncate" title={previousStation}>{previousStation}</div>
        </div>
        <div className="bg-rail-accent/10 p-1 rounded border border-rail-accent/30">
          <div className="text-[9px] text-rail-accent font-mono uppercase">Current</div>
          <div className="font-bold text-rail-accent truncate" title={currentStation}>{currentStation}</div>
        </div>
        <div className="bg-rail-panel p-1 rounded border border-rail-border/50">
          <div className="text-[9px] text-rail-textMuted font-mono uppercase">Next</div>
          <div className="font-semibold text-rail-text truncate" title={nextStation}>{nextStation}</div>
        </div>
      </div>

      {/* DEV DIAGNOSTICS */}
      <div className="mt-3 pt-3 border-t border-rail-border border-dashed space-y-1 bg-black/20 p-2 rounded">
        <div className="text-[10px] text-rail-text font-bold text-center mb-1 text-rail-warning">DIAGNOSTICS</div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-rail-textMuted">TRAIN:</span>
          <span className="text-rail-text">{selectedTrainId}</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-rail-textMuted">STATION SEQUENCE:</span>
          <span className="text-rail-text">{rawCurrentLocation?.sequence ?? '-'}</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-rail-textMuted">SEGMENT PROGRESS:</span>
          <span className="text-rail-text">{(rawCurrentLocation?.segmentProgress ?? 0).toFixed(4)}</span>
        </div>
        <div className="flex justify-between text-[9px] font-mono">
          <span className="text-rail-textMuted">DIST FROM TRACK:</span>
          <span className={trackDistMeters !== undefined && trackDistMeters > 100 ? 'text-red-500 font-bold' : 'text-green-400 font-bold'}>
            {trackDistMeters !== undefined ? `${trackDistMeters.toFixed(2)} m` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}
