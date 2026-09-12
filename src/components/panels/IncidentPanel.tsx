import { useIncidentAlertsStatus } from '../../hooks/useIncident';
import type { IncidentAlert, IncidentSeverity, IncidentType } from '../../types/domain';

function getSeverityColor(severity: IncidentSeverity): string {
  switch (severity) {
    case 'LOW': return '#22c55e';
    case 'MEDIUM': return '#eab308';
    case 'HIGH': return '#f97316';
    case 'CRITICAL': return '#ef4444';
    default: return '#7a8d9c';
  }
}

function getSeverityLabel(severity: IncidentSeverity): string {
  return severity;
}

function getTypeLabel(type: IncidentType): string {
  const labels: Record<IncidentType, string> = {
    TRACK_INUNDATION: 'Track Inundation',
    DERAILMENT_RISK: 'Derailment Risk',
    SIGNAL_FAILURE: 'Signal Failure',
    FIRE: 'Fire',
    COLLISION: 'Collision',
    MEDICAL_EMERGENCY: 'Medical Emergency',
    UNKNOWN: 'Unknown',
  };
  return labels[type] ?? type;
}

function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const color = getSeverityColor(severity);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs font-semibold"
      style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40`, borderWidth: '1px', borderStyle: 'solid' }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: color }} aria-hidden="true" />
      {getSeverityLabel(severity)}
    </span>
  );
}

function IncidentTypeBadge({ type }: { type: IncidentType }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs"
      style={{ backgroundColor: '#1890ff20', color: '#1890ff', borderColor: '#1890ff40', borderWidth: '1px', borderStyle: 'solid' }}>
      {getTypeLabel(type)}
    </span>
  );
}

export function IncidentPanel() {
  const { activeIncident, isLoading, isError, isFetching, secondsSinceUpdate } = useIncidentAlertsStatus();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  if (isLoading) {
    return (
      <section className="panel panel-hover p-4" data-panel-id="incident">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-rail-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Incident Mode
          </h3>
          <span className="badge badge-red">Person 3</span>
        </div>
        <div className="text-center py-4 animate-pulse">
          <div className="h-10 bg-rail-bg rounded border border-rail-border" />
          <div className="h-6 bg-rail-bg rounded border border-rail-border w-1/2 mx-auto mt-2" />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="panel panel-hover p-4 border-red-500/30" data-panel-id="incident">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-rail-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Incident Mode
          </h3>
          <span className="badge badge-red">Person 3</span>
        </div>
        <div className="text-center py-4">
          <svg className="mx-auto mb-2 w-8 h-8 text-red-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-rail-danger font-medium">INCIDENT SERVICE UNAVAILABLE</p>
          <p className="text-xs text-rail-textMuted mt-1">Incident alert endpoint not responding</p>
          <button onClick={() => window.location.reload()} className="mt-3 btn-secondary text-xs">
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!activeIncident) {
    return (
      <section className="panel panel-hover p-4" data-panel-id="incident">
        <div className="flex items-center justify-between mb-3 border-b border-rail-border pb-2">
          <h3 className="font-bold text-rail-text flex items-center gap-2 uppercase tracking-wider text-sm">
            <span className="bg-rail-danger text-rail-bg px-1.5 py-0.5 rounded-sm text-[11px] font-black leading-none">3</span>
            Active Incidents
          </h3>
          <span className="badge badge-green">Person 3</span>
        </div>
        <div className="text-center py-6">
          <svg className="mx-auto mb-2 w-10 h-10 text-green-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-500 font-medium">NO ACTIVE INCIDENTS</p>
          <p className="text-xs text-rail-textMuted mt-1">All clear on monitored corridor</p>
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
      </section>
    );
  }

  const severityColor = getSeverityColor(activeIncident.severity);
  const time = activeIncident.timestamp ? new Date(activeIncident.timestamp).toLocaleTimeString('en-GB', { 
    hour12: false, 
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) : '--:--:--';
  
  const fullDateTime = activeIncident.timestamp ? new Date(activeIncident.timestamp).toLocaleString('en-GB', { 
    hour12: false, 
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: 'short'
  }) : 'Unknown';

  const headcount = activeIncident.passengerEstimate !== undefined 
    ? `${activeIncident.passengerEstimate}`
    : 'Unavailable';

  return (
    <section className="panel panel-hover p-4 border-l-4" 
      style={{ borderLeftColor: severityColor }}
      data-panel-id="incident"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-rail-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor }} />
          Incident Mode
        </h3>
        <span className="badge badge-red">Person 3</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-rail-textMuted">Status</span>
          <SeverityBadge severity={activeIncident.severity} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-rail-textMuted">Type</span>
          <IncidentTypeBadge type={activeIncident.type} />
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-rail-border">
          <span className="text-xs text-rail-textMuted">Incident ID</span>
          <span className="font-mono text-xs text-rail-text">{activeIncident.incidentId}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-rail-textMuted">Affected Coach</span>
          <span className="font-mono text-lg font-semibold text-rail-text">{activeIncident.coachId}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-rail-textMuted">Location</span>
          <span className="font-mono text-xs text-rail-textMuted">
            {activeIncident.coordinates.latitude.toFixed(4)}° N, {activeIncident.coordinates.longitude.toFixed(4)}° E
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-rail-border">
          <span className="text-xs text-rail-textMuted">Est. Passengers</span>
          <span className="font-mono text-xs font-semibold text-rail-text">{headcount}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-rail-textMuted">Time</span>
          <span className="font-mono text-xs text-rail-text" title={fullDateTime}>{time} IST</span>
        </div>

        {activeIncident.description && (
          <div className="pt-1 border-t border-rail-border text-[11px] text-rail-textMuted">
            {activeIncident.description}
          </div>
        )}

        <div className="pt-2 border-t border-rail-border flex items-center justify-between text-xs">
          <span className="text-rail-textMuted/60 font-mono">
            Updated: {secondsSinceUpdate !== null ? `${secondsSinceUpdate}s ago` : 'just now'}
          </span>
          <div className="flex items-center gap-2">
            {isDemoMode && (
              <span className="badge badge-blue text-xs">Demo Data</span>
            )}
            {isFetching && (
              <span className="text-rail-accent text-xs animate-pulse font-mono">⟳</span>
            )}
            {activeIncident.acknowledged && (
              <span className="badge badge-green text-xs">ACKNOWLEDGED</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}