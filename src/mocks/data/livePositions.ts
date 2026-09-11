import type { LivePositionsResponse, CoachPosition } from '../../types/domain';
import { getLivePositionsOverride } from '../../demo/demoDataBridge';

const routeCoordinates: [number, number][] = [
  [88.2636, 22.5726],
  [87.8500, 22.3500],
  [87.4500, 22.1000],
  [87.0500, 21.8500],
  [86.9500, 21.5000],
  [86.8500, 21.1500],
  [87.1000, 20.8000],
  [87.3000, 20.4500],
  [87.5000, 20.1000],
  [87.6500, 19.7500],
  [87.8000, 19.4000],
  [87.9500, 19.0500],
];

function calculateSegmentLengths(coords: [number, number][]): number[] {
  const lengths: number[] = [];
  for (let i = 0; i < coords.length - 1; i++) {
    const [lng1, lat1] = coords[i];
    const [lng2, lat2] = coords[i + 1];
    const dx = lng2 - lng1;
    const dy = lat2 - lat1;
    lengths.push(Math.sqrt(dx * dx + dy * dy));
  }
  return lengths;
}

const segmentLengths = calculateSegmentLengths(routeCoordinates);
const totalLength = segmentLengths.reduce((a, b) => a + b, 0);

function interpolateAlongRoute(progress: number): { latitude: number; longitude: number; heading: number } {
  const targetLength = progress * totalLength;
  let accumulated = 0;
  
  for (let i = 0; i < segmentLengths.length; i++) {
    const nextAccumulated = accumulated + segmentLengths[i];
    if (targetLength <= nextAccumulated || i === segmentLengths.length - 1) {
      const segmentProgress = segmentLengths[i] > 0 ? (targetLength - accumulated) / segmentLengths[i] : 0;
      const [lng1, lat1] = routeCoordinates[i];
      const [lng2, lat2] = routeCoordinates[Math.min(i + 1, routeCoordinates.length - 1)];
      
      const lat = lat1 + (lat2 - lat1) * segmentProgress;
      const lng = lng1 + (lng2 - lng1) * segmentProgress;
      
      const heading = Math.atan2(lng2 - lng1, lat2 - lat1) * 180 / Math.PI;
      const normalizedHeading = heading < 0 ? heading + 360 : heading;
      
      return { latitude: lat, longitude: lng, heading: normalizedHeading };
    }
    accumulated = nextAccumulated;
  }
  
  const [lastLng, lastLat] = routeCoordinates[routeCoordinates.length - 1];
  return { latitude: lastLat, longitude: lastLng, heading: 180 };
}

const coachConfigs = [
  { coachId: 'ENGINE', offset: 0, baseSpeed: 85 },
  { coachId: 'B1', offset: 0.008, baseSpeed: 85 },
  { coachId: 'B2', offset: 0.016, baseSpeed: 85 },
  { coachId: 'B3', offset: 0.024, baseSpeed: 85 },
  { coachId: 'S1', offset: 0.032, baseSpeed: 85 },
  { coachId: 'S2', offset: 0.04, baseSpeed: 85 },
  { coachId: 'GUARD', offset: 0.048, baseSpeed: 85 },
];

let positionOffset = 0;

function getDeterministicPosition(progress: number, speed: number): LivePositionsResponse {
  const coaches: CoachPosition[] = coachConfigs.map(config => {
    const coachProgress = (progress + config.offset) % 1;
    const pos = interpolateAlongRoute(coachProgress);
    
    return {
      coachId: config.coachId,
      coordinates: { latitude: pos.latitude, longitude: pos.longitude },
      speedKmh: Math.max(10, speed),
      headingDegrees: pos.heading,
      timestamp: new Date().toISOString(),
      status: speed > 0 ? 'MOVING' as const : 'STOPPED' as const,
    };
  });
  
  return {
    trainId: '12841',
    coaches,
    timestamp: new Date().toISOString(),
  };
}

export function generateLivePositions(trainId = '12841'): LivePositionsResponse {
  const override = getLivePositionsOverride();
  if (override) {
    return getDeterministicPosition(override.progress, override.speed);
  }
  
  const now = new Date();
  const progress = (positionOffset % 2000) / 2000;
  
  const coaches: CoachPosition[] = coachConfigs.map(config => {
    const coachProgress = (progress + config.offset) % 1;
    const pos = interpolateAlongRoute(coachProgress);
    // Use a fixed variation based on positionOffset instead of Date.now() for determinism
    const speedVariation = Math.sin(positionOffset * 0.1 + config.offset * 100) * 8;
    
    return {
      coachId: config.coachId,
      coordinates: { latitude: pos.latitude, longitude: pos.longitude },
      speedKmh: Math.max(10, config.baseSpeed + speedVariation),
      headingDegrees: pos.heading,
      timestamp: now.toISOString(),
      status: 'MOVING' as const,
    };
  });
  
  positionOffset += 1;
  
  return {
    trainId,
    coaches,
    timestamp: now.toISOString(),
  };
}

export const livePositionsMock: LivePositionsResponse = generateLivePositions();