import { useMemo } from 'react';
import { useIncidentAlertsStatus } from './useIncident';
import type { Responder, Coordinates } from '../types/domain';

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

export function useNearestResponder(activeIncident: { coordinates: Coordinates } | null) {
  const incidentCoordinates = activeIncident?.coordinates;

  const responderData = useMemo(() => {
    if (!incidentCoordinates) {
      return {
        nearestResponder: null,
        allResponders: staticResponders.map(r => ({ ...r, distanceKm: undefined })),
        incidentCoordinates: null,
        timestamp: new Date().toISOString(),
        disclaimer: 'Static responder reference — demo data only. Not a live emergency services integration.',
      };
    }

    const respondersWithDistance = staticResponders
      .map(r => ({
        ...r,
        distanceKm: Math.round(haversineDistance(incidentCoordinates, r.coordinates) * 10) / 10,
      }))
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

    const nearestResponder = respondersWithDistance[0] ?? null;

    return {
      nearestResponder,
      allResponders: respondersWithDistance,
      incidentCoordinates,
      timestamp: new Date().toISOString(),
      disclaimer: 'Static responder reference — demo data only. Not a live emergency services integration.',
    };
  }, [incidentCoordinates]);

  return responderData;
}

export function useResponderStatus() {
  const { activeIncident } = useIncidentAlertsStatus();
  const responderData = useNearestResponder(activeIncident);
  
  return {
    ...responderData,
    isLoading: false,
    isError: false,
  };
}