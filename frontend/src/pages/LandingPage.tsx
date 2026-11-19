import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AnalyticsSummary, UserRole } from '../types/mealmesh';
import {
  Utensils,
  HeartHandshake,
  Bike,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe2,
  Layers,
  Cpu,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onDemoLogin: (role: UserRole) => void;
}

const DATA_STRUCTURES = [
  { name: 'Binary Min-Heap', complexity: 'O(log n) insert / extract', use: 'Orders surplus batches so the one closest to expiry (weighted by urgency) is always rescued first.', where: 'Donor and NGO feeds' },
  { name: 'Weighted Graph + Dijkstra', complexity: 'O((V+E) log V)', use: 'Bengaluru junctions are vertices and roads are weighted edges; Dijkstra finds the shortest pickup-to-shelter route.', where: 'Volunteer navigation' },
  { name: 'Greedy Multi-Criteria Allocator', complexity: 'O(n log n)', use: 'Scores every NGO on distance, free capacity, diet match and urgency (0-100), then fills the best ones first.', where: 'Run Greedy Match' },
  { name: 'Hash Table (separate chaining)', complexity: 'O(1) average lookup', use: 'Polynomial rolling hash with resizing at load factor 0.75. Adds up kg per food category for the impact charts.', where: 'Analytics categories' },
  { name: 'Stack (linked)', complexity: 'O(1) push / pop', use: 'Every admin decision is pushed; Undo pops the last one and reverses it (last in, first out).', where: 'Admin undo' },
  { name: 'Queue (linked)', complexity: 'O(1) enqueue / dequeue', use: 'Actions done while offline are replayed in the exact order they happened (first in, first out) when the connection returns.', where: 'Offline sync' },
  { name: 'Doubly Linked List', complexity: 'O(1) add at either end', use: 'Builds the donation timeline: urgent batches from the heap first, then history, walkable both ways.', where: 'Donor timeline' },
  { name: 'Trie (prefix tree)', complexity: 'O(L) per search', use: 'Type a few letters of a dish and matching names appear instantly. Only the prefix characters are walked.', where: 'Donor dish autocomplete' },
  { name: 'Disjoint Set Union', complexity: 'O(α(n)) per operation', use: 'Donors and NGOs within 3 km are union-ed; the number of sets left is the number of delivery zones.', where: 'Analytics delivery zones' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onDemoLogin }) => {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    // Live numbers from the backend; if it is still starting, the tiles simply stay empty
    // instead of showing made-up figures.
    api.getAnalyticsSummary().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 border-b border-emerald-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            DSA-Powered Food Redistribution Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
            Rescue Food. <span className="text-emerald-400">Redistribute Hope.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-emerald-100/90 leading-relaxed mb-10 font-normal">
            Every day, tons of fresh surplus food from restaurants, hotels, and caterers go to waste while millions face food insecurity.
            MealMesh connects food donors, verified NGOs, and volunteer fleets using real <strong>Priority Queues</strong>, <strong>Graph Dijkstra</strong>, and <strong>Multi-Criteria Greedy Heuristics</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('donor')}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm shadow-xl hover:shadow-emerald-500/30 transition flex items-center gap-2 group"
            >
              Post Food Surplus
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('dsa-lab')}
              className="px-6 py-3.5 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/80 font-bold text-sm shadow-lg transition flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              Explore DSA Laboratory
            </button>
          </div>
        </div>
      </section>

      {/* Live Impact Counters */}
      <section className="py-12 bg-white border-b border-slate-200 shadow-sm -mt-6 max-w-6xl mx-auto rounded-2xl relative z-20 px-6 sm:px-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Food Rescued</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1">
              {stats?.totalFoodRescuedKg.toLocaleString()} <span className="text-sm font-semibold">kg</span>
            </h3>
            <span className="text-[11px] text-slate-500">From {stats?.activeDonorsCount ?? 0} donor accounts</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meals Provided</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1">
              {stats?.totalMealsDistributed.toLocaleString()}
            </h3>
            <span className="text-[11px] text-slate-500">Nutritious Portions</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">CO2 Averted</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-teal-700 mt-1">
              {stats?.co2EmissionsSavedKg.toLocaleString()} <span className="text-sm font-semibold">kg</span>
            </h3>
            <span className="text-[11px] text-slate-500">Methane Prevention</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Economic Value</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1">
              ₹ {stats?.financialValueInr.toLocaleString()}
            </h3>
            <span className="text-[11px] text-slate-500">Saved in Rupees</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deliveries</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
              {stats?.completedDeliveriesCount}
            </h3>
            <span className="text-[11px] text-slate-500">Optimized Missions</span>
          </div>
        </div>
      </section>

      {/* 1-Click Demo Portals */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Experience MealMesh by Role
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Click any portal below to log in instantly with pre-seeded demonstration data in Bengaluru.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Donor Card */}
          <div
            onClick={() => {
              onDemoLogin('DONOR');
              onNavigate('donor');
            }}
            className="group cursor-pointer bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Food Donor Hub</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Restaurants & hotels post surplus meals, set expiry hours, and trigger automated NGO matching.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Enter as Donor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* NGO Card */}
          <div
            onClick={() => {
              onDemoLogin('NGO');
              onNavigate('ngo');
            }}
            className="group cursor-pointer bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">NGO Distribution Hub</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Shelters inspect storage gauges, review prioritized available food, and claim batches for communities.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Enter as NGO</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Volunteer Card */}
          <div
            onClick={() => {
              onDemoLogin('VOLUNTEER');
              onNavigate('volunteer');
            }}
            className="group cursor-pointer bg-white rounded-2xl p-6 border border-slate-200 hover:border-amber-500 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bike className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Volunteer Fleet</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Transporters accept missions with Dijkstra shortest path turn-by-turn routes across Bengaluru.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Enter as Volunteer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Admin Card */}
          <div
            onClick={() => {
              onDemoLogin('ADMIN');
              onNavigate('admin');
            }}
            className="group cursor-pointer bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-800 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Admin Operations</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Verify NGOs, monitor citywide impact, and roll back decisions with the custom reversible action stack.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Enter as Admin</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Redistribution Workflow Visualizer */}
      <section className="bg-slate-50 py-16 border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
              Algorithmic Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How MealMesh Redistributes Food
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto">
              Every surplus batch undergoes an end-to-end algorithmic pipeline to ensure timely, equitable, and hygienic redistribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-3">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Surplus Entry</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Donor kitchen logs dish title, quantity in kg, cooked time, and expiry deadline.
              </p>
              <span className="inline-block mt-3 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                FSSAI Validation
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-sm mb-3">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Priority Heap</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Binary Min-Heap continually places the most urgent expiring food batches at the top root.
              </p>
              <span className="inline-block mt-3 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                O(log N) Min-Heap
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-bold flex items-center justify-center text-sm mb-3">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Greedy Matching</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Multi-criteria engine scores candidate NGOs on proximity, capacity, and dietary alignment.
              </p>
              <span className="inline-block mt-3 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Heuristic Allocation
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-900 text-white font-bold flex items-center justify-center text-sm mb-3">
                4
              </div>
              <h4 className="font-bold text-sm text-slate-900">Dijkstra Routing</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Transport graph computes the shortest road route avoiding traffic bottlenecks across Bengaluru.
              </p>
              <span className="inline-block mt-3 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                O((V+E) log V) Dijkstra
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 text-white font-bold flex items-center justify-center text-sm mb-3">
                5
              </div>
              <h4 className="font-bold text-sm text-slate-900">Distribution</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Volunteer hands over food, recipient records beneficiary count, and CO2 savings are audited.
              </p>
              <span className="inline-block mt-3 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Audit Trail Logged
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Data structures behind the platform */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Built From Scratch</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Nine Data Structures Power Every Screen
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto">
            Each one is our own Java class in the backend, built on plain arrays and hand-written nodes (no PriorityQueue, HashMap or LinkedList inside), and each one does a real job in the app.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATA_STRUCTURES.map((ds) => (
            <button
              key={ds.name}
              type="button"
              onClick={() => onNavigate('dsa-lab')}
              className="text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition group"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">{ds.name}</h4>
                <span className="shrink-0 font-mono text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {ds.complexity}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{ds.use}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-[11px] font-semibold text-slate-500">
                <MapPin className="w-3 h-3" /> {ds.where}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
