import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsSummary, NgoProfile, Delivery, SensorReading, FoodSafetyThresholds } from '../types/mealmesh';
import { LiveDeliveryTracker } from '../maps/LiveDeliveryTracker';
import {
  ShieldCheck,
  RotateCcw,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  Building,
  Layers,
  ArrowRight,
  Search,
  Zap,
  Radio,
  Truck,
  Scale,
  Clock,
  Compass,
  Cpu,
  Database,
  Check,
  Flame,
  Activity,
  Heart,
  Award,
  Thermometer,
  Droplets,
  Wind,
  HeartHandshake,
  TrendingUp,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { ThermalExposurePanel } from '../components/ThermalExposurePanel';

interface SystemUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  verified: boolean;
  createdAt?: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ngos' | 'users' | 'fleet' | 'safety' | 'forecasting' | 'audit' | 'dsa'>('overview');
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [ngos, setNgos] = useState<NgoProfile[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [safetyThresholds, setSafetyThresholds] = useState<FoodSafetyThresholds>({ temperatureMaxCelsius: 8, humidityMaxPercent: 75, gasMaxPpm: 300 });
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Fairness & Forecasting States
  const [fairnessAuditTrail, setFairnessAuditTrail] = useState<any[]>([]);
  const [forecastSummary, setForecastSummary] = useState<any>(null);
  const [adminPledges, setAdminPledges] = useState<any[]>([]);

  // Search & filter states
  const [ngoSearch, setNgoSearch] = useState('');
  const [ngoFilter, setNgoFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [overviewDeliveryFilter, setOverviewDeliveryFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [fleetFilter, setFleetFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const showNotification = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Auto-ensure admin demo token if missing
      const token = localStorage.getItem('mealmesh_token');
      if (!token) {
        await api.demoLogin('ADMIN');
      }

      const [s, n, u, d, l] = await Promise.all([
        api.getAnalyticsSummary().catch(() => null),
        api.getAdminNgos().catch(() => []),
        api.getAdminUsers().catch(() => []),
        api.getFleetDeliveries().catch(() => []),
        api.getAuditLogs().catch(() => []),
      ]);

      if (s) setStats(s);
      setNgos(Array.isArray(n) ? n : []);
      setUsers(Array.isArray(u) ? u : []);

      // Sort deliveries by completionTime or startTime descending (latest first)
      const sortedDeliveries = Array.isArray(d)
        ? [...d].sort((a, b) => {
            const ta = a.completionTime ? new Date(a.completionTime).getTime() : (a.startTime ? new Date(a.startTime).getTime() : 0);
            const tb = b.completionTime ? new Date(b.completionTime).getTime() : (b.startTime ? new Date(b.startTime).getTime() : 0);
            return tb - ta;
          })
        : [];
      setDeliveries(sortedDeliveries);
      setAuditLogs(Array.isArray(l) ? l : []);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadFoodSafetyReadings = async () => {
    setSafetyLoading(true);
    try {
      const [readings, thresholds] = await Promise.all([api.getFoodSafetyReadings(), api.getFoodSafetyThresholds()]);
      setSensorReadings(readings);
      setSafetyThresholds(thresholds);
    }
    catch (err: any) { showNotification(err.message || 'Could not load food safety readings', 'warn'); }
    finally { setSafetyLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'safety') loadFoodSafetyReadings();
    if (activeTab === 'forecasting') {
      fetch('/api/forecasting/7day')
        .then((res) => res.json())
        .then((data) => { if (data.data) setForecastSummary(data.data); })
        .catch(() => {});
      fetch('/api/forecasting/pledges')
        .then((res) => res.json())
        .then((data) => { if (data.data) setAdminPledges(data.data); })
        .catch(() => {});
    }
  }, [activeTab]);

  const handleToggleVerify = async (ngoId: string, currentStatus: boolean) => {
    try {
      await api.verifyNgo(ngoId, !currentStatus);
      showNotification(`NGO verification status updated to ${!currentStatus ? 'VERIFIED' : 'PENDING'}. Action pushed to LIFO Undo Stack.`, 'success');
      loadAllData();
    } catch (err: any) {
      showNotification('Verification update failed: ' + err.message, 'warn');
    }
  };

  const handleUndo = async () => {
    try {
      const msg = await api.undoAdminAction();
      showNotification(msg, 'info');
      loadAllData();
    } catch (err: any) {
      showNotification('Undo failed: ' + err.message, 'warn');
    }
  };

  const handleSimulateUrgentDonation = async () => {
    setActionLoading(true);
    try {
      const donation = await api.simulateUrgentDonation();
      showNotification(`Emergency Surplus simulated: "${donation.title}" (${donation.quantityKg} kg) queued into Min-Heap!`, 'success');
      loadAllData();
    } catch (err: any) {
      showNotification('Simulation failed: ' + err.message, 'warn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBroadcastAlert = async () => {
    setActionLoading(true);
    try {
      const res = await api.broadcastFleetAlert('Emergency surplus batch available. Volunteers please check your mission hubs.');
      showNotification(res || 'Fleet dispatch notification broadcasted successfully to all volunteers!', 'info');
      loadAllData();
    } catch (err: any) {
      showNotification('Broadcast failed: ' + err.message, 'warn');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered NGOs
  const filteredNgos = ngos.filter((n) => {
    const matchesSearch =
      n.organizationName.toLowerCase().includes(ngoSearch.toLowerCase()) ||
      n.registrationNumber.toLowerCase().includes(ngoSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (ngoFilter === 'VERIFIED') return n.verified;
    if (ngoFilter === 'PENDING') return !n.verified;
    return true;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (userRoleFilter === 'ALL') return true;
    return u.role.toUpperCase() === userRoleFilter.toUpperCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-slate-900 text-white shadow-md">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Central Operations & Governance
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Enterprise control plane • DSA Engine Telemetry • NGO Compliance • Fleet Dispatch • LIFO Undo Engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleUndo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
            title="Pop most recent action from LIFO Stack and rollback database"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo Last Action
          </button>
          <button
            onClick={loadAllData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : notification.type === 'warn'
              ? 'bg-amber-50 border border-amber-300 text-amber-900'
              : 'bg-blue-50 border border-blue-300 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Total Rescued</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalFoodRescuedKg ? `${stats.totalFoodRescuedKg.toFixed(1)} kg` : '323.0 kg'}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <Flame className="w-3 h-3 text-emerald-600" /> ~{Math.round((stats?.totalFoodRescuedKg || 323) * 2.5)} meals created
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Orders Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {deliveries.filter((d) => d.status === 'DELIVERED').length}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            ✔ Handed Over to NGOs
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Active Missions</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {deliveries.filter((d) => d.status !== 'DELIVERED').length}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold">
            {users.filter((u) => u.role === 'VOLUNTEER').length || 1} Fleet Drivers
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>People Fed</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalPeopleFed ? stats.totalPeopleFed.toLocaleString() : '1,250'}
          </div>
          <span className="text-[11px] text-blue-700 font-semibold">Verified Beneficiaries</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Partner NGOs</span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {ngos.length || 2}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {ngos.filter((n) => n.verified).length} FSSAI Certified
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>CO2 Avoided</span>
            <Award className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-800">
            {stats?.co2EmissionsSavedKg ? `${stats.co2EmissionsSavedKg.toFixed(1)} kg` : '807.5 kg'}
          </div>
          <span className="text-[11px] text-teal-700 font-semibold">Environmental Offset</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-bold">
        {[
          { key: 'overview', label: 'Command Overview', icon: Activity, count: null },
          { key: 'forecasting', label: 'Surplus & Demand Forecast', icon: TrendingUp, count: forecastSummary?.alerts?.length || null },
          { key: 'safety', label: 'Food Safety IoT & Thermal Hazard', icon: Thermometer, count: sensorReadings.filter((reading) => reading.alert).length },
          { key: 'ngos', label: 'NGO Compliance', icon: Building, count: ngos.length },
          { key: 'users', label: 'User Directory', icon: Users, count: users.length },
          { key: 'fleet', label: 'Fleet & Deliveries', icon: Truck, count: deliveries.length },
          { key: 'dsa', label: 'DSA Engine Telemetry', icon: Cpu, count: 9 },
          { key: 'audit', label: 'Audit Trail (LIFO)', icon: FileText, count: auditLogs.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: COMMAND OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Action Center */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-2xl p-6 text-white shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Administrative Quick Action Center
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Live Demo Operations & Load Simulation</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Trigger real algorithm executions, emergency allocations, and volunteer push broadcasts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleSimulateUrgentDonation}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300" />
                  Simulate Urgent Surplus (40 kg)
                </button>
                <button
                  onClick={handleBroadcastAlert}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Broadcast Fleet Alert
                </button>
              </div>
            </div>
          </div>

          {/* Dual Panel: Recent Missions & High Priority NGO Allocations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Active Fleet Deliveries (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-sm text-slate-900">Fleet Logistics & Delivery Activity Stream</h3>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((filter) => {
                    const count =
                      filter === 'ALL'
                        ? deliveries.length
                        : filter === 'ACTIVE'
                        ? deliveries.filter((d) => d.status !== 'DELIVERED').length
                        : deliveries.filter((d) => d.status === 'DELIVERED').length;
                    return (
                      <button
                        key={filter}
                        onClick={() => setOverviewDeliveryFilter(filter)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          overviewDeliveryFilter === filter
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {filter === 'ALL' ? 'All' : filter === 'ACTIVE' ? 'In Transit' : 'Completed'} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {(() => {
                  const filtered = deliveries.filter((d) => {
                    if (overviewDeliveryFilter === 'ACTIVE') return d.status !== 'DELIVERED';
                    if (overviewDeliveryFilter === 'COMPLETED') return d.status === 'DELIVERED';
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        No {overviewDeliveryFilter.toLowerCase()} missions found.
                      </p>
                    );
                  }

                  return filtered.slice(0, 5).map((del) => {
                    const isDelivered = del.status === 'DELIVERED';
                    return (
                      <div
                        key={del.id}
                        className={`p-3.5 rounded-xl border transition text-xs space-y-2 ${
                          isDelivered
                            ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {del.allocation?.donation?.title || 'Surplus Food Rescue'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {del.allocation?.donation?.donorOrganization || 'Donor Kitchen'} &rarr;{' '}
                              {del.allocation?.ngo?.organizationName || 'Akshaya Patra'}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                              isDelivered
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : del.status === 'PICKED_UP'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {isDelivered && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {isDelivered ? 'COMPLETED & DELIVERED' : del.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                          <span>Quantity: <strong>{del.allocation?.allocatedQuantityKg || 25} kg</strong></span>
                          <span>Distance: <strong>~{del.estimatedDistanceKm || 4.5} km</strong></span>
                          <span>Transporter: <strong>{del.volunteer?.fullName || 'Rahul Sharma'}</strong></span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Quick NGO Overview (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">NGO Partner Capacity</h3>
                </div>
                <button
                  onClick={() => setActiveTab('ngos')}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  Manage <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {ngos.map((ngo) => {
                  const pct = Math.min(100, Math.round((ngo.currentStorageCapacityKg / Math.max(1, ngo.maxStorageCapacityKg)) * 100));
                  return (
                    <div key={ngo.id} className="p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{ngo.organizationName}</span>
                        {ngo.verified ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Capacity Usage</span>
                          <span className="font-mono font-bold text-slate-700">
                            {ngo.currentStorageCapacityKg} / {ngo.maxStorageCapacityKg} kg ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NGO COMPLIANCE & VERIFICATION */}
      {activeTab === 'safety' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2"><Thermometer className="w-4 h-4 text-emerald-700" />Food Safety Sensor Monitor</h2>
              <p className="text-xs text-slate-500 mt-1">ESP32 telemetry from DHT22 temperature/humidity and gas sensors. Breaches create notifications for the donor and admins.</p>
            </div>
            <button onClick={loadFoodSafetyReadings} disabled={safetyLoading} className="px-3 py-2 rounded-lg bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60">
              <RefreshCw className={`w-3.5 h-3.5 ${safetyLoading ? 'animate-spin' : ''}`} /> Refresh readings
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4"><div className="text-xs text-slate-500 flex items-center gap-2"><Thermometer className="w-4 h-4" />Temperature limit</div><div className="mt-1 text-lg font-black text-slate-900">{safetyThresholds.temperatureMaxCelsius}°C</div></div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4"><div className="text-xs text-slate-500 flex items-center gap-2"><Droplets className="w-4 h-4" />Humidity limit</div><div className="mt-1 text-lg font-black text-slate-900">{safetyThresholds.humidityMaxPercent}%</div></div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4"><div className="text-xs text-slate-500 flex items-center gap-2"><Wind className="w-4 h-4" />Gas limit</div><div className="mt-1 text-lg font-black text-slate-900">{safetyThresholds.gasMaxPpm} ppm</div></div>
          </div>
          {sensorReadings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No sensor telemetry received yet. Connect an ESP32 device using the endpoint documented in <span className="font-mono">docs/IOT_FOOD_SAFETY.md</span>.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Status / Donation</th><th className="p-3">Device</th><th className="p-3">Temperature</th><th className="p-3">Humidity</th><th className="p-3">Gas</th><th className="p-3">Recorded</th></tr></thead>
                <tbody>{sensorReadings.map((reading) => <tr key={reading.id} className="border-t border-slate-100">
                  <td className="p-3"><div className={`font-bold ${reading.alert ? 'text-rose-700' : 'text-emerald-700'}`}>{reading.alert ? 'ALERT' : 'SAFE'}</div><div className="text-slate-700 mt-1">{reading.donationTitle}</div>{reading.alertMessage && <div className="text-rose-600 mt-1 max-w-sm">{reading.alertMessage}</div>}</td>
                  <td className="p-3 font-mono">{reading.sensorId}</td><td className="p-3">{reading.temperatureCelsius.toFixed(1)}°C</td><td className="p-3">{reading.humidityPercent.toFixed(1)}%</td><td className="p-3">{reading.gasPpm.toFixed(1)} ppm</td><td className="p-3">{new Date(reading.recordedAt).toLocaleString()}</td>
                </tr>)}</tbody>
              </table>
            </div>
          )}
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">Thresholds are configurable and should be calibrated for the sensor, food type, and storage setup before operational use. MQ-series gas readings require calibration and should be treated as an indicator, not a food-safety certification.</p>
        </div>
      )}

      {/* TAB 2: NGO COMPLIANCE & VERIFICATION */}
      {activeTab === 'ngos' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-700" />
                NGO Accreditation & Storage Quotas
              </h2>
              <p className="text-xs text-slate-500">
                Verify FSSAI licensing and audit distribution readiness. Action reversible via LIFO Stack.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search organization or reg #..."
                  value={ngoSearch}
                  onChange={(e) => setNgoSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56"
                />
              </div>

              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 text-xs bg-slate-50">
                {(['ALL', 'VERIFIED', 'PENDING'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setNgoFilter(mode)}
                    className={`px-2.5 py-1 rounded font-semibold text-[11px] transition ${
                      ngoFilter === mode ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Organization</th>
                  <th className="py-3 px-4 font-bold">Reg Number</th>
                  <th className="py-3 px-4 font-bold">Beneficiaries</th>
                  <th className="py-3 px-4 font-bold">Storage Capacity</th>
                  <th className="py-3 px-4 font-bold">Hours</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Governance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNgos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No NGO partners match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredNgos.map((ngo) => {
                    const pct = Math.min(100, Math.round((ngo.currentStorageCapacityKg / Math.max(1, ngo.maxStorageCapacityKg)) * 100));
                    return (
                      <tr key={ngo.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {ngo.organizationName}
                          <span className="block text-[10px] font-normal text-slate-400">
                            {ngo.dietaryPreferences || 'VEG,ALL'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {ngo.registrationNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {ngo.beneficiaryCount} people/day
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 w-32">
                            <span className="text-[10px] text-slate-500 font-mono">
                              {ngo.currentStorageCapacityKg}/{ngo.maxStorageCapacityKg} kg
                            </span>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                          {ngo.operatingHours || '06:00 - 21:00'}
                        </td>
                        <td className="py-3.5 px-4">
                          {ngo.verified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleVerify(ngo.id, ngo.verified)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition shadow-sm ${
                              ngo.verified
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                : 'bg-emerald-700 text-white hover:bg-emerald-800'
                            }`}
                          >
                            {ngo.verified ? 'Revoke Status' : 'Approve NGO'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-700" />
                Cross-Role User Directory & Access Control
              </h2>
              <p className="text-xs text-slate-500">
                Inspect registered donors, NGO coordinators, delivery transporters, and system administrators.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 w-52"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Roles</option>
                <option value="DONOR">Donors</option>
                <option value="NGO">NGOs</option>
                <option value="VOLUNTEER">Volunteers</option>
                <option value="ADMIN">Administrators</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">User Identity</th>
                  <th className="py-3 px-4 font-bold">Role</th>
                  <th className="py-3 px-4 font-bold">Email</th>
                  <th className="py-3 px-4 font-bold">Phone</th>
                  <th className="py-3 px-4 font-bold">Verification</th>
                  <th className="py-3 px-4 font-bold">Registration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No system users match the search query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const roleBadge =
                      u.role === 'ADMIN'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : u.role === 'DONOR'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : u.role === 'NGO'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {u.fullName}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleBadge}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                          {u.email}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {u.phone || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active Member'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FLEET MISSIONS & LIVE TRANSPORT OVERSIGHT */}
      {activeTab === 'fleet' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                Fleet Missions & Real-Time Logistics
              </h2>
              <p className="text-xs text-slate-500">
                Live dispatch tracking across Bengaluru arterial corridors with Dijkstra shortest path telemetry.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              {deliveries.length} Total Missions Dispatched
            </span>
          </div>

          {/* Embedded Real-Time Live Delivery Radar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Tracking (Koramangala ➔ Jayanagar Hub)
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Turn-by-Turn GPS Telemetry
              </span>
            </div>
            <LiveDeliveryTracker
              foodTitle={deliveries[0]?.allocation?.donation?.title || 'South Indian Sambar, Rice & Poriyal'}
              quantityKg={deliveries[0]?.allocation?.allocatedQuantityKg || 25}
              donorName={deliveries[0]?.allocation?.donation?.donorOrganization || 'ITC Gardenia Kitchen, Koramangala'}
              ngoName={deliveries[0]?.allocation?.ngo?.organizationName || 'Akshaya Patra Redistribution Hub, Jayanagar'}
              transporterName="Rahul Sharma"
              vehicleNumber="Hero Electric Photon • KA-01-EQ-1001"
              height="450px"
              onDelivered={() => {
                showNotification('Consignment safely reached destination. Telemetry sync complete!', 'info');
                loadAllData();
              }}
            />
          </div>

          <div className="overflow-x-auto pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-bold text-sm text-slate-900">All Fleet Consignment Logs</h3>
              <div className="flex items-center gap-1.5">
                {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((filter) => {
                  const count =
                    filter === 'ALL'
                      ? deliveries.length
                      : filter === 'ACTIVE'
                      ? deliveries.filter((d) => d.status !== 'DELIVERED').length
                      : deliveries.filter((d) => d.status === 'DELIVERED').length;
                  return (
                    <button
                      key={filter}
                      onClick={() => setFleetFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        fleetFilter === filter
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter === 'ALL' ? 'All Missions' : filter === 'ACTIVE' ? 'Active / En Route' : '✔ Completed Orders'} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Food Consignment</th>
                  <th className="py-3 px-4 font-bold">Quantity</th>
                  <th className="py-3 px-4 font-bold">Pickup & Dropoff</th>
                  <th className="py-3 px-4 font-bold">Transporter</th>
                  <th className="py-3 px-4 font-bold">Distance / Time</th>
                  <th className="py-3 px-4 font-bold">Mission Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const displayDeliveries = deliveries.filter((d) => {
                    if (fleetFilter === 'ACTIVE') return d.status !== 'DELIVERED';
                    if (fleetFilter === 'COMPLETED') return d.status === 'DELIVERED';
                    return true;
                  });

                  if (displayDeliveries.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          No {fleetFilter.toLowerCase()} delivery missions found.
                        </td>
                      </tr>
                    );
                  }

                  return displayDeliveries.map((del) => {
                    const isDelivered = del.status === 'DELIVERED';
                    const statusColor =
                      isDelivered
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : del.status === 'PICKED_UP'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : del.status === 'ACCEPTED'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200';

                    return (
                      <tr key={del.id} className={`hover:bg-slate-50/70 transition ${isDelivered ? 'bg-emerald-50/20' : ''}`}>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {del.allocation?.donation?.title || 'Surplus Meals'}
                          <span className="block text-[10px] font-normal text-slate-400">
                            {del.allocation?.donation?.categoryName || 'Cooked Meals'} • {del.allocation?.donation?.dietaryType || 'VEG'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-800">
                          {del.allocation?.allocatedQuantityKg || 25} kg
                        </td>
                        <td className="py-3 px-4 text-slate-600 space-y-0.5">
                          <div>From: <strong>{del.allocation?.donation?.donorOrganization || 'Donor Kitchen'}</strong></div>
                          <div>To: <strong>{del.allocation?.ngo?.organizationName || 'Akshaya Patra'}</strong></div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="font-semibold block">{del.volunteer?.fullName || 'Rahul Sharma'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {del.volunteer?.vehicleType || 'TWO_WHEELER'} ({del.volunteer?.vehicleNumber || 'KA-01-EQ-1001'})
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          ~{del.estimatedDistanceKm || 4.8} km ({Math.round(del.estimatedTimeMinutes || 15)} min)
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border inline-flex items-center gap-1 ${statusColor}`}>
                            {isDelivered && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {del.status}
                          </span>
                          {del.completionTime && (
                            <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                              {new Date(del.completionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {/* Active Volunteer Fleet Grid */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Active Volunteer Transporter Fleet Across Bengaluru
              </h3>
              <span className="text-xs text-slate-500 font-semibold">6 Rapid Responders Deployed</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'Rahul Sharma', vehicle: 'Hero Electric Photon', reg: 'KA-01-EQ-1001', area: 'Koramangala 4th Block', phone: '+91 99000 22001', rating: '4.90', trips: 32, status: 'In-Transit (Live Tracking)' },
                { name: 'Priya Sundaram', vehicle: 'Ather 450X', reg: 'KA-05-MR-4421', area: '100ft Rd, Indiranagar', phone: '+91 98453 44002', rating: '4.95', trips: 45, status: 'Available for Dispatch' },
                { name: 'Mohammed Farhan', vehicle: 'Ola S1 Pro', reg: 'KA-03-JN-8832', area: '27th Main, HSR Layout', phone: '+91 98453 44012', rating: '4.88', trips: 62, status: 'Mission Completed' },
                { name: 'Ananya Deshmukh', vehicle: 'TVS iQube', reg: 'KA-04-EL-2094', area: '2nd Stage, BTM Layout', phone: '+91 98453 44004', rating: '4.92', trips: 38, status: 'Available for Dispatch' },
                { name: 'Vikramaditya Rao', vehicle: 'Tata Ace EV Mini-Van', reg: 'KA-51-MD-9002', area: 'Silk Board Corridor', phone: '+91 98453 44015', rating: '4.97', trips: 112, status: 'Bulk Transport On Standby' },
                { name: 'Deepa R. Nair', vehicle: 'Ampere Magnus', reg: 'KA-01-HG-3301', area: 'Phase 1, Electronic City', phone: '+91 98453 44018', rating: '4.89', trips: 29, status: 'Available for Dispatch' },
              ].map((vol) => (
                <div key={vol.reg} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{vol.name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      ⭐ {vol.rating}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono flex items-center justify-between">
                    <span>{vol.vehicle}</span>
                    <span className="text-slate-400">{vol.reg}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{vol.area} • {vol.phone}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                    <span className="text-emerald-700 font-semibold">{vol.status}</span>
                    <span className="text-slate-500 font-bold">{vol.trips} completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Advance Pledges Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Registered Corporate Surplus Pledges & Advance Intake
                </h3>
                <p className="text-xs text-slate-500">
                  Pre-committed batches scheduled to fill projected regional supply gaps before food expires
                </p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                {adminPledges.length} Pledges Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(adminPledges.length > 0 ? adminPledges : [
                {
                  pledgeId: 'PLG-A81F92B1',
                  donor: 'ITC Gardenia Kitchen',
                  targetZone: 'Koramangala Tech Corridor',
                  pledgedKg: 50.0,
                  scheduledDate: 'Upcoming Saturday Dinner',
                  timestamp: 'Recent',
                  status: 'CONFIRMED & SHELTERS PRE-NOTIFIED',
                  impact: 'Resolves weekend deficit for 125 shelter beneficiaries',
                },
              ]).map((plg: any, idx: number) => (
                <div key={plg.pledgeId || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{plg.donor}</span>
                    <span className="font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {plg.pledgedKg} kg
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Zone: {plg.targetZone}</span>
                    <span>•</span>
                    <span className="text-slate-500">{plg.scheduledDate}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] text-purple-700 font-semibold">✦ {plg.impact}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {plg.status || 'CONFIRMED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DSA ENGINE TELEMETRY */}
      {activeTab === 'dsa' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-700" />
                  Real-Time DSA Engine Architecture
                </h2>
                <p className="text-xs text-slate-500">
                  MealMesh core operations are strictly governed by custom data structures implemented from scratch.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Zero Standard Java Map/Set Wrappers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Priority Min-Heap
                  </span>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                    O(log N)
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Ranks surplus batches by expiration deadlines using minutes remaining as priority key.
                </p>
                <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between font-mono border-t border-slate-200/60">
                  <span>Tree Structure: Binary Array Heap</span>
                  <span className="text-emerald-700 font-bold">Active</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-600" />
                    Dijkstra Graph Routing
                  </span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                    O((V+E) log V)
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Adjacency-list road network graph of Bengaluru computes fastest transport path for volunteers.
                </p>
                <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between font-mono border-t border-slate-200/60">
                  <span>Network: 8 Key Bengaluru Hubs</span>
                  <span className="text-emerald-700 font-bold">Optimized</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    Greedy Multi-Criteria Matcher
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    O(N log N)
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Evaluates distance (35%), capacity (30%), urgency (25%), and dietary match (10%) simultaneously.
                </p>
                <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between font-mono border-t border-slate-200/60">
                  <span>Weight: 0.35 D + 0.30 C + 0.25 U</span>
                  <span className="text-emerald-700 font-bold">Trained</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    Disjoint Set Union (DSU)
                  </span>
                  <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">
                    O(&alpha;(N))
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Finds connected redistribution zones and community clusters with path compression & union by rank.
                </p>
                <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between font-mono border-t border-slate-200/60">
                  <span>Clustering: Koramangala-HSR-Jayanagar</span>
                  <span className="text-emerald-700 font-bold">Clustered</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                    LIFO Reversible Stack
                  </span>
                  <span className="text-[10px] font-mono bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-bold">
                    O(1)
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Stores administrative operations and enables 1-click database rollbacks with instant state recovery.
                </p>
                <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between font-mono border-t border-slate-200/60">
                  <span>Capacity: Dynamic Array Linked</span>
                  <span className="text-emerald-700 font-bold">Ready</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-teal-600" />
                    Custom Hash Table & Trie
                  </span>
                  <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-bold">
                    O(1) / O(L)
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Separate chaining with dynamic rehash at 0.75 load factor. Trie provides prefix dish search.
                </p>
                <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between font-mono border-t border-slate-200/60">
                  <span>Collision Strategy: Linked Chain</span>
                  <span className="text-emerald-700 font-bold">Indexed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DEMAND & SURPLUS FORECASTING */}
      {activeTab === 'forecasting' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">7-Day Projected Surplus</span>
              <p className="text-2xl font-black text-brand-600">{forecastSummary?.totalPredictedSurplusKg || 640.5} kg</p>
              <p className="text-xs text-slate-500">Bengaluru commercial kitchens & banquets</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">7-Day Projected Demand</span>
              <p className="text-2xl font-black text-emerald-600">{forecastSummary?.totalPredictedDemandKg || 615.0} kg</p>
              <p className="text-xs text-slate-500">Verified community shelter requirements</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Supply Buffer</span>
              <p className="text-2xl font-black text-amber-600">+{forecastSummary?.netBalanceKg || 25.5} kg</p>
              <p className="text-xs text-slate-500">Surplus buffer absorbing regional spikes</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Proactive Alerts</span>
              <p className="text-2xl font-black text-rose-600">{forecastSummary?.alerts?.length || 2}</p>
              <p className="text-xs text-slate-500">Early intervention warning notices</p>
            </div>
          </div>

          {/* Forecast Alerts */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Proactive Surplus Gaps & Deficit Intervention Alerts
            </h3>
            <div className="space-y-3">
              {(forecastSummary?.alerts || [
                {
                  type: 'SURPLUS_UNMATCHED',
                  zone: 'Whitefield IT Hub',
                  title: 'Weekend Banquet Surplus Unmatched Alert',
                  message: 'Forecast shows +43 kg excess banquet surplus on Saturday with no matched intake capacity.',
                  recommendedAction: 'Pre-alert partner shelters in neighboring HSR Layout to schedule morning pickup.',
                },
                {
                  type: 'SEVERE_SHORTAGE',
                  zone: 'Indiranagar Central',
                  title: 'Projected Beneficiary Deficit Alert',
                  message: 'Shelters project a 35 kg food deficit on Wednesday dinner. 70 children at risk of missed meal.',
                  recommendedAction: 'Appeal to corporate dining cafeterias to pledge surplus trays.',
                },
              ]).map((alt: any, i: number) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    alt.type === 'SURPLUS_UNMATCHED'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{alt.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-mono font-bold border border-slate-200">
                      Zone: {alt.zone}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{alt.message}</p>
                  <p className="font-semibold text-slate-800 text-[11px]">Action: {alt.recommendedAction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Advance Pledges Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Registered Corporate Surplus Pledges & Advance Intake
                </h3>
                <p className="text-xs text-slate-500">
                  Pre-committed batches scheduled to fill projected regional supply gaps before food expires
                </p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                {adminPledges.length} Pledges Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(adminPledges.length > 0 ? adminPledges : [
                {
                  pledgeId: 'PLG-A81F92B1',
                  donor: 'ITC Gardenia Kitchen',
                  targetZone: 'Koramangala Tech Corridor',
                  pledgedKg: 50.0,
                  scheduledDate: 'Upcoming Saturday Dinner',
                  timestamp: 'Recent',
                  status: 'CONFIRMED & SHELTERS PRE-NOTIFIED',
                  impact: 'Resolves weekend deficit for 125 shelter beneficiaries',
                },
              ]).map((plg: any, idx: number) => (
                <div key={plg.pledgeId || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{plg.donor}</span>
                    <span className="font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {plg.pledgedKg} kg
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Zone: {plg.targetZone}</span>
                    <span>•</span>
                    <span className="text-slate-500">{plg.scheduledDate}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] text-purple-700 font-semibold">✦ {plg.impact}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {plg.status || 'CONFIRMED'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                Immutable System Audit Trail (LIFO Stack Backed)
              </h2>
              <p className="text-xs text-slate-500">
                Complete traceability of donations, allocations, volunteer assignments, and administrative actions.
              </p>
            </div>
            <button
              onClick={handleUndo}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
            >
              <RotateCcw className="w-3 h-3" />
              Undo Last Action
            </button>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No audit logs recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 hover:bg-slate-100/60 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Entity: {log.entityType}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs mt-1">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
