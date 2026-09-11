import { useState } from 'react';
import { useETAPredictionStatus } from '../../hooks/useEta';
import { formatTimeString } from '../../utils/geo';

interface EtaPanelProps {
  trainId?: string;
}

export function EtaPanel({ trainId = '12841' }: EtaPanelProps) {
  const [selectedTrainId, setSelectedTrainId] = useState<string>(trainId);
  const { eta, isLoading, isError, secondsSinceUpdate, refetch } = useETAPredictionStatus(selectedTrainId);

  return (
    <section className="panel p-4 transition-all duration-200" data-panel-id="eta-panel">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-rail-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-rail-accent/10 border border-rail-accent/30 flex items-center justify-center text-rail-accent">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-rail-text text-sm flex items-center gap-2">
              ETA Intelligence
              <span className="badge badge-blue text-[10px] uppercase font-mono">SIH26028 Core</span>
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-rail-textMuted font-mono">Train #</span>
              <input
                type="text"
                value={selectedTrainId}
                onChange={(e) => setSelectedTrainId(e.target.value)}
                placeholder="12841"
                className="w-16 px-1.5 py-0.5 bg-rail-bg border border-rail-border rounded text-xs font-mono font-bold text-rail-accent focus:outline-none focus:border-rail-accent"
              />
              <select
                value={selectedTrainId}
                onChange={(e) => setSelectedTrainId(e.target.value)}
                className="px-1.5 py-0.5 bg-rail-bg border border-rail-border rounded text-[11px] font-mono text-rail-textMuted focus:outline-none"
              >
                <option value="12841">12841 (Coromandel Exp)</option>
                <option value="12839">12839 (Howrah Mail)</option>
                <option value="12863">12863 (Howrah SF Exp)</option>
                <option value="12626">12626 (Kerala Exp)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-green text-[10px]">LIVE ML</span>
          <button
            onClick={() => refetch()}
            className="p-1 hover:bg-rail-panelHover text-rail-textMuted hover:text-rail-text rounded transition-colors"
            title="Refresh ETA Prediction"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-6 flex flex-col items-center justify-center text-rail-textMuted">
          <div className="w-6 h-6 border-2 border-rail-accent border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-xs font-mono">Computing ML ETA prediction...</span>
        </div>
      )}

      {/* Error Fallback State */}
      {isError && !isLoading && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center my-1">
          <div className="flex items-center justify-center gap-1.5 text-red-400 font-medium text-xs mb-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>ETA Service Unavailable</span>
          </div>
          <p className="text-[11px] text-rail-textMuted mb-2">
            Unable to connect to Person 1 ML API (`/predict-eta`). Other dashboard services remain active.
          </p>
          <button onClick={() => refetch()} className="btn btn-secondary py-1 px-3 text-xs">
            Retry Connection
          </button>
        </div>
      )}

      {/* Content State */}
      {eta && !isLoading && (
        <div className="space-y-3">
          {/* Main Primary ETA Banner */}
          <div className="bg-rail-bg/80 border border-rail-border p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[11px] text-rail-textMuted uppercase font-mono tracking-wider block">Predicted Arrival</span>
              <div className="text-2xl font-bold font-mono text-rail-accent tracking-tight">
                {formatTimeString(eta.predictedArrival)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-rail-textMuted uppercase font-mono tracking-wider block">Status / Delay</span>
              <div className="mt-0.5">
                {eta.delayMinutes > 0 ? (
                  <span className="badge badge-yellow text-xs font-mono font-semibold">
                    +{eta.delayMinutes} min delay
                  </span>
                ) : eta.delayMinutes < 0 ? (
                  <span className="badge badge-green text-xs font-mono font-semibold">
                    {Math.abs(eta.delayMinutes)} min early
                  </span>
                ) : (
                  <span className="badge badge-green text-xs font-mono font-semibold">
                    ON TIME
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Confidence Interval / Range Visualization */}
          <div className="bg-rail-bg/50 p-2.5 rounded-lg border border-rail-border/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-rail-textMuted font-medium text-[11px]">Prediction Range Confidence</span>
              <span className="text-[10px] font-mono text-rail-accent">95% ML Confidence</span>
            </div>

            <div className="relative pt-1 pb-4">
              {/* Range bar background */}
              <div className="h-2 bg-rail-panel rounded-full overflow-hidden relative border border-rail-border">
                <div className="absolute inset-y-0 left-[20%] right-[20%] bg-rail-accent/30 rounded-full border border-rail-accent/50"></div>
                <div className="absolute inset-y-0 left-[48%] w-1 bg-rail-accent shadow-[0_0_8px_#38bdf8]"></div>
              </div>

              {/* Labels below bar */}
              <div className="flex items-center justify-between text-[10px] font-mono text-rail-textMuted mt-1">
                <div>
                  <span className="text-rail-textMuted/60 block">Earliest</span>
                  <span className="text-green-400 font-semibold">{formatTimeString(eta.confidenceRange.earliest)}</span>
                </div>
                <div className="text-center">
                  <span className="text-rail-accent font-semibold block">Predicted</span>
                  <span className="text-rail-accent">{formatTimeString(eta.predictedArrival)}</span>
                </div>
                <div className="text-right">
                  <span className="text-rail-textMuted/60 block">Latest</span>
                  <span className="text-yellow-400 font-semibold">{formatTimeString(eta.confidenceRange.latest)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Junctions Timeline */}
          {eta.upcomingJunctions && eta.upcomingJunctions.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-rail-textMuted uppercase font-mono mb-2">Upcoming Junctions</h4>
              <div className="space-y-1.5">
                {eta.upcomingJunctions.slice(0, 3).map((junction) => (
                  <div
                    key={junction.junctionId}
                    className="flex items-center justify-between p-2 bg-rail-bg/40 border border-rail-border/50 rounded text-xs hover:border-rail-border transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rail-accent"></span>
                      <span className="font-medium text-rail-text">{junction.name}</span>
                    </div>
                    <div className="text-right font-mono text-[11px]">
                      <span className="text-rail-textMuted mr-2">Sched: {formatTimeString(junction.scheduledArrival)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer timestamp */}
          <div className="pt-2 border-t border-rail-border/40 flex items-center justify-between text-[10px] text-rail-textMuted font-mono">
            <span>Contract: GET /predict-eta</span>
            {secondsSinceUpdate !== null && (
              <span>Updated {secondsSinceUpdate}s ago</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
