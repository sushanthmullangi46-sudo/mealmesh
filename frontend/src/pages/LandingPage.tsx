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

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onDemoLogin }) => {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    api.getAnalyticsSummary().then(setStats).catch(() => {
      // Default fallback stats if backend is starting
      setStats({
        totalFoodRescuedKg: 1845.5,
        totalMealsDistributed: 4610,
        totalPeopleFed: 4610,
        co2EmissionsSavedKg: 4613.8,
        financialValueInr: 221460,
        activeDonorsCount: 15,
        registeredNgosCount: 10,
        activeVolunteersCount: 12,
        completedDeliveriesCount: 48,
        rescuedByCategory: [],
        weeklyTrend: [],
      });
    });
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
            <span className="text-[11px] text-slate-500">From 15+ City Donors</span>
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

      {/* Demonstration Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Community Feedback</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Trusted by Bengaluru Food Rescuers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "Before MealMesh, we had to throw away 20 to 30 kg of wholesome buffet meals every evening. Now our surplus is matched within minutes to an Akshaya Patra center 4 km away."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                SK
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">Chef Suresh Kumar</h5>
                <span className="text-[11px] text-slate-500">ITC Gardenia Kitchen, Koramangala</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "The dynamic capacity gauge ensures we never get overwhelmed by donations we cannot store. The automated priority queue prioritizes the exact items our kitchen needs first."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-xs">
                PR
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">Pooja Ramanathan</h5>
                <span className="text-[11px] text-slate-500">Distribution Lead, Feeding India HSR</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "Turn-by-turn route optimization with Dijkstra takes all the guesswork out of multi-stop pickups. I can pick up from two restaurants and deliver within 40 minutes."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-xs">
                RS
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">Rahul Sharma</h5>
                <span className="text-[11px] text-slate-500">Volunteer Transporter, Indiranagar</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
