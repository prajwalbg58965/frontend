import { apiClient } from '../client';
import type { LivePositionsResponse } from '../../types/domain';
import { ENDPOINTS, type LivePositionsParams } from '../contracts';

export const positionsService = {
  getLivePositions: (params: LivePositionsParams = { trainId: '12841' }) =>
    apiClient.get<LivePositionsResponse>(ENDPOINTS.livePositions, params),
};