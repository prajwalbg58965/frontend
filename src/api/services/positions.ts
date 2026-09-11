import { positionApiClient } from '../client';
import type { LivePositionsResponse, CoachPosition, ApiResult } from '../../types/domain';
import { type LivePositionsParams } from '../contracts';
import { getLivePositionsOverride } from '../../demo/demoDataBridge';

export interface P2PositionResponse {
  coach_id: string;
  lat: number;
  long: number;
  speed?: number | null;
  calculated_speed?: number | null;
  timestamp: string;
  matched_lat?: number | null;
  matched_long?: number | null;
  match_distance_meters?: number | null;
  route_segment_id?: string | null;
  matched?: boolean | null;
}

export const positionsService = {
  getLivePositions: async (params: LivePositionsParams = { trainId: '12841' }): Promise<ApiResult<LivePositionsResponse>> => {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    if (!isDemoMode) {
      const res = await positionApiClient.get<P2PositionResponse[]>('/api/v1/live-positions');
      if (res.success) {
        const coaches: CoachPosition[] = res.data.map(p => ({
          coachId: p.coach_id,
          coordinates: {
            latitude: p.lat,
            longitude: p.long,
          },
          speedKmh: p.speed ?? p.calculated_speed ?? 0,
          headingDegrees: 90,
          timestamp: p.timestamp,
          status: (p.speed ?? p.calculated_speed ?? 0) > 0 ? 'MOVING' : 'STOPPED',
        }));

        return {
          success: true,
          data: {
            trainId: String(params.trainId || '12841'),
            coaches,
            timestamp: new Date().toISOString(),
          },
        };
      }
      return res;
    }

    const demoPos = getLivePositionsOverride() || { progress: 0.15, speed: 85 };
    const coaches: CoachPosition[] = [
      {
        coachId: 'B1',
        coordinates: { latitude: 20.2961 + demoPos.progress * 0.1, longitude: 85.8245 + demoPos.progress * 0.1 },
        speedKmh: demoPos.speed,
        headingDegrees: 90,
        timestamp: new Date().toISOString(),
        status: demoPos.speed > 0 ? 'MOVING' : 'STOPPED',
      },
    ];

    return {
      success: true,
      data: {
        trainId: String(params.trainId || '12841'),
        coaches,
        timestamp: new Date().toISOString(),
      },
    };
  },
};