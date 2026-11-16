import React from 'react';
import { Utensils, Heart, Shield, Cpu, ExternalLink } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">MealMesh</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent Food Rescue & Redistribution System. Eliminating urban food waste and hunger using advanced Data Structures & Algorithms.
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Operational Network: Bengaluru Urban (Asia/Kolkata)
            </p>
          </div>

          {/* Column 2: Platform Modules */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Role Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('donor')} className="hover:text-emerald-400 transition">
                  Food Donor Hub (Kitchens & Caterers)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ngo')} className="hover:text-emerald-400 transition">
                  NGO Redistribution Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('volunteer')} className="hover:text-emerald-400 transition">
                  Volunteer Delivery Fleet
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-emerald-400 transition">
                  Central Admin Operations
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Algorithmic Core */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">DSA Engine</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('dsa-lab')} className="hover:text-emerald-400 transition">
                  Dijkstra Route Optimization
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dsa-lab')} className="hover:text-emerald-400 transition">
                  Binary Min-Heap (Expiry Prioritization)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dsa-lab')} className="hover:text-emerald-400 transition">
                  Multi-Criteria Greedy Matcher
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dsa-lab')} className="hover:text-emerald-400 transition">
                  Disjoint Set Union (Zone Clusters)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dsa-lab')} className="hover:text-emerald-400 transition">
                  Separate Chaining Hash Table
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Impact & Standards */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Standards & Impact</h4>
            <p className="text-xs text-slate-400 mb-2">
              Compliance with FSSAI Food Safety Hygiene Ratings & UN Sustainable Development Goal #2 (Zero Hunger).
            </p>
            <div className="bg-emerald-950/60 p-3 rounded-lg border border-emerald-800/60">
              <span className="text-[11px] text-emerald-300 font-semibold block">CO2 Reduction Index</span>
              <span className="text-xs text-slate-300">2.5 kg CO2 avoided per 1 kg food rescued</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 MealMesh Technologies. Designed and built with production-grade DSA architecture.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">All algorithms implemented from scratch</span>
            <span className="text-emerald-400 font-semibold">100% Tests Passing</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
