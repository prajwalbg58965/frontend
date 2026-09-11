import type { Responder, ResponderLookupResponse, Coordinates } from '../../types/domain';

const staticResponders: readonly Responder[] = [
  {
    responderId: 'resp-1',
    name: 'Balasore District Hospital',
    type: 'HOSPITAL',
    coordinates: { latitude: 21.5000, longitude: 86.9500 },
    contact: '+91-6782-262xxx',
    capabilities: ['Trauma', 'Emergency Medicine', 'Burn Unit', 'ICU'],
  },
  {
    responderId: 'resp-2',
    name: 'NDRF 2nd Battalion, Balasore',
    type: 'NDRF',
    coordinates: { latitude: 21.4800, longitude: 86.9200 },
    contact: '+91-6782-275xxx',
    capabilities: ['Urban Search & Rescue', 'Medical First Response', 'CBRN', 'Rope Rescue'],
  },
  {
    responderId: 'resp-3',
    name: 'Kharagpur Railway Hospital',
    type: 'HOSPITAL',
    coordinates: { latitude: 22.3400, longitude: 87.3100 },
    contact: '+91-3222-255xxx',
    capabilities: ['Orthopedics', 'General Surgery', 'ICU', 'Blood Bank'],
  },
  {
    responderId: 'resp-4',
    name: 'NDRF 1st Battalion, Guwahati (Reserve)',
    type: 'NDRF',
    coordinates: { latitude: 26.1445, longitude: 91.7362 },
    contact: '+91-361-284xxxx',
    capabilities: ['Flood Rescue', 'Rope Rescue', 'Mass Casualty Management', 'Helicopter Ops'],
  },
];

function haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371;
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.latitude)) * Math.cos(toRad(coord2.latitude)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function generateResponderLookup(
  coordinates: Coordinates,
  radiusKm = 100
): ResponderLookupResponse {
  const respondersWithDistance = staticResponders
    .map(r => ({
      ...r,
      distanceKm: Math.round(haversineDistance(coordinates, r.coordinates) * 10) / 10,
    }))
    .filter(r => r.distanceKm !== undefined && r.distanceKm <= radiusKm)
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

  return {
    responders: respondersWithDistance,
    incidentCoordinates: coordinates,
    timestamp: new Date().toISOString(),
    disclaimer: 'Static responder reference — demo data only. Not a live emergency services integration.',
  };
}

export const respondersMock = staticResponders;