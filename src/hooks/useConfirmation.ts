import { useQuery } from '@tanstack/react-query';
import { confirmationService } from '../api/services';
import type { ConfirmationLogResponse } from '../types/domain';

const POLLING_INTERVAL_MS = 8000;

export function useConfirmationLog(routeId = 'hwh-kgp') {
  return useQuery<ConfirmationLogResponse, Error>({
    queryKey: ['confirmation-log', routeId],
    queryFn: () => confirmationService.getConfirmationLog({ routeId }).then(res => {
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    }),
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 4000,
  });
}

export function useConfirmationLogStatus(routeId = 'hwh-kgp') {
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useConfirmationLog(routeId);
  
  const secondsSinceUpdate = dataUpdatedAt 
    ? Math.floor((Date.now() - dataUpdatedAt) / 1000)
    : null;

  return {
    confirmations: data?.events ?? [],
    lastUpdated: data?.lastUpdated ?? null,
    isLoading,
    isError,
    isFetching,
    secondsSinceUpdate,
    lastUpdatedAt: dataUpdatedAt,
    refetch,
  };
}