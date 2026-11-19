import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Delivery, RouteResponse, RouteWaypoint, VolunteerProfile } from '../types/mealmesh';
import { MealMeshMap } from '../maps/MealMeshMap';
import { LiveDeliveryTracker, DisruptionType } from '../maps/LiveDeliveryTracker';
import { DisruptionSimulatorModal } from '../components/DisruptionSimulatorModal';
import { ThermalExposurePanel } from '../components/ThermalExposurePanel';
import {
  Bike,
  Navigation,
  CheckCircle,
  Clock,
  MapPin,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  PackageCheck,
  Radio,
  Zap,
  Users,
  ShieldCheck,
  BatteryCharging,
  AlertTriangle,
  QrCode,
  Thermometer,
  X,
} from 'lucide-react';

const SEEDED_FLEET_VOLUNTEERS = [
  { name: 'Rahul Sharma', vehicle: 'Hero Electric Photon', reg: 'KA-01-EQ-1001', area: 'Koramangala', rating: '4.9', completed: 32 },
  { name: 'Priya Sundaram', vehicle: 'Ather 450X', reg: 'KA-05-MR-4421', area: 'Indiranagar', rating: '4.95', completed: 45 },
  { name: 'Mohammed Farhan', vehicle: 'Ola S1 Pro', reg: 'KA-03-JN-8832', area: 'HSR Layout', rating: '4.88', completed: 62 },
  { name: 'Ananya Deshmukh', vehicle: 'TVS iQube', reg: 'KA-04-EL-2094', area: 'BTM / Jayanagar', rating: '4.92', completed: 38 },
  { name: 'Vikramaditya Rao', vehicle: 'Tata Ace EV Mini-Van', reg: 'KA-51-MD-9002', area: 'Silk Board Hub', rating: '4.97', completed: 112 },
  { name: 'Deepa R. Nair', vehicle: 'Ampere Magnus', reg: 'KA-01-HG-3301', area: 'Electronic City', rating: '4.89', completed: 29 },
];

