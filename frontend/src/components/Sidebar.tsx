import React from 'react';
import { useNavigation, ActiveTab } from '../hooks/useNavigationContext';
import {
  LayoutDashboard,
  Navigation,
  Route,
  GitCompare,
  AlertOctagon,
  Milestone,
  Binary,
  Network,
  BarChart3,
  Settings
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', sublabel: 'System Overview & KPIs', icon: LayoutDashboard },
  { id: 'navigation', label: 'Live Navigation', sublabel: 'Turn-by-Turn GPS Guidance', icon: Navigation },
  { id: 'shortest-path', label: 'Shortest Path', sublabel: 'Dijkstra vs A* Engine', icon: Route },
  { id: 'route-optimization', label: 'Route Comparison', sublabel: 'Distance vs Time vs Cost', icon: GitCompare },
  { id: 'traffic', label: 'Traffic Simulation', sublabel: 'Dynamic Congestion & Rerouting', icon: AlertOctagon, tag: 'Live' },
  { id: 'multistop', label: 'Multi-Stop Planner', sublabel: 'TSP 2-Opt Optimizer', icon: Milestone },
  { id: 'visualizer', label: 'Algorithm Visualizer', sublabel: 'Step-by-Step Priority Queue', icon: Binary, tag: 'Core' },
  { id: 'graph-analysis', label: 'Graph Analysis', sublabel: 'DSU, BFS & DFS Components', icon: Network },
  { id: 'benchmarks', label: 'Benchmarks', sublabel: 'Scalability (50 to 10k nodes)', icon: BarChart3 },
  { id: 'settings', label: 'Settings', sublabel: 'Database, Seeds & Engine', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useNavigation();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Main Navigation
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-between group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'}`} />
                <div className="min-w-0">
                  <div className="text-xs truncate">{item.label}</div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-brand-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.tag && (
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-white/20 text-white' : 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-400'
                }`}>
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
        <div className="font-semibold text-slate-700 dark:text-slate-300">DSA Route Engine</div>
        <div className="text-[10px] text-slate-400">Dijkstra, A*, 2-Opt TSP & DSU</div>
      </div>
    </aside>
  );
};
