import { useQuery } from '@tanstack/react-query';
import { useSimulation } from '../context/SimulationContext';
import { useRoute } from './useRoute';
import { calculateTrackPosition } from '../utils/trackPosition';

const POLLING_INTERVAL_MS = Number(import.meta.env.VITE_RAILRADAR_POLL_INTERVAL_MS) || 15000;

export function useLivePositions(trainId: string) {
  return useQuery<any, Error>({
    queryKey: ['live-positions', trainId],
    queryFn: async () => {
      const res = await fetch(`/api/trains/${trainId}/live?authoritative=true`);
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error?.message || `RailRadar proxy failed: ${res.status}`);
      const data = body.data;
      
      return {
        trainId: data.trainNumber,
        timestamp: data.lastUpdatedAt || new Date().toISOString(),
        coaches: [
          {
            coachId: 'ENGINE',
            status: data.status || (data.currentLocation?.speedKmh > 0 ? 'MOVING' : 'STOPPED'),
            coordinates: {
              latitude: data.currentLocation?.lat || 20.296,
              longitude: data.currentLocation?.lng || 85.824,
            },
            speedKmh: data.currentLocation?.speedKmh || 0,
            headingDegrees: data.currentLocation?.bearingDegrees || 0,
            timestamp: data.lastUpdatedAt || new Date().toISOString(),
          }
        ],
        rawCurrentLocation: data.currentLocation,
      };
    },
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: 5000,
  });
}

export function useLivePositionsStatus(trainId = '12841') {
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useLivePositions(trainId);
  const { mode, simulatedPosition } = useSimulation();
  const { data: routeData } = useRoute(trainId);
  
  const secondsSinceUpdate = dataUpdatedAt 
    ? Math.floor((Date.now() - dataUpdatedAt) / 1000)
    : null;

  let positions = data?.coaches ? [...data.coaches] : [];
  
  // Recalculate true live position on the track geometry
  let trackDistMeters = 0;
  if (routeData && data?.rawCurrentLocation && positions.length > 0) {
    const raw = data.rawCurrentLocation;
    const calc = calculateTrackPosition(
      routeData,
      raw.sequence,
      raw.segmentProgress,
      raw.isHalt
    );
    
    if (calc) {
      trackDistMeters = calc.distanceFromTrackMeters;
      if (calc.isValid) {
        positions[0] = {
          ...positions[0],
          coordinates: { latitude: calc.latitude, longitude: calc.longitude },
          headingDegrees: calc.bearingDegrees
        };
      } else {
        console.warn(`Live position calculation failed track validation. Dist: ${trackDistMeters}m`);
      }
    }
  }
  
  if (mode === 'SIMULATION' && simulatedPosition) {
    positions = positions.map((coach: any) => 
      coach.coachId === 'ENGINE' 
        ? {
            ...coach,
            coordinates: { latitude: simulatedPosition.latitude, longitude: simulatedPosition.longitude },
            headingDegrees: simulatedPosition.bearingDegrees,
            speedKmh: simulatedPosition.speedKmh,
            status: simulatedPosition.speedKmh > 0 ? 'MOVING' : 'STOPPED',
          }
        : coach
    );
    if (!positions.some((c: any) => c.coachId === 'ENGINE')) {
      positions = [{
        coachId: 'ENGINE',
        coordinates: { latitude: simulatedPosition.latitude, longitude: simulatedPosition.longitude },
        headingDegrees: simulatedPosition.bearingDegrees,
        speedKmh: simulatedPosition.speedKmh,
        timestamp: new Date().toISOString(),
        status: simulatedPosition.speedKmh > 0 ? 'MOVING' : 'STOPPED'
      }, ...positions];
    }
  }

  return {
    positions,
    trainId: data?.trainId ?? trainId,
    timestamp: data?.timestamp ?? null,
    rawCurrentLocation: data?.rawCurrentLocation,
    trackDistMeters,
    isLoading,
    isError,
    isFetching,
    secondsSinceUpdate,
    lastUpdated: dataUpdatedAt,
    refetch,
  };
}