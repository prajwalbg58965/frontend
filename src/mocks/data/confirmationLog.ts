import type { ConfirmationLogResponse, ConfirmationEvent } from '../../types/domain';
import { getConfirmationOverride } from '../../demo/demoDataBridge';

const baseEvents: readonly ConfirmationEvent[] = [
  {
    eventId: 'evt-001',
    location: 'Howrah Junction (HWH)',
    junctionId: 'HWH',
    status: 'CLEAR',
    details: 'Signal cleared for departure',
    timestamp: '2026-09-09T09:00:00.000Z',
    confirmedBy: 'AUTO',
  },
  {
    eventId: 'evt-002',
    location: 'Bhadrak (BHC)',
    junctionId: 'BHC',
    status: 'CLEAR',
    details: 'Track circuit clear',
    timestamp: '2026-09-09T09:30:00.000Z',
    confirmedBy: 'STATION_MASTER',
  },
  {
    eventId: 'evt-003',
    location: 'Balasore (BLS)',
    junctionId: 'BLS',
    status: 'CAUTION',
    details: 'Speed restriction 30 km/h - maintenance work',
    timestamp: '2026-09-09T10:00:00.000Z',
    confirmedBy: 'MANUAL',
  },
];

let eventCounter = baseEvents.length;

function buildConfirmationLog(override?: { location: string; status: string; time: string }[] | null): ConfirmationLogResponse {
  const now = new Date();
  
  if (override) {
    const events: ConfirmationEvent[] = override.map((item, index) => ({
      eventId: `evt-${String(index + 1).padStart(3, '0')}`,
      location: item.location,
      junctionId: item.location.includes('(') ? item.location.slice(item.location.indexOf('(') + 1, item.location.indexOf(')')) : undefined,
      status: item.status as ConfirmationEvent['status'],
      details: item.status,
      timestamp: new Date(now.getTime() - (override.length - index) * 600000).toISOString(),
      confirmedBy: 'AUTO',
    }));
    
    return {
      events,
      lastUpdated: now.toISOString(),
    };
  }
  
  const events = [...baseEvents];

  return {
    events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    lastUpdated: new Date().toISOString(),
  };
}

export function generateConfirmationLog(routeId = 'hwh-kgp'): ConfirmationLogResponse {
  const override = getConfirmationOverride();
  return buildConfirmationLog(override);
}

export const confirmationLogMock: ConfirmationLogResponse = buildConfirmationLog();