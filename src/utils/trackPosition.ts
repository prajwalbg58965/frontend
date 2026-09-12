import { lineString, point } from '@turf/helpers';
import lineSlice from '@turf/line-slice';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import length from '@turf/length';
import along from '@turf/along';
import bearing from '@turf/bearing';
import distance from '@turf/distance';
import type { RouteData, StationStop } from '../hooks/useRoute';

export interface CalculatedPosition {
  latitude: number;
  longitude: number;
  bearingDegrees: number;
  distanceFromTrackMeters: number;
  isValid: boolean;
}

/**
 * Calculates the exact train position on the actual route geometry.
 *
 * @param route The complete RouteData containing geojson and stops
 * @param sequence The current stop sequence
 * @param segmentProgress Float between 0.0 and 1.0 representing progress to the next stop
 * @param isHalt Boolean indicating if the train is currently stopped
 * @returns CalculatedPosition
 */
export function calculateTrackPosition(
  route: RouteData,
  sequence: number,
  segmentProgress: number,
  isHalt: boolean
): CalculatedPosition | null {
  if (!route || !route.geojson || !route.geojson.features || route.geojson.features.length === 0) {
    return null;
  }

  // Handle stops edge-cases
  if (route.stops.length === 0) return null;

  // Find current and next stop based on sequence
  let currentStop = route.stops.find((s: StationStop) => s.sequence === sequence);
  let nextStop = route.stops.find((s: StationStop) => s.sequence === sequence + 1);

  // Fallbacks if sequence is out of bounds
  if (!currentStop) {
    if (sequence < route.stops[0].sequence) currentStop = route.stops[0];
    else currentStop = route.stops[route.stops.length - 1];
  }
  if (!nextStop) {
    nextStop = currentStop;
  }

  // If train is halted or segmentProgress is exactly boundary, just return the station
  if (isHalt || segmentProgress <= 0 || nextStop.sequence === currentStop.sequence) {
    return {
      latitude: currentStop.lat,
      longitude: currentStop.lng,
      bearingDegrees: 0,
      distanceFromTrackMeters: 0,
      isValid: true,
    };
  }

  if (segmentProgress >= 1) {
    return {
      latitude: nextStop.lat,
      longitude: nextStop.lng,
      bearingDegrees: 0,
      distanceFromTrackMeters: 0,
      isValid: true,
    };
  }

  // We are between currentStop and nextStop.
  // We need to slice the LineString geometry.
  // Note: RailRadar geojson returns a single LineString feature.
  const feature = route.geojson.features.find((f: any) => f.geometry.type === 'LineString') || route.geojson.features[0];
  if (!feature || feature.geometry.type !== 'LineString') {
    return null;
  }

  const line = lineString(feature.geometry.coordinates as [number, number][]);

  // Turf uses [longitude, latitude]
  const currentPt = point([currentStop.lng, currentStop.lat]);
  const nextPt = point([nextStop.lng, nextStop.lat]);

  // Snap the station coordinates to the nearest point on the actual route
  const snappedCurrent = nearestPointOnLine(line, currentPt);
  const snappedNext = nearestPointOnLine(line, nextPt);

  // Slice the geometry between the two snapped points
  let segmentLine;
  try {
    segmentLine = lineSlice(snappedCurrent, snappedNext, line);
  } catch (err) {
    console.error('Failed to slice line:', err);
    return null;
  }

  const segmentLength = length(segmentLine, { units: 'meters' });
  const targetDistance = segmentLength * segmentProgress;

  // Interpolate along the sliced segment
  const calculatedPoint = along(segmentLine, targetDistance, { units: 'meters' });
  const calculatedLng = calculatedPoint.geometry.coordinates[0];
  const calculatedLat = calculatedPoint.geometry.coordinates[1];

  // Calculate bearing slightly ahead
  let calcBearing = 0;
  if (targetDistance + 10 < segmentLength) {
    const nextPointForBearing = along(segmentLine, targetDistance + 10, { units: 'meters' });
    calcBearing = bearing(calculatedPoint, nextPointForBearing);
  } else if (targetDistance - 10 > 0) {
    const prevPointForBearing = along(segmentLine, targetDistance - 10, { units: 'meters' });
    calcBearing = bearing(prevPointForBearing, calculatedPoint);
  } else {
    calcBearing = bearing(snappedCurrent, snappedNext);
  }

  // Validation: check distance to actual track
  const nearestToCalc = nearestPointOnLine(line, calculatedPoint);
  const distFromTrack = distance(calculatedPoint, nearestToCalc, { units: 'meters' });

  return {
    latitude: calculatedLat,
    longitude: calculatedLng,
    bearingDegrees: calcBearing,
    distanceFromTrackMeters: distFromTrack,
    isValid: distFromTrack < 100, // True if within 100 meters
  };
}
