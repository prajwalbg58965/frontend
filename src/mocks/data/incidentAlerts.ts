import type { IncidentAlertsResponse, IncidentAlert } from '../../types/domain';
import { getIncidentOverride } from '../../demo/demoDataBridge';

let activeIncident: IncidentAlert | null = null;
let incidentTriggered = false;

function buildIncidentAlerts(override?: { triggered: boolean; resolved: boolean; incident?: any } | null): IncidentAlertsResponse {
  const now = new Date();
  
  if (override) {
    if (override.triggered && override.incident && !override.resolved) {
      activeIncident = {
        ...override.incident,
        incidentId: 'inc-001',
        timestamp: override.incident.timestamp ?? now.toISOString(),
        acknowledged: false,
      };
      incidentTriggered = true;
    } else if (override.resolved) {
      activeIncident = null;
      incidentTriggered = false;
    }
  }
  
  const incidents: IncidentAlert[] = [];
  if (activeIncident) {
    incidents.push(activeIncident);
  }
  
  return {
    incidents,
    timestamp: new Date().toISOString(),
  };
}

export function generateIncidentAlerts(): IncidentAlertsResponse {
  const override = getIncidentOverride();
  return buildIncidentAlerts(override);
}

export function triggerMockIncident(): void {
  if (incidentTriggered) return;
  incidentTriggered = true;

  activeIncident = {
    incidentId: 'inc-001',
    type: 'TRACK_INUNDATION',
    coachId: 'B2',
    coordinates: { latitude: 21.4950, longitude: 86.9400 },
    severity: 'CRITICAL',
    passengerEstimate: 72,
    description: 'Track inundation due to flash flooding - Coach B2 at risk',
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
}

export function acknowledgeIncident(acknowledgedBy = 'OPERATOR'): void {
  if (activeIncident) {
    activeIncident = {
      ...activeIncident,
      acknowledged: true,
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy,
    };
  }
}

export function clearIncident(): void {
  activeIncident = null;
  incidentTriggered = false;
}

export function isIncidentActive(): boolean {
  return activeIncident !== null;
}

export function getActiveIncident(): IncidentAlert | null {
  return activeIncident;
}

export const incidentAlertsMock: IncidentAlertsResponse = buildIncidentAlerts();