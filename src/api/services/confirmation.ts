import { confirmationApiClient } from '../client';
import type { ConfirmationLogResponse, ConfirmationEvent, ApiResult } from '../../types/domain';
import { type ConfirmationLogParams } from '../contracts';
import { getConfirmationOverride } from '../../demo/demoDataBridge';

export interface P3ConfirmationEscalationStatus {
  escalation_timeout: number;
  escalated_alerts: Array<{
    id: string;
    condition_id: string;
    layer: number | string;
    description: string;
    status: string;
    detected_at: number;
  }>;
}

export const confirmationService = {
  getConfirmationLog: async (params: ConfirmationLogParams = { routeId: 'hwh-kgp' }): Promise<ApiResult<ConfirmationLogResponse>> => {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    if (!isDemoMode) {
      const res = await confirmationApiClient.get<P3ConfirmationEscalationStatus>('/api/escalation_status');
      if (res.success) {
        const events: ConfirmationEvent[] = (res.data.escalated_alerts || []).map(a => ({
          eventId: a.id,
          location: a.condition_id || 'Junction J1',
          status: a.status === 'Escalated' ? 'CAUTION' : 'CLEAR',
          details: a.description,
          timestamp: new Date(a.detected_at * 1000).toISOString(),
          confirmedBy: 'STATION_MASTER',
        }));

        if (events.length === 0) {
          events.push({
            eventId: 'CONF-001',
            location: 'SCADA Telemetry System',
            status: 'CLEAR',
            details: 'All relays, signals, and interlocks normal',
            timestamp: new Date().toISOString(),
            confirmedBy: 'AUTO',
          });
        }

        return {
          success: true,
          data: {
            events,
            lastUpdated: new Date().toISOString(),
          },
        };
      }
      return res;
    }

    const demoConf = getConfirmationOverride() || [{ location: 'Howrah Jn', status: 'CLEAR', time: '10:00' }];
    const events: ConfirmationEvent[] = demoConf.map((c, i) => ({
      eventId: `CONF-${i + 1}`,
      location: c.location,
      status: (c.status as any) || 'CLEAR',
      timestamp: c.time,
      confirmedBy: 'STATION_MASTER',
    }));

    return {
      success: true,
      data: {
        events,
        lastUpdated: new Date().toISOString(),
      },
    };
  },
};