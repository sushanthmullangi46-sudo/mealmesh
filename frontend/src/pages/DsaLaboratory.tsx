import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DsaLabStep, RouteWaypoint } from '../types/mealmesh';
import { MealMeshMap } from '../maps/MealMeshMap';
import {
  Cpu,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sliders,
  Layers,
  ArrowRight,
  GitBranch,
  Search,
  Database,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';

export const DsaLaboratory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'GRAPH' | 'HEAP' | 'HASHTABLE' | 'QUEUE' | 'STACK' | 'LINKEDLIST' | 'TRIE' | 'GREEDY' | 'DSU'
  >('GRAPH');

  // Operation state
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<DsaLabStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step

  // Structure specific state
  const [heapSnapshot, setHeapSnapshot] = useState<any[]>([]);
  const [hashBuckets, setHashBuckets] = useState<any[]>([]);
  const [hashMeta, setHashMeta] = useState<{ size: number; capacity: number; loadFactor: number; collisions: number }>({
    size: 0,
    capacity: 8,
    loadFactor: 0,
    collisions: 0,
  });
  const [queueItems, setQueueItems] = useState<string[]>([]);
  const [stackItems, setStackItems] = useState<string[]>([]);
  const [linkedListForward, setLinkedListForward] = useState<string[]>([]);
  const [trieMatches, setTrieMatches] = useState<string[]>([]);
  const [triePrefix, setTriePrefix] = useState<string>('ak');
  const [dsuRoots, setDsuRoots] = useState<string[]>([]);
  const [dsuComponentCount, setDsuComponentCount] = useState<number>(8);
  const [greedyResult, setGreedyResult] = useState<any>(null);

  // Graph state
  const [graphStart, setGraphStart] = useState<string>('V_KORAMANGALA');
  const [graphTarget, setGraphTarget] = useState<string>('V_JAYANAGAR');
  const [graphMetric, setGraphMetric] = useState<string>('distance');
  const [graphAlgorithm, setGraphAlgorithm] = useState<'DIJKSTRA' | 'BFS' | 'DFS'>('DIJKSTRA');
  const [waypoints, setWaypoints] = useState<RouteWaypoint[]>([]);
  const [routePath, setRoutePath] = useState<RouteWaypoint[]>([]);

  // Inputs
  const [inputVal, setInputVal] = useState<string>('');
  const [inputKey, setInputKey] = useState<string>('');
  const [inputPriority, setInputPriority] = useState<number>(2.5);

  const fetchWaypoints = async () => {
    try {
      const wps = await api.getWaypoints();
      setWaypoints(wps);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWaypoints();
    runOperation('PEEK');
  }, [activeTab]);

  // Step playback timer
  useEffect(() => {
    let timer: any;
    if (isPlaying && steps.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps, playbackSpeed]);

  const runOperation = async (operation: string) => {
    setLoading(true);
    setIsPlaying(false);
    try {
      const payload: any = {
        structure: activeTab,
        operation,
        key: inputKey || triePrefix,
        value: inputVal,
        priority: inputPriority,
        startNode: graphStart,
        targetNode: graphTarget,
        metric: graphMetric,
      };

      if (activeTab === 'GRAPH') {
        payload.operation = graphAlgorithm;
      }

      const res = await api.executeDsaOperation(payload);

      if (res.steps) {
        setSteps(res.steps);
        setCurrentStepIdx(0);
      }

      if (res.heapSnapshot) setHeapSnapshot(res.heapSnapshot);
      if (res.buckets) setHashBuckets(res.buckets);
      if (res.capacity) {
        setHashMeta({
          size: res.size,
          capacity: res.capacity,
          loadFactor: res.loadFactor,
          collisions: res.collisions,
        });
      }
      if (res.currentQueue) setQueueItems(res.currentQueue);
      if (res.currentStack) setStackItems(res.currentStack);
      if (res.forward) setLinkedListForward(res.forward);
      if (res.matches) setTrieMatches(res.matches);
      if (res.roots) setDsuRoots(res.roots);
      if (res.componentCount !== undefined) setDsuComponentCount(res.componentCount);
      if (res.allocationResult) setGreedyResult(res.allocationResult);

      if (res.dijkstraResult && res.dijkstraResult.path) {
        setRoutePath(
          res.dijkstraResult.path.map((v: any) => ({
            id: v.id,
            label: v.label,
            latitude: v.latitude,
            longitude: v.longitude,
            type: v.type,
          }))
        );
      }
    } catch (err: any) {
      alert('Operation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps[currentStepIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500 text-emerald-950 shadow-md">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Interactive DSA Laboratory
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Visual inspection and step-by-step debugging of custom algorithms implemented from scratch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Built From Scratch (Arrays + Own Nodes)
          </span>
        </div>
      </div>

      {/* Algorithm Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
        {[
          { id: 'GRAPH', label: '1. Graph Dijkstra' },
          { id: 'HEAP', label: '2. Binary Min-Heap' },
          { id: 'HASHTABLE', label: '3. Hash Table' },
          { id: 'GREEDY', label: '4. Greedy Allocator' },
          { id: 'DSU', label: '5. Disjoint Set Union' },
          { id: 'TRIE', label: '6. Prefix Trie' },
          { id: 'QUEUE', label: '7. FIFO Queue' },
          { id: 'STACK', label: '8. LIFO Stack' },
          { id: 'LINKEDLIST', label: '9. Doubly Linked List' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setIsPlaying(false);
            }}
            className={`px-3 py-2 rounded-xl transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Playback Scrubbing Bar */}
      {steps.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStepIdx(0)}
              title="Reset to step 1"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentStepIdx((p) => Math.max(0, p - 1))}
              disabled={currentStepIdx === 0}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-40"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={() => setCurrentStepIdx((p) => Math.min(steps.length - 1, p + 1))}
              disabled={currentStepIdx >= steps.length - 1}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-40"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-slate-700 ml-2">
              Step {currentStepIdx + 1} of {steps.length}
            </span>
          </div>

          {/* Speed slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Speed:
            </span>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={2200 - playbackSpeed}
              onChange={(e) => setPlaybackSpeed(2200 - parseInt(e.target.value))}
              className="accent-emerald-600 cursor-pointer w-28"
            />
            <span className="text-xs font-mono text-slate-600">{(1000 / playbackSpeed).toFixed(1)}x</span>
          </div>
        </div>
      )}

      {/* Step Trace Description Callout */}
      {currentStep && (
        <div className="bg-emerald-950 text-white p-4 rounded-2xl shadow-md border border-emerald-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-800 text-emerald-300 font-mono text-xs font-bold">
            #{currentStep.stepNumber || currentStepIdx + 1}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {currentStep.operation || currentStep.type || 'EVENT'}
            </span>
            <p className="text-xs sm:text-sm font-medium mt-0.5 leading-relaxed text-slate-100">
              {currentStep.description}
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 1: GRAPH DIJKSTRA */}
      {activeTab === 'GRAPH' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Graph Algorithm Configuration
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Algorithm Mode</label>
              <select
                value={graphAlgorithm}
                onChange={(e) => setGraphAlgorithm(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="DIJKSTRA">Dijkstra Shortest Path (Min-Heap)</option>
                <option value="BFS">Breadth-First Search (Queue Traversal)</option>
                <option value="DFS">Depth-First Search (Recursive Backtracking)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Source Node (Start)</label>
              <select
                value={graphStart}
                onChange={(e) => setGraphStart(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
              >
                {waypoints.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label} ({w.type})
                  </option>
                ))}
              </select>
            </div>

            {graphAlgorithm === 'DIJKSTRA' && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Node</label>
                  <select
                    value={graphTarget}
                    onChange={(e) => setGraphTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    {waypoints.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.label} ({w.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Optimization Metric</label>
                  <select
                    value={graphMetric}
                    onChange={(e) => setGraphMetric(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    <option value="distance">Shortest Road Distance (Kilometers)</option>
                    <option value="time">Fastest Travel Time (Traffic Adjusted)</option>
                  </select>
                </div>
              </>
            )}

            <button
              onClick={() => runOperation(graphAlgorithm)}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
            >
              {loading ? 'Executing Engine...' : `Run ${graphAlgorithm}`}
            </button>

            {/* Complexity details card */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
              <span className="font-bold text-slate-800 block">Time & Space Complexity</span>
              <p className="text-slate-600">Time: O((V + E) log V) with Adjacency List & Min-Heap</p>
              <p className="text-slate-600">Space: O(V + E) memory allocation</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <MealMeshMap
              waypoints={waypoints}
              routePath={routePath}
              selectedWaypointId={currentStep?.currentVertexId}
              height="500px"
            />
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: BINARY MIN-HEAP */}
      {activeTab === 'HEAP' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Binary Min-Heap Controls
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Food Item Label</label>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. Fresh Curd Rice (ITC)"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Expiry Priority Key (Hours): {inputPriority}h
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={inputPriority}
                onChange={(e) => setInputPriority(parseFloat(e.target.value) || 2.0)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-orange-600"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Lower hours = higher priority (placed closer to root)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => runOperation('INSERT')}
                className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
              >
                Insert Item
              </button>
              <button
                onClick={() => runOperation('EXTRACT_MIN')}
                className="py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-sm"
              >
                Extract Min (Root)
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
              <span className="font-bold text-slate-800 block">Min-Heap Invariants</span>
              <p className="text-slate-600">Parent index: (i - 1) / 2</p>
              <p className="text-slate-600">Left child: 2i + 1, Right child: 2i + 2</p>
              <p className="text-slate-600">Insert: O(log N) • ExtractMin: O(log N)</p>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Sequential Array Representation & Priority Ranking
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {heapSnapshot.map((item, idx) => {
                const isHighlight =
                  currentStep?.indexA === idx || currentStep?.indexB === idx;
                return (
                  <div
                    key={item.id || idx}
                    className={`p-3 rounded-xl border text-center transition ${
                      isHighlight
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                        : idx === 0
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400 block">Index [{idx}]</span>
                    <span className="text-base font-extrabold text-slate-900 block mt-1">
                      {item.priorityKey}h
                    </span>
                    <span className="text-xs font-semibold text-slate-700 truncate block mt-0.5">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-bold text-orange-600 block mt-1">
                      {item.urgency}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: HASH TABLE */}
      {activeTab === 'HASHTABLE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Hash Table Operations
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Key (Alphanumeric ID)</label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="e.g. DON-401"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Value Payload</label>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. 50kg Chapati & Dal"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => runOperation('PUT')}
                className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
              >
                Put (O(1))
              </button>
              <button
                onClick={() => runOperation('GET')}
                className="py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-sm"
              >
                Get (O(1))
              </button>
              <button
                onClick={() => runOperation('REMOVE')}
                className="py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-sm"
              >
                Remove
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Capacity:</span>
                <span className="font-mono font-bold text-slate-900">{hashMeta.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Size:</span>
                <span className="font-mono font-bold text-slate-900">{hashMeta.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Load Factor:</span>
                <span className="font-mono font-bold text-slate-900">{hashMeta.loadFactor} (max 0.75)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Chained Collisions:</span>
                <span className="font-mono font-bold text-amber-700">{hashMeta.collisions}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Bucket Array with Separate Chaining
            </h3>

            <div className="space-y-2">
              {hashBuckets.map((bucket) => {
                const isHighlight = currentStep?.bucketIndex === bucket.bucketIndex;
                return (
                  <div
                    key={bucket.bucketIndex}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                      isHighlight
                        ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-200'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <span className="w-16 font-mono font-bold text-xs text-slate-500">
                      Bucket [{bucket.bucketIndex}]
                    </span>

                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      {bucket.nodes.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">empty</span>
                      ) : (
                        bucket.nodes.map((node: any, idx: number) => (
                          <React.Fragment key={node.key}>
                            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs shadow-sm flex items-center gap-2 font-mono">
                              <span className="font-bold text-emerald-800">{node.key}</span>
                              <span className="text-slate-400">→</span>
                              <span className="text-slate-700">{node.valuePreview}</span>
                            </div>
                            {idx < bucket.nodes.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: GREEDY ALLOCATOR */}
      {activeTab === 'GREEDY' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Multi-Criteria Greedy Food Redistribution Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Composite Utility Function = 0.35(Proximity) + 0.35(CapacityFit) + 0.15(Dietary) + 0.15(ExpiryUrgency)
              </p>
            </div>

            <button
              onClick={() => runOperation('ALLOCATE')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
            >
              Run Greedy Match
            </button>
          </div>

          {greedyResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Original Surplus Batch</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {greedyResult.originalQuantityKg} kg
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Allocated to NGOs</span>
                  <span className="text-lg font-extrabold text-emerald-700">
                    {greedyResult.allocatedQuantityKg} kg
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Remaining Unallocated</span>
                  <span className="text-lg font-extrabold text-amber-700">
                    {greedyResult.remainingQuantityKg} kg
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {greedyResult.allocations?.map((item: any) => (
                  <div
                    key={item.ngoId}
                    className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">{item.ngoName}</h4>
                      <span className="font-extrabold text-emerald-800 text-sm">
                        {item.allocatedKg} kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>Road Distance: {item.distanceKm} km</span>
                      <span className="font-bold text-emerald-700">Composite Score: {item.score} / 100</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: DISJOINT SET UNION */}
      {activeTab === 'DSU' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Disjoint Set Union (DSU / Union-Find) for Delivery Zones
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Path Compression and Union by Rank for connected delivery clusters across Bengaluru.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                Connected Clusters: {dsuComponentCount}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {dsuRoots.map((root, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs">
                <span className="text-[10px] text-slate-400 block font-mono">Zone Node [{idx}]</span>
                <span className="font-bold text-slate-800 block mt-1">Root: {root}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setInputKey('0');
                setInputVal('3');
                runOperation('UNION');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              Union Zones [0 & 3]
            </button>
            <button
              onClick={() => {
                setInputKey('1');
                setInputVal('5');
                runOperation('UNION');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
            >
              Union Zones [1 & 5]
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: PREFIX TRIE */}
      {activeTab === 'TRIE' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Prefix Trie for Instant Autocompletion
          </h3>

          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Live Prefix Search Query
            </label>
            <div className="relative">
              <input
                type="text"
                value={triePrefix}
                onChange={(e) => {
                  setTriePrefix(e.target.value);
                  setInputKey(e.target.value);
                  runOperation('PREFIX_SEARCH');
                }}
                placeholder="Type 'ak', 'bi', 'ba'..."
                className="w-full px-3 py-2 pl-9 rounded-lg border border-slate-300 text-xs font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-700">
              Matching Indexed Entities ({trieMatches.length}):
            </span>
            <div className="flex flex-wrap gap-2">
              {trieMatches.map((m) => (
                <span
                  key={m}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 7, 8, 9: QUEUE, STACK, LINKED LIST */}
      {(activeTab === 'QUEUE' || activeTab === 'STACK' || activeTab === 'LINKEDLIST') && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-sm text-slate-900">
              {activeTab === 'QUEUE'
                ? 'FIFO Queue (Fair Request Processing)'
                : activeTab === 'STACK'
                ? 'LIFO Stack (Reversible Administrative Operations)'
                : 'Doubly Linked List (Timeline Navigation)'}
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  runOperation(
                    activeTab === 'QUEUE' ? 'ENQUEUE' : activeTab === 'STACK' ? 'PUSH' : 'ADD_LAST'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                {activeTab === 'QUEUE' ? 'Enqueue Tail' : activeTab === 'STACK' ? 'Push Top' : 'Append Tail'}
              </button>
              <button
                onClick={() =>
                  runOperation(activeTab === 'QUEUE' ? 'DEQUEUE' : activeTab === 'STACK' ? 'POP' : 'REMOVE')
                }
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                {activeTab === 'QUEUE' ? 'Dequeue Head' : activeTab === 'STACK' ? 'Pop Top' : 'Remove Head'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-h-[140px] flex items-center justify-center">
            {activeTab === 'QUEUE' && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  HEAD
                </span>
                {queueItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div className="bg-white px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold shadow-sm">
                      {item}
                    </div>
                    {idx < queueItems.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                  </React.Fragment>
                ))}
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  TAIL
                </span>
              </div>
            )}

            {activeTab === 'STACK' && (
              <div className="flex flex-col-reverse items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">BOTTOM</span>
                {stackItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 rounded-lg border text-xs font-semibold shadow-sm w-80 text-center ${
                      idx === stackItems.length - 1
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    {item} {idx === stackItems.length - 1 && '← TOP'}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'LINKEDLIST' && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  HEAD
                </span>
                {linkedListForward.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div className="bg-white px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold shadow-sm">
                      {item}
                    </div>
                    {idx < linkedListForward.length - 1 && (
                      <span className="text-slate-400 font-bold text-xs">⇄</span>
                    )}
                  </React.Fragment>
                ))}
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  TAIL
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
