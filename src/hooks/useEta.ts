import { useQuery } from '@tanstack/react-query';
import { etaService } from '../api/services';
import type { ETAPrediction } from '../types/domain';

const POLLING_INTERVAL_MS = 8000;

export function useETAPrediction(trainId = '12841') {
  return useQuery<ETAPrediction, Error>({
    queryKey: ['predict-eta', trainId],
    queryFn: () => etaService.predictEta({ trainId }).then(res => {
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    }),
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 3000,
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