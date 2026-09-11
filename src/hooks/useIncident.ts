import { useQuery } from '@tanstack/react-query';
import { incidentsService } from '../api/services';
import type { IncidentAlertsResponse, IncidentAlert } from '../types/domain';

const POLLING_INTERVAL_MS = 4000;

export function useIncidentAlerts(routeId = 'hwh-kgp', activeOnly = true) {
  return useQuery<IncidentAlertsResponse, Error>({
    queryKey: ['incident-alerts', routeId, activeOnly],
    queryFn: () => incidentsService.getIncidentAlerts({ routeId, activeOnly }).then(res => {
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    }),
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 2000,
  });
}

export function useIncidentAlertsStatus(routeId = 'hwh-kgp', activeOnly = true) {
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useIncidentAlerts(routeId, activeOnly);
  
  const activeIncident = data?.incidents?.[0] ?? null;
  const secondsSinceUpdate = dataUpdatedAt 
    ? Math.floor((Date.now() - dataUpdatedAt) / 1000)
    : null;

  return {
    incidents: data?.incidents ?? [],
    activeIncident,
    isLoading,
    isError,
    isFetching,
    secondsSinceUpdate,
    lastUpdatedAt: dataUpdatedAt,
    refetch,
  };
}