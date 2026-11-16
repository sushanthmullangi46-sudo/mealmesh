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
  ShieldCheck,
  Zap,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Compass,
  BatteryCharging,
  Thermometer,
  Users,
  Radio,
  Truck,
} from 'lucide-react';

// Ultra-realistic detailed street coordinates following actual Bengaluru road geometries
// from ITC Gardenia Kitchen (Koramangala 4th Block) to Akshaya Patra Foundation Hub (Jayanagar 4th Block)
export const BENGALURU_REALISTIC_ROAD_TRACK: [number, number][] = [
  [12.9352, 77.6245], // Start: ITC Gardenia Kitchen, Koramangala 4th Block
  [12.9348, 77.6253], // 80ft Road 4th Cross
  [12.9342, 77.6264], // 80ft Road Boulevard Entry
  [12.9335, 77.6272], // Passing Bethany High School
  [12.9328, 77.6279], // 80ft Road commercial curve
  [12.9318, 77.6288], // Approaching Sony World Signal Junction
  [12.9312, 77.6293], // Sony World Signal Intersection Turn
  [12.9304, 77.6300], // Merge onto 100ft Intermediate Ring Road
  [12.9295, 77.6309], // Maharaja Signal Junction
  [12.9284, 77.6318], // Koramangala Indoor Stadium Curve
  [12.9272, 77.6327], // Intermediate Ring Road Arterial Corridor
  [12.9261, 77.6334], // St. John's Hospital North Gate
  [12.9248, 77.6342], // Koramangala Water Tank Circle
  [12.9235, 77.6351], // St. John's Medical College Road
  [12.9221, 77.6361], // Sarjapur Road Intersection Ramp
  [12.9208, 77.6373], // Agara Lake North Promenade
  [12.9196, 77.6387], // Agara Lake Boulevard Curve
  [12.9184, 77.6401], // Approaching Agara Flyover Ascent
  [12.9172, 77.6416], // Agara Flyover Bridge
  [12.9160, 77.6428], // Flyover Central Overpass
  [12.9148, 77.6436], // Flyover Descent into HSR Layout
  [12.9135, 77.6441], // 27th Main Road HSR Layout Entry
  [12.9122, 77.6445], // HSR Sector 1 Commercial Strip
  [12.9115, 77.6432], // 27th Main & 19th Main Crossing
  [12.9120, 77.6415], // 19th Main Road Corridor
  [12.9128, 77.6385], // 14th Main Arterial Road Junction
  [12.9136, 77.6355], // HSR Sector 5 Link Road
  [12.9143, 77.6325], // Madiwala Lake Peripheral Road
  [12.9150, 77.6295], // Silk Board Bypass Slip Road
  [12.9158, 77.6265], // Merge onto Outer Ring Road (ORR) BTM Corridor
  [12.9164, 77.6235], // BTM Layout 1st Stage
  [12.9170, 77.6200], // BTM 2nd Stage Ring Road
  [12.9176, 77.6168], // Approaching Udupi Garden Signal
  [12.9182, 77.6135], // Udupi Garden Signal Junction
  [12.9189, 77.6105], // Jayadeva Hospital Flyover Approach
  [12.9195, 77.6075], // Jayadeva Hospital Underpass
  [12.9202, 77.6045], // Bannerghatta Road Interchange
  [12.9209, 77.6015], // East End Circle, Jayanagar
  [12.9216, 77.5992], // Jayanagar 9th Block East Main Road
  [12.9224, 77.5975], // 9th Block Market Boulevard
  [12.9232, 77.5960], // 32nd Cross Road Intersection
  [12.9238, 77.5950], // Jayanagar 4th 'T' Block Entry
  [12.9244, 77.5942], // 10th Main Road Jayanagar
  [12.9250, 77.5938], // Destination: Akshaya Patra Foundation Hub, Jayanagar
];

// Realistic turn-by-turn navigation instructions mapped along the route
interface RouteManeuver {
  progressThreshold: number; // 0.0 to 1.0
  instruction: string;
  roadName: string;
  type: 'turn-right' | 'turn-left' | 'straight' | 'fork' | 'destination';
  distanceMeters: number;
}

