import { useResponderStatus } from '../../hooks/useResponder';
import type { Responder } from '../../types/domain';

function getResponderTypeColor(type: Responder['type']): string {
  switch (type) {
    case 'HOSPITAL': return '#1890ff';
    case 'NDRF': return '#f97316';
    case 'FIRE': return '#ef4444';
    case 'POLICE': return '#722ed1';
    case 'AMBULANCE': return '#eb2f96';
    default: return '#7a8d9c';
  }
}

function getResponderTypeLabel(type: Responder['type']): string {
  switch (type) {
    case 'HOSPITAL': return 'HOSPITAL';
    case 'NDRF': return 'NDRF UNIT';
    case 'FIRE': return 'FIRE STATION';
    case 'POLICE': return 'POLICE';
    case 'AMBULANCE': return 'AMBULANCE';
    default: return type;
  }
}

function ResponderTypeBadge({ type }: { type: Responder['type'] }) {
  const color = getResponderTypeColor(type);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs font-semibold"
      style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40`, borderWidth: '1px', borderStyle: 'solid' }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: color }} aria-hidden="true" />
      {getResponderTypeLabel(type)}
    </span>
  );
}

export function ResponderPanel() {
  const { nearestResponder, allResponders, incidentCoordinates, timestamp, disclaimer } = useResponderStatus();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  const hasActiveIncident = nearestResponder !== null;

  if (!hasActiveIncident) {
    return (
      <section className="panel panel-hover p-4" data-panel-id="responder">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-rail-text flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Nearest Responder
          </h3>
          <span className="badge badge-blue">Static Data</span>
        </div>
        <div className="text-center py-6">
          <svg className="mx-auto mb-2 w-10 h-10 text-blue-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-blue-500 font-medium">WAITING FOR INCIDENT</p>
          <p className="text-xs text-rail-textMuted mt-1">Responder lookup activates when Incident Mode triggers</p>
        </div>
        <div className="pt-2 border-t border-rail-border flex items-center justify-between text-xs">
          <span className="text-rail-textMuted/60 font-mono">
            Static reference data
          </span>
          <span className="badge badge-blue text-xs">Demo Data</span>
        </div>
      </section>
    );
  }

  const responder = nearestResponder!;
  const color = getResponderTypeColor(responder.type);

  return (
    <section className="panel panel-hover p-4 border-l-4" style={{ borderLeftColor: color }} data-panel-id="responder">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-rail-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          Nearest Responder
        </h3>
        <span className="badge badge-blue">Static Data</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-rail-textMuted">Type</span>
          <ResponderTypeBadge type={nearestResponder!.type} />
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-rail-border">
          <span className="text-xs text-rail-textMuted">Name</span>
          <span className="font-medium text-rail-text truncate">{nearestResponder!.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-rail-textMuted">Approx. straight-line distance</span>
          <span className="font-mono text-lg font-semibold text-rail-text">
            {nearestResponder!.distanceKm?.toFixed(1)} km
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-rail-border">
          <span className="text-xs text-rail-textMuted">Coordinates</span>
          <span className="font-mono text-xs text-rail-textMuted">
            {nearestResponder!.coordinates.latitude.toFixed(4)}° N, {nearestResponder!.coordinates.longitude.toFixed(4)}° E
          </span>
        </div>

        {nearestResponder!.capabilities && nearestResponder!.capabilities.length > 0 && (
          <div className="pt-1 border-t border-rail-border">
            <div className="text-xs text-rail-textMuted mb-1">Capabilities</div>
            <div className="flex flex-wrap gap-1">
              {nearestResponder!.capabilities.map((cap, i) => (
                <span key={i} className="badge badge-blue text-[10px]">{cap}</span>
              ))}
            </div>
          </div>
        )}

        {nearestResponder!.contact && (
          <div className="pt-1 border-t border-rail-border">
            <div className="text-xs text-rail-textMuted mb-1">Contact</div>
            <span className="font-mono text-xs text-rail-textMuted">{nearestResponder!.contact}</span>
          </div>
        )}

        <div className="pt-2 border-t border-rail-border flex items-center justify-between text-xs">
          <span className="text-rail-textMuted/60 font-mono">
            Calculated: {new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata' })} IST
          </span>
          <div className="flex items-center gap-2">
            <span className="badge badge-blue text-xs">Demo Data</span>
            <span className="text-red-500/80 text-[10px] font-mono">
              Static reference — not live emergency services
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-rail-border text-[10px] text-red-500/80 text-center">
        {disclaimer}
      </div>
    </section>
  );
}