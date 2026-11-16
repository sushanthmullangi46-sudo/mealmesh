import React, { useState } from 'react';
import { useNavigation } from '../hooks/useNavigationContext';
import { api } from '../services/api';
import { RouteResponse } from '../types';
import { Route, Zap, CheckCircle2, Info, ArrowRight } from 'lucide-react';

export const ShortestPathView: React.FC = () => {
  const {
    locations,
    selectedSourceId,
    setSelectedSourceId,
    selectedTargetId,
    setSelectedTargetId,
    setActiveRoute,
  } = useNavigation();

  const [dijkstraResult, setDijkstraResult] = useState<RouteResponse | null>(null);
  const [astarResult, setAstarResult] = useState<RouteResponse | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [activeDisplay, setActiveDisplay] = useState<'Dijkstra' | 'A*'>('A*');

  const handleRunComparison = async () => {
    if (!selectedSourceId || !selectedTargetId) return;
    try {
      setRunning(true);
      const [dijkstra, astar] = await Promise.all([
        api.findShortestPath(selectedSourceId, selectedTargetId),
        api.findAStarPath(selectedSourceId, selectedTargetId, 'DISTANCE')
      ]);
      setDijkstraResult(dijkstra);
      setAstarResult(astar);
      setActiveRoute(astar); // overlay on map
    } catch (err: any) {
      alert("Error calculating routes: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Configuration Header */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Dijkstra vs A* Pathfinding Benchmark
            </h3>
          </div>
          <span className="text-xs text-slate-500">Compare frontier efficiency</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-semibold text-slate-500">Origin</label>
            <select
              value={selectedSourceId || ''}
              onChange={(e) => setSelectedSourceId(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name} (#{l.id})</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-center text-slate-400">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-semibold text-slate-500">Destination</label>
            <select
              value={selectedTargetId || ''}
              onChange={(e) => setSelectedTargetId(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
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
            disabled={running}
            className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 flex items-center gap-2 transition-colors"
          >
            <Zap className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Executing Algorithms...' : 'Run Simultaneous Comparison'}
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      {dijkstraResult && astarResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dijkstra Card */}
          <div
            onClick={() => { setActiveDisplay('Dijkstra'); setActiveRoute(dijkstraResult); }}
            className={`p-5 rounded-xl bg-white dark:bg-slate-900 border-2 cursor-pointer transition-all ${
              activeDisplay === 'Dijkstra'
                ? 'border-brand-500 shadow-md'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Dijkstra's Algorithm
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                O((V+E) log V)
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Distance:</span>
                <span className="font-bold text-sm">{dijkstraResult.total_distance_km.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nodes Explored:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {dijkstraResult.nodes_explored} nodes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Edges Examined:</span>
                <span className="font-semibold">{dijkstraResult.edges_examined} edges</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Execution Time:</span>
                <span className="font-mono font-bold text-emerald-600">
                  {dijkstraResult.execution_time_ms.toFixed(3)} ms
                </span>
              </div>
              <div className="pt-2 border-t dark:border-slate-800 text-[11px] text-slate-500">
                Explores uniformly in all radial directions without goal bias.
              </div>
            </div>
          </div>

          {/* A* Card */}
          <div
            onClick={() => { setActiveDisplay('A*'); setActiveRoute(astarResult); }}
            className={`p-5 rounded-xl bg-white dark:bg-slate-900 border-2 cursor-pointer transition-all ${
              activeDisplay === 'A*'
                ? 'border-emerald-500 shadow-md'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> A* Search (Haversine Heuristic)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                f(n) = g(n) + h(n)
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Distance:</span>
                <span className="font-bold text-sm">{astarResult.total_distance_km.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nodes Explored:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {astarResult.nodes_explored} nodes{' '}
                  <span className="text-[10px] font-normal text-slate-400">
                    ({Math.round(((dijkstraResult.nodes_explored - astarResult.nodes_explored) / Math.max(1, dijkstraResult.nodes_explored)) * 100)}% fewer)
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Edges Examined:</span>
                <span className="font-semibold">{astarResult.edges_examined} edges</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Execution Time:</span>
                <span className="font-mono font-bold text-emerald-600">
                  {astarResult.execution_time_ms.toFixed(3)} ms
                </span>
              </div>
              <div className="pt-2 border-t dark:border-slate-800 text-[11px] text-slate-500">
                Prunes search space toward target using great-circle admissible lower bound.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Algorithmic Admissibility Note */}
      <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1">
        <div className="font-bold flex items-center gap-1.5">
          <Info className="w-4 h-4 text-brand-600" /> Mathematical Admissibility Proof
        </div>
        <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
          A* is guaranteed to yield the optimal path because the Haversine great-circle distance is strictly admissible (h(u) &le; d*(u &rarr; target)).
          Because straight-line spherical distance is always less than or equal to actual road network distance, the heuristic never overestimates the true remaining cost, satisfying the strict condition for admissibility and consistency.
        </p>
      </div>
    </div>
  );
};
