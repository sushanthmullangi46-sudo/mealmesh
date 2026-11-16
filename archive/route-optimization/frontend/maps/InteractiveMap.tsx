import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useNavigation } from '../hooks/useNavigationContext';
import { Location, Road, TrafficLevel } from '../types';
import {
  Navigation,
  Flag,
  RotateCcw,
  Layers,
  Map as MapIcon,
  Sun,
  Moon,
  Compass,
  AlertCircle,
  Eye,
  EyeOff,
  Crosshair
} from 'lucide-react';

// Tile provider configurations
type TileTheme = 'street' | 'satellite' | 'dark';

const TILE_CONFIG: Record<TileTheme, { url: string; attribution: string; maxZoom: number }> = {
  street: {
    // CartoDB Voyager - Google Maps crisp vector aesthetic
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 20,
  },
  satellite: {
    // Esri World Imagery - Photorealistic High-Res Satellite Aerial
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics, USDA, USGS',
    maxZoom: 19,
  },
  dark: {
    // CartoDB Dark Matter - High-contrast modern SaaS night mode
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 20,
  },
};

// Realistic curvature geometry dictionary for highways and bridges
// This ensures bridges realistically arc over the East River and expressways follow shorelines
const REALISTIC_ROAD_CURVES: Record<string, [number, number][]> = {
  // Brooklyn Bridge Arc over the East River (from Civic Center/City Hall to DUMBO)
  'r_20_21': [
    [40.7100, -73.9990],
    [40.7088, -73.9965],
    [40.7065, -73.9930],
    [40.7045, -73.9905],
    [40.7030, -73.9890]
  ],
  // Williamsburg Bridge Toll Bypass Arc over the East River
  'r_19_21': [
    [40.7170, -73.9780],
    [40.7150, -73.9820],
    [40.7100, -73.9850],
    [40.7060, -73.9870],
    [40.7030, -73.9890]
  ],
  // FDR Drive Midtown Waterfront Shoreline curve
  'r_13_14': [
    [40.7430, -73.9740],
    [40.7390, -73.9725],
    [40.7350, -73.9730],
    [40.7310, -73.9740]
  ],
  // FDR Lower Expressway Shoreline
  'r_14_19': [
    [40.7310, -73.9740],
    [40.7260, -73.9720],
    [40.7210, -73.9745],
    [40.7170, -73.9780]
  ],
  // West Side Highway Hudson River Shoreline curve
  'r_17_18': [
    [40.7425, -74.0060],
    [40.7370, -74.0090],
    [40.7320, -74.0105],
    [40.7280, -74.0110]
  ],
  'r_18_10': [
    [40.7280, -74.0110],
    [40.7230, -74.0125],
    [40.7170, -74.0130],
    [40.7118, -74.0131]
  ],
};

