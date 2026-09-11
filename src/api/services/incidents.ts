import { incidentApiClient, apiClient } from '../client';
import type { IncidentAlertsResponse, IncidentAlert, ApiResult } from '../../types/domain';
import { type IncidentAlertsParams } from '../contracts';

export interface P3AlertItem {
  id: string;
  condition_id: string;
  layer: number | string;
  description: string;
  status: string;
  detected_at: number;
  acknowledged_by?: string | null;
  acknowledged_at?: number | null;
}

export interface P3EscalationStatusResponse {
  escalation_timeout: number;
  escalated_alerts: P3AlertItem[];
}

export const incidentsService = {
  getIncidentAlerts: async (params: IncidentAlertsParams = { routeId: 'hwh-kgp', activeOnly: true }): Promise<ApiResult<IncidentAlertsResponse>> => {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    if (!isDemoMode) {
      const res = await incidentApiClient.get<P3EscalationStatusResponse>('/api/escalation_status');
      if (res.success) {
        const incidents: IncidentAlert[] = (res.data.escalated_alerts || []).map(a => {
          const coachMatch = a.condition_id.match(/coach_([A-Z0-9]+)/i) || a.condition_id.match(/([B|S][0-9]+)/i);
          const coachId = coachMatch ? coachMatch[1].toUpperCase() : 'B1';

          return {
            incidentId: a.id,
            type: a.description.toLowerCase().includes('signal') ? 'SIGNAL_FAILURE' : 'DERAILMENT_RISK',
            coachId,
            coordinates: { latitude: 20.3, longitude: 85.8 },
            severity: 'CRITICAL',
            passengerEstimate: 72,
            description: a.description,
            timestamp: new Date(a.detected_at * 1000).toISOString(),
            acknowledged: a.status === 'Acknowledged',
            acknowledgedAt: a.acknowledged_at ? new Date(a.acknowledged_at * 1000).toISOString() : undefined,
            acknowledgedBy: a.acknowledged_by || undefined,
          };
        });

        return {
          success: true,
          data: {
            incidents,
            timestamp: new Date().toISOString(),
          },
        };
      }
      return res;
    }

    return apiClient.get<IncidentAlertsResponse>('/api/incident-alerts', params);
  },

  acknowledgeIncident: async (incidentId: string): Promise<ApiResult<{ success: boolean; incidentId: string; acknowledgedAt: string }>> => {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    if (!isDemoMode) {
      const res = await incidentApiClient.post<{ status: string; message: string }>(`/api/acknowledge_alert/${incidentId}`);
      if (res.success) {
        return {
          success: true,
          data: {
            success: true,
            incidentId,
            acknowledgedAt: new Date().toISOString(),
          },
        };
      }
      return res;
    }

    return apiClient.post<{ success: boolean; incidentId: string; acknowledgedAt: string }>(
      `/api/incident-alerts/${incidentId}/acknowledge`,
      {}
    );
  },
};