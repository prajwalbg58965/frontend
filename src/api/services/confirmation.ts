import { apiClient } from '../client';
import type { ConfirmationLogResponse } from '../../types/domain';
import { ENDPOINTS, type ConfirmationLogParams } from '../contracts';

export const confirmationService = {
  getConfirmationLog: (params: ConfirmationLogParams = { routeId: 'hwh-kgp' }) =>
    apiClient.get<ConfirmationLogResponse>(ENDPOINTS.confirmationLog, params),
};