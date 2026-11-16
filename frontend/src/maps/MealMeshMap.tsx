import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteWaypoint } from '../types/mealmesh';

// Create custom colored SVG marker icons for crisp rendering
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 13px;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
      ">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

interface MealMeshMapProps {
  waypoints?: RouteWaypoint[];
  routePath?: RouteWaypoint[];
  selectedWaypointId?: string;
  onSelectWaypoint?: (wp: RouteWaypoint) => void;
  height?: string;
}

export const MealMeshMap: React.FC<MealMeshMapProps> = ({
  waypoints = [],
  routePath = [],
  selectedWaypointId,
  onSelectWaypoint,
  height = '500px',
}) => {
  const center: [number, number] = [12.9600, 77.6200]; // Central Bengaluru

  // Polyline positions
  const polylineCoords: [number, number][] = routePath.map((wp) => [wp.latitude, wp.longitude]);

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white" style={{ height }}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Drawn Route Polyline */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            color="#059669"
            weight={5}
            opacity={0.85}
            dashArray="8, 6"
          />
        )}

        {/* Render Waypoint Markers */}
        {waypoints.map((wp, idx) => {
          const isSelected = wp.id === selectedWaypointId;
          const color =
            wp.type === 'DONOR'
              ? '#047857' // Emerald Forest Green
              : wp.type === 'NGO'
              ? '#2563eb' // Royal Blue
              : wp.type === 'VOLUNTEER'
              ? '#d97706' // Warm Amber
              : '#475569'; // Slate Junction

          const symbol =
            wp.type === 'DONOR' ? '🍲' : wp.type === 'NGO' ? '🏠' : wp.type === 'VOLUNTEER' ? '🛵' : '📍';

          return (
            <Marker
              key={wp.id || idx}
              position={[wp.latitude, wp.longitude]}
              icon={createCustomIcon(isSelected ? '#ea580c' : color, symbol)}
              eventHandlers={{
                click: () => onSelectWaypoint && onSelectWaypoint(wp),
              }}
            >
              <Popup>
                <div className="p-1 max-w-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 text-xs font-semibold rounded"
                      style={{ backgroundColor: color + '20', color }}
                    >
                      {wp.type}
                    </span>
                    <span className="text-xs text-slate-500">{wp.id}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{wp.label}</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Lat: {wp.latitude.toFixed(4)}, Lon: {wp.longitude.toFixed(4)}
                  </p>
                  {onSelectWaypoint && (
                    <button
                      onClick={() => onSelectWaypoint(wp)}
                      className="mt-2 w-full text-xs font-medium bg-emerald-700 hover:bg-emerald-800 text-white py-1 px-2 rounded transition"
                    >
                      Select Location
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