const ROUTE_MANEUVERS: RouteManeuver[] = [
  {
    progressThreshold: 0.12,
    instruction: 'In 180 m: Turn Right at Sony World Signal onto Intermediate Ring Rd',
    roadName: 'Koramangala 80ft Boulevard',
    type: 'turn-right',
    distanceMeters: 180,
  },
  {
    progressThreshold: 0.32,
    instruction: 'In 650 m: Continue straight past St. John\'s Hospital towards Agara Lake',
    roadName: '100ft Intermediate Ring Road',
    type: 'straight',
    distanceMeters: 650,
  },
  {
    progressThreshold: 0.48,
    instruction: 'In 240 m: Take Agara Flyover ramp towards HSR Layout',
    roadName: 'Agara Lake Promenade',
    type: 'fork',
    distanceMeters: 240,
  },
  {
    progressThreshold: 0.65,
    instruction: 'In 380 m: Turn Right onto Outer Ring Road towards BTM / Jayadeva',
    roadName: '27th Main Road, HSR Sector 1',
    type: 'turn-right',
    distanceMeters: 380,
  },
  {
    progressThreshold: 0.85,
    instruction: 'In 420 m: Continue through Jayadeva Underpass towards Jayanagar',
    roadName: 'BTM Outer Ring Road',
    type: 'straight',
    distanceMeters: 420,
  },
  {
    progressThreshold: 0.96,
    instruction: 'In 150 m: Turn Left at East End Circle onto 9th Block Main Rd',
    roadName: 'East End Circle, Jayanagar',
    type: 'turn-left',
    distanceMeters: 150,
  },
  {
    progressThreshold: 1.0,
    instruction: 'Destination on the Left: Akshaya Patra Redistribution Hub',
    roadName: 'Jayanagar 4th \'T\' Block',
    type: 'destination',
    distanceMeters: 30,
  },
];

// Active Volunteer Fleet Locations across Bengaluru
const ACTIVE_FLEET_VOLUNTEERS = [
  {
    id: 'vol-priya',
    name: 'Priya Sundaram',
    vehicle: 'Ather 450X (Electric)',
    regNumber: 'KA-05-MR-4421',
    coords: [12.9378, 77.6315] as [number, number],
    status: 'In-Transit to Indiranagar Hub',
    rating: '4.95',
    speedKmH: 31,
    battery: 88,
  },
  {
    id: 'vol-farhan',
    name: 'Mohammed Farhan',
    vehicle: 'Ola S1 Pro (Electric)',
    regNumber: 'KA-03-JN-8832',
    coords: [12.9138, 77.6415] as [number, number],
    status: 'Delivered 35 kg Warm Meals',
    rating: '4.88',
    speedKmH: 0,
    battery: 76,
  },
  {
    id: 'vol-ananya',
    name: 'Ananya Deshmukh',
    vehicle: 'TVS iQube (Electric)',
    regNumber: 'KA-04-EL-2094',
    coords: [12.9178, 77.6162] as [number, number],
    status: 'En-Route with Bread Surplus',
    rating: '4.92',
    speedKmH: 26,
    battery: 82,
  },
  {
    id: 'vol-vikram',
    name: 'Vikramaditya Rao',
    vehicle: 'Tata Ace EV (Mini-Van)',
    regNumber: 'KA-51-MD-9002',
    coords: [12.9168, 77.6248] as [number, number],
    status: 'Bulk Consignment Transporter',
    rating: '4.97',
    speedKmH: 22,
    battery: 91,
  },
];

// Helper to calculate total distance along coordinates in km
function calculateTotalDistance(coords: [number, number][]): number {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lon1] = coords[i];
    const [lat2, lon2] = coords[i + 1];
    const R = 6371;
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      ">
        🏠
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

