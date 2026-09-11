import { useQuery } from '@tanstack/react-query';
import { riskService } from '../api/services';
import type { RiskScoreResponse } from '../types/domain';

const POLLING_INTERVAL_MS = 15000;

export function useRiskScore(routeId = 'hwh-kgp') {
  return useQuery<RiskScoreResponse, Error>({
    queryKey: ['risk-score', routeId],
    queryFn: () => riskService.getRiskScore({ routeId }).then(res => {
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    }),
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 10000,
  });
}

export function useRiskScoreStatus(routeId = 'hwh-kgp') {
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useRiskScore(routeId);
  
  const secondsSinceUpdate = dataUpdatedAt 
    ? Math.floor((Date.now() - dataUpdatedAt) / 1000)
    : null;

  return {
    risk: data,
    isLoading,
    isError,
    isFetching,
    secondsSinceUpdate,
    lastUpdated: dataUpdatedAt,
    refetch,
  };
}