import { riskApiClient } from '../client';
import type { RiskScoreResponse, RiskSegment, ApiResult } from '../../types/domain';
import { type RiskScoreParams } from '../contracts';
import { getRiskOverride } from '../../demo/demoDataBridge';

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
      let segmentId = (params.routeId && params.routeId !== 'hwh-kgp') ? String(params.routeId) : 'SEG_01';
      let res = await riskApiClient.get<P2RiskScoreResponse>('/api/v1/risk-score', { segment_id: segmentId });

      if (!res.success && segmentId !== 'SEG_01') {
        segmentId = 'SEG_01';
        res = await riskApiClient.get<P2RiskScoreResponse>('/api/v1/risk-score', { segment_id: segmentId });
      }

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

    const demoRisk = getRiskOverride() || { level: 'LOW', segments: [] };
    const levelMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
      CRITICAL: 'CRITICAL',
    };
    const overallLevel = levelMap[demoRisk.level] || 'LOW';

    return {
      success: true,
      data: {
        routeId: String(params.routeId || 'hwh-kgp'),
        overallRiskLevel: overallLevel,
        segments: demoRisk.segments || [],
        timestamp: new Date().toISOString(),
      },
    };
  },
};