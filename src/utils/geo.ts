import { Coordinates } from '../types/domain';

/**
 * Calculates the straight-line (great-circle) distance between two geographic coordinates
 * using the Haversine formula.
 * Returns distance in kilometers, rounded to 1 decimal place.
 */
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const EARTH_RADIUS_KM = 6371;

  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const lat1Rad = toRadians(coord1.latitude);
  const lat2Rad = toRadians(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_KM * c;
  return Math.round(distance * 10) / 10;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats a ISO timestamp string or Date object into human-readable time (e.g. "10:42:15 AM")
 */
export function formatTimeString(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) {
    return 'Invalid Time';
  }
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Calculates time offset in minutes between two ISO timestamp strings
 */
export function getMinutesDifference(isoTime1: string, isoTime2: string): number {
  const t1 = new Date(isoTime1).getTime();
  const t2 = new Date(isoTime2).getTime();
  if (isNaN(t1) || isNaN(t2)) return 0;
  return Math.round((t2 - t1) / (1000 * 60));
}
