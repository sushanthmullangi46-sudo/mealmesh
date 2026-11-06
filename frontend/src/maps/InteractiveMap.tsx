import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useNavigation } from '../hooks/useNavigationContext';
import { Location, Road, TrafficLevel } from '../types';
import { Navigation, Flag, Plus, AlertCircle, RefreshCw, Layers } from 'lucide-react';

// Custom Map Click Handler for adding new locations
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Controller to auto-fit bounds when route changes
function RouteBoundsController({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length > 1) {
      const bounds = L.latLngBounds(coordinates.map(c => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [coordinates, map]);
  return null;
}

// Helper to create sharp SVG DivIcons
const createNodeIcon = (
  isSource: boolean,
  isTarget: boolean,
  isCurrentVisualizer: boolean,
  isVisitedVisualizer: boolean,
  isIsolated: boolean
) => {
  let bgColor = '#3b82f6'; // default brand blue
  let size = 28;
  let ringHtml = '';
  let iconContent = '';

  if (isCurrentVisualizer) {
    bgColor = '#eab308'; // Amber Gold
    size = 36;
    ringHtml = `<div class="absolute -inset-2 rounded-full border-2 border-yellow-400 animate-ping opacity-75"></div>`;
  } else if (isSource) {
    bgColor = '#10b981'; // Emerald Green
    size = 34;
    iconContent = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>`;
  } else if (isTarget) {
    bgColor = '#ef4444'; // Red
    size = 34;
    iconContent = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>`;
  } else if (isVisitedVisualizer) {
    bgColor = '#06b6d4'; // Cyan
    size = 24;
  } else if (isIsolated) {
    bgColor = '#64748b'; // Slate
    size = 22;
  }

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer group">
      ${ringHtml}
      <div style="background-color: ${bgColor}; width: ${size}px; height: ${size}px;"
           class="rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 transition-transform duration-200 group-hover:scale-125">
        ${iconContent || `<span class="w-2.5 h-2.5 bg-white rounded-full"></span>`}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-node',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const getTrafficColor = (level: TrafficLevel) => {
  switch (level) {
    case 'LOW': return '#10b981'; // Emerald
    case 'MEDIUM': return '#f59e0b'; // Amber
    case 'HIGH': return '#ef4444'; // Rose
    case 'BLOCKED': return '#8b5cf6'; // Violet / Blocked
    default: return '#94a3b8';
  }
};

export const InteractiveMap: React.FC = () => {
  const {
    locations,
    roads,
    selectedSourceId,
    setSelectedSourceId,
    selectedTargetId,
    setSelectedTargetId,
    activeRoute,
    comparisonRoutes,
    tspResponse,
    visualizationTrace,
    visualizerCurrentStep,
    updateRoadTrafficLevel,
  } = useNavigation();

  const [newLocationModal, setNewLocationModal] = useState<{ lat: number; lng: number } | null>(null);

  // Map center defaults to Manhattan network area
  const defaultCenter: [number, number] = [40.7450, -73.9900];

  // Visualizer step state
  const currentVisualizerStepObj = visualizationTrace?.steps?.[visualizerCurrentStep];
  const visualizerVisitedNodes = currentVisualizerStepObj?.visited_nodes || [];
  const visualizerActiveNode = currentVisualizerStepObj?.current_node || -1;
  const visualizerNeighborNode = currentVisualizerStepObj?.neighbor_node || -1;

  // Build lookup map for node coordinates
  const locationLookup = React.useMemo(() => {
    const map = new Map<number, Location>();
    locations.forEach(loc => map.set(loc.id, loc));
    return map;
  }, [locations]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapClickHandler
          onMapClick={(lat, lng) => {
            setNewLocationModal({ lat, lng });
          }}
        />

        {/* Auto fit active route bounds */}
        {activeRoute?.path_coordinates && activeRoute.path_coordinates.length > 1 && (
          <RouteBoundsController coordinates={activeRoute.path_coordinates} />
        )}
        {tspResponse?.complete_path_coordinates && tspResponse.complete_path_coordinates.length > 1 && (
          <RouteBoundsController coordinates={tspResponse.complete_path_coordinates} />
        )}

        {/* Render Roads as colored Polylines */}
        {roads.map(road => {
          const u = locationLookup.get(road.source_id);
          const v = locationLookup.get(road.target_id);
          if (!u || !v) return null;

          const color = getTrafficColor(road.traffic_level);
          const isBlocked = road.traffic_level === 'BLOCKED';

          return (
            <Polyline
              key={road.id}
              positions={[[u.latitude, u.longitude], [v.latitude, v.longitude]]}
              pathOptions={{
                color,
                weight: isBlocked ? 3 : 4,
                opacity: isBlocked ? 0.6 : 0.85,
                dashArray: isBlocked ? '6, 6' : undefined,
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 text-slate-800 dark:text-slate-100 min-w-[200px]">
                  <div className="font-semibold text-sm border-b pb-1 dark:border-slate-700">
                    {road.road_name} ({road.road_type})
                  </div>
                  <div className="text-xs space-y-1">
                    <div>Length: <span className="font-medium">{road.distance_km} km</span></div>
                    <div>Speed Limit: <span className="font-medium">{road.speed_limit_kmh} km/h</span></div>
                    <div>Toll: <span className="font-medium">${road.toll_cost.toFixed(2)}</span></div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span>Traffic:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        road.traffic_level === 'LOW' ? 'bg-emerald-100 text-emerald-800' :
                        road.traffic_level === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                        road.traffic_level === 'HIGH' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {road.traffic_level}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t dark:border-slate-700">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Update Condition:</label>
                    <div className="grid grid-cols-4 gap-1 text-[10px]">
                      {(['LOW', 'MEDIUM', 'HIGH', 'BLOCKED'] as TrafficLevel[]).map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => updateRoadTrafficLevel(road.id, lvl)}
                          className={`py-1 rounded font-medium ${
                            road.traffic_level === lvl
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                          }`}
                        >
                          {lvl[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Render Comparison Routes if active */}
        {comparisonRoutes && (
          <>
            {/* Fastest Route in Purple */}
            <Polyline
              positions={comparisonRoutes.fastest_time_route.path_coordinates}
              pathOptions={{ color: '#8b5cf6', weight: 6, opacity: 0.9 }}
            />
            {/* Lowest Cost Route in Emerald */}
            <Polyline
              positions={comparisonRoutes.lowest_cost_route.path_coordinates}
              pathOptions={{ color: '#10b981', weight: 4, opacity: 0.9, dashArray: '4, 4' }}
            />
          </>
        )}

        {/* Render Active Calculated Route Polyline */}
        {activeRoute?.path_coordinates && activeRoute.path_coordinates.length > 1 && (
          <>
            {/* Background Glow */}
            <Polyline
              positions={activeRoute.path_coordinates}
              pathOptions={{ color: '#60a5fa', weight: 10, opacity: 0.4 }}
            />
            {/* Core Route Line */}
            <Polyline
              positions={activeRoute.path_coordinates}
              pathOptions={{ color: '#2563eb', weight: 5, opacity: 1.0 }}
            />
          </>
        )}

        {/* Render TSP Multi-Stop Tour Polyline */}
        {tspResponse?.complete_path_coordinates && tspResponse.complete_path_coordinates.length > 1 && (
          <Polyline
            positions={tspResponse.complete_path_coordinates}
            pathOptions={{ color: '#06b6d4', weight: 5, opacity: 0.9 }}
          />
        )}

        {/* Render Location Markers */}
        {locations.map(loc => {
          const isSource = loc.id === selectedSourceId;
          const isTarget = loc.id === selectedTargetId;
          const isCurrentVis = loc.id === visualizerActiveNode;
          const isVisitedVis = visualizerVisitedNodes.includes(loc.id);
          const isIsolated = loc.id >= 90; // Islands or isolated nodes

          const icon = createNodeIcon(isSource, isTarget, isCurrentVis, isVisitedVis, isIsolated);

          return (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="p-2 space-y-2 text-slate-800 dark:text-slate-100 min-w-[210px]">
                  <div className="flex items-center justify-between border-b pb-1 dark:border-slate-700">
                    <span className="font-bold text-sm">{loc.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      #{loc.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <div>Type: <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">{loc.type}</span></div>
                    <div>Elevation: <span className="font-medium text-slate-800 dark:text-slate-200">{loc.elevation_m}m</span></div>
                    <div>GPS: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</div>
                    {loc.description && <div className="italic mt-1 text-[11px]">{loc.description}</div>}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-2 border-t dark:border-slate-700">
                    <button
                      onClick={() => setSelectedSourceId(loc.id)}
                      className={`px-2 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                        isSource
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" /> Start
                    </button>
                    <button
                      onClick={() => setSelectedTargetId(loc.id)}
                      className={`px-2 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                        isTarget
                          ? 'bg-red-600 text-white'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-300'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" /> Destination
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 p-2.5 text-xs space-y-1.5 pointer-events-auto max-w-[200px]">
        <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-brand-500" /> Map Traffic Legend
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Low (Free)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Congested</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
