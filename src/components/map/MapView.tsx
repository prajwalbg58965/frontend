import { useEffect, useRef, useState, createContext, useContext } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapLegend } from './MapLegend';
import { MapLayers } from './MapLayers';
import { useTrain } from '../../context/TrainContext';
import type { Coordinates } from '../../types/domain';

const DEFAULT_CENTER: Coordinates = { latitude: 21.49, longitude: 86.94 };
const DEFAULT_ZOOM = 8.5;

const DARK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#0a0f14' },
    },
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      paint: {
        'raster-opacity': 0.15,
        'raster-saturation': 0,
        'raster-contrast': 0.3,
      },
    },
  ],
};

interface MapViewProps {
  onMapLoad?: (map: maplibregl.Map) => void;
  onError?: (error: Error) => void;
}

const MapContext = createContext<maplibregl.Map | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<Error | null>(null);
  const { selectedTrainId, getTrainInfo } = useTrain();

  const activeTrain = getTrainInfo(selectedTrainId);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: DARK_STYLE,
        center: [DEFAULT_CENTER.longitude, DEFAULT_CENTER.latitude],
        zoom: DEFAULT_ZOOM,
        pitch: 0,
        bearing: 0,
        antialias: true,
        preserveDrawingBuffer: false,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(
        new maplibregl.ScaleControl({ unit: 'metric', maxWidth: 120 }),
        'bottom-left'
      );

      map.on('load', () => {
        setMapLoaded(true);
      });

      map.on('error', (e: any) => {
        const error = new Error(e.error?.message || 'Map error');
        setMapError(error);
      });

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
        setMapLoaded(false);
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize map');
      setMapError(error);
    }
  }, []);

  if (mapError) {
    return (
      <div className="flex-1 panel relative flex items-center justify-center">
        <div className="text-center p-8">
          <svg className="mx-auto mb-4 w-16 h-16 text-rail-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h2 className="text-lg font-medium text-rail-text mb-1">Map Failed to Load</h2>
          <p className="text-sm text-rail-textMuted max-w-md mx-auto">{mapError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn-primary text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <MapContext.Provider value={mapRef.current}>
      <div className="flex-1 panel relative min-h-0 overflow-hidden">
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          aria-label="Railway corridor map"
        />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-rail-panel/90 z-10 pointer-events-none">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-rail-border border-t-rail-accent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-rail-textMuted">Initializing map...</p>
            </div>
          </div>
        )}
        <MapLegend />
        <MapLayers />
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <div className="panel px-3 py-2 text-xs font-mono text-rail-text shadow-panel whitespace-nowrap flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rail-accent animate-ping" />
            <span className="font-bold">Tracking #{activeTrain.id}</span>
            <span className="text-rail-accent font-semibold">({activeTrain.name})</span>
            <span className="text-rail-textMuted text-[11px]">• {activeTrain.route}</span>
          </div>
        </div>
        {children}
      </div>
    </MapContext.Provider>
  );
}

export function useMap(): maplibregl.Map | null {
  return useContext(MapContext);
}

export function MapView({ onMapLoad, onError }: MapViewProps) {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      onMapLoad?.(map);
    }
  }, [map, onMapLoad]);

  return null;
}