import React, { useState } from 'react';
import { useNavigation } from '../hooks/useNavigationContext';
import { api } from '../services/api';
import { TrafficLevel } from '../types';
import {
  AlertOctagon,
  Shuffle,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Ban
} from 'lucide-react';

export const TrafficSimulationView: React.FC = () => {
  const {
    roads,
    updateRoadTrafficLevel,
    refreshGraphData,
    selectedSourceId,
    selectedTargetId,
    activeRoute,
    setActiveRoute,
  } = useNavigation();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const handleRandomize = async () => {
    try {
      setLoadingAction('randomize');
      await api.randomizeTraffic();
      await refreshGraphData();
      if (selectedSourceId && selectedTargetId) {
        const reroute = await api.findFastestPath(selectedSourceId, selectedTargetId);
        setActiveRoute(reroute);
      }
    } catch (err: any) {
      alert("Failed to randomize traffic: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReset = async () => {
    try {
      setLoadingAction('reset');
      await api.resetTraffic();
      await refreshGraphData();
      if (selectedSourceId && selectedTargetId) {
        const reroute = await api.findFastestPath(selectedSourceId, selectedTargetId);
        setActiveRoute(reroute);
      }
    } catch (err: any) {
      alert("Failed to reset traffic: " + err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBlockBroadway = async () => {
    // Specifically demonstrate instant rerouting by blocking Midtown Broadway corridor
    try {
      setLoadingAction('block_demo');
      // r_2_4 is Broadway Midtown connecting Times Square to Empire State
      await api.updateRoadTraffic('r_2_4', 'BLOCKED');
      await refreshGraphData();
      if (selectedSourceId && selectedTargetId) {
        const reroute = await api.findFastestPath(selectedSourceId, selectedTargetId);
        setActiveRoute(reroute);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const filteredRoads = roads.filter(r => {
    if (filterLevel === 'ALL') return true;
    return r.traffic_level === filterLevel;
  });

  return (
    <div className="space-y-4">
      {/* Simulation Dashboard Header */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Dynamic Traffic Simulation & Snapshot Engine
              </h3>
              <p className="text-xs text-slate-500">
                Adjust road capacity multipliers to trigger real-time algorithmic rerouting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBlockBroadway}
              disabled={loadingAction !== null}
              className="px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-red-300 dark:border-red-900"
            >
              <Ban className="w-3.5 h-3.5" /> Block Midtown Broadway (Test Reroute)
            </button>

            <button
              onClick={handleRandomize}
              disabled={loadingAction !== null}
              className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" /> Randomize Rush Hour
            </button>

            <button
              onClick={handleReset}
              disabled={loadingAction !== null}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Free-Flow
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-400">Filter by Traffic:</span>
          {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'BLOCKED'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
                filterLevel === lvl
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Road Segment Control List */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            Road Network Conditions ({filteredRoads.length} of {roads.length} segments)
          </h4>
          <span className="text-[11px] text-slate-400">Click any level to update dynamically</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-2">
          {filteredRoads.map(road => (
            <div
              key={road.id}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="truncate text-slate-900 dark:text-white">{road.road_name}</span>
                <span className="text-[10px] font-mono text-slate-400">#{road.id}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Distance: {road.distance_km} km</span>
                <span>Speed: {road.speed_limit_kmh} km/h</span>
                <span>Toll: ${road.toll_cost.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-4 gap-1 pt-1 border-t dark:border-slate-700/60">
                {(['LOW', 'MEDIUM', 'HIGH', 'BLOCKED'] as TrafficLevel[]).map(lvl => {
                  const isCurrent = road.traffic_level === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => updateRoadTrafficLevel(road.id, lvl)}
                      className={`py-1 rounded text-[10px] font-bold transition-all ${
                        isCurrent
                          ? lvl === 'LOW' ? 'bg-emerald-600 text-white' :
                            lvl === 'MEDIUM' ? 'bg-amber-500 text-white' :
                            lvl === 'HIGH' ? 'bg-red-600 text-white' :
                            'bg-purple-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
