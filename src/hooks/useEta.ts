import { useQuery } from '@tanstack/react-query';
import { etaService } from '../api/services';
import type { ETAPrediction } from '../types/domain';

const POLLING_INTERVAL_MS = Number(import.meta.env.VITE_RAILRADAR_POLL_INTERVAL_MS) || 30000;

export function useETAPrediction(trainId: string) {
  return useQuery<ETAPrediction, Error>({
    queryKey: ['predict-eta', trainId],
    queryFn: async () => {
      // 1. Get live operational data from proxy
      let currentDelay = 5.0;
      let currentStation = 'Howrah';
      let nextStation = 'Kharagpur';
      try {
        const liveRes = await fetch(`/api/trains/${trainId}/live`);
        if (liveRes.ok) {
          const body = await liveRes.json();
          if (body.success) {
            const liveData = body.data;
            currentDelay = liveData.delayMinutes || 0;
            currentStation = liveData.currentStation || liveData.previousStation || 'Howrah';
            nextStation = liveData.nextStation || 'Kharagpur';
          }
        }
      } catch (e) {
        console.warn('Failed to fetch live context for ETA prediction', e);
      }

      // 2. Feed into ML Engine
      const res = await etaService.predictEta({
        trainId,
        currentStation,
        nextStation,
        currentDelay
      });

      if (!res.success) throw new Error(res.error.message);
      
      return {
        ...res.data,
        liveDelayMinutes: currentDelay
      };
    },
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5000,
  });
}

export function useETAPredictionStatus(trainId = '12841') {
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useETAPrediction(trainId);
  
  const secondsSinceUpdate = dataUpdatedAt 
    ? Math.floor((Date.now() - dataUpdatedAt) / 1000)
    : null;

  return {
    eta: data,
    isLoading,
    isError,
    isFetching,
    secondsSinceUpdate,
    lastUpdated: dataUpdatedAt,
    refetch,
  };
}