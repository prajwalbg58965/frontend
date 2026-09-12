import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import bbox from '@turf/bbox';
import { useMap } from './MapView';
import { useRoute } from '../../hooks/useRoute';
import { useLivePositionsStatus } from '../../hooks/useLivePositions';
import { useRiskScoreStatus } from '../../hooks/useRisk';
import { useIncidentAlertsStatus } from '../../hooks/useIncident';
import { useResponderStatus } from '../../hooks/useResponder';
import { useTrain } from '../../context/TrainContext';
import { useSimulation } from '../../context/SimulationContext';
import type { CoachPosition, RiskSegment, IncidentAlert } from '../../types/domain';

const COACH_COLORS = {
  ENGINE: '#00d4aa',
  DEFAULT: '#1890ff',
  STOPPED: '#ffb800',
  UNKNOWN: '#7a8d9c',
};

const RISK_COLORS = {
  LOW: '#22c55e',
  MEDIUM: '#eab308',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

function getCoachColor(coach: CoachPosition): string {
  if (coach.coachId === 'ENGINE') return COACH_COLORS.ENGINE;
  switch (coach.status) {
    case 'MOVING': return COACH_COLORS.DEFAULT;
    case 'STOPPED': return COACH_COLORS.STOPPED;
    default: return COACH_COLORS.UNKNOWN;
  }
}

function getIncidentSeverityColor(severity: IncidentAlert['severity']): string {
  switch (severity) {
    case 'LOW': return '#22c55e';
    case 'MEDIUM': return '#eab308';
    case 'HIGH': return '#f97316';
    case 'CRITICAL': return '#ef4444';
    default: return '#ef4444';
  }
}

function createCoachMarkerElement(coach: CoachPosition, isAffected: boolean): HTMLElement {
  const el = document.createElement('div');
  el.className = 'coach-marker';
  const isAffectedStyle = isAffected ? `
    box-shadow: 0 0 0 3px #ef4444, 0 2px 12px rgba(239,68,68,0.6), 0 0 0 1px rgba(255,255,255,0.1);
    animation: pulse-ring 1500ms ease-out infinite;
    z-index: 20;
  ` : `
    box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
    z-index: 10;
  `;
  
  el.style.cssText = `
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #0a0f14;
    ${isAffectedStyle}
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: #0a0f14;
    text-shadow: 0 0 2px rgba(255,255,255,0.8);
    transition: transform 2500ms cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 300ms ease;
    will-change: transform;
  `;
  el.style.backgroundColor = getCoachColor(coach);
  el.textContent = coach.coachId.replace(/^[A-Z]/, '');
  el.title = `${coach.coachId} — ${coach.status}${isAffected ? ' ⚠ AFFECTED' : ''}`;
  return el;
}

function createRiskRouteGeoJSON(segments: readonly RiskSegment[]) {
  const features = segments.map(segment => ({
    type: 'Feature' as const,
    properties: {
      segmentId: segment.segmentId,
      name: segment.name,
      riskLevel: segment.riskLevel,
      floodDepthMm: segment.floodDepthMm ?? 0,
      weatherAlert: segment.weatherAlert ?? '',
    },
    geometry: {
      type: 'LineString' as const,
      coordinates: [
        [segment.startCoordinates.longitude, segment.startCoordinates.latitude],
        [segment.endCoordinates.longitude, segment.endCoordinates.latitude],
      ],
    },
  }));

  return {
    type: 'FeatureCollection' as const,
    features,
  };
}

function createIncidentMarkerElement(incident: IncidentAlert): HTMLElement {
  const el = document.createElement('div');
  el.className = 'incident-marker';
  const severityColor = getIncidentSeverityColor(incident.severity);
  el.style.cssText = `
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid #0a0f14;
    box-shadow: 0 0 0 4px ${severityColor}, 0 4px 20px rgba(0,0,0,0.5);
    background: ${severityColor};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: #0a0f14;
    animation: pulse-ring 2000ms ease-out infinite;
    z-index: 30;
  `;
  el.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#0a0f14" strokeWidth="2.5" aria-hidden="true">
      <path d="M8 2L14 14H2L8 2Z" />
      <circle cx="8" cy="9" r="1.5" />
    </svg>
  `;
  el.title = `INCIDENT: ${incident.incidentId} — ${incident.coachId}`;
  return el;
}

function SeverityBadge({ severity }: { severity: IncidentAlert['severity'] }) {
  const color = getIncidentSeverityColor(severity);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs font-semibold"
      style={{ backgroundColor: `${color}20`, color, borderColor: `${color}40`, borderWidth: '1px', borderStyle: 'solid' }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: color }} aria-hidden="true" />
      {severity}
    </span>
  );
}

export function MapLayers() {
  const map = useMap();
  const { selectedTrainId } = useTrain();
  const { data: routeData, isLoading: routeLoading, isError: routeError } = useRoute(selectedTrainId);
  const { positions, isLoading: positionsLoading, isError: positionsError, secondsSinceUpdate } = useLivePositionsStatus(selectedTrainId);
  const { risk, isLoading: riskLoading, isError: riskError } = useRiskScoreStatus();
  const { activeIncident, isLoading: incidentLoading, isError: incidentError } = useIncidentAlertsStatus();
  const { nearestResponder } = useResponderStatus();
  
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const incidentMarkerRef = useRef<maplibregl.Marker | null>(null);
  const responderMarkerRef = useRef<maplibregl.Marker | null>(null);
  const routeAddedRef = useRef(false);
  const boundsFittedRef = useRef(false);
  const riskLayerAddedRef = useRef(false);
  const incidentHandledRef = useRef<string | null>(null);
  const mapFocusedRef = useRef(false);
  const stationsAddedRef = useRef(false);
  const currentTrainIdRef = useRef<string | null>(null);
  const [feedStatus, setFeedStatus] = useState<'connecting' | 'live' | 'error'>('connecting');
  const { mode, simulatedPosition, followTrain, progress } = useSimulation();

  useEffect(() => {
    if (currentTrainIdRef.current !== selectedTrainId) {
      currentTrainIdRef.current = selectedTrainId;
      boundsFittedRef.current = false; // allow refit bounds on new train
    }
  }, [selectedTrainId]);

  useEffect(() => {
    if (positionsLoading) setFeedStatus('connecting');
    else if (positionsError) setFeedStatus('error');
    else setFeedStatus('live');
  }, [positionsLoading, positionsError]);

  useEffect(() => {
    if (!map || routeLoading || routeError || !routeData) return;

    if (!routeAddedRef.current) {
      try {
        if (!routeData.geojson.features || routeData.geojson.features.length === 0) return;

        map.addSource('railway-route', {
          type: 'geojson',
          data: routeData.geojson as any,
        });

        map.addLayer({
          id: 'railway-route-line',
          type: 'line',
          source: 'railway-route',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': [
              'case',
              ['has', 'segment_id'], [
                'case',
                ['==', ['get', 'segment_id'], 'REAL_RAIL_SEG_01'], '#00f2fe',
                ['==', ['get', 'segment_id'], 'REAL_RAIL_SEG_02'], '#4facfe',
                '#1e293b'
              ],
              '#00f2fe'
            ],
            'line-width': [
              'case',
              ['has', 'segment_id'], [
                'case',
                ['==', ['get', 'segment_id'], 'REAL_RAIL_SEG_01'], 4,
                ['==', ['get', 'segment_id'], 'REAL_RAIL_SEG_02'], 4,
                2
              ],
              4
            ],
            'line-opacity': [
              'case',
              ['has', 'segment_id'], [
                'case',
                ['==', ['get', 'segment_id'], 'REAL_RAIL_SEG_01'], 0.9,
                ['==', ['get', 'segment_id'], 'REAL_RAIL_SEG_02'], 0.9,
                0.4
              ],
              0.9
            ]
          },
        });

        map.addLayer({
          id: 'railway-route-glow',
          type: 'line',
          source: 'railway-route',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': [
              'case',
              ['has', 'segment_id'], [
                'case',
                ['==', ['get', 'segment_id'], 'REAL_RAIL_SEG_01'], '#00f2fe',
                ['==', ['get', 'segment_id'], 'REAL_RAIL_SEG_02'], '#4facfe',
                '#1e293b'
              ],
              '#00f2fe'
            ],
            'line-width': 12,
            'line-opacity': 0.3,
            'line-blur': 8,
          },
          filter: [
            'any',
            ['!', ['has', 'segment_id']],
            ['in', ['get', 'segment_id'], ['literal', ['REAL_RAIL_SEG_01', 'REAL_RAIL_SEG_02']]]
          ],
        });

        routeAddedRef.current = true;
      } catch (err) {
        console.error('Failed to add route layer:', err);
      }
    } else {
      const source = map.getSource('railway-route') as maplibregl.GeoJSONSource;
      if (source && routeData.geojson.features && routeData.geojson.features.length > 0) {
        source.setData(routeData.geojson as any);
      }
    }

    if (!boundsFittedRef.current && routeData.geojson.features.length > 0) {
      try {
        const bounds = new maplibregl.LngLatBounds();
        
        // Find the primary route
        const primaryFeature = routeData.geojson.features.find(f => f.properties?.segment_id === 'REAL_RAIL_SEG_01') || routeData.geojson.features[0];
        
        const coords = primaryFeature.geometry.coordinates as [number, number][];
        if (coords.length >= 2) {
          bounds.extend(coords[0]);
          for (const coord of coords) {
            bounds.extend(coord);
          }
          map.fitBounds(bounds, { padding: 50, duration: 1000 });
          boundsFittedRef.current = true;
        }
      } catch (err) {
        console.error('Failed to fit bounds:', err);
      }
    }

    if (!stationsAddedRef.current && routeData.stops.length > 0) {
      try {
        const stationGeoJSON = {
          type: 'FeatureCollection' as const,
          features: routeData.stops.map(stop => ({
            type: 'Feature' as const,
            properties: {
              name: stop.name,
              sequence: stop.sequence
            },
            geometry: {
              type: 'Point' as const,
              coordinates: [stop.lng, stop.lat]
            }
          }))
        };

        map.addSource('railway-stations', {
          type: 'geojson',
          data: stationGeoJSON
        });

        map.addLayer({
          id: 'railway-station-points',
          type: 'circle',
          source: 'railway-stations',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              5, 2,
              10, 4,
              15, 6
            ],
            'circle-color': '#040b14',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#00f2fe'
          }
        });

        map.addLayer({
          id: 'railway-station-labels',
          type: 'symbol',
          source: 'railway-stations',
          minzoom: 8,
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 10,
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            'symbol-sort-key': ['get', 'sequence'],
          },
          paint: {
            'text-color': '#e8edf2',
            'text-halo-color': '#06111f',
            'text-halo-width': 2
          }
        });

        stationsAddedRef.current = true;
      } catch (e) {
        console.error('Failed to add stations', e);
      }
    } else if (routeData.stops.length > 0) {
      const stationGeoJSON = {
        type: 'FeatureCollection' as const,
        features: routeData.stops.map(stop => ({
          type: 'Feature' as const,
          properties: { name: stop.name, sequence: stop.sequence },
          geometry: { type: 'Point' as const, coordinates: [stop.lng, stop.lat] }
        }))
      };
      const source = map.getSource('railway-stations') as maplibregl.GeoJSONSource;
      if (source) source.setData(stationGeoJSON);
    }
  }, [map, routeData, routeLoading, routeError]);

  useEffect(() => {
    if (!map || riskLoading || riskError || !risk) return;

    if (!riskLayerAddedRef.current) {
      try {
        const riskGeoJSON = createRiskRouteGeoJSON(risk.segments);
        map.addSource('railway-risk', {
          type: 'geojson',
          data: riskGeoJSON,
        });

        map.addLayer({
          id: 'railway-risk-line',
          type: 'line',
          source: 'railway-risk',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': [
              'match',
              ['get', 'riskLevel'],
              'LOW', '#22c55e',
              'MEDIUM', '#eab308',
              'HIGH', '#f97316',
              'CRITICAL', '#ef4444',
              '#7a8d9c'
            ],
            'line-width': 5,
            'line-opacity': 0.9,
          },
        });

        map.addLayer({
          id: 'railway-risk-glow',
          type: 'line',
          source: 'railway-risk',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': [
              'match',
              ['get', 'riskLevel'],
              'LOW', '#22c55e',
              'MEDIUM', '#eab308',
              'HIGH', '#f97316',
              'CRITICAL', '#ef4444',
              '#7a8d9c'
            ],
            'line-width': 10,
            'line-opacity': 0.2,
            'line-blur': 6,
          },
        });

        riskLayerAddedRef.current = true;
      } catch (err) {
        console.error('Failed to add risk layer:', err);
      }
    } else if (riskLayerAddedRef.current && risk) {
      try {
        const riskGeoJSON = createRiskRouteGeoJSON(risk.segments);
        const source = map.getSource('railway-risk') as maplibregl.GeoJSONSource;
        if (source) {
          source.setData(riskGeoJSON);
        }
      } catch (err) {
        console.error('Failed to update risk layer:', err);
      }
    }
  }, [map, risk, riskLoading, riskError]);

  // Incident handling
  useEffect(() => {
    if (!map || incidentLoading || incidentError) return;

    // New active incident detected
    if (activeIncident && activeIncident.incidentId !== incidentHandledRef.current) {
      incidentHandledRef.current = activeIncident.incidentId;
      mapFocusedRef.current = false;
    }

    // Incident resolved
    if (!activeIncident && incidentHandledRef.current !== null) {
      incidentHandledRef.current = null;
      mapFocusedRef.current = false;
      
      // Remove incident marker
      if (incidentMarkerRef.current) {
        incidentMarkerRef.current.remove();
        incidentMarkerRef.current = null;
      }
    }
  }, [map, activeIncident, incidentLoading, incidentError]);

  // Add/update incident marker and highlight affected coach
  useEffect(() => {
    if (!map) return;

    // Handle incident marker
    if (activeIncident) {
      if (!incidentMarkerRef.current) {
        const el = createIncidentMarkerElement(activeIncident);
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([activeIncident.coordinates.longitude, activeIncident.coordinates.latitude])
          .addTo(map);

        const popup = new maplibregl.Popup({ 
          closeButton: false, 
          closeOnClick: true,
          offset: 16,
          className: 'incident-popup'
        }).setHTML(createIncidentPopupContent(activeIncident));

        marker.setPopup(popup);
        incidentMarkerRef.current = marker;

        // Focus map on incident once
        if (!mapFocusedRef.current) {
          map.flyTo({
            center: [activeIncident.coordinates.longitude, activeIncident.coordinates.latitude],
            zoom: 11,
            duration: 2000,
            essential: true,
          });
          mapFocusedRef.current = true;
        }
      }
    } else {
      // Remove incident marker if exists
      if (incidentMarkerRef.current) {
        incidentMarkerRef.current.remove();
        incidentMarkerRef.current = null;
      }
    }
  }, [map, activeIncident]);

  // Responder marker
  useEffect(() => {
    if (!map) return;

    if (nearestResponder && activeIncident) {
      if (!responderMarkerRef.current) {
        const responder = nearestResponder;
        const el = document.createElement('div');
        el.className = 'responder-marker';
        const typeColor = responder.type === 'HOSPITAL' ? '#1890ff' : '#f97316';
        el.style.cssText = `
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid #0a0f14;
          box-shadow: 0 0 0 4px ${typeColor}, 0 4px 20px rgba(0,0,0,0.5);
          background: ${typeColor};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          color: #0a0f14;
          animation: pulse-ring 2000ms ease-out infinite;
          z-index: 25;
        `;
        el.innerHTML = responder.type === 'HOSPITAL' ? 'H' : 'N';
        el.title = `${responder.name} (${responder.type}) - ${responder.distanceKm?.toFixed(1)} km`;

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([responder.coordinates.longitude, responder.coordinates.latitude])
          .addTo(map);

        const popup = new maplibregl.Popup({ 
          closeButton: false, 
          closeOnClick: true,
          offset: 16,
          className: 'responder-popup'
        }).setHTML(createResponderPopupContent(nearestResponder));

        marker.setPopup(popup);
        responderMarkerRef.current = marker;
      } else {
        // Update position if responder changed
        const existingMarker = responderMarkerRef.current;
        if (existingMarker) {
          const responder = nearestResponder;
          existingMarker.setLngLat([responder.coordinates.longitude, responder.coordinates.latitude]);
          existingMarker.getElement().title = `${responder.name} (${responder.type}) - ${responder.distanceKm?.toFixed(1)} km`;
          // Update popup content
          const popup = existingMarker.getPopup();
          if (popup) {
            popup.setHTML(createResponderPopupContent(nearestResponder));
          }
        }
      }
    } else {
      // Remove responder marker if exists
      if (responderMarkerRef.current) {
        responderMarkerRef.current.remove();
        responderMarkerRef.current = null;
      }
    }
  }, [map, nearestResponder, activeIncident]);

  // Coach markers with affected highlighting
  useEffect(() => {
    if (!map || positionsLoading) return;

    const currentCoachIds = new Set(positions.map(c => c.coachId));
    const existingCoachIds = new Set(markersRef.current.keys());
    const affectedCoachId = activeIncident?.coachId ?? null;

    for (const coachId of existingCoachIds) {
      if (!currentCoachIds.has(coachId)) {
        const marker = markersRef.current.get(coachId);
        if (marker) {
          marker.remove();
          markersRef.current.delete(coachId);
        }
      }
    }

    for (const coach of positions) {
      const existingMarker = markersRef.current.get(coach.coachId);
      const newLngLat = [coach.coordinates.longitude, coach.coordinates.latitude] as [number, number];
      const isAffected = coach.coachId === affectedCoachId;

      if (existingMarker) {
        existingMarker.getElement().style.backgroundColor = getCoachColor(coach);
        existingMarker.getElement().title = `${coach.coachId} — ${coach.status}${isAffected ? ' ⚠ AFFECTED' : ''}`;
        existingMarker.setLngLat(newLngLat);
        
        // Update affected styling
        const el = existingMarker.getElement();
        if (isAffected) {
          el.style.boxShadow = '0 0 0 3px #ef4444, 0 2px 12px rgba(239,68,68,0.6), 0 0 0 1px rgba(255,255,255,0.1)';
          el.style.animation = 'pulse-ring 1500ms ease-out infinite';
          el.style.zIndex = '20';
        } else {
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)';
          el.style.animation = 'none';
          el.style.zIndex = '10';
        }
        existingMarker.setLngLat(newLngLat);
      } else {
        const el = createCoachMarkerElement(coach, isAffected);
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat(newLngLat)
          .addTo(map);

        const popup = new maplibregl.Popup({ 
          closeButton: false, 
          closeOnClick: true,
          offset: 16,
          className: 'coach-popup'
        }).setHTML(createPopupContent(coach, isAffected, mode));

        marker.setPopup(popup);
        markersRef.current.set(coach.coachId, marker);
      }
    }
  }, [map, positions, positionsLoading, activeIncident]);

  // Handle follow train
  useEffect(() => {
    if (!map || !followTrain) return;
    let targetLng = 20.296;
    let targetLat = 85.824;

    if (mode === 'SIMULATION' && simulatedPosition) {
      targetLng = simulatedPosition.longitude;
      targetLat = simulatedPosition.latitude;
    } else {
      const eng = positions.find(c => c.coachId === 'ENGINE');
      if (eng) {
        targetLng = eng.coordinates.longitude;
        targetLat = eng.coordinates.latitude;
      }
    }

    map.panTo([targetLng, targetLat], { duration: 1000, easing: t => t * (2 - t) });
  }, [map, followTrain, simulatedPosition, positions, mode]);

  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current.clear();
      if (incidentMarkerRef.current) {
        incidentMarkerRef.current.remove();
        incidentMarkerRef.current = null;
      }
      if (responderMarkerRef.current) {
        responderMarkerRef.current.remove();
        responderMarkerRef.current = null;
      }
      routeAddedRef.current = false;
      boundsFittedRef.current = false;
      riskLayerAddedRef.current = false;
      stationsAddedRef.current = false;
      incidentHandledRef.current = null;
      mapFocusedRef.current = false;
    };
  }, [map]);

  if (!map) return null;

  return (
    <>
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="panel px-3 py-2 shadow-panel flex items-center gap-2 whitespace-nowrap">
          <span className={`w-2 h-2 rounded-full ${
            feedStatus === 'live' ? 'bg-green-500 animate-pulse' :
            feedStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`} aria-hidden="true" />
          <span className="font-mono text-xs text-rail-text">LIVE FEED: TRAIN {selectedTrainId}</span>
          {secondsSinceUpdate !== null && (
            <span className="font-mono text-xs text-rail-textMuted">
              Updated: {secondsSinceUpdate}s ago
            </span>
          )}
          {feedStatus === 'error' && (
            <span className="font-mono text-xs text-rail-danger">POSITION FEED UNAVAILABLE</span>
          )}
        </div>
      </div>

      {activeIncident && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fade-in">
          <div className="panel px-4 py-2 shadow-panel flex items-center gap-3 whitespace-nowrap" style={{ borderLeft: `4px solid ${getIncidentSeverityColor(activeIncident.severity)}` }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} style={{ color: getIncidentSeverityColor(activeIncident.severity) }} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="font-mono text-sm font-semibold text-rail-text">INCIDENT MODE</span>
            <span className="font-mono text-xs text-rail-textMuted">{activeIncident.coachId}</span>
            <SeverityBadge severity={activeIncident.severity} />
          </div>
        </div>
      )}
    </>
  );
}

function createPopupContent(coach: CoachPosition, isAffected = false, mode = 'LIVE'): string {
  const updateTime = coach.timestamp ? new Date(coach.timestamp).toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata' }) : 'Unknown';
  const coords = `${coach.coordinates.latitude.toFixed(4)}° N, ${coach.coordinates.longitude.toFixed(4)}° E`;
  const isSim = mode === 'SIMULATION';
  const sourceText = isSim ? 'Source: RailSentinel Demo' : 'Source: RailRadar';
  const modeColor = isSim ? '#ffb800' : '#22c55e';
  
  return `
    <div class="coach-popup-content" style="padding: 8px 10px; min-width: 160px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.5;">
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${getCoachColor(coach)}; border: 1px solid #0a0f14;" aria-hidden="true"></span>
        <strong style="color: #e8edf2; font-size: 13px;">Coach ${coach.coachId}${isAffected ? ' ⚠' : ''}</strong>
      </div>
      <div style="color: #7a8d9c; margin-bottom: 4px;">
        <span style="color: #e8edf2;">Status:</span> ${coach.status}${isAffected ? ' (AFFECTED)' : ''}
      </div>
      <div style="color: #7a8d9c; margin-bottom: 4px;">
        <span style="color: #e8edf2;">Last update:</span> ${updateTime} IST
      </div>
      <div style="color: #7a8d9c; font-size: 11px; border-top: 1px solid #1e2a38; padding-top: 4px;">
        <span style="color: #e8edf2;">Coords:</span> ${coords}
      </div>
      <div style="color: ${modeColor}; font-size: 10px; margin-top: 6px; text-align: center; font-weight: bold; padding: 2px; border: 1px solid ${modeColor}40; border-radius: 4px; background: ${modeColor}10;">
        ● ${isSim ? 'SIMULATED' : 'LIVE GPS'}<br>
        <span style="font-size: 9px; opacity: 0.8;">${sourceText}</span>
      </div>
    </div>
  `;
}

function createIncidentPopupContent(incident: IncidentAlert): string {
  const time = incident.timestamp ? new Date(incident.timestamp).toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata' }) : 'Unknown';
  const coords = `${incident.coordinates.latitude.toFixed(4)}° N, ${incident.coordinates.longitude.toFixed(4)}° E`;
  const severityColor = getIncidentSeverityColor(incident.severity);
  
  return `
    <div class="incident-popup-content" style="padding: 10px 12px; min-width: 200px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.5;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; border-bottom: 1px solid #1e2a38; padding-bottom: 8px;">
        <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${severityColor}; border: 1px solid #0a0f14;" aria-hidden="true"></span>
        <strong style="color: #e8edf2; font-size: 14px;">${incident.incidentId}</strong>
      </div>
      <div style="color: #7a8d9c; margin-bottom: 4px;">
        <span style="color: #e8edf2;">Type:</span> ${incident.type}
      </div>
      <div style="color: #7a8d9c; margin-bottom: 4px;">
        <span style="color: #e8edf2;">Severity:</span> <span style="color: ${severityColor}; font-weight: 600;">${incident.severity}</span>
      </div>
      <div style="color: #7a8d9c; margin-bottom: 4px;">
        <span style="color: #e8edf2;">Coach:</span> <span style="color: #e8edf2; font-weight: 600;">${incident.coachId}</span>
      </div>
      <div style="color: #7a8d9c; margin-bottom: 4px;">
        <span style="color: #e8edf2;">Est. Passengers:</span> ${incident.passengerEstimate ?? 'Unavailable'}
      </div>
      <div style="color: #7a8d9c; margin-bottom: 4px;">
        <span style="color: #e8edf2;">Time:</span> ${time} IST
      </div>
      <div style="color: #7a8d9c; font-size: 11px; border-top: 1px solid #1e2a38; padding-top: 4px;">
        <span style="color: #e8edf2;">Location:</span> ${coords}
      </div>
      <div style="color: #ff4d4f; font-size: 10px; margin-top: 6px; text-align: center;">
        Demo incident — not a real emergency
      </div>
    </div>
  `;
}

function createResponderPopupContent(responder: { name: string; type: string; coordinates: { latitude: number; longitude: number }; distanceKm?: number; capabilities?: readonly string[]; contact?: string }): string {
  const typeColor = responder.type === 'HOSPITAL' ? '#1890ff' : '#f97316';
  const typeLabel = responder.type === 'HOSPITAL' ? 'HOSPITAL' : 'NDRF UNIT';
  
  return `
    <div class="responder-popup-content" style="padding: 10px 12px; min-width: 220px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.5;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; border-bottom: 1px solid #1e2a38; padding-bottom: 8px;">
        <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${typeColor}; border: 1px solid #0a0f14;" aria-hidden="true"></span>
        <strong style="color: #e8edf2; font-size: 14px;">${responder.name}</strong>
      </div>
      <div style="color: #7a8d9c; margin-bottom: 4px;">
        <span style="color: #e8edf2;">Type:</span> <span style="color: ${typeColor}; font-weight: 600;">${typeLabel}</span>
      </div>
      <div style="color: #7a8d9c; margin-bottom: 4px;">
        <span style="color: #e8edf2;">Approx. straight-line distance:</span> <span style="color: #e8edf2; font-weight: 600;">${responder.distanceKm?.toFixed(1)} km</span>
      </div>
      <div style="color: #7a8d9c; margin-bottom: 4px;">
        <span style="color: #e8edf2;">Location:</span> ${responder.coordinates.latitude.toFixed(4)}° N, ${responder.coordinates.longitude.toFixed(4)}° E
      </div>
      ${responder.capabilities && responder.capabilities.length > 0 ? `
      <div style="color: #7a8d9c; margin-bottom: 4px; font-size: 11px;">
        <span style="color: #e8edf2;">Capabilities:</span> ${responder.capabilities.join(', ')}
      </div>
      ` : ''}
      ${responder.contact ? `
      <div style="color: #7a8d9c; margin-bottom: 4px; font-size: 11px;">
        <span style="color: #e8edf2;">Contact:</span> ${responder.contact}
      </div>
      ` : ''}
      <div style="color: #ff4d4f; font-size: 10px; margin-top: 6px; text-align: center;">
        Static responder reference — not a live emergency services integration
      </div>
    </div>
  `;
}