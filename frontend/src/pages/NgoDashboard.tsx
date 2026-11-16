import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Donation, NgoProfile, Allocation } from '../types/mealmesh';
import { LiveDeliveryTracker } from '../maps/LiveDeliveryTracker';
import {
  HeartHandshake,
  Database,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Zap,
  RefreshCw,
  Box,
  Truck,
  Users,
  Bike,
  X,
} from 'lucide-react';

export const NgoDashboard: React.FC = () => {
  const [profile, setProfile] = useState<NgoProfile | null>(null);
  const [availableFood, setAvailableFood] = useState<Donation[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [dietaryFilter, setDietaryFilter] = useState<string>('ALL');
  const [capacityCurrent, setCapacityCurrent] = useState<number>(35);
  const [capacityMax, setCapacityMax] = useState<number>(250);
  const [message, setMessage] = useState<string | null>(null);
  const [showLiveRadar, setShowLiveRadar] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ngo, food, allocs] = await Promise.all([
        api.getNgoProfile(),
        api.getActiveDonations(),
        api.getNgoAllocations(),
      ]);

      if (ngo) {
        setProfile(ngo);
        setCapacityCurrent(ngo.currentStorageCapacityKg);
        setCapacityMax(ngo.maxStorageCapacityKg);
      }
      setAvailableFood(food);
      setAllocations(allocs);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateCapacity = async () => {
    try {
      const updated = await api.updateNgoCapacity(capacityCurrent, capacityMax);
      if (updated) {
        setProfile(updated);
        setMessage('Storage capacity updated successfully!');
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (err: any) {
      alert('Failed to update capacity: ' + err.message);
    }
  };

  const handleClaimDonation = async (donationId: string) => {
    setClaimingId(donationId);
    try {
      const res = await api.claimDonation(donationId);
      setMessage(`Surplus food claimed successfully! New transport mission dispatched to Volunteer Fleet (~${res.estimatedDistanceKm || 4.5} km).`);
      loadData();
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      alert('Claim failed: ' + err.message);
    } finally {
      setClaimingId(null);
    }
  };

  const availableCap = Math.max(0, capacityMax - capacityCurrent);
  const capPercentage = Math.min(100, Math.round((capacityCurrent / Math.max(1, capacityMax)) * 100));

  const filteredFood = availableFood.filter((d) => {
    if (dietaryFilter === 'ALL') return true;
    return d.dietaryType === dietaryFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <HeartHandshake className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {profile?.organizationName || 'Akshaya Patra Redistribution Hub'}
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Redistribution Hub • Beneficiaries Served: {profile?.beneficiaryCount || 250} people daily
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-300 text-blue-900 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Storage Capacity Gauge & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 border-r border-slate-100 pr-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Storage Capacity Gauge
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-extrabold text-slate-900">{capacityCurrent} kg</h3>
            <span className="text-xs font-medium text-slate-500">of {capacityMax} kg capacity</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-3 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                capPercentage > 85 ? 'bg-red-500' : capPercentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${capPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
            <span>{capPercentage}% utilized</span>
            <span className="text-emerald-700 font-bold">{availableCap} kg available space</span>
          </div>
        </div>

        <div className="md:col-span-8 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Stored Food (kg): {capacityCurrent} kg
            </label>
            <input
              type="range"
              min="0"
              max={capacityMax}
              value={capacityCurrent}
              onChange={(e) => setCapacityCurrent(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="w-36">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity (kg)</label>
            <input
              type="number"
              min="20"
              max="1000"
              value={capacityMax}
              onChange={(e) => setCapacityMax(parseFloat(e.target.value) || 200)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
            />
          </div>

          <div className="self-end">
            <button
              onClick={handleUpdateCapacity}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              Save Capacity
            </button>
          </div>
        </div>
      </div>

      {/* Discovery Feed & Allocations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surplus Discovery Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-600" />
              Available Surplus Food (Min-Heap Priority)
            </h2>

            {/* Filter buttons */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-[11px]">
              {(['ALL', 'VEG', 'NON_VEG', 'VEGAN'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDietaryFilter(mode)}
                  className={`px-2.5 py-0.5 rounded font-semibold transition ${
                    dietaryFilter === mode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFood.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No surplus food currently matches this filter. Check back soon.
              </div>
            ) : (
              filteredFood.map((food) => {
                const isUrgent = food.urgency === 'CRITICAL' || food.urgency === 'HIGH';
                return (
                  <div
                    key={food.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-400 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">{food.title}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              food.urgency === 'CRITICAL'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {food.urgency}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {food.donorOrganization || 'Hotel Kitchen'} • {food.categoryName} • {food.dietaryType}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-blue-700">
                          {food.quantityKg} kg
                        </span>
                        <span className="text-[11px] text-slate-500 block">({food.servings} servings)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 text-orange-600 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {food.minutesRemaining > 0
                            ? `${Math.floor(food.minutesRemaining / 60)}h ${food.minutesRemaining % 60}m remaining`
                            : 'Expires within 1 hour'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{food.addressLine || 'Koramangala, Bengaluru'}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {food.allergenInfo || 'Standard hygiene guidelines met'}
                      </span>
                      <button
                        onClick={() => handleClaimDonation(food.id)}
                        disabled={claimingId === food.id || availableCap < food.quantityKg}
                        className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-sm ${
                          availableCap < food.quantityKg
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {claimingId === food.id
                          ? 'Claiming...'
                          : availableCap < food.quantityKg
                          ? 'Capacity Exceeded'
                          : 'Claim for Distribution'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Inbound Distributions & Live Courier Radar (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Inbound Allocations ({allocations.length})
            </h2>
            <button
              onClick={() => setShowLiveRadar(!showLiveRadar)}
              className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition flex items-center gap-1.5"
            >
              <Bike className="w-3.5 h-3.5 text-blue-600" />
              <span>{showLiveRadar ? 'Hide Live Radar' : 'Show Live Radar'}</span>
            </button>
          </div>

          {/* Live Courier Tracking Radar */}
          {showLiveRadar && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Live Consignment Telemetry (Bengaluru Arterial Road)</span>
              </div>
              <LiveDeliveryTracker
                foodTitle={
                  allocations[0]?.donation?.title ||
                  'South Indian Sambar, Rice & Poriyal'
                }
                quantityKg={allocations[0]?.allocatedQuantityKg || 25}
                donorName={
                  allocations[0]?.donation?.donorOrganization ||
                  'ITC Gardenia Kitchen, Koramangala'
                }
                ngoName={
                  profile?.organizationName ||
                  'Akshaya Patra Redistribution Hub, Jayanagar'
                }
                transporterName="Rahul Sharma"
                vehicleNumber="Hero Electric • KA-01-EQ-1001"
                height="420px"
                onDelivered={() => {
                  setMessage('🎉 Consignment safely arrived at your NGO Hub! Capacity updated.');
                  setTimeout(() => setMessage(null), 5000);
                  loadData();
                }}
              />
            </div>
          )}

          <div className="space-y-3">
            {allocations.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No incoming allocations yet. Claim surplus batches from the discovery feed to initiate live transport.
              </div>
            ) : (
              allocations.map((alloc) => (
                <div
                  key={alloc.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {alloc.donation?.title || 'Surplus Food Batch'}
                    </span>
                    <span className="font-extrabold text-blue-700">{alloc.allocatedQuantityKg} kg</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Greedy Match Score: {alloc.matchScore.toFixed(1)}/100</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      {alloc.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    From: {alloc.donation?.donorOrganization || 'Bengaluru Kitchen'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
