import { apiClient } from '../client';
import type { RiskScoreResponse } from '../../types/domain';
import { ENDPOINTS, type RiskScoreParams } from '../contracts';

export const riskService = {
  getRiskScore: (params: RiskScoreParams = { routeId: 'hwh-kgp' }) =>
    apiClient.get<RiskScoreResponse>(ENDPOINTS.riskScore, params),
};