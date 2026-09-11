import { describe, it, expect } from 'vitest';
import { calculateDistanceKm, formatTimeString, getMinutesDifference } from './geo';

describe('geo utils', () => {
  it('calculates Haversine distance between two coordinates correctly', () => {
    // New Delhi (28.6139, 77.2090) to Agra (27.1767, 78.0081) approx 180 km
    const delhi = { latitude: 28.6139, longitude: 77.209 };
    const agra = { latitude: 27.1767, longitude: 78.0081 };

    const distance = calculateDistanceKm(delhi, agra);
    expect(distance).toBeGreaterThan(170);
    expect(distance).toBeLessThan(190);
  });

  it('returns 0 km for identical coordinates', () => {
    const coord = { latitude: 20.2961, longitude: 85.8245 };
    expect(calculateDistanceKm(coord, coord)).toBe(0);
  });

  it('formats timestamp correctly', () => {
    const isoString = '2026-09-11T10:42:00.000Z';
    const formatted = formatTimeString(isoString);
    expect(formatted).not.toBe('Invalid Time');
  });

  it('calculates minute differences accurately', () => {
    const t1 = '2026-09-11T10:00:00.000Z';
    const t2 = '2026-09-11T10:15:00.000Z';
    expect(getMinutesDifference(t1, t2)).toBe(15);
  });
});
