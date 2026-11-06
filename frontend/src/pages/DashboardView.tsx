import React, { useEffect, useState } from 'react';
import { useNavigation } from '../hooks/useNavigationContext';
import { api } from '../services/api';
import { RouteHistoryItem } from '../types';
import {
  MapPin,
  Layers,
  Network,
  Clock,
  Zap,
  TrendingUp,
  ArrowRight,
  Route,
  Activity,
  History
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { stats, locations, setActiveTab, setSelectedSourceId, setSelectedTargetId } = useNavigation();
  const [history, setHistory] = useState<RouteHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  useEffect(() => {
    api.getRouteHistory()
      .then(data => setHistory(data))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const locationMap = React.useMemo(() => {
    const map = new Map<number, string>();
    locations.forEach(l => map.set(l.id, l.name));
    return map;
  }, [locations]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 text-white shadow-xl">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
            Enterprise DSA Platform
          </span>
          <h2 className="text-2xl font-black tracking-tight">
            Algorithmic Route Optimization & GIS Engine
          </h2>
          <p className="text-sm text-brand-100 leading-relaxed">
            High-performance pathfinding featuring C++20 Dijkstra, A* with admissible Haversine heuristics,
            Disjoint Set Union (DSU) graph partitioning, and 2-Opt Traveling Salesperson (TSP) optimization.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-brand-600">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Locations</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.total_locations || locations.length}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">GIS Graph Vertices</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Road Segments</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.total_roads || 0}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Adjacency List Edges</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Connected Components</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.connected_components || 1}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">DSU Partition Groups</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Road Speed</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.average_speed_limit_kmh || 50} <span className="text-sm font-normal text-slate-500">km/h</span>
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Dynamic Traffic Weighted</div>
          </div>
        </div>
      </div>

      {/* Quick Launch Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('shortest-path')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm text-left transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-2">
            <Route className="w-6 h-6 text-brand-500 group-hover:scale-110 transition-transform" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Dijkstra vs A* Pathfinder</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compare Dijkstra frontier expansion with heuristic-guided A* search.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('traffic')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-sm text-left transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Dynamic Traffic Simulation</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate rush hour road blockages and witness instant live rerouting.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('visualizer')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm text-left transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Step-by-Step Algorithm Visualizer</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Inspect the Priority Queue, distance relaxations, and parent pointers frame by frame.
          </p>
        </button>
      </div>

      {/* Recent Route History Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Algorithm Executions</h3>
          </div>
          <span className="text-xs text-slate-500">Last 50 routes</span>
        </div>

        <div className="overflow-x-auto">
          {loadingHistory ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading calculation history...</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No routes calculated yet. Calculate a route using Live Navigation or Shortest Path to view history logs.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Route (Origin → Destination)</th>
                  <th className="px-4 py-3">Algorithm</th>
                  <th className="px-4 py-3">Objective</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Exec Time</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.slice(0, 8).map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {locationMap.get(item.source_id) || `Node ${item.source_id}`} →{' '}
                      {locationMap.get(item.target_id) || `Node ${item.target_id}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                        {item.algorithm}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 capitalize">{item.objective.toLowerCase()}</td>
                    <td className="px-4 py-3 font-semibold">{item.distance_km.toFixed(2)} km</td>
                    <td className="px-4 py-3">{item.time_minutes.toFixed(1)} min</td>
                    <td className="px-4 py-3">${item.cost.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                      {item.execution_time_ms.toFixed(3)} ms
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedSourceId(item.source_id);
                          setSelectedTargetId(item.target_id);
                          setActiveTab('navigation');
                        }}
                        className="text-brand-600 hover:text-brand-700 font-semibold"
                      >
                        Re-run
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
