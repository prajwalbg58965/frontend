import { useQuery } from '@tanstack/react-query';

interface RouteFeature {
  type: 'Feature';
  properties: {
    name: string;
    description: string;
  };
  geometry: {
    type: 'LineString';
    coordinates: number[][];
  };
}

interface RouteResponse {
  type: 'FeatureCollection';
  features: RouteFeature[];
}

async function fetchRoute(): Promise<RouteResponse> {
  const response = await fetch('/demo-data/route.geojson');
  if (!response.ok) throw new Error('Failed to load route');
  return response.json();
}

export function useRoute() {
  return useQuery<RouteResponse, Error>({
    queryKey: ['route'],
    queryFn: fetchRoute,
    staleTime: Infinity,
    retry: 1,
  });
}