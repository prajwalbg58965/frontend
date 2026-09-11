import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { demoController, DemoControllerState, DemoPhase } from './demoController';
import type { DemoEvent } from './demoTimeline';

interface DemoContextValue {
  state: DemoControllerState;
  currentEvent: DemoEvent | null;
  timeline: DemoEvent[];
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  jumpToPhase: (index: number) => void;
  jumpToIncident: () => void;
  setSpeedMultiplier: (speed: number) => void;
  isDemoMode: boolean;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const [state, setState] = useState<DemoControllerState>(demoController.getState());
  const [currentEvent, setCurrentEvent] = useState<DemoEvent | null>(demoController.getCurrentEvent());
  const [timeline] = useState<DemoEvent[]>(demoController.getTimeline());

  useEffect(() => {
    if (!enabled) return;
    
    const unsubscribe = demoController.subscribe((newState) => {
      setState(newState);
      setCurrentEvent(demoController.getCurrentEvent());
    });
    
    return unsubscribe;
  }, [enabled]);

  const start = useCallback(() => demoController.start(), []);
  const pause = useCallback(() => demoController.pause(), []);
  const resume = useCallback(() => demoController.resume(), []);
  const reset = useCallback(() => demoController.reset(), []);
  const jumpToPhase = useCallback((index: number) => demoController.jumpToPhase(index), []);
  const jumpToIncident = useCallback(() => demoController.jumpToIncident(), []);
  const setSpeedMultiplier = useCallback((speed: number) => demoController.setSpeedMultiplier(speed), []);

  return (
    <DemoContext.Provider value={{
      state,
      currentEvent,
      timeline,
      start,
      pause,
      resume,
      reset,
      jumpToPhase,
      jumpToIncident,
      setSpeedMultiplier,
      isDemoMode: enabled && state.state !== 'IDLE',
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

export function useDemoPhase(): DemoPhase {
  const { state } = useDemo();
  return state.currentPhase;
}

export function useDemoProgress(): number {
  const { state } = useDemo();
  return state.overallProgress;
}

export function useIsDemoRunning(): boolean {
  const { state } = useDemo();
  return state.state === 'RUNNING';
}

export function useIsDemoMode(): boolean {
  const { isDemoMode } = useDemo();
  return isDemoMode;
}