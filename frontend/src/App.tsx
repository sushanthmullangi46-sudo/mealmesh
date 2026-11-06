import React from 'react';
import { NavigationProvider, useNavigation } from './hooks/useNavigationContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { InteractiveMap } from './maps/InteractiveMap';

// Page Views
import { DashboardView } from './pages/DashboardView';
import { LiveNavigationView } from './pages/LiveNavigationView';
import { ShortestPathView } from './pages/ShortestPathView';
import { RouteOptimizationView } from './pages/RouteOptimizationView';
import { TrafficSimulationView } from './pages/TrafficSimulationView';
import { MultiStopView } from './pages/MultiStopView';
import { VisualizerView } from './pages/VisualizerView';
import { GraphAnalysisView } from './pages/GraphAnalysisView';
import { BenchmarksView } from './pages/BenchmarksView';
import { SettingsView } from './pages/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab } = useNavigation();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'navigation':
        return <LiveNavigationView />;
      case 'shortest-path':
        return <ShortestPathView />;
      case 'route-optimization':
        return <RouteOptimizationView />;
      case 'traffic':
        return <TrafficSimulationView />;
      case 'multistop':
        return <MultiStopView />;
      case 'visualizer':
        return <VisualizerView />;
      case 'graph-analysis':
        return <GraphAnalysisView />;
      case 'benchmarks':
        return <BenchmarksView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  // Views where map is secondary or not needed in split: benchmarks, settings
  const showSplitMap = activeTab !== 'benchmarks' && activeTab !== 'settings';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col lg:flex-row min-w-0 overflow-hidden">
          {/* Active Control & Analytics View Panel */}
          <div className={`${showSplitMap ? 'lg:w-[48%] xl:w-[44%]' : 'w-full'} flex-1 overflow-y-auto p-4 md:p-6 space-y-4`}>
            {renderActiveView()}
          </div>

          {/* Interactive Geospatial Leaflet Map Panel */}
          {showSplitMap && (
            <div className="flex-1 lg:w-[52%] xl:w-[56%] p-4 md:p-6 pl-0 flex flex-col min-h-[420px] lg:min-h-0">
              <InteractiveMap />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <NavigationProvider>
      <MainContent />
    </NavigationProvider>
  );
}

export default App;

