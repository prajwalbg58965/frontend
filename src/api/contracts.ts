import type {
  LivePositionsResponse,
  ETAPrediction,
  RiskScoreResponse,
  ConfirmationLogResponse,
  IncidentAlertsResponse,
  ResponderLookupResponse,
  ApiResult,
  Coordinates,
} from '../types/domain';

export interface PredictEtaParams {
  readonly trainId: string;
  readonly [key: string]: unknown;
}

export interface LivePositionsParams {
  readonly trainId: string;
  readonly [key: string]: unknown;
}

export interface RiskScoreParams {
  readonly routeId: string;
  readonly [key: string]: unknown;
}

export interface ConfirmationLogParams {
  readonly routeId?: string;
  readonly since?: string;
  readonly [key: string]: unknown;
}

export interface IncidentAlertsParams {
  readonly routeId?: string;
  readonly activeOnly?: boolean;
  readonly [key: string]: unknown;
}

export interface ResponderLookupParams {
  readonly coordinates: Coordinates;
  readonly radiusKm?: number;
  readonly types?: readonly ('HOSPITAL' | 'NDRF' | 'FIRE' | 'POLICE' | 'AMBULANCE')[];
  readonly [key: string]: unknown;
}

export interface ApiContracts {
  predictEta: (params: PredictEtaParams) => Promise<ApiResult<ETAPrediction>>;
  getLivePositions: (params: LivePositionsParams) => Promise<ApiResult<LivePositionsResponse>>;
  getRiskScore: (params: RiskScoreParams) => Promise<ApiResult<RiskScoreResponse>>;
  getConfirmationLog: (params: ConfirmationLogParams) => Promise<ApiResult<ConfirmationLogResponse>>;
  getIncidentAlerts: (params: IncidentAlertsParams) => Promise<ApiResult<IncidentAlertsResponse>>;
  getNearestResponders: (params: ResponderLookupParams) => Promise<ApiResult<ResponderLookupResponse>>;
}

export const ENDPOINTS = {
  predictEta: '/api/predict-eta',
  livePositions: '/api/live-positions',
  riskScore: '/api/risk-score',
  confirmationLog: '/api/confirmation-log',
  incidentAlerts: '/api/incident-alerts',
  nearestResponders: '/api/nearest-responders',
} as const;

export function buildUrl(endpoint: string, params: Record<string, unknown>): string {
  const url = new URL(endpoint, import.meta.env.VITE_API_BASE_URL || '');
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}