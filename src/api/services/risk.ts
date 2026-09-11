import { riskApiClient, apiClient } from '../client';
import type { RiskScoreResponse, RiskSegment, ApiResult } from '../../types/domain';
import { type RiskScoreParams } from '../contracts';

export interface P2RiskScoreResponse {
  segment_id: string;
  risk_level: 'none' | 'low' | 'moderate' | 'severe';
  source: string;
  last_updated: string;
}

export const riskService = {
  getRiskScore: async (params: RiskScoreParams = { routeId: 'hwh-kgp' }): Promise<ApiResult<RiskScoreResponse>> => {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    if (!isDemoMode) {
      const segmentId = String(params.routeId || 'hwh-kgp');
      const res = await riskApiClient.get<P2RiskScoreResponse>('/api/v1/risk-score', { segment_id: segmentId });
      if (res.success) {
        const p2Level = res.data.risk_level;
        let overallLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        if (p2Level === 'moderate') overallLevel = 'MEDIUM';
        if (p2Level === 'severe') overallLevel = 'CRITICAL';

        const segment: RiskSegment = {
          segmentId: res.data.segment_id,
          name: res.data.segment_id,
          startCoordinates: { latitude: 20.3, longitude: 85.8 },
          endCoordinates: { latitude: 20.4, longitude: 85.9 },
          riskLevel: overallLevel,
          weatherAlert: res.data.source ? `Source: ${res.data.source}` : undefined,
          lastUpdated: res.data.last_updated,
        };

        return {
          success: true,
          data: {
            routeId: segmentId,
            overallRiskLevel: overallLevel,
            segments: [segment],
            timestamp: new Date().toISOString(),
          },
        };
      }
      return res;
    }

    return apiClient.get<RiskScoreResponse>('/api/risk-score', params);
  },
};