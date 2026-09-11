import { useQuery } from '@tanstack/react-query';
import { positionsService } from '../api/services';
import type { LivePositionsResponse } from '../types/domain';

const POLLING_INTERVAL_MS = 2500;

export function useLivePositions(trainId = '12841') {
  return useQuery<LivePositionsResponse, Error>({
    queryKey: ['live-positions', trainId],
    queryFn: () => positionsService.getLivePositions({ trainId }).then(res => {
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    }),
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 1000,
  });
}

export function useLivePositionsStatus(trainId = '12841') {
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useLivePositions(trainId);
  
  const secondsSinceUpdate = dataUpdatedAt 
    ? Math.floor((Date.now() - dataUpdatedAt) / 1000)
    : null;

  return {
    positions: data?.coaches ?? [],
    trainId: data?.trainId ?? trainId,
    timestamp: data?.timestamp ?? null,
    isLoading,
    isError,
    isFetching,
    secondsSinceUpdate,
    lastUpdated: dataUpdatedAt,
    refetch,
  };
}