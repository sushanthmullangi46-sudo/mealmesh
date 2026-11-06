import React, { useState } from 'react';
import { useNavigation } from '../hooks/useNavigationContext';
import { api } from '../services/api';
import { Objective, Algorithm } from '../types';
import {
  Navigation,
  Flag,
  ArrowRight,
  Clock,
  Compass,
  DollarSign,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export const LiveNavigationView: React.FC = () => {
  const {
    locations,
    selectedSourceId,
    setSelectedSourceId,
    selectedTargetId,
    setSelectedTargetId,
    activeRoute,
    setActiveRoute,
  } = useNavigation();

  const [algorithm, setAlgorithm] = useState<Algorithm>('Dijkstra');
  const [objective, setObjective] = useState<Objective>('DISTANCE');
  const [calculating, setCalculating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleComputeRoute = async () => {
    if (!selectedSourceId || !selectedTargetId) {
      setErrorMsg("Please select both source and destination locations.");
      return;
    }
    try {
      setCalculating(true);
      setErrorMsg(null);
      let res;
      if (algorithm === 'A*') {
        res = await api.findAStarPath(selectedSourceId, selectedTargetId, objective);
      } else {
        if (objective === 'TIME') {
          res = await api.findFastestPath(selectedSourceId, selectedTargetId);
        } else {
          res = await api.findShortestPath(selectedSourceId, selectedTargetId);
        }
      }
      setActiveRoute(res);
      if (!res.found) {
        setErrorMsg("No path exists between the selected locations (they may be in disconnected components).");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to calculate route");
    } finally {
      setCalculating(false);
    }
  };

  const handleSwap = () => {
    const temp = selectedSourceId;
    setSelectedSourceId(selectedTargetId);
    setSelectedTargetId(temp);
  };

  return (
    <div className="space-y-4">
      {/* Route Control Panel Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Route Planning & Guidance</h3>
          </div>
          <span className="text-xs text-slate-500">Pick on map or dropdown</span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Origin */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Starting Location (Origin)
            </label>
            <select
              value={selectedSourceId || ''}
              onChange={(e) => setSelectedSourceId(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">Select origin...</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name} (#{l.id})</option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center pt-2">
            <button
              onClick={handleSwap}
              title="Swap Origin and Destination"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Destination Location
            </label>
            <select
              value={selectedTargetId || ''}
              onChange={(e) => setSelectedTargetId(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">Select destination...</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name} (#{l.id})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Algorithm & Objective Radios */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-slate-500">Algorithm:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="algo"
                checked={algorithm === 'Dijkstra'}
                onChange={() => setAlgorithm('Dijkstra')}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span>Dijkstra's Algorithm</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="algo"
                checked={algorithm === 'A*'}
                onChange={() => setAlgorithm('A*')}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span>A* Pathfinding (Haversine)</span>
            </label>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-slate-500">Criteria:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="obj"
                checked={objective === 'DISTANCE'}
                onChange={() => setObjective('DISTANCE')}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span>Shortest Distance</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="obj"
                checked={objective === 'TIME'}
                onChange={() => setObjective('TIME')}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span>Fastest Time</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="obj"
                checked={objective === 'COST'}
                onChange={() => setObjective('COST')}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span>Lowest Cost</span>
            </label>
          </div>

          <button
            onClick={handleComputeRoute}
            disabled={calculating}
            className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 flex items-center gap-2 transition-colors ml-auto"
          >
            <Zap className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
            {calculating ? 'Computing Route...' : 'Calculate Optimal Route'}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Route Details Card */}
      {activeRoute && activeRoute.found && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Key Metrics */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Route Summary</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total Distance:</span>
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {activeRoute.total_distance_km.toFixed(2)} km
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Estimated Duration:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                  {activeRoute.total_time_minutes.toFixed(1)} mins
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Estimated Travel Cost:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ${activeRoute.total_cost.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t dark:border-slate-800 text-slate-500">
                <span>Explored Frontier:</span>
                <span className="font-mono">{activeRoute.nodes_explored} nodes ({activeRoute.edges_examined} edges)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Execution Time:</span>
                <span className="font-mono text-emerald-600 font-semibold">{activeRoute.execution_time_ms.toFixed(3)} ms</span>
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Maneuvers */}
          <div className="md:col-span-2 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Turn-by-Turn Navigation Steps ({activeRoute.detailed_steps.length} segments)
            </h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {activeRoute.detailed_steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-[10px]">
                      {step.step_number}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {step.road_name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {step.from_node_name} → {step.to_node_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{step.distance_km} km</div>
                    <div className="text-[11px] text-slate-400">{step.travel_time_minutes} min</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
