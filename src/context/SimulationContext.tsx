import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import length from '@turf/length';
import along from '@turf/along';
import bearing from '@turf/bearing';
import { lineString } from '@turf/helpers';
import { useRoute } from '../hooks/useRoute';
import { useTrain } from './TrainContext';

export type SimulationMode = 'LIVE' | 'SIMULATION';
export type PlaybackState = 'PLAYING' | 'PAUSED' | 'STOPPED';

export interface SimulatedPosition {
  latitude: number;
  longitude: number;
  bearingDegrees: number;
  speedKmh: number;
}

interface SimulationContextValue {
  mode: SimulationMode;
  playbackState: PlaybackState;
  speedMultiplier: number;
  progress: number;
  simulatedPosition: SimulatedPosition | null;
  followTrain: boolean;
  
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  returnToLive: () => void;
  setSpeedMultiplier: (speed: number) => void;
  setFollowTrain: (follow: boolean) => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

// Approx base speed for 1x multiplier (e.g., 75 km/h)
const BASE_SPEED_KMH = 75;

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const { selectedTrainId } = useTrain();
  const { data: routeData } = useRoute(selectedTrainId);
  
  const [mode, setMode] = useState<SimulationMode>('LIVE');
  const [playbackState, setPlaybackState] = useState<PlaybackState>('STOPPED');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [simulatedPosition, setSimulatedPosition] = useState<SimulatedPosition | null>(null);
  const [followTrain, setFollowTrain] = useState(false);

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  useEffect(() => {
    // Reset simulation when train changes
    setMode('LIVE');
    setPlaybackState('STOPPED');
    setProgress(0);
    setSimulatedPosition(null);
  }, [selectedTrainId]);

  const updatePosition = (time: number) => {
    if (playbackState !== 'PLAYING') {
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(updatePosition);
      return;
    }

    if (!lastTimeRef.current) {
      lastTimeRef.current = time;
    }
    const deltaTimeSec = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    if (routeData && routeData.geojson.features.length > 0) {
      // Find main route
      const feature = routeData.geojson.features.find(f => f.properties?.segment_id === 'REAL_RAIL_SEG_01') || routeData.geojson.features[0];
      const coords = feature.geometry.coordinates as [number, number][];
      
      if (coords.length > 1) {
        try {
          const line = lineString(coords);
          const totalLength = length(line, { units: 'kilometers' });
          
          // Speed in km/s
          const speedKmS = (BASE_SPEED_KMH * speedMultiplier) / 3600;
          const distanceTravelled = speedKmS * deltaTimeSec;
          
          const progressDelta = distanceTravelled / totalLength;
          
          setProgress(prev => {
            const nextProgress = Math.min(prev + progressDelta, 1);
            
            // Calculate coords using Turf
            const currentDist = nextProgress * totalLength;
            const currentPt = along(line, currentDist, { units: 'kilometers' });
            
            // Calculate bearing slightly ahead
            const aheadDist = Math.min(currentDist + 0.1, totalLength);
            const aheadPt = along(line, aheadDist, { units: 'kilometers' });
            
            const b = bearing(currentPt, aheadPt);
            
            setSimulatedPosition({
              latitude: currentPt.geometry.coordinates[1],
              longitude: currentPt.geometry.coordinates[0],
              bearingDegrees: b,
              speedKmh: BASE_SPEED_KMH * speedMultiplier,
            });

            if (nextProgress >= 1) {
              setPlaybackState('STOPPED');
            }
            
            return nextProgress;
          });
        } catch (e) {
          console.error('Turf interpolation error:', e);
        }
      }
    }

    requestRef.current = requestAnimationFrame(updatePosition);
  };

  useEffect(() => {
    if (mode === 'SIMULATION') {
      requestRef.current = requestAnimationFrame(updatePosition);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [mode, playbackState, speedMultiplier, routeData]);

  const startSimulation = () => {
    setMode('SIMULATION');
    setPlaybackState('PLAYING');
  };

  const pauseSimulation = () => {
    setPlaybackState('PAUSED');
  };

  const resetSimulation = () => {
    setProgress(0);
    setPlaybackState('STOPPED');
    // Compute initial position
    if (routeData && routeData.geojson.features.length > 0) {
      const feature = routeData.geojson.features.find(f => f.properties?.segment_id === 'REAL_RAIL_SEG_01') || routeData.geojson.features[0];
      const coords = feature.geometry.coordinates as [number, number][];
      if (coords.length > 1) {
        setSimulatedPosition({
          latitude: coords[0][1],
          longitude: coords[0][0],
          bearingDegrees: 0,
          speedKmh: 0
        });
      }
    }
  };

  const returnToLive = () => {
    setMode('LIVE');
    setPlaybackState('STOPPED');
  };

  const value = {
    mode,
    playbackState,
    speedMultiplier,
    progress,
    simulatedPosition,
    followTrain,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    returnToLive,
    setSpeedMultiplier,
    setFollowTrain,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
