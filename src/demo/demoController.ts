import { DEMO_TIMELINE, DEMO_TOTAL_DURATION, type DemoPhase, type DemoEvent } from './demoTimeline';

export type DemoState = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETE';
export { type DemoPhase } from './demoTimeline';

export interface DemoControllerState {
  state: DemoState;
  currentPhaseIndex: number;
  currentPhase: DemoPhase;
  phaseProgress: number;
  overallProgress: number;
  elapsedTime: number;
  phaseElapsed: number;
  phaseRemaining: number;
  speedMultiplier: number;
}

export class DemoController {
  private state: DemoControllerState = {
    state: 'IDLE',
    currentPhaseIndex: 0,
    currentPhase: 'IDLE',
    phaseProgress: 0,
    overallProgress: 0,
    elapsedTime: 0,
    phaseElapsed: 0,
    phaseRemaining: 0,
    speedMultiplier: 1,
  };

  private timer: ReturnType<typeof setTimeout> | null = null;
  private subscribers: Set<(state: DemoControllerState) => void> = new Set();
  private lastTimestamp = 0;
  private accumulatedTime = 0;

  subscribe(callback: (state: DemoControllerState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.state);
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    this.subscribers.forEach(cb => cb({ ...this.state }));
  }

  private computeOverallProgress(): number {
    let elapsed = this.accumulatedTime;
    const currentEvent = DEMO_TIMELINE[this.state.currentPhaseIndex];
    if (currentEvent && this.state.state === 'RUNNING') {
      elapsed += this.state.phaseElapsed;
    }
    return Math.min(100, (elapsed / DEMO_TOTAL_DURATION) * 100);
  }

  private updatePhaseProgress(): void {
    const event = DEMO_TIMELINE[this.state.currentPhaseIndex];
    if (!event) return;
    
    const phaseElapsed = Math.min(this.state.phaseElapsed, event.duration);
    this.state.phaseProgress = (phaseElapsed / event.duration) * 100;
    this.state.phaseRemaining = event.duration - phaseElapsed;
    this.state.overallProgress = this.computeOverallProgress();
  }

  private advancePhase(): void {
    if (this.state.currentPhaseIndex < DEMO_TIMELINE.length - 1) {
      this.state.currentPhaseIndex++;
      this.state.currentPhase = DEMO_TIMELINE[this.state.currentPhaseIndex].phase;
      this.state.phaseElapsed = 0;
      this.state.phaseProgress = 0;
    } else {
      this.state.state = 'COMPLETE';
      this.state.currentPhase = 'COMPLETE';
      this.state.overallProgress = 100;
    }
  }

  jumpToPhase(index: number): void {
    if (index < 0 || index >= DEMO_TIMELINE.length) return;
    this.state.currentPhaseIndex = index;
    this.state.currentPhase = DEMO_TIMELINE[index].phase;
    this.state.phaseElapsed = 0;
    this.state.phaseProgress = 0;

    let acc = 0;
    for (let i = 0; i < index; i++) {
      acc += DEMO_TIMELINE[i].duration;
    }
    this.accumulatedTime = acc;
    this.updatePhaseProgress();

    if (this.state.state === 'IDLE') {
      this.state.state = 'PAUSED';
    }
    this.notify();
  }

  jumpToIncident(): void {
    const incidentIndex = DEMO_TIMELINE.findIndex(e => e.phase === 'INCIDENT_TRIGGERED');
    if (incidentIndex !== -1) {
      this.jumpToPhase(incidentIndex);
      this.start();
    }
  }

  start(): void {
    if (this.state.state === 'RUNNING') return;
    
    if (this.state.state === 'IDLE') {
      this.accumulatedTime = 0;
      this.state.currentPhaseIndex = 0;
      this.state.currentPhase = DEMO_TIMELINE[0].phase;
    }
    
    this.state.state = 'RUNNING';
    this.lastTimestamp = performance.now();
    this.notify();
    this.tick();
  }

  pause(): void {
    if (this.state.state !== 'RUNNING') return;
    
    this.state.state = 'PAUSED';
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const now = performance.now();
    this.accumulatedTime += now - this.lastTimestamp;
    this.state.phaseElapsed += now - this.lastTimestamp;
    this.updatePhaseProgress();
    this.notify();
  }

  resume(): void {
    if (this.state.state !== 'PAUSED') return;
    
    this.state.state = 'RUNNING';
    this.lastTimestamp = performance.now();
    this.notify();
    this.tick();
  }

  reset(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    this.state = {
      state: 'IDLE',
      currentPhaseIndex: 0,
      currentPhase: 'IDLE',
      phaseProgress: 0,
      overallProgress: 0,
      elapsedTime: 0,
      phaseElapsed: 0,
      phaseRemaining: 0,
      speedMultiplier: this.state.speedMultiplier,
    };
    this.accumulatedTime = 0;
    this.lastTimestamp = 0;
    this.notify();
  }

  setSpeedMultiplier(multiplier: number): void {
    this.state.speedMultiplier = Math.max(0.1, Math.min(10, multiplier));
    this.notify();
  }

  getState(): DemoControllerState {
    return { ...this.state };
  }

  getCurrentEvent(): DemoEvent | null {
    return DEMO_TIMELINE[this.state.currentPhaseIndex] ?? null;
  }

  getTimeline(): DemoEvent[] {
    return DEMO_TIMELINE;
  }

  private tick(): void {
    if (this.state.state !== 'RUNNING') return;

    const now = performance.now();
    const delta = (now - this.lastTimestamp) * this.state.speedMultiplier;
    this.lastTimestamp = now;

    this.state.phaseElapsed += delta;
    this.state.elapsedTime = this.accumulatedTime + this.state.phaseElapsed;

    const currentEvent = DEMO_TIMELINE[this.state.currentPhaseIndex];
    if (currentEvent && this.state.phaseElapsed >= currentEvent.duration) {
      this.advancePhase();
      if (this.state.state === 'RUNNING') {
        this.tick();
        return;
      }
    }

    this.updatePhaseProgress();
    this.notify();

    this.timer = setTimeout(() => this.tick(), 100);
  }

  destroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.subscribers.clear();
  }
}

export const demoController = new DemoController();