import { useIncidentAlertsStatus } from '../../hooks/useIncident';
import { useETAPredictionStatus } from '../../hooks/useEta';
import { useTrain } from '../../context/TrainContext';
import { useDemo } from '../../demo/DemoContext';

export function BottomDashboard() {
  const { selectedTrainId } = useTrain();
  const { etaPrediction } = useETAPredictionStatus(selectedTrainId);
  const { incidents } = useIncidentAlertsStatus();
  const { demoControls } = useDemo();

  const handleViewRoute = () => {
    window.dispatchEvent(new CustomEvent('map:fit-route'));
  };

  const handleTrackSelected = () => {
    handleViewRoute();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 p-3 shrink-0 bg-rail-bg">
      
      {/* CARD 1 — ETA ANALYTICS */}
      <div className="panel p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3 border-b border-rail-border/50 pb-2">
          <h3 className="text-[10px] font-mono text-rail-textMuted uppercase tracking-widest">ETA ANALYTICS</h3>
          <span className="badge badge-blue">ML MODEL LIVE</span>
        </div>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
          <div>
            <div className="text-[9px] text-rail-textMuted uppercase mb-0.5">Pred ETA</div>
            <div className="font-mono font-medium">{etaPrediction?.predictedArrival ? new Date(etaPrediction.predictedArrival).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
          </div>
          <div>
            <div className="text-[9px] text-rail-textMuted uppercase mb-0.5">Delay</div>
            <div className="font-mono font-medium text-rail-warning">+{etaPrediction?.liveDelayMinutes || etaPrediction?.delayMinutes || 0}m</div>
          </div>
          <div>
            <div className="text-[9px] text-rail-textMuted uppercase mb-0.5">Confidence</div>
            <div className="font-mono font-medium text-green-400">{etaPrediction?.confidencePct || 85}%</div>
          </div>
          <div>
            <div className="text-[9px] text-rail-textMuted uppercase mb-0.5">Baseline MAE</div>
            <div className="font-mono font-medium">{etaPrediction?.baselineMaeMin || 14.2}m</div>
          </div>
        </div>
        
        <div className="mt-auto pt-3 flex items-center justify-between text-[10px] text-rail-textMuted border-t border-rail-border/30">
          <span>Model Improvement:</span>
          <span className="text-green-400 font-medium font-mono">42%</span>
        </div>
      </div>

      {/* CARD 2 — NETWORK STATUS */}
      <div className="panel p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3 border-b border-rail-border/50 pb-2">
          <h3 className="text-[10px] font-mono text-rail-textMuted uppercase tracking-widest">NETWORK STATUS</h3>
          <span className="text-[10px] font-mono text-green-400">92% HEALTH</span>
        </div>

        <div className="flex flex-col gap-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-rail-textMuted">On Time</span></div>
            <span>138</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span><span className="text-rail-textMuted">Delayed</span></div>
            <span>12</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span><span className="text-rail-textMuted">At Risk</span></div>
            <span>4</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-rail-textMuted">Critical</span></div>
            <span>{(incidents?.length || 0) > 0 ? 1 : 0}</span>
          </div>
        </div>
        
        <div className="mt-auto pt-2">
          <div className="h-1.5 w-full bg-rail-bg rounded-full flex overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: '89%' }}></div>
            <div className="h-full bg-yellow-500" style={{ width: '8%' }}></div>
            <div className="h-full bg-red-500" style={{ width: '3%' }}></div>
          </div>
        </div>
      </div>

      {/* CARD 3 — LIVE SAFETY FEED */}
      <div className="panel p-4 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-3 border-b border-rail-border/50 pb-2 shrink-0">
          <h3 className="text-[10px] font-mono text-rail-textMuted uppercase tracking-widest">LIVE SAFETY FEED</h3>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        </div>

        <div className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-hide text-[11px] font-mono">
          <div className="flex gap-3">
            <span className="text-rail-textMuted shrink-0">13:41</span>
            <span className="text-green-400 shrink-0">✓</span>
            <span className="truncate">Junction A — CLEAR</span>
          </div>
          <div className="flex gap-3">
            <span className="text-rail-textMuted shrink-0">13:39</span>
            <span className="text-green-400 shrink-0">✓</span>
            <span className="truncate">Section B — CLEAR</span>
          </div>
          {(incidents?.length || 0) > 0 && (
            <div className="flex gap-3 text-rail-danger bg-rail-danger/10 -mx-2 px-2 py-0.5 rounded">
              <span className="shrink-0">{new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
              <span className="shrink-0">⚠</span>
              <span className="truncate">Section {incidents?.[0]?.coachId || 'C'} — ANOMALY</span>
            </div>
          )}
          <div className="flex gap-3 opacity-60">
            <span className="text-rail-textMuted shrink-0">13:35</span>
            <span className="text-green-400 shrink-0">✓</span>
            <span className="truncate">Station BBS — CLEAR</span>
          </div>
          <div className="flex gap-3 opacity-40">
            <span className="text-rail-textMuted shrink-0">13:28</span>
            <span className="text-yellow-400 shrink-0">⚠</span>
            <span className="truncate">Section D — WEATHER WARN</span>
          </div>
        </div>
      </div>

      {/* CARD 4 — QUICK ACTIONS */}
      <div className="panel p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3 border-b border-rail-border/50 pb-2">
          <h3 className="text-[10px] font-mono text-rail-textMuted uppercase tracking-widest">QUICK ACTIONS</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 flex-1">
          <button onClick={() => demoControls.startPhase('INCIDENT_TRIGGERED')} className="bg-rail-bg border border-rail-border hover:border-rail-danger/50 rounded flex items-center justify-center text-[10px] font-mono py-1.5 transition-colors">
            Trigger Incident
          </button>
          <button onClick={handleTrackSelected} className="bg-rail-accent/10 border border-rail-accent/30 text-rail-accent hover:bg-rail-accent/20 rounded flex items-center justify-center text-[10px] font-mono py-1.5 transition-colors">
            Track Selected
          </button>
          <button onClick={handleViewRoute} className="bg-rail-bg border border-rail-border hover:border-rail-accent/50 rounded flex items-center justify-center text-[10px] font-mono py-1.5 transition-colors">
            View Route
          </button>
          <button className="bg-rail-bg border border-rail-border hover:border-green-500/50 rounded flex items-center justify-center text-[10px] font-mono py-1.5 transition-colors">
            Confirm Safety
          </button>
          <button onClick={() => demoControls.startPhase('INCIDENT_RESPONSE')} className="bg-rail-bg border border-rail-border hover:border-rail-warning/50 rounded flex items-center justify-center text-[10px] font-mono py-1.5 transition-colors">
            Simulate Conflict
          </button>
          <button className="bg-rail-bg border border-rail-border hover:border-rail-accent/50 rounded flex items-center justify-center text-[10px] font-mono py-1.5 transition-colors">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
