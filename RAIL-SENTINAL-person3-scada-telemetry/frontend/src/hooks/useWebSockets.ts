import { useState, useEffect } from 'react';

export interface Alert {
  id: string;
  condition_id: string;
  layer: string;
  description: string;
  status: string;
  detected_at: number;
  acknowledged_by?: string;
  acknowledged_at?: number;
  escalated_at?: number;
  escalated_to?: string;
}

export interface TrainData {
  trainNumber: string;
  trainName: string;
  status: string;
  isLive: boolean;
  delayMinutes: number;
  currentStation: string;
  avgSpeed: number;
  source: string;
  destination: string;
  distanceFromOriginKm: number;
  totalDistanceKm: number;
  previousHalt: string;
  nextHalt: string;
  lat?: number;
  lng?: number;
}

export interface AppState {
  scada: {
    tracks: Record<string, boolean>;
    points: Record<string, string>;
    signals: Record<string, string>;
    fault_active: boolean;
    source_train?: string | null;
    source_train_name?: string | null;
    source_progress_pct?: number;
  } | null;
  trains: {
    trains: Record<string, TrainData>;
    ghost_trains?: Record<string, TrainData>;
    railradar_active: boolean;
  } | null;
  alerts: Alert[];
}

export function useWebSockets() {
  const [state, setState] = useState<AppState>({
    scada: null,
    trains: null,
    alerts: [],
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setState((prevState) => ({
          ...prevState,
          scada: data.scada || prevState.scada,
          trains: data.trains || prevState.trains,
          alerts: data.alerts || prevState.alerts,
        }));
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return { state, connected };
}