// Primary Consignment Courier Moving Scooter
const createScooterIcon = (bearing: number = 0) =>
  L.divIcon({
    className: 'custom-scooter-icon',
    html: `
      <div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
        <!-- Pulsing radar sonar wave -->
        <div style="
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.4);
          animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>

        <!-- Scooter body -->
        <div style="
          width: 40px;
          height: 40px;
          background: #0f172a;
          border-radius: 50%;
          border: 3px solid #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(0,0,0,0.45);
          transform: rotate(${bearing}deg);
          transition: transform 0.2s ease-out;
        ">
          <span style="font-size: 22px;">🛵</span>
        </div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
  });

// Other Active Fleet Volunteers Icon
const createFleetVolunteerIcon = (type: string = 'TWO_WHEELER') =>
  L.divIcon({
    className: 'fleet-volunteer-icon',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.3);
          animation: pulse 2s infinite;
        "></div>
        <div style="
          width: 28px;
          height: 28px;
          background: #1e293b;
          border-radius: 50%;
          border: 2px solid #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          font-size: 14px;
        ">
          ${type === 'FOUR_WHEELER' ? '🚚' : '🛵'}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
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
  donorName = 'ITC Gardenia Kitchen, Koramangala 4th Block',
  ngoName = 'Akshaya Patra Redistribution Hub, Jayanagar',
  transporterName = 'Rahul Sharma',
  vehicleNumber = 'Hero Electric Photon • KA-01-EQ-1001',
  deliveryId,
  onDelivered,
  height = '580px',
}) => {
  const roadCoordinates = BENGALURU_REALISTIC_ROAD_TRACK;
  const totalDistanceKm = calculateTotalDistance(roadCoordinates);

  // Live simulation states (under 5 minutes, default 120s)
  const [totalDurationSec, setTotalDurationSec] = useState<number>(120);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1x, 2x, 4x
  const [isReached, setIsReached] = useState<boolean>(false);
  const [showFleet, setShowFleet] = useState<boolean>(true);

  const hasNotifiedRef = useRef<boolean>(false);

  // Timer loop: runs continuously live
  useEffect(() => {
    const intervalMs = 200; // updates 5 times per second for fluid motion
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

  // Current realistic turn-by-turn instruction
  const currentManeuver =
    ROUTE_MANEUVERS.find((m) => progress < m.progressThreshold) ||
    ROUTE_MANEUVERS[ROUTE_MANEUVERS.length - 1];

  // Calculate realistic dynamic speed (slower near signals/turns, faster on ORR)
  const isNearTurn = rawIndex % 5 < 1.2;
  const currentSpeedKmH = isReached ? 0 : isNearTurn ? 18 : 36;

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white flex flex-col relative font-sans">
      {/* Top Telemetry Header - Clean "Live Tracking" Heading */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span
              className={`w-3.5 h-3.5 rounded-full block ${
                isReached ? 'bg-emerald-400' : 'bg-emerald-500 animate-pulse'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                {isReached
                  ? '🎉 Consignment Reached Destination!'
                  : 'Live Tracking'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isReached
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                }`}
              >
                {isReached ? 'DELIVERED' : 'HIGH-ACCURACY GPS'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {isReached
                ? `Delivered ${quantityKg} kg hot meals to ${ngoName}.`
                : `${transporterName} navigating via ${currentManeuver.roadName}.`}
            </p>
          </div>
        </div>

        {/* Speed Multiplier & Fleet Controls */}
        <div className="flex items-center gap-2.5">
          {/* Active Fleet Toggle */}
          <button
            onClick={() => setShowFleet(!showFleet)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              showFleet
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Fleet ({ACTIVE_FLEET_VOLUNTEERS.length + 1})</span>
          </button>

          {/* Speed Controls */}
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
            title="Restart Simulation"
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
          {/* CartoDB High-Definition Street Map Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapBoundsWatcher coords={roadCoordinates} />

          {/* Route Outer Glowing Halo */}
          <Polyline
            positions={roadCoordinates}
            color="#059669"
            weight={10}
            opacity={0.16}
            lineCap="round"
          />

          {/* Traversed Road Track (Solid Emerald Green) */}
          {traversedCoords.length > 1 && (
            <Polyline
              positions={traversedCoords}
              color="#059669"
              weight={5}
              opacity={0.95}
              lineCap="round"
            />
          )}

          {/* Remaining Road Track (Dashed Royal Blue) */}
          {remainingCoords.length > 1 && (
            <Polyline
              positions={remainingCoords}
              color="#2563eb"
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
                <span className="text-emerald-700 font-bold block">{quantityKg} kg Surplus Meals</span>
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

          {/* Primary Moving Courier Scooter Marker */}
          <Marker position={[riderLat, riderLon]} icon={createScooterIcon(bearing)}>
            <Popup>
              <div className="text-xs p-1 space-y-1 font-sans">
                <span className="font-bold text-slate-900 block">🛵 {transporterName}</span>
                <p className="text-slate-500 text-[11px]">{vehicleNumber}</p>
                <p className="text-emerald-700 font-bold text-[11px]">
                  {isReached ? 'Arrived at Destination!' : `${remainingDistKm} km remaining`}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Other Active Volunteer Fleet Vehicles in Bengaluru */}
          {showFleet &&
            ACTIVE_FLEET_VOLUNTEERS.map((vol) => (
              <Marker
                key={vol.id}
                position={vol.coords}
                icon={createFleetVolunteerIcon(vol.id === 'vol-vikram' ? 'FOUR_WHEELER' : 'TWO_WHEELER')}
              >
                <Popup>
                  <div className="text-xs p-1.5 space-y-1 font-sans">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>{vol.name}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded">⭐ {vol.rating}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-mono">{vol.vehicle} • {vol.regNumber}</p>
                    <div className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                      <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                      <span>{vol.status}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">Battery: {vol.battery}%</span>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Turn-by-Turn GPS Navigation Overlay (Like Google Maps / Waze) */}
        {!isReached && (
          <div className="absolute top-4 left-4 z-[1000] pointer-events-auto max-w-sm">
            <div className="bg-emerald-950/95 backdrop-blur-md text-white rounded-2xl p-3.5 border border-emerald-800 shadow-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center shrink-0 border border-emerald-600">
                {currentManeuver.type === 'turn-right' && <CornerUpRight className="w-5 h-5 text-emerald-300" />}
                {currentManeuver.type === 'turn-left' && <CornerUpLeft className="w-5 h-5 text-emerald-300" />}
                {currentManeuver.type === 'straight' && <ArrowUp className="w-5 h-5 text-emerald-300" />}
                {currentManeuver.type === 'fork' && <Compass className="w-5 h-5 text-emerald-300" />}
                {currentManeuver.type === 'destination' && <MapPin className="w-5 h-5 text-emerald-300" />}
              </div>
              <div>
                <p className="text-xs font-extrabold text-white leading-tight">
                  {currentManeuver.instruction}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-emerald-300 font-medium truncate max-w-[200px]">
                    {currentManeuver.roadName}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-800/80 px-1.5 py-0.2 rounded text-emerald-200">
                    ~{Math.round(currentSpeedKmH)} km/h
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Tracking HUD Card (Bottom Sheet) */}
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
                    {isReached ? 'Handover Complete' : 'Live Journey Telemetry'}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                    {isReached
                      ? 'Consignment Safely Reached NGO Hub'
                      : `Estimated Arrival in ${remainingMinsFormatted}`}
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    {isReached
                      ? `Digital Handover Verified • ${Math.round(quantityKg * 2.5)} meals received`
                      : `${remainingDistKm} km remaining • Speed: ~${currentSpeedKmH} km/h • Dual-Band GPS`}
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
                    {isReached ? 'Arrived' : 'ETA Countdown'}
                  </span>
                </div>

                {isReached && (
                  <button
                    onClick={handleRestart}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Replay Demo
                  </button>
                )}
              </div>
            </div>

            {/* Continuous Progress Bar */}
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

            {/* Real Telemetry Grid: Transporter, Battery, Thermal Box & GPS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Transporter</span>
                <span className="font-bold text-slate-900 block truncate">{transporterName}</span>
                <span className="text-[10px] text-emerald-700 font-semibold">⭐ 4.9 (320 deliveries)</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Vehicle & Battery</span>
                <span className="font-bold text-slate-900 block truncate">Hero Electric Photon</span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <BatteryCharging className="w-3 h-3" /> 84% • Range: 46 km
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Consignment Safety</span>
                <span className="font-bold text-slate-900 block truncate">{foodTitle}</span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Thermometer className="w-3 h-3" /> 64.6°C Insulated Safe
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Telemetry Accuracy</span>
                <span className="font-bold text-slate-900 block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> NavIC / GPS Lock
                </span>
                <span className="text-[10px] text-slate-500">±1.2m Accuracy • 14 Sats</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
