import React from 'react';
import { useNavigation } from '../hooks/useNavigationContext';
import { api } from '../services/api';
import {
  Compass,
  Moon,
  Sun,
  RotateCcw,
  Cpu,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    isDarkMode,
    toggleDarkMode,
    stats,
    refreshGraphData,
    loading
  } = useNavigation();

  const handleResetData = async () => {
    if (window.confirm("Reset network graph to default metropolitan benchmark state?")) {
      try {
        await api.resetSeed();
        await refreshGraphData();
      } catch (err: any) {
        alert("Failed to reset graph: " + err.message);
      }
    }
  };

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
          <Compass className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base md:text-lg tracking-tight text-slate-900 dark:text-white">
              Intelligent Route Optimization
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              DSA v1.0
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
            Real-World Algorithmic Geospatial Navigation & Performance Engine
          </p>
        </div>
      </div>

      {/* Network & Engine Stats Pill */}
      <div className="flex items-center gap-3">
        {stats && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-brand-500" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.engine_type}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>{stats.total_locations} Nodes</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>{stats.total_roads} Roads</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <div className="flex items-center gap-1">
              {stats.is_fully_connected ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> {stats.connected_components} Components
                </span>
              )}
            </div>
          </div>
        )}

        {/* Reseed Database Button */}
        <button
          onClick={handleResetData}
          disabled={loading}
          title="Reset graph to default benchmark network"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-500' : ''}`} />
          <span className="hidden sm:inline">Reset Graph</span>
        </button>

        {/* Dark/Light Mode Switch */}
        <button
          onClick={toggleDarkMode}
          title="Toggle light and dark themes"
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};

