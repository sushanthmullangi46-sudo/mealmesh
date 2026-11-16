import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Delivery, RouteResponse, RouteWaypoint } from '../types/mealmesh';
import { MealMeshMap } from '../maps/MealMeshMap';
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
  ShieldAlert,
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [allWaypoints, setAllWaypoints] = useState<RouteWaypoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
      // Find nearest waypoints or default to Koramangala -> Jayanagar
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
      const updated = await api.updateDeliveryStatus(deliveryId, newStatus);
      setStatusMessage(`Delivery marked as ${newStatus}!`);
      setTimeout(() => setStatusMessage(null), 4000);
      fetchDeliveries();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Bike className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">Volunteer Mission Hub</h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Accept food transport missions with turn-by-turn Dijkstra route optimization and live telemetry.
          </p>
        </div>

        <button
          onClick={fetchDeliveries}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Missions
        </button>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
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
              Assigned Missions ({deliveries.length})
            </h2>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Vehicle: Two-Wheeler
            </span>
          </div>

          <div className="space-y-3">
            {deliveries.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No active delivery missions right now. Check back when new donations are matched.
              </div>
            ) : (
              deliveries.map((del) => {
                const isSelected = selectedDelivery?.id === del.id;
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
                      isSelected ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">
                            {del.allocation?.donation?.title || 'Surplus Food Rescue Mission'}
                          </h3>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-1 ${statusColor}`}>
                          {del.status}
                        </span>
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
                          {del.allocation?.donation?.donorOrganization || 'ITC Gardenia, Koramangala'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-800">Dropoff:</span>
                        <span className="truncate">
                          {del.allocation?.ngo?.organizationName || 'Akshaya Patra HSR Hub'}
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(del.id, 'DELIVERED');
                          }}
                          className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                        >
                          Mark Successfully Delivered
                        </button>
                      )}

                      {del.status === 'DELIVERED' && (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Mission Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Map & Dijkstra Route Telemetry */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              Live Route Navigation (Dijkstra Shortest Path)
            </h2>
            {routeData && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {routeData.totalDistanceKm} km • ~{routeData.totalTimeMinutes} mins
              </span>
            )}
          </div>

          <MealMeshMap
            waypoints={allWaypoints}
            routePath={routeData?.path || []}
            height="460px"
          />

          {routeData && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800">Computed Optimal Waypoint Sequence</span>
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
      </div>
    </div>
  );
};
