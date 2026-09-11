import { apiClient } from '../client';
import type { ETAPrediction, ETAPredictResponse } from '../../types/domain';
import { ENDPOINTS, type PredictEtaParams, type PredictEtaRealParams } from '../contracts';

export const etaService = {
  predictEta: (params: PredictEtaParams = { trainId: '12841' }) =>
    apiClient.get<ETAPrediction>(ENDPOINTS.predictEta, params),

  predictEtaReal: (params: PredictEtaRealParams) =>
    apiClient.post<ETAPredictResponse>(ENDPOINTS.predictEtaReal, params, true),
};