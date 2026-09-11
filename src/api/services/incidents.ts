import { apiClient } from '../client';
import type { IncidentAlertsResponse, IncidentAlert } from '../../types/domain';
import { ENDPOINTS, type IncidentAlertsParams } from '../contracts';

export const incidentsService = {
  getIncidentAlerts: (params: IncidentAlertsParams = { routeId: 'hwh-kgp', activeOnly: true }) =>
    apiClient.get<IncidentAlertsResponse>(ENDPOINTS.incidentAlerts, params),

  acknowledgeIncident: (incidentId: string) =>
    apiClient.post<{ success: boolean; incidentId: string; acknowledgedAt: string }>(
      `${ENDPOINTS.incidentAlerts}/${incidentId}/acknowledge`,
      {}
    ),
};