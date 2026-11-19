import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Donation } from '../types/mealmesh';
import { SurplusForecastModal } from '../components/SurplusForecastModal';
import { useOfflineSync } from '../services/offlineSyncManager';
import {
  Utensils,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Zap,
  Sparkles,
  RefreshCw,
  Thermometer,
  QrCode,
  TrendingUp,
  Building,
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [matchingId, setMatchingId] = useState<string | null>(null);
  const [matchingStatus, setMatchingStatus] = useState<string | null>(null);
  const [dishSuggestions, setDishSuggestions] = useState<string[]>([]);
  const [showForecastModal, setShowForecastModal] = useState<boolean>(false);
  const { isOnline, queueAction } = useOfflineSync();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryName, setCategoryName] = useState('Cooked Meals');
  const [dietaryType, setDietaryType] = useState<'VEG' | 'NON_VEG' | 'VEGAN'>('VEG');
  const [foodType, setFoodType] = useState<'COOKED' | 'RAW' | 'PACKAGED'>('COOKED');
  const [quantityKg, setQuantityKg] = useState<number>(30);
  const [servings, setServings] = useState<number>(75);
  const [hoursUntilExpiry, setHoursUntilExpiry] = useState<number>(4);
  const [storageTemp, setStorageTemp] = useState<number>(65);
  const [allergenInfo, setAllergenInfo] = useState('Contains Dairy/Gluten');
  const [pickupInstructions, setPickupInstructions] = useState('Collect from rear kitchen dispatch gate');
  const [addressLine, setAddressLine] = useState('Old Airport Rd, Kodihalli, Indiranagar, Bengaluru');
  const [donorVenue, setDonorVenue] = useState('The Leela Palace Banquet');
  const [donorLatitude, setDonorLatitude] = useState(12.9606);
  const [donorLongitude, setDonorLongitude] = useState(77.6484);

  const VENUE_PRESETS = [
    {
      name: 'The Leela Palace Banquet',
      address: 'Old Airport Rd, Kodihalli, Indiranagar, Bengaluru',
      lat: 12.9606,
      lng: 77.6484,
      defaultDish: 'Royal Mughlai Vegetable Biryani & Paneer Gravy',
    },
    {
      name: 'Infosys Corporate Dining',
      address: 'Hosur Rd, Electronic City Phase 1, Bengaluru',
      lat: 12.8399,
      lng: 77.6770,
      defaultDish: 'Executive Continental Baked Pasta & Herb Sourdough',
    },
    {
      name: 'Taj West End Convention Centre',
      address: 'Race Course Rd, High Grounds, Bengaluru',
      lat: 12.9866,
      lng: 77.5855,
      defaultDish: 'Mysore Royal Feast Pulao & Kesar Badam Halwa',
    },
    {
      name: 'Sheraton Grand Banquet Hall',
      address: 'Dr. Rajkumar Rd, Rajajinagar, Bengaluru',
      lat: 13.0112,
      lng: 77.5550,
      defaultDish: 'South Indian Sambar, Steamed Rice & Avial',
    },
    {
      name: 'Corner House Foods',
      address: '100ft Road, Indiranagar, Bengaluru',
      lat: 12.9784,
      lng: 77.6408,
      defaultDish: 'Fresh Multigrain Sourdough Loaves & Croissants',
    },
    {
      name: 'ITC Gardenia Kitchen',
      address: '80 Feet Rd, Koramangala 4th Block, Bengaluru',
      lat: 12.9352,
      lng: 77.6245,
      defaultDish: 'Grand Palace Buffet Surplus Meals',
    },
  ];

  const handleVenueChange = (venueName: string) => {
    setDonorVenue(venueName);
    const preset = VENUE_PRESETS.find((v) => v.name === venueName);
    if (preset) {
      setAddressLine(preset.address);
      setDonorLatitude(preset.lat);
      setDonorLongitude(preset.lng);
      if (!title || VENUE_PRESETS.some((v) => v.defaultDish === title)) {
        setTitle(preset.defaultDish);
      }
    }
  };

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'RESERVED'>('ALL');

  const fetchDonations = async () => {
    setLoading(true);
    try {
      // Auto-ensure demo donor credentials if currently unauthenticated or role mismatch
      const user = api.getCurrentUser();
      if (!user || user.role !== 'DONOR') {
        await api.demoLogin('DONOR');
      }

      let data = await api.getMyDonations();
      if (!data || data.length === 0) {
        // Fallback to active system donations so feed is never blank
        data = await api.getActiveDonations();
      }
      setDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load donor donations:', err);
      try {
        const fallback = await api.getActiveDonations();
        setDonations(Array.isArray(fallback) ? fallback : []);
      } catch (e2) {
        console.error(e2);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handlePostDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (!isOnline) {
      // Offline-first queued action
      queueAction('DONATION_CREATE', `Surplus Food: ${title} (${quantityKg} kg)`, {
        title, description, categoryName, dietaryType, foodType, quantityKg, servings,
        hoursUntilExpiry, storageTemperatureCelsius: storageTemp, allergenInfo, pickupInstructions, addressLine
      });
      setTitle('');
      setDescription('');
      setMatchingStatus('📡 Offline Mode: Food donation saved locally in offline queue. Will auto-sync when network returns.');
      setTimeout(() => setMatchingStatus(null), 6000);
      return;
    }

    try {
      setLoading(true);
      const created = await api.postDonation({
        title,
        description,
        categoryName,
        dietaryType,
        foodType,
        quantityKg,
        servings,
        hoursUntilExpiry,
        storageTemperatureCelsius: storageTemp,
        allergenInfo,
        pickupInstructions,
        addressLine,
        latitude: donorLatitude,
        longitude: donorLongitude,
        donorOrganization: donorVenue,
      });

      if (created) {
        // Optimistically prepend to the active donations feed so it's instantly #1!
        setDonations((prev) => [created, ...prev.filter((d) => d.id !== created.id)]);
        setStatusFilter('ALL');
      }

      // Clear form
      setTitle('');
      setDescription('');
      await fetchDonations();
      setMatchingStatus(`⚡ Surplus food "${created?.title || title}" posted and inserted into the expiry min-heap (most urgent batch is always shown first).`);
      setTimeout(() => setMatchingStatus(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to post donation');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerMatch = async (donationId: string) => {
    setMatchingId(donationId);
    setMatchingStatus(null);
    try {
      const res = await api.matchDonation(donationId);
      const topReason = res.allocations?.[0]?.explanationReason || res.matchedNgos?.[0]?.reason;
      if (topReason) {
        setMatchingStatus(
          `Fairness Allocation Successful! [Allocated: ${res.allocatedKg} kg] -> ${topReason}`
        );
      } else {
        setMatchingStatus(
          `Successfully matched ${res.allocatedKg} kg across ${res.matchedNgos?.length || 1} NGOs using Max-Min Fairness Allocator!`
        );
      }
      fetchDonations();
    } catch (err: any) {
      setMatchingStatus(`Matching result: ${err.message}`);
    } finally {
      setMatchingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Utensils className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">Food Donor Portal</h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Register surplus meals, inspect Min-Heap expiry priority ranking, and trigger multi-criteria NGO matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForecastModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 hover:bg-blue-100 transition shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Demand & Surplus Forecast</span>
          </button>

          <button
            onClick={fetchDonations}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Alert Banner if present */}
      {matchingStatus && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{matchingStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Register Surplus Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Register New Surplus Food Batch
            </h2>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              FSSAI Hygiene Verified
            </span>
          </div>

          <form onSubmit={handlePostDonation} className="space-y-4 text-xs">
            {/* Donor Venue & Location Selector */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-700" />
                  Select Donor Kitchen & Venue
                </label>
                <span className="text-[10px] text-emerald-700 font-semibold">Different Venues & Places</span>
              </div>
              <select
                value={donorVenue}
                onChange={(e) => handleVenueChange(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-emerald-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {VENUE_PRESETS.map((vp) => (
                  <option key={vp.name} value={vp.name}>
                    {vp.name} — ({vp.address.split(',')[1]?.trim() || vp.address})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{addressLine}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dish / Item Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  const value = e.target.value;
                  setTitle(value);
                  // Prefix search on the backend Trie (only after 2 letters, to keep it meaningful)
                  if (value.trim().length >= 2) {
                    api.getFoodSuggestions(value).then(setDishSuggestions).catch(() => setDishSuggestions([]));
                  } else {
                    setDishSuggestions([]);
                  }
                }}
                list="dish-suggestions"
                autoComplete="off"
                placeholder="e.g. Basmati Veg Biryani with Paneer Curry"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <datalist id="dish-suggestions">
                {dishSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              <p className="mt-1 text-[11px] text-slate-500">Suggestions come from a Trie (prefix tree) on the server.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Cooked Meals">Cooked Meals</option>
                  <option value="Raw Groceries">Raw Groceries</option>
                  <option value="Bakery Items">Bakery Items</option>
                  <option value="Dairy Products">Dairy Products</option>
                  <option value="Packaged Goods">Packaged Goods</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dietary Type</label>
                <select
                  value={dietaryType}
                  onChange={(e) => setDietaryType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="VEG">Vegetarian (Veg)</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                  <option value="VEGAN">Strict Vegan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity (kg) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quantityKg}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setQuantityKg(val);
                    setServings(Math.round(val * 2.5));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Servings</label>
                <input
                  type="number"
                  min={1}
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expiry (Hours)</label>
                <input
                  type="number"
                  min={1}
                  max={48}
                  value={hoursUntilExpiry}
                  onChange={(e) => setHoursUntilExpiry(parseInt(e.target.value) || 4)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-orange-600 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Storage Temp (°C)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={storageTemp}
                    onChange={(e) => setStorageTemp(parseFloat(e.target.value) || 60)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Thermometer className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Allergen Tags</label>
                <input
                  type="text"
                  value={allergenInfo}
                  onChange={(e) => setAllergenInfo(e.target.value)}
                  placeholder="e.g. Nuts, Dairy"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pickup Address & Instructions</label>
              <textarea
                rows={2}
                value={pickupInstructions}
                onChange={(e) => setPickupInstructions(e.target.value)}
                placeholder="Dispatched from kitchen rear gate, contact Head Chef Suresh."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Submitting to Min-Heap...' : 'Publish Food Donation'}
            </button>
          </form>
        </div>

        {/* Right Column: Active Surplus Batches (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Active Donations (Min-Heap Expiry Prioritized)
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {donations.length} total batches registered
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {(['ALL', 'AVAILABLE', 'RESERVED'] as const).map((mode) => {
                const count =
                  mode === 'ALL'
                    ? donations.length
                    : mode === 'AVAILABLE'
                    ? donations.filter((d) => d.status === 'AVAILABLE').length
                    : donations.filter((d) => d.status !== 'AVAILABLE').length;

                return (
                  <button
                    key={mode}
                    onClick={() => setStatusFilter(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      statusFilter === mode
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {mode === 'ALL' ? 'All' : mode === 'AVAILABLE' ? 'Available' : 'Reserved / Claimed'} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {(() => {
              const displayedDonations = donations.filter((d) => {
                if (statusFilter === 'AVAILABLE') return d.status === 'AVAILABLE';
                if (statusFilter === 'RESERVED') return d.status !== 'AVAILABLE';
                return true;
              });

              if (displayedDonations.length === 0) {
                return (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    No {statusFilter.toLowerCase()} food donations found. Post a new batch using the form on the left.
                  </div>
                );
              }

              return displayedDonations.map((d) => {
                const urgencyColor =
                  d.urgency === 'CRITICAL'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : d.urgency === 'HIGH'
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                const isAvailable = d.status === 'AVAILABLE';

                return (
                  <div
                    key={d.id}
                    className={`rounded-2xl p-5 border transition space-y-3 ${
                      isAvailable
                        ? 'bg-white border-emerald-400 shadow-sm hover:border-emerald-500 ring-1 ring-emerald-200'
                        : 'bg-slate-50/60 border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">{d.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${urgencyColor}`}>
                            {d.urgency}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {d.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {d.categoryName} • {d.dietaryType} • <strong className="text-slate-700">{d.donorOrganization || 'Koramangala Kitchen'}</strong>
                        </p>
                      </div>

                      <div className="text-right sm:text-right">
                        <span className="text-sm font-extrabold text-emerald-800">
                          {d.quantityKg} kg
                        </span>
                        <span className="text-xs text-slate-500 block">({d.servings} meals)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Time Left</span>
                        <span className="font-bold text-orange-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {d.minutesRemaining > 0 ? `${Math.floor(d.minutesRemaining / 60)}h ${d.minutesRemaining % 60}m` : 'Expiring soon'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Status</span>
                        <span className="font-semibold text-slate-700">{d.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Storage Temp</span>
                        <span className="font-semibold text-slate-700">{d.storageTemperatureCelsius || 65}°C</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Location</span>
                        <span className="font-semibold text-slate-700 truncate block">{d.addressLine || 'Koramangala'}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end border-t border-slate-100 mt-2">
                      {d.status === 'AVAILABLE' && (
                        <button
                          onClick={() => handleTriggerMatch(d.id)}
                          disabled={matchingId === d.id}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          {matchingId === d.id ? 'Running Greedy Matcher...' : 'Run Greedy Match'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SurplusForecastModal
        isOpen={showForecastModal}
        onClose={() => setShowForecastModal(false)}
      />
    </div>
  );
};
