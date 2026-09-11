import { useQuery } from '@tanstack/react-query';
import { etaService } from '../api/services';
import type { ETAPrediction, ETAPredictResponse, ETAPredictRequest } from '../types/domain';

const POLLING_INTERVAL_MS = 8000;
const REAL_API_POLLING_INTERVAL_MS = 10000;

// Mock mode hook (existing behavior)
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

// Real API mode hook
export function useETAPredictionReal(request: ETAPredictRequest) {
  return useQuery<ETAPredictResponse, Error>({
    queryKey: ['predict-eta-real', request.train_number],
    queryFn: () => etaService.predictEtaReal(request).then(res => {
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    }),
    refetchInterval: REAL_API_POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5000,
    enabled: !!request.train_number,
  });
}

// Unified hook that chooses between real and mock based on environment
export function useETAPredictionUnified(
  trainId = '12841',
  realRequest?: ETAPredictRequest
) {
  const isRealMode = import.meta.env.VITE_ETA_API_MODE === 'real';
  
  // Real API mode
  const realQuery = useQuery<ETAPredictResponse, Error>({
    queryKey: ['predict-eta-real', realRequest?.train_number],
    queryFn: () => {
      if (!realRequest) throw new Error('Real request required for real mode');
      return etaService.predictEtaReal(realRequest).then(res => {
        if (!res.success) throw new Error(res.error.message);
        return res.data;
      });
    },
    refetchInterval: REAL_API_POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5000,
    enabled: isRealMode && !!realRequest,
  });

  // Mock mode
  const mockQuery = useQuery<ETAPrediction, Error>({
    queryKey: ['predict-eta', trainId],
    queryFn: () => etaService.predictEta({ trainId }).then(res => {
      if (!res.success) throw new Error(res.error.message);
      return res.data;
    }),
    refetchInterval: POLLING_INTERVAL_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 3000,
    enabled: !isRealMode,
  });

  // Return unified interface
  if (isRealMode) {
    const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = realQuery;
    
    // Transform real response to mock-compatible format for UI compatibility
    const eta = data ? {
      trainId: realRequest?.train_number || trainId,
      predictedArrival: calculatePredictedArrival(data.predicted_delay_min),
      delayMinutes: Math.round(data.predicted_delay_min),
      confidenceRange: {
        earliest: calculatePredictedArrival(data.confidence_low_min),
        latest: calculatePredictedArrival(data.confidence_high_min),
      },
      nextJunction: undefined,
      upcomingJunctions: [],
      timestamp: new Date().toISOString(),
    } : undefined;

    const secondsSinceUpdate = dataUpdatedAt 
      ? Math.floor((Date.now() - dataUpdatedAt) / 1000)
      : null;

    return {
      eta,
      isLoading,
      isError,
      isFetching,
      secondsSinceUpdate,
      lastUpdated: dataUpdatedAt,
      refetch,
      isRealMode: true,
      confidencePct: data?.confidence_pct,
      baselineMaeMin: data?.baseline_mae_min,
    };
  } else {
    const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = mockQuery;
    
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
      isRealMode: false,
    };
  }
}

function calculatePredictedArrival(delayMin: number): string {
  const now = new Date();
  const scheduledArrival = new Date(now);
  scheduledArrival.setHours(11, 25, 0, 0); // Base scheduled arrival
  scheduledArrival.setMinutes(scheduledArrival.getMinutes() + delayMin);
  return scheduledArrival.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' });
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