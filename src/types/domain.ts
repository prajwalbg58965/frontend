export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface CoachPosition {
  readonly coachId: string;
  readonly coordinates: Coordinates;
  readonly speedKmh: number;
  readonly headingDegrees: number;
  readonly timestamp: string;
  readonly status: 'MOVING' | 'STOPPED' | 'UNKNOWN';
}

export interface LivePositionsResponse {
  readonly trainId: string;
  readonly coaches: readonly CoachPosition[];
  readonly timestamp: string;
}

export interface JunctionInfo {
  readonly junctionId: string;
  readonly name: string;
  readonly coordinates: Coordinates;
  readonly scheduledArrival: string;
  readonly scheduledDeparture: string;
}

export interface ETAPrediction {
  readonly trainId: string;
  readonly predictedArrival: string;
  readonly delayMinutes: number;
  readonly liveDelayMinutes?: number;
  readonly confidenceRange: {
    readonly earliest: string;
    readonly latest: string;
  };
  readonly confidenceLowMin?: number;
  readonly confidenceHighMin?: number;
  readonly confidencePct?: number;
  readonly baselineMaeMin?: number;
  readonly nextJunction?: JunctionInfo;
  readonly upcomingJunctions: readonly JunctionInfo[];
  readonly timestamp: string;
}

export interface RiskSegment {
  readonly segmentId: string;
  readonly name: string;
  readonly startCoordinates: Coordinates;
  readonly endCoordinates: Coordinates;
  readonly riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly floodDepthMm?: number;
  readonly weatherAlert?: string;
  readonly lastUpdated: string;
}

export interface RiskScoreResponse {
  readonly routeId: string;
  readonly overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly segments: readonly RiskSegment[];
  readonly timestamp: string;
}

export interface ConfirmationEvent {
  readonly eventId: string;
  readonly location: string;
  readonly junctionId?: string;
  readonly status: 'CLEAR' | 'CAUTION' | 'BLOCKED' | 'RESTRICTED';
  readonly details?: string;
  readonly timestamp: string;
  readonly confirmedBy: 'AUTO' | 'MANUAL' | 'STATION_MASTER';
}

export interface ConfirmationLogResponse {
  readonly events: readonly ConfirmationEvent[];
  readonly lastUpdated: string;
}

export type IncidentType =
  | 'TRACK_INUNDATION'
  | 'DERAILMENT_RISK'
  | 'SIGNAL_FAILURE'
  | 'FIRE'
  | 'COLLISION'
  | 'MEDICAL_EMERGENCY'
  | 'UNKNOWN';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IncidentAlert {
  readonly incidentId: string;
  readonly type: IncidentType;
  readonly coachId: string;
  readonly coordinates: Coordinates;
  readonly severity: IncidentSeverity;
  readonly passengerEstimate: number;
  readonly description: string;
  readonly timestamp: string;
  readonly acknowledged: boolean;
  readonly acknowledgedAt?: string;
  readonly acknowledgedBy?: string;
}

export interface IncidentAlertsResponse {
  readonly incidents: readonly IncidentAlert[];
  readonly timestamp: string;
}

export interface Responder {
  readonly responderId: string;
  readonly name: string;
  readonly type: 'HOSPITAL' | 'NDRF' | 'FIRE' | 'POLICE' | 'AMBULANCE';
  readonly coordinates: Coordinates;
  readonly contact?: string;
  readonly capabilities: readonly string[];
  readonly distanceKm?: number;
}

export interface ResponderLookupResponse {
  readonly responders: readonly Responder[];
  readonly incidentCoordinates: Coordinates;
  readonly timestamp: string;
  readonly disclaimer: string;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly status: number;
  readonly timestamp: string;
}

export type ApiResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: ApiError };