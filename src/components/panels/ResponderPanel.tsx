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
  const { nearestResponder, incidentCoordinates, disclaimer } = useResponderStatus();

  const hasActiveIncident = nearestResponder !== null && incidentCoordinates !== null;

  return (
    <section className="panel panel-hover p-4" data-panel-id="responder">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-rail-text flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Nearest Responder
        </h3>
        <span className="badge badge-blue text-[10px]">Person 4</span>
      </div>

      {/* Mandatory Disclaimer Badge */}
      <div className="mb-3 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-[10px] text-yellow-400 font-mono text-center">
        Static responder reference — demo data
      </div>

      {!hasActiveIncident ? (
        <div className="text-center py-5">
          <svg className="mx-auto mb-2 w-8 h-8 text-blue-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-xs text-blue-400 font-medium">AWAITING INCIDENT LOCATION</p>
          <p className="text-[11px] text-rail-textMuted mt-1">
            Calculates nearest hospital / NDRF unit when Incident Mode triggers.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rail-textMuted">Responder Type</span>
            <ResponderTypeBadge type={nearestResponder.type} />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-rail-border">
            <span className="text-xs text-rail-textMuted">Name</span>
            <span className="font-semibold text-rail-text text-xs text-right truncate max-w-[180px]">
              {nearestResponder.name}
            </span>
          </div>

          <div className="bg-rail-bg/80 p-2 rounded border border-rail-border flex items-center justify-between">
            <span className="text-xs text-rail-textMuted">Straight-Line Distance</span>
            <span className="font-mono text-base font-bold text-rail-accent">
              {nearestResponder.distanceKm?.toFixed(1)} km
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-rail-textMuted">Coordinates</span>
            <span className="font-mono text-rail-text">
              {nearestResponder.coordinates.latitude.toFixed(4)}° N, {nearestResponder.coordinates.longitude.toFixed(4)}° E
            </span>
          </div>

          {nearestResponder.capabilities && (
            <div className="pt-1 border-t border-rail-border">
              <span className="text-[11px] text-rail-textMuted block mb-1">Capabilities</span>
              <div className="flex flex-wrap gap-1">
                {nearestResponder.capabilities.map((cap, i) => (
                  <span key={i} className="badge badge-blue text-[9px] px-1.5 py-0.5">{cap}</span>
                ))}
              </div>
            </div>
          )}

          {nearestResponder.contact && (
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-rail-border">
              <span className="text-rail-textMuted">Emergency Contact</span>
              <span className="font-mono text-rail-text">{nearestResponder.contact}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-rail-border text-[9px] text-rail-textMuted/70 text-center font-mono">
        {disclaimer}
      </div>
    </section>
  );
}