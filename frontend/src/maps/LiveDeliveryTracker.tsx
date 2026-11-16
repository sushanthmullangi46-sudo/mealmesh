import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Bike,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  RotateCcw,
  FastForward,
  ShieldCheck,
  Zap,
  Flame,
  Award,
  Phone,
} from 'lucide-react';

// Realistic detailed road coordinates following Bengaluru arterial streets
// (Koramangala 80ft Rd -> Sony World -> Ring Rd -> Agara -> HSR -> BTM -> Jayanagar Akshaya Patra Hub)
export const BENGALURU_REALISTIC_ROAD_TRACK: [number, number][] = [
  [12.9352, 77.6245], // Start: ITC Gardenia Kitchen, Koramangala 4th Block
  [12.9345, 77.6258], // 80ft Road 5th Cross
  [12.9332, 77.6275], // Koramangala 80ft Rd Boulevard
  [12.9315, 77.6289], // Sony World Signal Junction
  [12.9298, 77.6302], // 100ft Road Entry
  [12.9275, 77.6320], // Intermediate Ring Road
  [12.9255, 77.6335], // St. John's Medical College Road
  [12.9230, 77.6350], // Koramangala Water Tank Junction
  [12.9205, 77.6372], // Sarjapur Road Intersection
  [12.9188, 77.6395], // Agara Lake Boulevard
  [12.9165, 77.6418], // Agara Flyover Approach
  [12.9142, 77.6435], // 27th Main HSR Entry
  [12.9121, 77.6446], // HSR Layout Sector 2 Junction
  [12.9130, 77.6400], // 14th Main Arterial Road
  [12.9142, 77.6345], // Madiwala Lake Peripheral Rd
  [12.9155, 77.6280], // Outer Ring Road BTM Approach
  [12.9168, 77.6210], // BTM Layout 2nd Stage Ring Rd
  [12.9182, 77.6145], // Udupi Garden Signal
  [12.9195, 77.6080], // Jayadeva Hospital Flyover
  [12.9212, 77.6020], // East End Circle
  [12.9228, 77.5975], // Jayanagar 9th Block Main Rd
  [12.9240, 77.5955], // Jayanagar 4th 'T' Block Crossing
  [12.9250, 77.5938], // Destination: Akshaya Patra Foundation Hub, Jayanagar
];

// Helper to calculate total distance along coordinates in km
function calculateTotalDistance(coords: [number, number][]): number {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lon1] = coords[i];
    const [lat2, lon2] = coords[i + 1];
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return Math.round(total * 10) / 10;
}

// Custom Marker Icons
const createOriginIcon = () =>
  L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background: #047857;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      ">
        🍲
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

const createDestIcon = () =>
  L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background: #2563eb;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      ">
        🏠
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

