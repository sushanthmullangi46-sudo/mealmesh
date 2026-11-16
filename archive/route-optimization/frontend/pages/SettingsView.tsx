import React from 'react';
import { useNavigation } from '../hooks/useNavigationContext';
import { api } from '../services/api';
import {
  Settings,
  RotateCcw,
  Sun,
  Moon,
  Cpu,
  Database,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    isDarkMode,
    toggleDarkMode,
    stats,
    refreshGraphData,
    loading
  } = useNavigation();

  const handleReseed = async () => {
    if (window.confirm("Reseed database with original 26 locations and 34 roads?")) {
      try {
        await api.resetSeed();
        await refreshGraphData();
        alert("Database successfully reseeded.");
      } catch (err: any) {
        alert("Error reseeding database: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-600" /> System & Engine Settings
        </h3>
        <p className="text-xs text-slate-500">
          Configure DSA runtime engine, database persistence, and application themes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core DSA Engine */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Cpu className="w-4 h-4 text-brand-500" /> DSA Engine Status
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>Engine Type:</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                {stats?.engine_type || 'Active'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Graph Version:</span>
              <span className="font-mono font-bold">v{stats?.version || 1}</span>
            </div>
            <div className="flex justify-between">
              <span>Data Structures:</span>
              <span className="font-mono">Adjacency List + Min-Heap</span>
            </div>
            <div className="flex justify-between">
              <span>Admissibility Heuristic:</span>
              <span className="font-mono text-emerald-600">Great-Circle Haversine</span>
            </div>
          </div>
        </div>

        {/* Database & Graph Reseed */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Database className="w-4 h-4 text-emerald-500" /> Database & Persistence
          </div>
          <p className="text-xs text-slate-500">
            Reset all modified road traffic, custom vertices, and user-added roads back to default.
          </p>
          <button
            onClick={handleReseed}
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-500' : ''}`} />
            Reseed Sample Road Network
          </button>
        </div>

        {/* Display & Theme */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Sun className="w-4 h-4 text-amber-500" /> Appearance & Theme
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">Current theme:</span>
            <button
              onClick={toggleDarkMode}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-xs flex items-center gap-1.5"
            >
              {isDarkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </div>

        {/* Documentation & Links */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-purple-500" /> API & Documentation
          </div>
          <div className="text-xs space-y-1.5">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 hover:underline flex items-center gap-1"
            >
              Swagger REST API Documentation <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="http://localhost:8000/redoc"
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 hover:underline flex items-center gap-1"
            >
              ReDoc Interactive Specs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

