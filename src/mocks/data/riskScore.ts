import type { RiskScoreResponse, RiskSegment } from '../../types/domain';
import { getRiskOverride } from '../../demo/demoDataBridge';

const segments: readonly RiskSegment[] = [
  {
    segmentId: 'seg-hwh-bhc',
    name: 'Howrah → Bhadrak',
    startCoordinates: { latitude: 22.5726, longitude: 88.2636 },
    endCoordinates: { latitude: 21.0700, longitude: 86.7200 },
    riskLevel: 'LOW',
    floodDepthMm: 0,
    weatherAlert: undefined,
    lastUpdated: new Date().toISOString(),
  },
  {
    segmentId: 'seg-bhc-bls',
    name: 'Bhadrak → Balasore',
    startCoordinates: { latitude: 21.0700, longitude: 86.7200 },
    endCoordinates: { latitude: 21.4900, longitude: 86.9300 },
    riskLevel: 'LOW',
    floodDepthMm: 15,
    weatherAlert: 'Light rain expected',
    lastUpdated: new Date().toISOString(),
  },
  {
    segmentId: 'seg-bls-jrl',
    name: 'Balasore → Jaleswar',
    startCoordinates: { latitude: 21.4900, longitude: 86.9300 },
    endCoordinates: { latitude: 21.8200, longitude: 87.2200 },
    riskLevel: 'MEDIUM',
    floodDepthMm: 120,
    weatherAlert: 'Heavy rainfall warning - water level rising',
    lastUpdated: new Date().toISOString(),
  },
  {
    segmentId: 'seg-jrl-kgp',
    name: 'Jaleswar → Kharagpur',
    startCoordinates: { latitude: 21.8200, longitude: 87.2200 },
    endCoordinates: { latitude: 22.3500, longitude: 87.3300 },
    riskLevel: 'LOW',
    floodDepthMm: 0,
    weatherAlert: undefined,
    lastUpdated: new Date().toISOString(),
  },
];

function getOverallRisk(segments: readonly RiskSegment[]): RiskScoreResponse['overallRiskLevel'] {
  const levels = segments.map(s => s.riskLevel);
  if (levels.includes('CRITICAL')) return 'CRITICAL';
  if (levels.includes('HIGH')) return 'HIGH';
  if (levels.includes('MEDIUM')) return 'MEDIUM';
  return 'LOW';
}

let riskCallCount = 0;

function buildRiskScore(override?: { level: string; segments: any[] } | null): RiskScoreResponse {
  const now = new Date();
  
  if (override) {
    const dynamicSegments = override.segments.map((seg: any) => ({
      ...seg,
      lastUpdated: now.toISOString(),
    }));
    
    return {
      routeId: 'hwh-kgp',
      overallRiskLevel: override.level as RiskScoreResponse['overallRiskLevel'],
      segments: dynamicSegments,
      timestamp: now.toISOString(),
    };
  }
  
  const dynamicSegments = segments.map(segment => {
    if (segment.segmentId === 'seg-bls-jrl') {
      const cycle = Math.sin(riskCallCount * 0.2);
      if (cycle > 0.7) {
        return {
          ...segment,
          riskLevel: 'HIGH' as const,
          floodDepthMm: 280 + Math.round(25), // deterministic: use fixed value instead of random
          weatherAlert: 'Flash flood warning - track inundation imminent',
          lastUpdated: now.toISOString(),
        };
      }
      if (cycle > 0.3) {
        return {
          ...segment,
          riskLevel: 'MEDIUM' as const,
          floodDepthMm: 120 + Math.round(15), // deterministic: use fixed value instead of random
          weatherAlert: 'Heavy rainfall warning - water level rising',
          lastUpdated: now.toISOString(),
        };
      }
    }
    return { ...segment, lastUpdated: now.toISOString() };
  });
  
  riskCallCount += 1;
  
  return {
    routeId: 'hwh-kgp',
    overallRiskLevel: getOverallRisk(dynamicSegments),
    segments: dynamicSegments,
    timestamp: now.toISOString(),
  };
}

export function generateRiskScore(routeId = 'hwh-kgp'): RiskScoreResponse {
  const override = getRiskOverride();
  return buildRiskScore(override);
}

export const riskScoreMock: RiskScoreResponse = buildRiskScore();