// Swiggy/Zomato style moving scooter marker with pulsing radar wave
const createScooterIcon = (bearing: number = 0) =>
  L.divIcon({
    className: 'custom-scooter-icon',
    html: `
      <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
        <!-- Pulsing radar wave -->
        <div style="
          position: absolute;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.35);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>

        <!-- Scooter body -->
        <div style="
          width: 38px;
          height: 38px;
          background: #0f172a;
          border-radius: 50%;
          border: 3px solid #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 14px rgba(0,0,0,0.4);
          transform: rotate(${bearing}deg);
          transition: transform 0.2s ease-out;
        ">
          <span style="font-size: 20px;">🛵</span>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

// Component to dynamically fit map bounds
const MapBoundsWatcher: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 1) {
      const bounds = L.latLngBounds(coords.map(([lat, lon]) => [lat, lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map]);
  return null;
};

interface LiveDeliveryTrackerProps {
  foodTitle?: string;
  quantityKg?: number;
  donorName?: string;
  ngoName?: string;
  transporterName?: string;
  vehicleNumber?: string;
  deliveryId?: string;
  onDelivered?: () => void;
  height?: string;
}

export const LiveDeliveryTracker: React.FC<LiveDeliveryTrackerProps> = ({
  foodTitle = 'South Indian Sambar, Rice & Poriyal',
  quantityKg = 25,
  donorName = 'ITC Gardenia Kitchen, Koramangala',
  ngoName = 'Akshaya Patra Redistribution Hub, Jayanagar',
  transporterName = 'Rahul Sharma',
  vehicleNumber = 'Hero Electric • KA-01-EQ-1001',
  deliveryId,
  onDelivered,
  height = '560px',
}) => {
  const roadCoordinates = BENGALURU_REALISTIC_ROAD_TRACK;
  const totalDistanceKm = calculateTotalDistance(roadCoordinates);

  // Live simulation states
  // User asked: "make the time less than 5 min so that i can show project so that after the time complete it shows reached"
  // Default total duration: 120 seconds (2 minutes)
  const [totalDurationSec, setTotalDurationSec] = useState<number>(120);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1x, 2x, 4x demo acceleration
  const [isReached, setIsReached] = useState<boolean>(false);

  const hasNotifiedRef = useRef<boolean>(false);

  // Timer loop: runs continuously live
  useEffect(() => {
    const intervalMs = 200; // updates 5 times per second for smooth motion
    const timer = setInterval(() => {
      setElapsedSec((prev) => {
        const next = prev + (intervalMs / 1000) * speedMultiplier;
        if (next >= totalDurationSec) {
          setIsReached(true);
          return totalDurationSec;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [totalDurationSec, speedMultiplier]);

  // When reached, notify callback once
  useEffect(() => {
    if (isReached && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      if (onDelivered) {
        onDelivered();
      }
    }
  }, [isReached, onDelivered]);

  // Reset simulation
  const handleRestart = () => {
    setElapsedSec(0);
    setIsReached(false);
    hasNotifiedRef.current = false;
  };

  // Calculate current progress (0.0 to 1.0)
  const progress = Math.min(1.0, elapsedSec / Math.max(1, totalDurationSec));

  // Compute current interpolated rider position and bearing
  const totalPoints = roadCoordinates.length;
  const rawIndex = progress * (totalPoints - 1);
  const currentIndex = Math.min(totalPoints - 2, Math.floor(rawIndex));
  const subProgress = rawIndex - currentIndex;

  const currentPoint = roadCoordinates[currentIndex];
  const nextPoint = roadCoordinates[currentIndex + 1] || currentPoint;

  const riderLat = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * subProgress;
  const riderLon = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * subProgress;

  // Bearing angle calculation for scooter rotation
  const dLat = nextPoint[0] - currentPoint[0];
  const dLon = nextPoint[1] - currentPoint[1];
  const bearing = Math.round((Math.atan2(dLon, dLat) * 180) / Math.PI);

  // Traversed polyline vs remaining polyline
  const traversedCoords: [number, number][] = [
    ...roadCoordinates.slice(0, currentIndex + 1),
    [riderLat, riderLon],
  ];

  const remainingCoords: [number, number][] = [
    [riderLat, riderLon],
    ...roadCoordinates.slice(currentIndex + 1),
  ];

  // Remaining distance & time metrics
  const remainingDistKm = Math.max(0, Math.round(totalDistanceKm * (1 - progress) * 10) / 10);
  const remainingSec = Math.max(0, Math.ceil(totalDurationSec - elapsedSec));
  const remainingMinsFormatted = `${Math.floor(remainingSec / 60)
    .toString()
    .padStart(2, '0')}:${(remainingSec % 60).toString().padStart(2, '0')}`;

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white flex flex-col relative">
      {/* Top Floating Swiggy/Zomato Status Bar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span
              className={`w-3 h-3 rounded-full block ${
                isReached ? 'bg-emerald-400' : 'bg-emerald-500 animate-pulse'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                {isReached
                  ? '🎉 Consignment Reached Destination!'
                  : '⚡ Live Dispatch Telemetry (Swiggy/Zomato Tracking)'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isReached
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                }`}
              >
                {isReached ? 'DELIVERED' : 'IN_TRANSIT'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {isReached
                ? `Successfully delivered ${quantityKg} kg meals to ${ngoName}.`
                : `${transporterName} is navigating via Koramangala 80ft Rd & Ring Rd.`}
            </p>
          </div>
        </div>

        {/* Speed Multiplier & Restart Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">
            Simulation Speed:
          </span>
          <div className="inline-flex rounded-xl bg-slate-800 p-0.5 border border-slate-700 text-xs">
            {[1, 2, 4].map((mult) => (
              <button
                key={mult}
                onClick={() => setSpeedMultiplier(mult)}
                className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition ${
                  speedMultiplier === mult
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mult}x
              </button>
            ))}
          </div>

          <button
            onClick={handleRestart}
            title="Restart Live Tracking from Pickup"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Realistic Leaflet Map View */}
      <div className="relative" style={{ height }}>
        <MapContainer
          center={[12.9285, 77.6180]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* CartoDB / OSM High-Definition Map Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapBoundsWatcher coords={roadCoordinates} />

          {/* Glowing Outer Route Halo */}
          <Polyline
            positions={roadCoordinates}
            color="#059669"
            weight={10}
            opacity={0.18}
            lineCap="round"
          />

          {/* Traversed Road Polyline (Solid Emerald) */}
          {traversedCoords.length > 1 && (
            <Polyline
              positions={traversedCoords}
              color="#059669"
              weight={5}
              opacity={0.95}
              lineCap="round"
            />
          )}

          {/* Remaining Road Polyline (Dashed Blue/Slate) */}
          {remainingCoords.length > 1 && (
            <Polyline
              positions={remainingCoords}
              color="#3b82f6"
              weight={4}
              opacity={0.8}
              dashArray="8, 8"
              lineCap="round"
            />
          )}

          {/* Origin Marker (Donor) */}
          <Marker position={roadCoordinates[0]} icon={createOriginIcon()}>
            <Popup>
              <div className="text-xs p-1 space-y-1">
                <span className="font-bold text-slate-900 block">🍲 Food Pickup Point</span>
                <p className="text-slate-600 font-medium">{donorName}</p>
                <span className="text-emerald-700 font-bold block">{quantityKg} kg Warm Meals Prepared</span>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker (NGO) */}
          <Marker position={roadCoordinates[roadCoordinates.length - 1]} icon={createDestIcon()}>
            <Popup>
              <div className="text-xs p-1 space-y-1">
                <span className="font-bold text-slate-900 block">🏠 Redistribution Hub</span>
                <p className="text-slate-600 font-medium">{ngoName}</p>
                <span className="text-blue-700 font-bold block">Target Beneficiaries: 250 People</span>
              </div>
            </Popup>
          </Marker>

          {/* Moving Scooter Marker */}
          <Marker position={[riderLat, riderLon]} icon={createScooterIcon(bearing)}>
            <Popup>
              <div className="text-xs p-1 space-y-1 font-sans">
                <span className="font-bold text-slate-900 block">🛵 {transporterName}</span>
                <p className="text-slate-500 text-[11px]">{vehicleNumber}</p>
                <p className="text-emerald-700 font-bold text-[11px]">
                  {isReached ? 'Arrived at NGO!' : `${remainingDistKm} km remaining`}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Swiggy/Zomato Tracking HUD Card (Bottom Sheet) */}
        <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 z-[1000] pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200/90 shadow-2xl space-y-3.5">
            {/* Countdown & ETA Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl ${
                    isReached ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    {isReached ? 'Mission Accomplished' : 'Live Order Journey'}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                    {isReached
                      ? 'Consignment Safely Reached NGO Hub'
                      : `Estimated Arrival in ${remainingMinsFormatted}`}
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    {isReached
                      ? `Handover verified • ${Math.round(quantityKg * 2.5)} meals delivered`
                      : `${remainingDistKm} km away • Speed: ~${isReached ? 0 : 28} km/h on Outer Ring Rd`}
                  </span>
                </div>
              </div>

              {/* Countdown Digits Pill */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                    {isReached ? '00:00' : remainingMinsFormatted}
                  </span>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    {isReached ? 'Arrived' : 'Time Remaining'}
                  </span>
                </div>

                {isReached && (
                  <button
                    onClick={handleRestart}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Replay
                  </button>
                )}
              </div>
            </div>

            {/* Continuous Animated Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <MapPin className="w-3 h-3" /> {donorName.split(',')[0]}
                </span>
                <span>{Math.round(progress * 100)}% Traversed</span>
                <span className="flex items-center gap-1 text-blue-700">
                  <MapPin className="w-3 h-3" /> {ngoName.split(',')[0]}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    isReached
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            {/* Partner Identity & Food Details Footer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Transporter</span>
                <span className="font-bold text-slate-900 block truncate">{transporterName}</span>
                <span className="text-[10px] text-emerald-700 font-semibold">⭐ 4.9 (320 trips)</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Vehicle</span>
                <span className="font-bold text-slate-900 block truncate">Hero Electric Photon</span>
                <span className="text-[10px] text-slate-500 font-mono">KA-01-EQ-1001</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Consignment</span>
                <span className="font-bold text-slate-900 block truncate">{foodTitle}</span>
                <span className="text-[10px] text-emerald-700 font-extrabold">{quantityKg} kg Surplus</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Safety Status</span>
                <span className="font-bold text-emerald-800 block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Insulated Box
                </span>
                <span className="text-[10px] text-slate-500">65°C Thermal Retained</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
