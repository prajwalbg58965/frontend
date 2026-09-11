import { apiClient } from '../client';
import type { ETAPrediction } from '../../types/domain';
import { ENDPOINTS, type PredictEtaParams } from '../contracts';

export const etaService = {
  predictEta: (params: PredictEtaParams = { trainId: '12841' }) =>
    apiClient.get<ETAPrediction>(ENDPOINTS.predictEta, params),
};