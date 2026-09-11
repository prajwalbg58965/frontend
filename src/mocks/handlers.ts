import { http, HttpResponse } from 'msw';
import {
  generateLivePositions,
  generateETAPrediction,
  generateRiskScore,
  generateConfirmationLog,
  generateIncidentAlerts,
  triggerMockIncident,
  generateResponderLookup,
} from './data';
import type { LivePositionsParams, PredictEtaParams, RiskScoreParams, ConfirmationLogParams, IncidentAlertsParams, ResponderLookupParams } from '../api/contracts';

export const handlers = [
  http.get('/api/live-positions', ({ request }) => {
    const url = new URL(request.url);
    const trainId = url.searchParams.get('trainId') || '12841';
    const data = generateLivePositions(trainId);
    return HttpResponse.json(data);
  }),

  // Mock ETA API (GET) - for demo/mock mode
  http.get('/api/predict-eta', ({ request }) => {
    const url = new URL(request.url);
    const trainId = url.searchParams.get('trainId') || '12841';
    const data = generateETAPrediction(trainId);
    return HttpResponse.json(data);
  }),

  http.get('/api/risk-score', ({ request }) => {
    const url = new URL(request.url);
    const routeId = url.searchParams.get('routeId') || 'hwh-kgp';
    const data = generateRiskScore(routeId);
    return HttpResponse.json(data);
  }),

  http.get('/api/confirmation-log', ({ request }) => {
    const url = new URL(request.url);
    const routeId = url.searchParams.get('routeId') || 'hwh-kgp';
    const data = generateConfirmationLog(routeId);
    return HttpResponse.json(data);
  }),

  http.get('/api/incident-alerts', ({ request }) => {
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('activeOnly') !== 'false';
    const data = generateIncidentAlerts();
    if (activeOnly) {
      return HttpResponse.json({
        ...data,
        incidents: data.incidents.filter(i => !i.acknowledged),
      });
    }
    return HttpResponse.json(data);
  }),

  http.get('/api/nearest-responders', ({ request }) => {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '21.4950');
    const lng = parseFloat(url.searchParams.get('lng') || '86.9400');
    const radiusKm = parseFloat(url.searchParams.get('radiusKm') || '100');
    const data = generateResponderLookup({ latitude: lat, longitude: lng }, radiusKm);
    return HttpResponse.json(data);
  }),

  http.post('/api/incident-alerts/:incidentId/acknowledge', ({ params }) => {
    const { incidentId } = params;
    return HttpResponse.json({ success: true, incidentId, acknowledgedAt: new Date().toISOString() });
  }),
];