import { useRiskScoreStatus } from '../../hooks/useRisk';
import type { RiskScoreResponse, RiskSegment } from '../../types/domain';

function getRiskColor(level: RiskSegment['riskLevel']): string {
  switch (level) {
    case 'LOW': return '#22c55e';
    case 'MEDIUM': return '#eab308';
    case 'HIGH': return '#f97316';
    case 'CRITICAL': return '#ef4444';
    default: return '#7a8d9c';
  }
}

function getRiskLabel(level: RiskSegment['riskLevel']): string {
  switch (level) {
    case 'LOW': return 'LOW';
    case 'MEDIUM': return 'MEDIUM';
    case 'HIGH': return 'HIGH';
    case 'CRITICAL': return 'CRITICAL';
    default: return 'UNKNOWN';
  }
}

function RiskLevelBadge({ level }: { level: RiskSegment['riskLevel'] }) {
  const color = getRiskColor(level);
  const label = getRiskLabel(level);
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-xs font-semibold"
      style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40`, borderWidth: '1px', borderStyle: 'solid' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

function SegmentRow({ segment }: { segment: RiskSegment }) {
  const color = getRiskColor(segment.riskLevel);
  return (
    <div className="py-2 border-b border-rail-border/50 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-rail-text truncate pr-2">{segment.name}</span>
        <RiskLevelBadge level={segment.riskLevel} />
      </div>
      <div className="flex items-center gap-3 text-[11px] text-rail-textMuted">
        {segment.floodDepthMm !== undefined && segment.floodDepthMm > 0 && (
          <span className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path d="M8 2a6 6 0 110 12A6 6 0 018 2zM8 13V8M8 5h.01" />
            </svg>
            <span>{segment.floodDepthMm}mm</span>
          </span>
        )}
        {segment.weatherAlert && (
          <span className="flex items-center gap-1 truncate">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path d="M8 14v-9M8 5H7.99" />
            </svg>
            <span className="truncate max-w-[140px]">{segment.weatherAlert}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function RiskPanel() {
  const { risk, isLoading, isError, isFetching, secondsSinceUpdate } = useRiskScoreStatus();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  if (isLoading) {
    return (
      <section className="panel panel-hover p-4" data-panel-id="risk">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-rail-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Route Risk
          </h3>
          <span className="badge badge-yellow">Person 2</span>
        </div>
        <div className="space-y-2 animate-pulse">
          <div className="h-10 bg-rail-bg rounded border border-rail-border" />
          <div className="h-6 bg-rail-bg rounded border border-rail-border w-3/4" />
          <div className="h-6 bg-rail-bg rounded border border-rail-border w-1/2" />
          <div className="h-6 bg-rail-bg rounded border border-rail-border w-1/3" />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="panel panel-hover p-4 border-red-500/30" data-panel-id="risk">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-rail-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Route Risk
          </h3>
          <span className="badge badge-red">Person 2</span>
        </div>
        <div className="text-center py-4">
          <svg className="mx-auto mb-2 w-8 h-8 text-red-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-rail-danger font-medium">RISK SERVICE UNAVAILABLE</p>
          <p className="text-xs text-rail-textMuted mt-1">Risk scoring endpoint not responding</p>
          <button onClick={() => window.location.reload()} className="mt-3 btn-secondary text-xs">
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!risk) {
    return (
      <section className="panel panel-hover p-4" data-panel-id="risk">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-rail-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Route Risk
          </h3>
          <span className="badge badge-yellow">Person 2</span>
        </div>
        <div className="text-center py-4 text-rail-textMuted">
          No risk data available
        </div>
      </section>
    );
  }

  return (
    <section className="panel panel-hover p-4" data-panel-id="risk">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-rail-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          Route Risk
        </h3>
        <span className="badge badge-yellow">Person 2</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-rail-textMuted">Overall</span>
            <RiskLevelBadge level={risk.overallRiskLevel} />
          </div>
          <span className="text-xs text-rail-textMuted font-mono">
            {risk.segments.length} segments
          </span>
        </div>

        <div className="pt-2 border-t border-rail-border max-h-48 overflow-y-auto">
          {risk.segments.map(segment => (
            <SegmentRow key={segment.segmentId} segment={segment} />
          ))}
        </div>

        <div className="pt-2 border-t border-rail-border flex items-center justify-between text-xs">
          <span className="text-rail-textMuted/60 font-mono">
            Updated: {secondsSinceUpdate !== null ? `${secondsSinceUpdate}s ago` : 'just now'}
          </span>
          {isDemoMode && (
            <span className="badge badge-blue text-xs">Demo Data</span>
          )}
          {isFetching && (
            <span className="text-rail-accent text-xs animate-pulse font-mono">⟳</span>
          )}
        </div>
      </div>
    </section>
  );
}