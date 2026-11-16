import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../hooks/useNavigationContext';
import { api } from '../services/api';
import { VisualizationResponse, VisualizationStep } from '../types';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Binary,
  Layers,
  Zap,
  Info,
  CheckCircle2,
  Clock,
  Gauge
} from 'lucide-react';

export const VisualizerView: React.FC = () => {
  const {
    locations,
    selectedSourceId,
    setSelectedSourceId,
    selectedTargetId,
    setSelectedTargetId,
    visualizationTrace,
    setVisualizationTrace,
    visualizerCurrentStep,
    setVisualizerCurrentStep,
  } = useNavigation();

  const [algorithm, setAlgorithm] = useState<'Dijkstra' | 'A*'>('Dijkstra');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 0.25x to 4x
  const [loadingTrace, setLoadingTrace] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  const locationMap = React.useMemo(() => {
    const map = new Map<number, string>();
    locations.forEach(l => map.set(l.id, l.name));
    return map;
  }, [locations]);

  const handleGenerateTrace = async () => {
    if (!selectedSourceId || !selectedTargetId) return;
    try {
      setLoadingTrace(true);
      setIsPlaying(false);
      setVisualizerCurrentStep(0);
      const trace = await api.getTrace(selectedSourceId, selectedTargetId, algorithm, 'DISTANCE');
      setVisualizationTrace(trace);
    } catch (err: any) {
      alert("Trace generation error: " + err.message);
    } finally {
      setLoadingTrace(false);
    }
  };

  // Playback timer loop
  useEffect(() => {
    if (isPlaying && visualizationTrace) {
      const intervalMs = Math.max(100, Math.round(800 / playbackSpeed));
      timerRef.current = setInterval(() => {
        setVisualizerCurrentStep(prev => {
          if (prev + 1 >= (visualizationTrace?.steps?.length || 0)) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, visualizationTrace]);

  const currentStep: VisualizationStep | undefined = visualizationTrace?.steps?.[visualizerCurrentStep];

  return (
    <div className="space-y-4">
      {/* Execution Controls Header */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Binary className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Step-by-Step Algorithm Execution Visualizer
              </h3>
              <p className="text-xs text-slate-500">
                Live interactive trace of Priority Queue, edge relaxations, and parent pointers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Engine Algorithm:</label>
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <button
                onClick={() => setAlgorithm('Dijkstra')}
                className={`px-3 py-1 rounded-md transition-all ${
                  algorithm === 'Dijkstra' ? 'bg-white dark:bg-slate-700 shadow text-brand-600 dark:text-white' : 'text-slate-500'
                }`}
              >
                Dijkstra
              </button>
              <button
                onClick={() => setAlgorithm('A*')}
                className={`px-3 py-1 rounded-md transition-all ${
                  algorithm === 'A*' ? 'bg-white dark:bg-slate-700 shadow text-brand-600 dark:text-white' : 'text-slate-500'
                }`}
              >
                A* (Haversine)
              </button>
            </div>
          </div>
        </div>

        {/* Inputs & Generate Button */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4">
            <label className="text-xs font-semibold text-slate-500 block mb-1">Source Node</label>
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

          <div className="md:col-span-4">
            <label className="text-xs font-semibold text-slate-500 block mb-1">Target Node</label>
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

          <div className="md:col-span-4 flex items-end">
            <button
              onClick={handleGenerateTrace}
              disabled={loadingTrace}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 flex items-center justify-center gap-2"
            >
              <Zap className={`w-4 h-4 ${loadingTrace ? 'animate-spin' : ''}`} />
              {loadingTrace ? 'Recording Trace...' : 'Generate Execution Trace'}
            </button>
          </div>
        </div>

        {/* Player Bar */}
        {visualizationTrace && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            {/* Play/Pause & Step Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVisualizerCurrentStep(0)}
                title="Reset to beginning"
                className="p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setVisualizerCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={visualizerCurrentStep === 0}
                title="Step backward"
                className="p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play Trace'}
              </button>

              <button
                onClick={() => setVisualizerCurrentStep(prev => Math.min((visualizationTrace.steps.length || 1) - 1, prev + 1))}
                disabled={visualizerCurrentStep >= visualizationTrace.steps.length - 1}
                title="Step forward"
                className="p-2 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-40"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Scrubber slider */}
            <div className="flex-1 min-w-[200px] flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 w-16 text-right">
                Step {visualizerCurrentStep + 1}/{visualizationTrace.steps.length}
              </span>
              <input
                type="range"
                min="0"
                max={visualizationTrace.steps.length - 1}
                value={visualizerCurrentStep}
                onChange={(e) => setVisualizerCurrentStep(Number(e.target.value))}
                className="flex-1 accent-brand-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>

            {/* Playback speed selector */}
            <div className="flex items-center gap-1 text-xs">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              {[0.5, 1.0, 2.0, 4.0].map(spd => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded font-mono font-bold ${
                    playbackSpeed === spd
                      ? 'bg-brand-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live DSA Execution Inspection Cards */}
      {currentStep && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step Log Description */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">Current DSA Action</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                currentStep.event_type === 'VISIT_NODE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                currentStep.event_type === 'UPDATE_DISTANCE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                currentStep.event_type === 'REACH_GOAL' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {currentStep.event_type}
              </span>
            </div>

            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed font-mono">
              {currentStep.description}
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Active Node:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {locationMap.get(currentStep.current_node) || `Node ${currentStep.current_node}`}
                </span>
              </div>
              {currentStep.neighbor_node !== -1 && (
                <div className="flex justify-between">
                  <span>Neighbor Node:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {locationMap.get(currentStep.neighbor_node) || `Node ${currentStep.neighbor_node}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Current Distance / Cost:</span>
                <span className="font-mono font-semibold">{currentStep.current_dist}</span>
              </div>
              {algorithm === 'A*' && (
                <div className="flex justify-between">
                  <span>Heuristic h(n):</span>
                  <span className="font-mono font-semibold text-emerald-600">{currentStep.heuristic}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Priority Score:</span>
                <span className="font-mono font-bold text-brand-600">{currentStep.priority_score}</span>
              </div>
            </div>
          </div>

          {/* Priority Queue Min-Heap Snapshot */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Min-Heap Priority Queue (Top Elements)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Size: {currentStep.priority_queue_state.length}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {currentStep.priority_queue_state.length === 0 ? (
                <div className="text-slate-400 text-xs italic py-4 text-center">Priority queue is empty</div>
              ) : (
                currentStep.priority_queue_state.map(([nodeId, prio], idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg flex items-center justify-between font-mono text-xs ${
                      idx === 0
                        ? 'bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 font-bold text-brand-700 dark:text-brand-300'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>
                      {idx === 0 ? '👑 Min: ' : `#${idx + 1} `}
                      {locationMap.get(nodeId) || `Node ${nodeId}`}
                    </span>
                    <span className="font-bold">{prio}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Visited / Settled Nodes List */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Closed / Visited Set ({currentStep.visited_nodes.length} nodes)
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">Settled</span>
            </div>

            <div className="max-h-48 overflow-y-auto flex flex-wrap gap-1.5 text-xs pr-1">
              {currentStep.visited_nodes.map((nodeId, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                >
                  {locationMap.get(nodeId) || `Node ${nodeId}`}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
