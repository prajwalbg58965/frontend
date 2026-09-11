import type { ETAPrediction, ETAPredictResponse, JunctionInfo } from '../../types/domain';
import { getETAOverride } from '../../demo/demoDataBridge';

const upcomingJunctions: readonly JunctionInfo[] = [
  {
    junctionId: 'BLS',
    name: 'Balasore',
    coordinates: { latitude: 21.4900, longitude: 86.9300 },
    scheduledArrival: '11:25',
    scheduledDeparture: '11:27',
  },
  {
    junctionId: 'JRL',
    name: 'Jaleswar',
    coordinates: { latitude: 21.8200, longitude: 87.2200 },
    scheduledArrival: '11:55',
    scheduledDeparture: '11:57',
  },
  {
    junctionId: 'KGP',
    name: 'Kharagpur',
    coordinates: { latitude: 22.3500, longitude: 87.3300 },
    scheduledArrival: '12:45',
    scheduledDeparture: '12:55',
  },
];

let etaCallCount = 0;

function buildETA(override?: { predictedArrival: string; delay: number; confidence: [string, string] } | null): ETAPrediction {
  const now = new Date();
  
  if (override) {
    return {
      trainId: '12841',
      predictedArrival: override.predictedArrival,
      delayMinutes: override.delay,
      confidenceRange: {
        earliest: override.confidence[0],
        latest: override.confidence[1],
      },
      nextJunction: upcomingJunctions[0],
      upcomingJunctions,
      timestamp: now.toISOString(),
    };
  }
  
  const baseDelay = 0;
  const variation = Math.sin(etaCallCount * 0.3) * 5;
  const delayMinutes = Math.round(baseDelay + variation);

  const baseArrival = new Date(now);
  baseArrival.setHours(11, 25, 0, 0);
  baseArrival.setMinutes(baseArrival.getMinutes() + delayMinutes);

  const earliest = new Date(baseArrival);
  earliest.setMinutes(earliest.getMinutes() - 3);

  const latest = new Date(baseArrival);
  latest.setMinutes(latest.getMinutes() + 8);

  etaCallCount += 1;

  return {
    trainId: '12841',
    predictedArrival: baseArrival.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    delayMinutes,
    confidenceRange: {
      earliest: earliest.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      latest: latest.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    },
    nextJunction: upcomingJunctions[0],
    upcomingJunctions,
    timestamp: now.toISOString(),
  };
}

// Real API mock response generator
let realEtaCallCount = 0;

function buildETAPredictResponse(override?: { 
  predicted_delay_min: number; 
  confidence_low_min: number; 
  confidence_high_min: number; 
  confidence_pct: number;
  baseline_mae_min: number;
} | null): ETAPredictResponse {
  const now = new Date();
  
  if (override) {
    return {
      predicted_delay_min: override.predicted_delay_min,
      confidence_low_min: override.confidence_low_min,
      confidence_high_min: override.confidence_high_min,
      confidence_pct: override.confidence_pct,
      baseline_mae_min: override.baseline_mae_min,
    };
  }
  
  const baseDelay = 5.0;
  const variation = Math.sin(realEtaCallCount * 0.3) * 3;
  const predictedDelay = Math.round((baseDelay + variation) * 10) / 10;
  const confidenceLow = Math.round((predictedDelay - 3) * 10) / 10;
  const confidenceHigh = Math.round((predictedDelay + 5) * 10) / 10;
  
  realEtaCallCount += 1;
  
  return {
    predicted_delay_min: predictedDelay,
    confidence_low_min: confidenceLow,
    confidence_high_min: confidenceHigh,
    confidence_pct: 80,
    baseline_mae_min: 9.8544,
  };
}

export function generateETAPrediction(trainId = '12841'): ETAPrediction {
  const override = getETAOverride();
  return buildETA(override);
}

export function generateETAPredictResponse(): ETAPredictResponse {
  const override = getETAOverride();
  if (override) {
    // Convert demo override to real API format
    const delay = override.delay;
    return {
      predicted_delay_min: delay,
      confidence_low_min: delay - 3,
      confidence_high_min: delay + 5,
      confidence_pct: 80,
      baseline_mae_min: 9.8544,
    };
  }
  return buildETAPredictResponse();
}

export const etaMock: ETAPrediction = buildETA();
export const etaPredictMock: ETAPredictResponse = buildETAPredictResponse();