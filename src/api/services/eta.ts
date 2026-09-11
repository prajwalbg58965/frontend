import { etaApiClient, apiClient } from '../client';
import type { ETAPrediction, ApiResult } from '../../types/domain';
import { type PredictEtaParams } from '../contracts';

export interface P1ETARequest {
  train_number: string;
  current_station: string;
  next_station: string;
  current_delay_min: number;
  distance_to_next_km: number;
  historical_section_avg_delay: number;
  section_historical_median_delay: number;
  section_historical_std_delay: number;
  section_historical_count: number;
  train_historical_avg_delay: number;
  day_of_week: number;
  time_of_day: number;
}

export interface P1ETAResponse {
  predicted_delay_min: number;
  confidence_low_min: number;
  confidence_high_min: number;
  confidence_pct: number;
  baseline_mae_min: number;
}

export const etaService = {
  predictEta: async (params: PredictEtaParams = { trainId: '12841' }): Promise<ApiResult<ETAPrediction>> => {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    if (!isDemoMode) {
      const p1Payload: P1ETARequest = {
        train_number: String(params.trainId || '12841'),
        current_station: (params.currentStation as string) || 'Howrah',
        next_station: (params.nextStation as string) || 'Kharagpur',
        current_delay_min: typeof params.currentDelay === 'number' ? params.currentDelay : 5.0,
        distance_to_next_km: typeof params.distanceToNext === 'number' ? params.distanceToNext : 42.5,
        historical_section_avg_delay: 15.0,
        section_historical_median_delay: 9.0,
        section_historical_std_delay: 13.4,
        section_historical_count: 120,
        train_historical_avg_delay: 26.0,
        day_of_week: new Date().getDay(),
        time_of_day: new Date().getHours() + new Date().getMinutes() / 60,
      };

      const res = await etaApiClient.post<P1ETAResponse>('/predict-eta/', p1Payload);
      if (res.success) {
        const d = res.data;
        const now = new Date();
        const arrivalTime = new Date(now.getTime() + d.predicted_delay_min * 60000);
        const arrivalStr = arrivalTime.toTimeString().slice(0, 5);

        return {
          success: true,
          data: {
            trainId: String(params.trainId || '12841'),
            predictedArrival: arrivalStr,
            delayMinutes: Math.round(d.predicted_delay_min * 10) / 10,
            confidenceRange: {
              earliest: `${Math.round(d.confidence_low_min)}m`,
              latest: `${Math.round(d.confidence_high_min)}m`,
            },
            confidenceLowMin: d.confidence_low_min,
            confidenceHighMin: d.confidence_high_min,
            confidencePct: d.confidence_pct,
            baselineMaeMin: d.baseline_mae_min,
            upcomingJunctions: [],
            timestamp: new Date().toISOString(),
          },
        };
      }
      return res;
    }

    return apiClient.get<ETAPrediction>('/api/predict-eta', params);
  },
};