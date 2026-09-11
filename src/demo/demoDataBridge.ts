import { demoController } from './demoController';
import { DEMO_TIMELINE } from './demoTimeline';

interface TrainPositionState {
  progress: number;
  speed: number;
}

interface ETAState {
  predictedArrival: string;
  delay: number;
  confidence: [string, string];
}

interface RiskState {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  segments: any[];
}

interface ConfirmationState {
  location: string;
  status: string;
  time: string;
}

interface IncidentState {
  triggered: boolean;
  resolved: boolean;
  incident?: any;
}

interface DemoDataState {
  trainPosition: TrainPositionState;
  eta: ETAState;
  risk: RiskState;
  confirmations: ConfirmationState[];
  incident: IncidentState;
}

let currentState: DemoDataState = {
  trainPosition: { progress: 0.15, speed: 85 },
  eta: { predictedArrival: '11:25', delay: 0, confidence: ['11:20', '11:35'] },
  risk: { level: 'LOW', segments: [] },
  confirmations: [{ location: 'Howrah Jn', status: 'CLEAR', time: '10:00' }],
  incident: { triggered: false, resolved: false },
};

let subscribers: Set<() => void> = new Set();

function notify() {
  subscribers.forEach(cb => cb());
}

export function getDemoDataState(): DemoDataState {
  return { ...currentState };
}

export function subscribeToDemoData(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

function interpolatePhaseProgress(phaseElapsed: number, phaseDuration: number): number {
  return Math.min(1, phaseElapsed / phaseDuration);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpString(a: string, b: string, t: number): string {
  return b;
}

demoController.subscribe(() => {
  const state = demoController.getState();
  const currentEvent = DEMO_TIMELINE[state.currentPhaseIndex];
  const prevEvent = state.currentPhaseIndex > 0 ? DEMO_TIMELINE[state.currentPhaseIndex - 1] : null;
  
  if (!currentEvent) return;

  let trainProgress = currentEvent.actions.trainPosition?.progress ?? currentState.trainPosition.progress;
  let trainSpeed = currentEvent.actions.trainPosition?.speed ?? currentState.trainPosition.speed;

  if (prevEvent && state.phaseElapsed > 0 && state.phaseElapsed < currentEvent.duration) {
    const t = interpolatePhaseProgress(state.phaseElapsed, currentEvent.duration);
    const prevProgress = prevEvent.actions.trainPosition?.progress ?? 0;
    const prevSpeed = prevEvent.actions.trainPosition?.speed ?? 0;
    const nextProgress = currentEvent.actions.trainPosition?.progress ?? 0;
    const nextSpeed = currentEvent.actions.trainPosition?.speed ?? 0;
    
    trainProgress = lerp(prevProgress, nextProgress, t);
    const interpolatedSpeed = lerp(prevSpeed, nextSpeed, t);
    trainSpeed = Math.round(interpolatedSpeed);
  } else if (currentEvent.actions.trainPosition) {
    trainProgress = currentEvent.actions.trainPosition.progress;
    trainSpeed = currentEvent.actions.trainPosition.speed;
  }

  let etaState = currentState.eta;
  const currentEta = currentEvent.actions.eta;
  const prevEta = prevEvent?.actions.eta;
  
  // Extract values before conditional to avoid TypeScript narrowing issues
  const currentEtaArrival = currentEta?.predictedArrival ?? '';
  const currentEtaDelay = currentEta?.delay ?? 0;
  const currentEtaConfidence = currentEta?.confidence ?? ['', ''];
  const prevEtaArrival = prevEta?.predictedArrival ?? '';
  const prevEtaDelay = prevEta?.delay ?? 0;
  
  if (currentEta) {
    etaState = currentEta;
  } else if (prevEta && currentEta) {
    const t = interpolatePhaseProgress(state.phaseElapsed, currentEvent.duration);
    const prevArrival = prevEtaArrival;
    const nextArrival = currentEtaArrival;
    const prevDelay = prevEtaDelay;
    const nextDelay = currentEtaDelay;
    
    const prevMinutes = parseTimeToMinutes(prevEtaArrival);
    const nextMinutes = parseTimeToMinutes(currentEtaArrival);
    const interpMinutes = Math.round(lerp(prevMinutes, nextMinutes, t));
    const interpDelay = Math.round(lerp(prevEtaDelay, currentEtaDelay, t));
    
    const hour = Math.floor(interpMinutes / 60);
    const minute = interpMinutes % 60;
    etaState = {
      predictedArrival: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      delay: interpDelay,
      confidence: currentEtaConfidence,
    };
  }

  let riskState = currentState.risk;
  if (currentEvent.actions.risk) {
    riskState = currentEvent.actions.risk;
  }

  let confirmationsState = currentState.confirmations;
  if (currentEvent.actions.confirmations) {
    confirmationsState = currentEvent.actions.confirmations;
  }

  let incidentState = currentState.incident;
  if (currentEvent.actions.incidentTriggered) {
    incidentState = { 
      triggered: true, 
      resolved: false,
      incident: currentEvent.actions.incidents?.[0],
    };
  } else if (currentEvent.actions.incidentResolved) {
    incidentState = { 
      triggered: true, 
      resolved: true,
      incident: undefined,
    };
  } else if (currentEvent.actions.incidents && currentEvent.actions.incidents.length > 0) {
    incidentState = { 
      triggered: true, 
      resolved: false,
      incident: currentEvent.actions.incidents[0],
    };
  } else if (!currentEvent.actions.incidentTriggered && !currentEvent.actions.incidentResolved) {
    incidentState = { triggered: false, resolved: false };
  }

  currentState = {
    trainPosition: { progress: trainProgress, speed: trainSpeed },
    eta: etaState,
    risk: riskState,
    confirmations: confirmationsState,
    incident: incidentState,
  };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('demo-data-update', { detail: currentState }));
  }
});

function parseTimeToMinutes(timeStr: string): number {
  const [hour, minute] = timeStr.split(':').map(Number);
  return hour * 60 + minute;
}

export function getLivePositionsOverride(): { progress: number; speed: number } | null {
  const state = getDemoDataState();
  if (demoController.getState().state === 'IDLE') return null;
  return { progress: state.trainPosition.progress, speed: state.trainPosition.speed };
}

export function getETAOverride(): { predictedArrival: string; delay: number; confidence: [string, string] } | null {
  const state = getDemoDataState();
  if (demoController.getState().state === 'IDLE') return null;
  return state.eta;
}

export function getRiskOverride(): { level: string; segments: any[] } | null {
  const state = getDemoDataState();
  if (demoController.getState().state === 'IDLE') return null;
  return state.risk;
}

export function getConfirmationOverride(): { location: string; status: string; time: string }[] | null {
  const state = getDemoDataState();
  if (demoController.getState().state === 'IDLE') return null;
  return state.confirmations;
}

export function getIncidentOverride(): { triggered: boolean; resolved: boolean; incident?: any } | null {
  const state = getDemoDataState();
  if (demoController.getState().state === 'IDLE') return null;
  return state.incident;
}