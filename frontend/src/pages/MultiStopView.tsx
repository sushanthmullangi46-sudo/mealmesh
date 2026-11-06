import React, { useState } from 'react';
import { useNavigation } from '../hooks/useNavigationContext';
import { api } from '../services/api';
import { MultiStopResponse } from '../types';
import {
  Milestone,
  Plus,
  Trash2,
  Zap,
  ArrowRight,
  TrendingDown,
  Info,
  RotateCw
} from 'lucide-react';

export const MultiStopView: React.FC = () => {
  const { locations, setTspResponse, tspResponse, setActiveRoute } = useNavigation();

  const [startId, setStartId] = useState<number>(1); // Central Station
  const [waypoints, setWaypoints] = useState<number[]>([2, 5, 8, 11]); // Times Sq, Flatiron, SoHo, Wall St
  const [roundTrip, setRoundTrip] = useState<boolean>(true);
  const [selectedToAdd, setSelectedToAdd] = useState<number>(3);
  const [optimizing, setOptimizing] = useState<boolean>(false);

  const locationMap = React.useMemo(() => {
    const map = new Map<number, string>();
    locations.forEach(l => map.set(l.id, l.name));
    return map;
  }, [locations]);

  const handleAddWaypoint = () => {
    if (selectedToAdd && !waypoints.includes(selectedToAdd) && selectedToAdd !== startId) {
      setWaypoints([...waypoints, selectedToAdd]);
    }
  };

  const handleRemoveWaypoint = (id: number) => {
    setWaypoints(waypoints.filter(w => w !== id));
  };

  const handleOptimizeTour = async () => {
    try {
      setOptimizing(true);
      const res = await api.optimizeMultiStop(startId, waypoints, startId, roundTrip);
      setTspResponse(res);
      setActiveRoute(null); // let map display TSP polyline
    } catch (err: any) {
      alert("Error optimizing multi-stop tour: " + err.message);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Configuration Header */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Milestone className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Multi-Stop Route Optimizer (Metric TSP)
              </h3>
              <p className="text-xs text-slate-500">
                Nearest Neighbor Greedy Tour Construction + 2-Opt Local Search Heuristic
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950">
            NP-Hard Approximation
          </span>
        </div>

        {/* Start and Round Trip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Start & Finish Hub
            </label>
            <select
              value={startId}
              onChange={(e) => setStartId(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name} (#{l.id})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="roundTrip"
              checked={roundTrip}
              onChange={(e) => setRoundTrip(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
            />
            <label htmlFor="roundTrip" className="text-xs font-medium cursor-pointer">
              Complete Circuit (Round Trip return to starting hub)
            </label>
          </div>
        </div>

        {/* Add Waypoints Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <select
            value={selectedToAdd}
            onChange={(e) => setSelectedToAdd(Number(e.target.value))}
            className="flex-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
          >
            {locations.filter(l => l.id !== startId && !waypoints.includes(l.id)).map(l => (
              <option key={l.id} value={l.id}>{l.name} (#{l.id})</option>
            ))}
          </select>

          <button
            onClick={handleAddWaypoint}
            className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Plus className="w-4 h-4 text-brand-500" /> Add Stop
          </button>

          <button
            onClick={handleOptimizeTour}
            disabled={optimizing || waypoints.length === 0}
            className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 flex items-center gap-2"
          >
            <Zap className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
            {optimizing ? 'Optimizing Tour...' : 'Optimize Itinerary (2-Opt)'}
          </button>
        </div>

        {/* Waypoints List */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Stops to Visit ({waypoints.length} locations):
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {waypoints.map((wp, index) => (
              <div
                key={wp}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2"
              >
                <span className="font-bold text-brand-600 dark:text-brand-400">Stop #{index + 1}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{locationMap.get(wp) || `Node ${wp}`}</span>
                <button
                  onClick={() => handleRemoveWaypoint(wp)}
                  className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Comparison Card */}
      {tspResponse && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">2-Opt Optimization Gains</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Initial Tour (Nearest Neighbor):</span>
                <span className="font-semibold">{tspResponse.initial_distance_km.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Optimized Tour (2-Opt Swaps):</span>
                <span className="font-bold text-emerald-600 text-sm">{tspResponse.optimized_distance_km.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Distance Saved:</span>
                <span className="font-bold text-emerald-600">
                  {tspResponse.distance_saved_km.toFixed(2)} km ({tspResponse.improvement_percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">2-Opt Iterations:</span>
                <span className="font-mono">{tspResponse.two_opt_iterations} iterations</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Execution Time:</span>
                <span className="font-mono text-emerald-600 font-bold">{tspResponse.execution_time_ms.toFixed(3)} ms</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Optimal Sequence of Visitation ({tspResponse.tour_node_ids.length} stops)
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
              {tspResponse.tour_node_ids.map((nid, i) => (
                <React.Fragment key={i}>
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold">
                    {i + 1}. {locationMap.get(nid) || `Node ${nid}`}
                  </div>
                  {i < tspResponse.tour_node_ids.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <span>{tspResponse.heuristic_notes}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

