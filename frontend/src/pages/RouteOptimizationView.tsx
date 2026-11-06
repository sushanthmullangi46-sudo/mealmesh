import React, { useState } from 'react';
import { useNavigation } from '../hooks/useNavigationContext';
import { api } from '../services/api';
import { MultiCriteriaCompareResponse } from '../types';
import { GitCompare, Zap, DollarSign, Clock, MapPin, Check } from 'lucide-react';

export const RouteOptimizationView: React.FC = () => {
  const {
    locations,
    selectedSourceId,
    setSelectedSourceId,
    selectedTargetId,
    setSelectedTargetId,
    setActiveRoute,
    setComparisonRoutes,
  } = useNavigation();

  const [compareData, setCompareData] = useState<MultiCriteriaCompareResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeCriterion, setActiveCriterion] = useState<'distance' | 'time' | 'cost'>('time');

  const handleRunComparison = async () => {
    if (!selectedSourceId || !selectedTargetId) return;
    try {
      setLoading(true);
      const res = await api.compareRoutes(selectedSourceId, selectedTargetId);
      setCompareData(res);
      setComparisonRoutes(res);
      setActiveRoute(res.fastest_time_route);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActiveRouteObj = () => {
    if (!compareData) return null;
    if (activeCriterion === 'distance') return compareData.shortest_distance_route;
    if (activeCriterion === 'time') return compareData.fastest_time_route;
    return compareData.lowest_cost_route;
  };

  const currentRoute = getActiveRouteObj();

  return (
    <div className="space-y-4">
      {/* Selector Header */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Multi-Criteria Route Optimization
            </h3>
          </div>
          <span className="text-xs text-slate-500">Shortest vs Fastest vs Cheapest</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Origin</label>
            <select
              value={selectedSourceId || ''}
              onChange={(e) => setSelectedSourceId(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name} (#{l.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Destination</label>
            <select
              value={selectedTargetId || ''}
              onChange={(e) => setSelectedTargetId(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name} (#{l.id})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunComparison}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 flex items-center gap-2"
          >
            <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Evaluating Multiple Objectives...' : 'Compare 3 Objectives'}
          </button>
        </div>
      </div>

      {/* 3 Interactive Cards */}
      {compareData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Shortest Distance */}
            <div
              onClick={() => {
                setActiveCriterion('distance');
                setActiveRoute(compareData.shortest_distance_route);
              }}
              className={`p-4 rounded-xl bg-white dark:bg-slate-900 border-2 cursor-pointer transition-all ${
                activeCriterion === 'distance'
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Shortest Distance
                </span>
                {activeCriterion === 'distance' && <Check className="w-4 h-4 text-blue-500" />}
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {compareData.shortest_distance_route.total_distance_km.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-500">km</span>
              </div>
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                <div>Time: <span className="font-semibold text-slate-800 dark:text-slate-200">{compareData.shortest_distance_route.total_time_minutes.toFixed(1)} mins</span></div>
                <div>Cost: <span className="font-semibold text-slate-800 dark:text-slate-200">${compareData.shortest_distance_route.total_cost.toFixed(2)}</span></div>
                <div>Runtime: <span className="font-mono text-emerald-600">{compareData.shortest_distance_route.execution_time_ms.toFixed(3)} ms</span></div>
              </div>
            </div>

            {/* Fastest Travel Time */}
            <div
              onClick={() => {
                setActiveCriterion('time');
                setActiveRoute(compareData.fastest_time_route);
              }}
              className={`p-4 rounded-xl bg-white dark:bg-slate-900 border-2 cursor-pointer transition-all ${
                activeCriterion === 'time'
                  ? 'border-purple-500 shadow-md ring-2 ring-purple-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Fastest Duration
                </span>
                {activeCriterion === 'time' && <Check className="w-4 h-4 text-purple-500" />}
              </div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {compareData.fastest_time_route.total_time_minutes.toFixed(1)}{' '}
                <span className="text-xs font-normal text-slate-500">mins</span>
              </div>
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                <div>Distance: <span className="font-semibold text-slate-800 dark:text-slate-200">{compareData.fastest_time_route.total_distance_km.toFixed(2)} km</span></div>
                <div>Cost: <span className="font-semibold text-slate-800 dark:text-slate-200">${compareData.fastest_time_route.total_cost.toFixed(2)}</span></div>
                <div>Runtime: <span className="font-mono text-emerald-600">{compareData.fastest_time_route.execution_time_ms.toFixed(3)} ms</span></div>
              </div>
            </div>

            {/* Lowest Monetary Cost */}
            <div
              onClick={() => {
                setActiveCriterion('cost');
                setActiveRoute(compareData.lowest_cost_route);
              }}
              className={`p-4 rounded-xl bg-white dark:bg-slate-900 border-2 cursor-pointer transition-all ${
                activeCriterion === 'cost'
                  ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Lowest Cost
                </span>
                {activeCriterion === 'cost' && <Check className="w-4 h-4 text-emerald-500" />}
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ${compareData.lowest_cost_route.total_cost.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                <div>Distance: <span className="font-semibold text-slate-800 dark:text-slate-200">{compareData.lowest_cost_route.total_distance_km.toFixed(2)} km</span></div>
                <div>Time: <span className="font-semibold text-slate-800 dark:text-slate-200">{compareData.lowest_cost_route.total_time_minutes.toFixed(1)} mins</span></div>
                <div>Runtime: <span className="font-mono text-emerald-600">{compareData.lowest_cost_route.execution_time_ms.toFixed(3)} ms</span></div>
              </div>
            </div>
          </div>

          {/* Detailed Path Steps for Active Criterion */}
          {currentRoute && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Segment Breakdown ({activeCriterion.toUpperCase()} OPTIMIZED)
              </h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-2">
                {currentRoute.detailed_steps.map((st, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold">{st.road_name}</span> ({st.from_node_name} → {st.to_node_name})
                    </div>
                    <div className="flex gap-4 font-mono text-[11px]">
                      <span>{st.distance_km} km</span>
                      <span>{st.travel_time_minutes} min</span>
                      <span className="font-bold">${st.cost.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
