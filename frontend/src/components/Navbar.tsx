import React from 'react';
import { UserSession, UserRole } from '../types/mealmesh';
import {
  Utensils,
  HeartHandshake,
  ShieldCheck,
  Bike,
  Cpu,
  BarChart3,
  LogOut,
  User,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: UserSession | null;
  onDemoLogin: (role: UserRole) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="bg-emerald-950 text-white sticky top-0 z-50 shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => onNavigate(currentUser ? (
              currentUser.role === 'DONOR'
                ? 'donor'
                : currentUser.role === 'NGO'
                ? 'ngo'
                : currentUser.role === 'VOLUNTEER'
                ? 'volunteer'
                : 'admin'
            ) : 'landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  Meal<span className="text-emerald-400">Mesh</span>
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-400/30">
                  DSA 2.0
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/70 font-medium tracking-wide">
                Food Rescue & Redistribution
              </p>
            </div>
          </div>

          {/* Primary Navigation Links - Strictly filtered by Authenticated Role */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'landing'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              Overview
            </button>

            {/* ONLY render role portal for the currently authenticated user */}
            {currentUser?.role === 'DONOR' && (
              <button
                onClick={() => onNavigate('donor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentView === 'donor'
                    ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-400'
                    : 'text-emerald-100 hover:bg-emerald-900/60'
                }`}
              >
                <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                Donor Hub
              </button>
            )}

            {currentUser?.role === 'NGO' && (
              <button
                onClick={() => onNavigate('ngo')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentView === 'ngo'
                    ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-blue-400'
                    : 'text-emerald-100 hover:bg-emerald-900/60'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-blue-400" />
                NGO Hub
              </button>
            )}

            {currentUser?.role === 'VOLUNTEER' && (
              <button
                onClick={() => onNavigate('volunteer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentView === 'volunteer'
                    ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-amber-400'
                    : 'text-emerald-100 hover:bg-emerald-900/60'
                }`}
              >
                <Bike className="w-3.5 h-3.5 text-amber-400" />
                Volunteer Hub
              </button>
            )}

            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentView === 'admin'
                    ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-purple-400'
                    : 'text-emerald-100 hover:bg-emerald-900/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Admin Ops
              </button>
            )}

            {/* Public/Analytics/DSA Links */}
            <button
              onClick={() => onNavigate('dsa-lab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                currentView === 'dsa-lab'
                  ? 'bg-emerald-500 text-emerald-950 border-emerald-400 shadow-md'
                  : 'bg-emerald-900/80 text-emerald-200 border-emerald-700/50 hover:bg-emerald-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              DSA Laboratory
            </button>

            <button
              onClick={() => onNavigate('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'analytics'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              Analytics
            </button>
          </nav>

          {/* Authentication & Profile Controls */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* User Identity Display */}
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none truncate max-w-[150px]">
                    {currentUser.fullName}
                  </p>
                  <span
                    className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded mt-1 inline-block ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-purple-900/90 text-purple-200 border border-purple-500/30'
                        : currentUser.role === 'DONOR'
                        ? 'bg-emerald-900/90 text-emerald-300 border border-emerald-500/30'
                        : currentUser.role === 'NGO'
                        ? 'bg-blue-900/90 text-blue-200 border border-blue-500/30'
                        : 'bg-amber-900/90 text-amber-200 border border-amber-500/30'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>

                {/* Explicit Logout Button - Required to switch user/role */}
                <button
                  onClick={onLogout}
                  title="Log out of current account"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-700 text-rose-200 hover:text-white border border-rose-700/60 transition shadow-sm font-bold text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
