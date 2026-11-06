import React, { useEffect, useState } from 'react';
import { useNavigation } from '../hooks/useNavigationContext';
import { api } from '../services/api';
import { ConnectivityAnalysisResponse, TraversalResponse } from '../types';
import {
  Network,
  GitBranch,
  Layers,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Play
} from 'lucide-react';

export const GraphAnalysisView: React.FC = () => {
  const { locations } = useNavigation();

  const [connData, setConnData] = useState<ConnectivityAnalysisResponse | null>(null);
  const [traversalData, setTraversalData] = useState<TraversalResponse | null>(null);
  const [traversalType, setTraversalType] = useState<'BFS' | 'DFS'>('BFS');
  const [startNodeId, setStartNodeId] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchConnectivity = async () => {
    try {
      setLoading(true);
      const res = await api.getConnectivity();
      setConnData(res);
    } catch (err: any) {
      alert("Error loading connectivity analysis: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectivity();
  }, []);

  const handleRunTraversal = async () => {
    try {
      if (traversalType === 'BFS') {
        const res = await api.getBfsTraversal(startNodeId);
        setTraversalData(res);
      } else {
        const res = await api.getDfsTraversal(startNodeId);
        setTraversalData(res);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Graph Connectivity & Disjoint Set Union (DSU) Analyzer
              </h3>
              <p className="text-xs text-slate-500">
                Identify connected subgraphs, network partitions, and unreachable island nodes
              </p>
            </div>
          </div>

          <button
            onClick={fetchConnectivity}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Analysis
          </button>
        </div>

        {/* Connectivity Summary Pill */}
        {connData && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              {connData.is_fully_connected ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> 100% Fully Connected Network
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4" /> Disconnected Network ({connData.component_count} Components)
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-slate-500">
              <span>Total Vertices: <strong className="text-slate-800 dark:text-slate-200">{connData.total_nodes}</strong></span>
              <span>Total Edges: <strong className="text-slate-800 dark:text-slate-200">{connData.total_edges}</strong></span>
              <span>DSU Runtime: <strong className="font-mono text-emerald-600">{connData.execution_time_ms.toFixed(3)} ms</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Traversal Tool Card (BFS / DFS) */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
          Traverse Road Graph (BFS / DFS Search)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5">
            <label className="text-xs font-semibold text-slate-500 block mb-1">Start / Root Vertex</label>
            <select
              value={startNodeId}
              onChange={(e) => setStartNodeId(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2"
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name} (#{l.id})</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="text-xs font-semibold text-slate-500 block mb-1">Algorithm</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTraversalType('BFS')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                  traversalType === 'BFS' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}
              >
                BFS (Level Order)
              </button>
              <button
                onClick={() => setTraversalType('DFS')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold ${
                  traversalType === 'DFS' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                }`}
              >
                DFS (Depth Exploration)
              </button>
            </div>
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              onClick={handleRunTraversal}
              className="w-full py-2 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5" /> Run {traversalType}
            </button>
          </div>
        </div>

        {traversalData && (
          <div className="pt-2 border-t dark:border-slate-800 space-y-2">
            <div className="text-xs text-slate-500">
              {traversalData.algorithm} Visited Sequence ({traversalData.visited_order.length} reachable nodes):
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {traversalData.visited_names.map((name, i) => (
                <span key={i} className="px-2 py-1 rounded bg-brand-50 dark:bg-brand-950 text-brand-800 dark:text-brand-300 font-mono text-[11px]">
                  {i + 1}. {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Disjoint Set Union Component Groups */}
      {connData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connData.components.map((comp, idx) => (
            <div
              key={comp.component_id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-brand-500' : 'bg-amber-500'}`}></span>
                  Connected Component #{comp.component_id}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {comp.node_count} nodes
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto flex flex-wrap gap-1.5 pr-1">
                {comp.node_names.map((name, ni) => (
                  <span
                    key={ni}
                    className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                  >
                    {name}
                  </span>
                ))}
              </div>

              {idx > 0 && (
                <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300">
                  Notice: This partition is disconnected from the main city network by water without a bridge link.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
