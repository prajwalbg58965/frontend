export type DemoPhase = 
  | 'IDLE'
  | 'MONITORING'
  | 'MOVING'
  | 'ETA_RISK_CONFIRMATIONS'
  | 'INCIDENT_TRIGGERED'
  | 'INCIDENT_RESPONSE'
  | 'REUNIFICATION'
  | 'RESOLVED'
  | 'COMPLETE';

export interface DemoEvent {
  phase: DemoPhase;
  label: string;
  duration: number;
  actions: {
    trainPosition?: { progress: number; speed: number };
    eta?: { predictedArrival: string; delay: number; confidence: [string, string] };
    risk?: { level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; segments: any[] };
    confirmations?: { location: string; status: string; time: string }[];
    incidents?: any[];
    incidentTriggered?: boolean;
    incidentResolved?: boolean;
  };
}

export const DEMO_TIMELINE: DemoEvent[] = [
  {
    phase: 'MONITORING',
    label: 'Normal Monitoring',
    duration: 10000,
    actions: {
      trainPosition: { progress: 0.15, speed: 85 },
      eta: { predictedArrival: '11:25', delay: 0, confidence: ['11:20', '11:35'] },
      risk: { level: 'LOW', segments: [] },
      confirmations: [{ location: 'Howrah Jn', status: 'CLEAR', time: '10:00' }],
      incidents: [],
    },
  },
  {
    phase: 'MOVING',
    label: 'Train Moving',
    duration: 15000,
    actions: {
      trainPosition: { progress: 0.35, speed: 92 },
      eta: { predictedArrival: '11:22', delay: -3, confidence: ['11:18', '11:28'] },
      risk: { level: 'LOW', segments: [] },
      confirmations: [{ location: 'Bhadrak', status: 'CLEAR', time: '10:30' }],
      incidents: [],
    },
  },
  {
    phase: 'ETA_RISK_CONFIRMATIONS',
    label: 'ETA / Risk / Confirmations',
    duration: 15000,
    actions: {
      trainPosition: { progress: 0.52, speed: 78 },
      eta: { predictedArrival: '11:28', delay: 3, confidence: ['11:22', '11:40'] },
      risk: { level: 'MEDIUM', segments: [{ id: 'seg-jaleswar', riskLevel: 'MEDIUM', floodDepth: 120, weatherAlert: 'Heavy rainfall warning' }] },
      confirmations: [{ location: 'Jaleswar', status: 'CAUTION - Water level rising', time: '11:00' }],
      incidents: [],
    },
  },
  {
    phase: 'INCIDENT_TRIGGERED',
    label: 'Incident Triggered',
    duration: 5000,
    actions: {
      trainPosition: { progress: 0.61, speed: 0 },
      eta: { predictedArrival: '12:15', delay: 50, confidence: ['12:00', '12:45'] },
      risk: { level: 'HIGH', segments: [{ id: 'seg-jaleswar', riskLevel: 'HIGH', floodDepth: 280, weatherAlert: 'Flash flood warning' }] },
      confirmations: [{ location: 'Jaleswar', status: 'BLOCKED - Track inundated', time: '11:30' }],
      incidentTriggered: true,
      incidents: [{
        id: 'inc-001',
        type: 'TRACK_INUNDATION',
        coachId: 'B2',
        coordinates: [86.95, 21.50],
        severity: 'CRITICAL',
        passengerEstimate: 72,
        timestamp: '11:30',
      }],
    },
  },
  {
    phase: 'INCIDENT_RESPONSE',
    label: 'Incident Response',
    duration: 30000,
    actions: {
      trainPosition: { progress: 0.61, speed: 0 },
      eta: { predictedArrival: '13:30', delay: 125, confidence: ['13:00', '14:30'] },
      risk: { level: 'HIGH', segments: [{ id: 'seg-jaleswar', riskLevel: 'HIGH', floodDepth: 320, weatherAlert: 'Flash flood warning' }] },
      confirmations: [{ location: 'Balasore', status: 'NDRF DEPLOYED', time: '11:45' }],
      incidents: [{
        id: 'inc-001',
        type: 'TRACK_INUNDATION',
        coachId: 'B2',
        coordinates: [86.95, 21.50],
        severity: 'CRITICAL',
        passengerEstimate: 72,
        timestamp: '11:30',
      }],
    },
  },
  {
    phase: 'REUNIFICATION',
    label: 'Passenger Safety Check',
    duration: 20000,
    actions: {
      trainPosition: { progress: 0.61, speed: 0 },
      eta: { predictedArrival: '13:30', delay: 125, confidence: ['13:00', '14:30'] },
      risk: { level: 'HIGH', segments: [{ id: 'seg-jaleswar', riskLevel: 'HIGH', floodDepth: 320, weatherAlert: 'Flash flood warning' }] },
      confirmations: [{ location: 'Balasore', status: 'EVACUATION IN PROGRESS', time: '12:15' }],
      incidents: [{
        id: 'inc-001',
        type: 'TRACK_INUNDATION',
        coachId: 'B2',
        coordinates: [86.95, 21.50],
        severity: 'CRITICAL',
        passengerEstimate: 72,
        timestamp: '11:30',
      }],
    },
  },
  {
    phase: 'RESOLVED',
    label: 'Incident Resolved',
    duration: 10000,
    actions: {
      trainPosition: { progress: 0.61, speed: 10 },
      eta: { predictedArrival: '14:00', delay: 155, confidence: ['13:45', '14:30'] },
      risk: { level: 'MEDIUM', segments: [{ id: 'seg-jaleswar', riskLevel: 'MEDIUM', floodDepth: 100, weatherAlert: 'Water receding' }] },
      confirmations: [{ location: 'Balasore', status: 'TRACK CLEAR - Speed restricted', time: '12:30' }],
      incidentResolved: true,
      incidents: [],
    },
  },
  {
    phase: 'COMPLETE',
    label: 'Demo Complete',
    duration: 10000,
    actions: {
      trainPosition: { progress: 0.65, speed: 60 },
      eta: { predictedArrival: '14:15', delay: 170, confidence: ['14:00', '14:45'] },
      risk: { level: 'LOW', segments: [] },
      confirmations: [{ location: 'Balasore', status: 'NORMAL OPERATIONS RESUMED', time: '12:45' }],
      incidents: [],
    },
  },
];

export const DEMO_TOTAL_DURATION = DEMO_TIMELINE.reduce((sum, e) => sum + e.duration, 0);
export const DEMO_PHASES = DEMO_TIMELINE.map(e => e.phase);