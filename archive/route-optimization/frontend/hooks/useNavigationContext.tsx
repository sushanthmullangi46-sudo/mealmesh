import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Location, Road, RouteResponse, MultiCriteriaCompareResponse,
  MultiStopResponse, VisualizationResponse, GraphStats, TrafficLevel
} from '../types';
import { api } from '../services/api';

export type ActiveTab =
  | 'dashboard'
  | 'navigation'
  | 'shortest-path'
  | 'route-optimization'
  | 'traffic'
  | 'multistop'
  | 'visualizer'
  | 'graph-analysis'
  | 'benchmarks'
  | 'settings';

interface NavigationContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  locations: Location[];
  roads: Road[];
  stats: GraphStats | null;
  loading: boolean;
  error: string | null;
  selectedSourceId: number | null;
  setSelectedSourceId: (id: number | null) => void;
  selectedTargetId: number | null;
  setSelectedTargetId: (id: number | null) => void;
  activeRoute: RouteResponse | null;
  setActiveRoute: (route: RouteResponse | null) => void;
  comparisonRoutes: MultiCriteriaCompareResponse | null;
  setComparisonRoutes: (comp: MultiCriteriaCompareResponse | null) => void;
  tspResponse: MultiStopResponse | null;
  setTspResponse: (tsp: MultiStopResponse | null) => void;
  visualizationTrace: VisualizationResponse | null;
  setVisualizationTrace: (trace: VisualizationResponse | null) => void;
  visualizerCurrentStep: number;
  setVisualizerCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  refreshGraphData: () => Promise<void>;
  updateRoadTrafficLevel: (roadId: string, level: TrafficLevel) => Promise<void>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(2); // Default Times Sq
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(12); // Default Battery Park
  const [activeRoute, setActiveRoute] = useState<RouteResponse | null>(null);
  const [comparisonRoutes, setComparisonRoutes] = useState<MultiCriteriaCompareResponse | null>(null);
  const [tspResponse, setTspResponse] = useState<MultiStopResponse | null>(null);
  const [visualizationTrace, setVisualizationTrace] = useState<VisualizationResponse | null>(null);
  const [visualizerCurrentStep, setVisualizerCurrentStep] = useState<number>(0);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const refreshGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [locsData, roadsData, statsData] = await Promise.all([
        api.getLocations(),
        api.getRoads(),
        api.getStats(),
      ]);
      setLocations(locsData);
      setRoads(roadsData);
      setStats(statsData);

      // Auto-compute realistic default route (Times Sq to Battery Park) on initial load
      if (!activeRoute) {
        try {
          const defaultRoute = await api.findFastestPath(2, 12);
          setActiveRoute(defaultRoute);
        } catch (_) {}
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load graph data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGraphData();
  }, []);

  const updateRoadTrafficLevel = async (roadId: string, level: TrafficLevel) => {
    try {
      await api.updateRoadTraffic(roadId, level);
      setRoads(prev => prev.map(r => r.id === roadId ? { ...r, traffic_level: level } : r));
    } catch (err: any) {
      setError(err.message || 'Failed to update road traffic');
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleDarkMode,
        locations,
        roads,
        stats,
        loading,
        error,
        selectedSourceId,
        setSelectedSourceId,
        selectedTargetId,
        setSelectedTargetId,
        activeRoute,
        setActiveRoute,
        comparisonRoutes,
        setComparisonRoutes,
        tspResponse,
        setTspResponse,
        visualizationTrace,
        setVisualizationTrace,
        visualizerCurrentStep,
        setVisualizerCurrentStep,
        refreshGraphData,
        updateRoadTrafficLevel,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