export const VolunteerDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [allWaypoints, setAllWaypoints] = useState<RouteWaypoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'live' | 'dijkstra'>('live');
  const [activeVolunteerIndex, setActiveVolunteerIndex] = useState<number>(0);
  const [showDisruptionModal, setShowDisruptionModal] = useState<boolean>(false);
  const [showThermalModal, setShowThermalModal] = useState<boolean>(false);
  const [disruptionNotice, setDisruptionNotice] = useState<string | null>(null);
  const [disruptionMode, setDisruptionMode] = useState<DisruptionType>(null);
  const [qaDecisions, setQaDecisions] = useState<Record<string, 'APPROVED' | 'QUARANTINED' | 'DIVERTED'>>({});

  const currentVolunteer = SEEDED_FLEET_VOLUNTEERS[activeVolunteerIndex];

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const [dels, wps] = await Promise.all([
        api.getVolunteerDeliveries(),
        api.getWaypoints(),
      ]);
      setDeliveries(dels);
      setAllWaypoints(wps);

      if (dels.length > 0 && !selectedDelivery) {
        setSelectedDelivery(dels[0]);
        calculateRouteForDelivery(dels[0]);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const calculateRouteForDelivery = async (delivery: Delivery) => {
    setRouteLoading(true);
    try {
      const res = await api.computeRoute('V_KORAMANGALA', 'V_JAYANAGAR', 'time');
      setRouteData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleSelectDelivery = (del: Delivery) => {
    setSelectedDelivery(del);
    calculateRouteForDelivery(del);
  };

  const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
    try {
      await api.updateDeliveryStatus(deliveryId, newStatus);
      setStatusMessage(`Delivery status updated to ${newStatus}!`);
      setTimeout(() => setStatusMessage(null), 5000);
      fetchDeliveries();
    } catch (err: any) {
      console.error('Failed to update status:', err);
    }
  };

  // Called automatically when the countdown completes (< 5 min)
  const handleAutoReached = () => {
    if (selectedDelivery && selectedDelivery.status !== 'DELIVERED') {
      handleUpdateStatus(selectedDelivery.id, 'DELIVERED');
    }
    setStatusMessage('🎉 Consignment Reached Destination! Handover verified automatically.');
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const handleThermalDecision = (decision: 'APPROVED' | 'QUARANTINED' | 'DIVERTED', donId?: string) => {
    const targetKey = donId || selectedDelivery?.allocation?.donation?.id || 'sample';
    setQaDecisions((prev) => ({ ...prev, [targetKey]: decision }));

    if (decision === 'APPROVED') {
      setStatusMessage('✔ Consignment QA Approved: Thermal holding criteria compliant. Batch validated in delivery queue.');
      setTimeout(() => setStatusMessage(null), 6000);
      fetchDeliveries();
    } else {
      const actionText = decision === 'QUARANTINED' ? 'Quarantined for Lab Testing' : 'Diverted to Bio-Compost';
      setStatusMessage(`⛔ Consignment ${actionText}: Fails thermal holding safety standards. Removed from active delivery missions!`);
      setTimeout(() => setStatusMessage(null), 7000);

      // Immediately remove from current delivery missions list
      setDeliveries((prev) => {
        const remaining = prev.filter((del) => {
          const dId = del.allocation?.donation?.id || 'sample';
          return dId !== targetKey && (!donId || del.allocation?.donation?.id !== donId);
        });
        if (selectedDelivery && (selectedDelivery.allocation?.donation?.id === targetKey || targetKey === 'sample')) {
          setSelectedDelivery(remaining.length > 0 ? remaining[0] : null);
          if (remaining.length > 0) {
            calculateRouteForDelivery(remaining[0]);
          }
        }
        return remaining;
      });

      // Auto close modal after 1.2s so user sees feedback
      setTimeout(() => {
        setShowThermalModal(false);
      }, 1200);
    }
  };

  // Filter deliveries based on thermal QA decisions: only approved or un-flagged consignments show
  const visibleDeliveries = deliveries.filter((del) => {
    const dId = del.allocation?.donation?.id || 'sample';
    const status = qaDecisions[dId];
    if (status === 'QUARANTINED' || status === 'DIVERTED') {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Bike className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Volunteer Mission Hub
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Accept food transport missions with turn-by-turn Dijkstra route optimization and high-accuracy live street telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowDisruptionModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate Disruption</span>
          </button>

          <button
            onClick={() => setShowThermalModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 hover:bg-rose-100 transition shadow-sm"
          >
            <Thermometer className="w-3.5 h-3.5 text-rose-600" />
            <span>Thermal Safety</span>
          </button>

          <button
            onClick={fetchDeliveries}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Missions
          </button>
        </div>
      </div>

      {/* Active Rapid Volunteer Fleet Selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            Active Rapid Volunteer Fleet ({SEEDED_FLEET_VOLUNTEERS.length} Transporters Online)
          </span>
          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Current: {currentVolunteer.name} ({currentVolunteer.vehicle})
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SEEDED_FLEET_VOLUNTEERS.map((vol, idx) => {
            const isSelected = activeVolunteerIndex === idx;
            return (
              <button
                key={vol.reg}
                onClick={() => setActiveVolunteerIndex(idx)}
                className={`text-left p-2.5 rounded-xl border text-xs transition space-y-1 ${
                  isSelected
                    ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-400'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate">{vol.name}</span>
                  <span className="text-[10px] text-emerald-700 font-bold">⭐ {vol.rating}</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{vol.vehicle}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{vol.area}</span>
                  <span className="font-bold text-slate-600">{vol.completed} trips</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Grid: Mission List (5 cols) & Live Map / Route (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Missions List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-amber-600" />
              Assigned Missions ({visibleDeliveries.length})
            </h2>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {currentVolunteer.vehicle} • {currentVolunteer.reg}
            </span>
          </div>

          <div className="space-y-3">
            {visibleDeliveries.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">
                  No Approved Consignments in Dispatch Queue
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Consignments that were quarantined or diverted due to thermal exposure risk are hidden from dispatch. Only QA-approved batches appear here for delivery.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQaDecisions({});
                    fetchDeliveries();
                  }}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Reset Safety Audit Filters
                </button>
              </div>
            ) : (
              visibleDeliveries.map((del) => {
                const isSelected = selectedDelivery?.id === del.id;
                const isApproved = qaDecisions[del.allocation?.donation?.id || 'sample'] === 'APPROVED';
                const statusColor =
                  del.status === 'DELIVERED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : del.status === 'PICKED_UP'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <div
                    key={del.id}
                    onClick={() => handleSelectDelivery(del)}
                    className={`bg-white rounded-2xl p-5 border cursor-pointer transition shadow-sm space-y-3 ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">
                            {del.allocation?.donation?.title || 'Surplus Food Rescue Mission'}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${statusColor}`}
                          >
                            {del.status}
                          </span>
                          {del.volunteer?.fullName && (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1">
                              <Bike className="w-2.5 h-2.5 text-slate-500" />
                              {del.volunteer.fullName}
                            </span>
                          )}
                          {isApproved && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Thermal QA Approved
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-amber-800">
                          {del.allocation?.allocatedQuantityKg || 25} kg
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          ~{del.estimatedDistanceKm || 5.2} km
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5 pt-1 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800">Pickup:</span>
                        <span className="truncate">
                          {del.allocation?.donation?.donorOrganization ||
                            'ITC Gardenia, Koramangala'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-800">Dropoff:</span>
                        <span className="truncate">
                          {del.allocation?.ngo?.organizationName ||
                            'Akshaya Patra HSR Hub'}
                        </span>
                      </div>
                    </div>

                    {/* Mission Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {del.status === 'ASSIGNED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(del.id, 'ACCEPTED');
                          }}
                          className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
                        >
                          Accept Mission
                        </button>
                      )}

                      {del.status === 'ACCEPTED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(del.id, 'PICKED_UP');
                          }}
                          className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
                        >
                          Confirm Food Picked Up
                        </button>
                      )}

                      {del.status === 'PICKED_UP' && (
                        <div className="w-full flex items-center justify-between text-xs text-blue-800 font-semibold bg-blue-50 p-2 rounded-lg border border-blue-200">
                          <span className="flex items-center gap-1">
                            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                            Live In-Transit Tracking
                          </span>
                          <span className="text-[10px] text-blue-600">Auto-Delivers on Arrival</span>
                        </div>
                      )}

                      {del.status === 'DELIVERED' && (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Mission Completed & Handed Over
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Map & Tracking Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Telemetry View Mode Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
              <button
                onClick={() => setMapMode('live')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  mapMode === 'live'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bike className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Tracking</span>
              </button>
              <button
                onClick={() => setMapMode('dijkstra')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  mapMode === 'dijkstra'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Dijkstra Shortest Path</span>
              </button>
            </div>

            {routeData && mapMode === 'dijkstra' && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {routeData.totalDistanceKm} km • ~{routeData.totalTimeMinutes} mins
              </span>
            )}
          </div>

          {/* Render Active View Mode */}
          {mapMode === 'live' ? (
            <LiveDeliveryTracker
              foodTitle={
                selectedDelivery?.allocation?.donation?.title ||
                'South Indian Sambar, Rice & Poriyal'
              }
              quantityKg={
                selectedDelivery?.allocation?.allocatedQuantityKg || 25
              }
              donorName={
                selectedDelivery?.allocation?.donation?.donorOrganization ||
                'ITC Gardenia Kitchen, Koramangala 4th Block'
              }
              ngoName={
                selectedDelivery?.allocation?.ngo?.organizationName ||
                'Akshaya Patra Redistribution Hub, Jayanagar'
              }
              transporterName={currentVolunteer.name}
              vehicleNumber={`${currentVolunteer.vehicle} • ${currentVolunteer.reg}`}
              deliveryId={selectedDelivery?.id}
              onDelivered={handleAutoReached}
              height="540px"
              disruptionMode={disruptionMode}
              disruptionNotice={disruptionNotice}
              onDisruptionChange={setDisruptionMode}
            />
          ) : (
            <div className="space-y-4">
              <MealMeshMap
                waypoints={allWaypoints}
                routePath={routeData?.path || []}
                height="460px"
              />

              {routeData && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800">
                      Computed Optimal Waypoint Sequence
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Algorithm: {routeData.algorithmUsed}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {routeData.path.map((wp, idx) => (
                      <React.Fragment key={wp.id}>
                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-800 font-semibold text-[11px] border border-slate-200">
                          {wp.label}
                        </span>
                        {idx < routeData.path.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DisruptionSimulatorModal
        isOpen={showDisruptionModal}
        onClose={() => setShowDisruptionModal(false)}
        deliveryId={selectedDelivery?.id}
        onReplanSuccess={(res) => {
          setDisruptionNotice(res.executionSummary);
          setDisruptionMode(res.disruptionType || 'ROAD_BLOCKED');
          setStatusMessage(`⚠️ Dynamic Re-Routing: ${res.executionSummary}`);
          setTimeout(() => setStatusMessage(null), 7000);
        }}
      />

      {showThermalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl">
            <button
              onClick={() => setShowThermalModal(false)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <ThermalExposurePanel
              donationId={selectedDelivery?.allocation?.donation?.id || 'don-current'}
              foodTitle={selectedDelivery?.allocation?.donation?.title || 'Active Consignment'}
              onClose={() => setShowThermalModal(false)}
              onDecision={handleThermalDecision}
            />
          </div>
        </div>
      )}
    </div>
  );
};
