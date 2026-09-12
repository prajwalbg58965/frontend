import { useConfirmationLogStatus } from '../../hooks/useConfirmation';
import type { ConfirmationEvent } from '../../types/domain';

function getStatusColor(status: ConfirmationEvent['status']): string {
  switch (status) {
    case 'CLEAR': return '#22c55e';
    case 'CAUTION': return '#eab308';
    case 'RESTRICTED': return '#f97316';
    case 'BLOCKED': return '#ef4444';
    default: return '#7a8d9c';
  }
}

function getStatusLabel(status: ConfirmationEvent['status']): string {
  switch (status) {
    case 'CLEAR': return 'CLEAR';
    case 'CAUTION': return 'CAUTION';
    case 'RESTRICTED': return 'RESTRICTED';
    case 'BLOCKED': return 'BLOCKED';
    default: return 'UNKNOWN';
  }
}

function StatusBadge({ status }: { status: ConfirmationEvent['status'] }) {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs font-semibold"
      style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40`, borderWidth: '1px', borderStyle: 'solid' }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

function ConfirmationRow({ event }: { event: ConfirmationEvent }) {
  const color = getStatusColor(event.status);
  const time = event.timestamp ? new Date(event.timestamp).toLocaleTimeString('en-GB', { 
    hour12: false, 
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit'
  }) : '--:--';
  
  const fullDateTime = event.timestamp ? new Date(event.timestamp).toLocaleString('en-GB', { 
    hour12: false, 
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: 'short'
  }) : 'Unknown';

  return (
    <div className="py-2 border-b border-rail-border/50 last:border-0 group">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: color }} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-rail-text truncate">{event.location}</span>
            <StatusBadge status={event.status} />
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-rail-textMuted">
            <span className="font-mono text-rail-text" title={fullDateTime}>{time} IST</span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a5 5 0 110 10A5 5 0 018 3z" />
                <path d="M8 6v4M8 11h.01" />
              </svg>
              {event.confirmedBy}
            </span>
          </div>
          {event.details && (
            <div className="mt-1 text-[11px] text-rail-textMuted/80 truncate group-hover:text-rail-textMuted transition-colors">
              {event.details}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ConfirmationPanel() {
  const { confirmations, isLoading, isError, isFetching, secondsSinceUpdate } = useConfirmationLogStatus();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  if (isLoading) {
    return (
      <section className="panel panel-hover p-4" data-panel-id="confirmations">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-rail-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Confirmations
          </h3>
          <span className="badge badge-green">Person 3</span>
        </div>
        <div className="space-y-2 animate-pulse max-h-64 overflow-y-auto">
          <div className="h-14 bg-rail-bg rounded border border-rail-border" />
          <div className="h-14 bg-rail-bg rounded border border-rail-border" />
          <div className="h-14 bg-rail-bg rounded border border-rail-border" />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="panel panel-hover p-4 border-red-500/30" data-panel-id="confirmations">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-rail-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Confirmations
          </h3>
          <span className="badge badge-red">Person 3</span>
        </div>
        <div className="text-center py-4">
          <svg className="mx-auto mb-2 w-8 h-8 text-red-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-rail-danger font-medium">CONFIRMATION SERVICE UNAVAILABLE</p>
          <p className="text-xs text-rail-textMuted mt-1">Confirmation log endpoint not responding</p>
          <button onClick={() => window.location.reload()} className="mt-3 btn-secondary text-xs">
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (confirmations.length === 0) {
    return (
      <section className="panel panel-hover p-4" data-panel-id="confirmations">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-rail-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Confirmations
          </h3>
          <span className="badge badge-green">Person 3</span>
        </div>
        <div className="text-center py-6 text-rail-textMuted">
          <svg className="mx-auto mb-2 w-8 h-8 text-rail-textMuted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">NO CONFIRMATIONS YET</p>
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

  return (
    <section className="panel panel-hover p-4" data-panel-id="confirmations">
      <div className="flex items-center justify-between mb-3 border-b border-rail-border pb-2">
        <h3 className="font-bold text-rail-text flex items-center gap-2 uppercase tracking-wider text-sm">
          <span className="bg-rail-info text-rail-bg px-1.5 py-0.5 rounded-sm text-[11px] font-black leading-none">1</span>
          Confirmations
        </h3>
        <span className="badge badge-green">Person 3</span>
      </div>

      <div className="max-h-64 overflow-y-auto custom-scrollbar">
        {confirmations.map(event => (
          <ConfirmationRow key={event.eventId} event={event} />
        ))}
      </div>

      <div className="pt-2 border-t border-rail-border flex items-center justify-between text-xs">
        <span className="text-rail-textMuted/60 font-mono">
          Updated: {secondsSinceUpdate !== null ? `${secondsSinceUpdate}s ago` : 'just now'}
        </span>
        <span className="text-rail-textMuted/60 font-mono">
          {confirmations.length} event{confirmations.length !== 1 ? 's' : ''}
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