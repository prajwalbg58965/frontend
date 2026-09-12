import { useQuery } from '@tanstack/react-query';

interface RouteFeature {
  type: 'Feature';
  properties: {
    name?: string;
    description?: string;
    segment_id?: string;
  };
  geometry: {
    type: 'LineString' | 'MultiLineString';
    coordinates: number[][] | number[][][];
  };
}

export interface RouteGeoJSON {
  type: 'FeatureCollection';
  features: RouteFeature[];
}

export interface StationStop {
  sequence: number;
  code: string;
  name: string;
  lat: number;
  lng: number;
  arrival?: string;
  departure?: string;
}

export interface RouteData {
  geojson: RouteGeoJSON;
  stops: StationStop[];
}

async function fetchRoute(trainId: string): Promise<RouteData> {
  try {
    const res = await fetch(`/api/trains/${trainId}/route`);
    if (res.ok) {
      const body = await res.json();
      
      let geojson = null;
      let stops: StationStop[] = [];
      
      if (body.success && body.data) {
        geojson = body.data.geojson || body.data;
        stops = body.data.stops || [];
      } else if (body.type === 'FeatureCollection' || body.type === 'Feature') {
        geojson = body; // Fallback in case it's returned directly
      }

      if (geojson) {
        let finalGeoJSON: RouteGeoJSON;
        if (geojson.type === 'Feature') {
          finalGeoJSON = { type: 'FeatureCollection', features: [geojson] };
        } else {
          finalGeoJSON = geojson as RouteGeoJSON;
        }
        return { geojson: finalGeoJSON, stops };
      }
    }
  } catch (e) {
    console.warn('Failed to fetch RailRadar route, using local fallback', e);
  }

  // Fallback to local demo data
  const response = await fetch('/demo-data/real_railway_bhubaneswar.geojson');
  if (!response.ok) throw new Error('Failed to load local fallback route');
  const fallbackGeoJSON = await response.json();
  return { geojson: fallbackGeoJSON, stops: [] };
}

export function useRoute(trainId: string) {
  return useQuery<RouteData, Error>({
    queryKey: ['route', trainId],
    queryFn: () => fetchRoute(trainId),
    staleTime: Infinity,
    retry: 1,
  });
}