// Map auto-fit & resize controller
function MapController({ coordinates, center }: { coordinates?: [number, number][]; center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size to ensure crisp full-container rendering without gray blocks
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (coordinates && coordinates.length > 1) {
      const bounds = L.latLngBounds(coordinates.map(c => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [coordinates, map]);

  return null;
}

// Google Maps Style SVG Teardrop Pin Marker
const createGoogleMapsPin = (
  loc: Location,
  isSource: boolean,
  isTarget: boolean,
  isCurrentVisualizer: boolean,
  isVisitedVisualizer: boolean,
  isIsolated: boolean
) => {
  let pinColor = '#1e40af'; // default dark blue
  let letter = '';
  let badgeIcon = '';
  let pinWidth = 28;
  let pinHeight = 36;
  let pulseHtml = '';

  if (isCurrentVisualizer) {
    pinColor = '#eab308'; // Amber Gold
    pulseHtml = `<div class="absolute -inset-2 rounded-full border-2 border-yellow-400 animate-ping opacity-75"></div>`;
    letter = '⚡';
  } else if (isSource) {
    pinColor = '#10b981'; // Google Maps Emerald Green
    pinWidth = 34;
    pinHeight = 44;
    letter = 'A';
    pulseHtml = `<div class="absolute -inset-2.5 rounded-full bg-emerald-400/30 animate-pulse"></div>`;
  } else if (isTarget) {
    pinColor = '#ef4444'; // Google Maps Crimson Red
    pinWidth = 34;
    pinHeight = 44;
    letter = 'B';
    pulseHtml = `<div class="absolute -inset-2.5 rounded-full bg-red-400/30 animate-pulse"></div>`;
  } else if (isVisitedVisualizer) {
    pinColor = '#06b6d4'; // Cyan
    pinWidth = 22;
    pinHeight = 28;
  } else if (isIsolated) {
    pinColor = '#64748b'; // Slate
    letter = '!';
  } else {
    // Category icons
    if (loc.type === 'terminal') {
      pinColor = '#2563eb';
      badgeIcon = '🚆';
    } else if (loc.type === 'hospital') {
      pinColor = '#dc2626';
      badgeIcon = '🏥';
    } else if (loc.name.includes('Bridge')) {
      pinColor = '#d97706';
      badgeIcon = '🌉';
    } else if (loc.name.includes('Park') || loc.name.includes('Circle')) {
      pinColor = '#059669';
      badgeIcon = '🌳';
    } else {
      pinColor = '#3b82f6';
      badgeIcon = '🏢';
    }
  }

  const labelHtml = (isSource || isTarget || loc.type === 'terminal' || loc.type === 'hospital')
    ? `<div class="absolute top-[100%] left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-bold whitespace-nowrap shadow-md pointer-events-none border border-white/20">
        ${loc.name}
       </div>`
    : '';

  const html = `
    <div class="relative flex flex-col items-center cursor-pointer group select-none">
      ${pulseHtml}
      <!-- SVG Teardrop Pin -->
      <svg width="${pinWidth}" height="${pinHeight}" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg"
           class="drop-shadow-lg transition-transform duration-200 group-hover:scale-125 group-hover:-translate-y-1">
        <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z"
              fill="${pinColor}"/>
        <circle cx="14" cy="14" r="10" fill="#ffffff"/>
      </svg>
      <!-- Center Symbol / Icon -->
      <div class="absolute top-[5px] left-0 right-0 flex items-center justify-center font-black text-xs" style="color: ${pinColor}">
        ${letter || badgeIcon || '•'}
      </div>
      <!-- Persistent Name Tag for Key Points -->
      ${labelHtml}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-google-pin',
    iconSize: [pinWidth, pinHeight],
    iconAnchor: [pinWidth / 2, pinHeight],
  });
};

const getTrafficColor = (level: TrafficLevel) => {
  switch (level) {
    case 'LOW': return '#10b981'; // Emerald Green
    case 'MEDIUM': return '#f59e0b'; // Amber / Orange
    case 'HIGH': return '#ef4444'; // Crimson Red
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
    isDarkMode,
  } = useNavigation();

  // Map theme: defaults to 'dark' if dark mode enabled, otherwise 'street' (Voyager)
  const [tileTheme, setTileTheme] = useState<TileTheme>(isDarkMode ? 'dark' : 'street');
  const [showTrafficOverlay, setShowTrafficOverlay] = useState<boolean>(true);

  // Sync default theme on dark mode change if user hasn't explicitly set satellite
  useEffect(() => {
    if (tileTheme !== 'satellite') {
      setTileTheme(isDarkMode ? 'dark' : 'street');
    }
  }, [isDarkMode]);

  // Center Manhattan default coordinates
  const defaultCenter: [number, number] = [40.7420, -73.9900];

  const currentVisualizerStepObj = visualizationTrace?.steps?.[visualizerCurrentStep];
  const visualizerVisitedNodes = currentVisualizerStepObj?.visited_nodes || [];
  const visualizerActiveNode = currentVisualizerStepObj?.current_node || -1;

  const locationLookup = useMemo(() => {
    const map = new Map<number, Location>();
    locations.forEach(loc => map.set(loc.id, loc));
    return map;
  }, [locations]);

  // Build curved polyline coordinates for roads (realistic geometry)
  const getRoadPositions = (road: Road): [number, number][] => {
    if (REALISTIC_ROAD_CURVES[road.id]) {
      return REALISTIC_ROAD_CURVES[road.id];
    }
    const revId = `${road.source_id}_${road.target_id}`;
    if (REALISTIC_ROAD_CURVES[revId]) {
      return REALISTIC_ROAD_CURVES[revId];
    }
    const u = locationLookup.get(road.source_id);
    const v = locationLookup.get(road.target_id);
    if (!u || !v) return [];
    return [[u.latitude, u.longitude], [v.latitude, v.longitude]];
  };

  const activeCoordinates = activeRoute?.path_coordinates || tspResponse?.complete_path_coordinates;

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Google Maps Style Navigation Header Overlay */}
      {activeRoute && activeRoute.found && (
        <div className="absolute top-3 left-3 right-3 z-[500] pointer-events-none flex justify-center">
          <div className="pointer-events-auto bg-slate-900/95 dark:bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/80 flex items-center justify-between gap-4 max-w-xl w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-md">
                <Navigation className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Fastest Route</span>
                  <span className="text-[10px] text-emerald-400 font-normal">via {activeRoute.detailed_steps?.[0]?.road_name || 'Highway'}</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {locationLookup.get(activeRoute.source_id)?.name} → {locationLookup.get(activeRoute.target_id)?.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-sm font-black text-emerald-400">
                  {activeRoute.total_time_minutes.toFixed(0)} min
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {activeRoute.total_distance_km.toFixed(1)} km
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Map Theme & Layer Switcher (Streets, Satellite, Dark) */}
      <div className="absolute top-3 right-3 z-[500] flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setTileTheme('street')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
            tileTheme === 'street'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" /> Streets
        </button>

        <button
          onClick={() => setTileTheme('satellite')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
            tileTheme === 'satellite'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" /> Satellite
        </button>

        <button
          onClick={() => setTileTheme('dark')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
            tileTheme === 'dark'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Moon className="w-3.5 h-3.5" /> Dark
        </button>

        <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5"></span>

        <button
          onClick={() => setShowTrafficOverlay(!showTrafficOverlay)}
          title="Toggle live road traffic congestion colors"
          className={`p-1.5 rounded-lg transition-colors ${
            showTrafficOverlay ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : 'text-slate-400'
          }`}
        >
          {showTrafficOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full flex-1"
      >
        <TileLayer
          key={tileTheme}
          url={TILE_CONFIG[tileTheme].url}
          attribution={TILE_CONFIG[tileTheme].attribution}
          maxZoom={TILE_CONFIG[tileTheme].maxZoom}
        />

        <MapController coordinates={activeCoordinates} center={defaultCenter} />

        {/* Realistic Road Polylines */}
        {roads.map(road => {
          const positions = getRoadPositions(road);
          if (positions.length < 2) return null;

          const color = showTrafficOverlay ? getTrafficColor(road.traffic_level) : '#94a3b8';
          const isBlocked = road.traffic_level === 'BLOCKED';

          return (
            <React.Fragment key={road.id}>
              {/* Outer casing road bed line */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color: isBlocked ? '#475569' : '#ffffff',
                  weight: 6,
                  opacity: 0.7,
                }}
              />
              {/* Colored Core Road Segment */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color,
                  weight: isBlocked ? 3 : 4,
                  opacity: isBlocked ? 0.7 : 0.95,
                  dashArray: isBlocked ? '6, 6' : undefined,
                }}
              >
                <Popup>
                  <div className="p-3 space-y-2 text-slate-800 dark:text-slate-100 min-w-[210px]">
                    <div className="font-bold text-sm border-b pb-1 dark:border-slate-700 flex justify-between items-center">
                      <span>{road.road_name}</span>
                      <span className="text-[10px] font-mono text-slate-400 capitalize">{road.road_type}</span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>Length: <span className="font-semibold">{road.distance_km} km</span></div>
                      <div>Speed Limit: <span className="font-semibold">{road.speed_limit_kmh} km/h</span></div>
                      <div>Tolls: <span className="font-semibold">${road.toll_cost.toFixed(2)}</span></div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span>Congestion:</span>
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
                            className={`py-1 rounded font-bold ${
                              road.traffic_level === lvl
                                ? 'bg-brand-600 text-white shadow'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
            </React.Fragment>
          );
        })}

        {/* Active Route: Google Maps Royal Blue Navigation Ribbon */}
        {activeRoute?.path_coordinates && activeRoute.path_coordinates.length > 1 && (
          <>
            {/* Outer Soft Cyan/Blue Glow */}
            <Polyline
              positions={activeRoute.path_coordinates}
              pathOptions={{
                color: '#38bdf8',
                weight: 12,
                opacity: 0.45,
              }}
            />
            {/* Dark Border Contrast Casing */}
            <Polyline
              positions={activeRoute.path_coordinates}
              pathOptions={{
                color: '#1e3a8a',
                weight: 8,
                opacity: 0.9,
              }}
            />
            {/* Core Google Royal Blue Ribbon */}
            <Polyline
              positions={activeRoute.path_coordinates}
              pathOptions={{
                color: '#2563eb',
                weight: 5,
                opacity: 1.0,
              }}
            />
          </>
        )}

        {/* Multi-Criteria Comparison Alternative Routes */}
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

        {/* Multi-Stop TSP Complete Circuit in Cyan */}
        {tspResponse?.complete_path_coordinates && tspResponse.complete_path_coordinates.length > 1 && (
          <Polyline
            positions={tspResponse.complete_path_coordinates}
            pathOptions={{ color: '#06b6d4', weight: 6, opacity: 0.9 }}
          />
        )}

        {/* Realistic Google Maps Teardrop Markers */}
        {locations.map(loc => {
          const isSource = loc.id === selectedSourceId;
          const isTarget = loc.id === selectedTargetId;
          const isCurrentVis = loc.id === visualizerActiveNode;
          const isVisitedVis = visualizerVisitedNodes.includes(loc.id);
          const isIsolated = loc.id >= 90;

          const pinIcon = createGoogleMapsPin(loc, isSource, isTarget, isCurrentVis, isVisitedVis, isIsolated);

          return (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={pinIcon}
            >
              <Popup>
                <div className="p-3 space-y-2 text-slate-800 dark:text-slate-100 min-w-[220px]">
                  <div className="flex items-center justify-between border-b pb-1 dark:border-slate-700">
                    <span className="font-bold text-sm">{loc.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      #{loc.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                    <div>Category: <span className="font-semibold capitalize text-slate-900 dark:text-white">{loc.type}</span></div>
                    <div>Elevation: <span className="font-semibold text-slate-900 dark:text-white">{loc.elevation_m}m</span></div>
                    <div>GPS: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</div>
                    {loc.description && <div className="italic text-[11px] text-slate-500 pt-0.5">{loc.description}</div>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-slate-700">
                    <button
                      onClick={() => setSelectedSourceId(loc.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                        isSource
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" /> Start (A)
                    </button>
                    <button
                      onClick={() => setSelectedTargetId(loc.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                        isTarget
                          ? 'bg-red-600 text-white'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" /> Dest (B)
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Bottom Left Traffic Legend */}
      <div className="absolute bottom-4 left-4 z-[500] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2.5 text-xs pointer-events-auto space-y-1.5 max-w-[210px]">
        <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-brand-500" /> Live Highway Traffic
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
            <span>Fast / Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></span>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></span>
            <span>Heavy Delay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm"></span>
            <span>Blocked / Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
