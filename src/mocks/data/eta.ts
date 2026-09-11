import type { ETAPrediction, JunctionInfo } from '../../types/domain';
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

export function generateETAPrediction(trainId = '12841'): ETAPrediction {
  const override = getETAOverride();
  return buildETA(override);
}

export const etaMock: ETAPrediction = buildETA();