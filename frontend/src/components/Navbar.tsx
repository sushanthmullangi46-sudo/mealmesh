import React, { useState } from 'react';
import { UserSession, UserRole } from '../types/mealmesh';
import {
  Utensils,
  HeartHandshake,
  ShieldCheck,
  Bike,
  Cpu,
  BarChart3,
  LogOut,
  LogIn,
  Languages,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../services/i18n';
import { useOfflineSync } from '../services/offlineSyncManager';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: UserSession | null;
  onDemoLogin?: (role: UserRole) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onLogout,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { isOnline, pendingCount, isSyncing, triggerSync, toggleSimulatedOffline } = useOfflineSync();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  return (
    <header className="bg-emerald-950 text-white sticky top-0 z-50 shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-y-2 py-2 md:py-0 md:h-16">
          {/* Logo & Brand */}
          <div
            onClick={() =>
              onNavigate(
                currentUser
                  ? currentUser.role === 'DONOR'
                    ? 'donor'
                    : currentUser.role === 'NGO'
                    ? 'ngo'
                    : currentUser.role === 'VOLUNTEER'
                    ? 'volunteer'
                    : 'admin'
                  : 'landing'
              )
            }
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
                <span className="hidden sm:inline bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-400/30">
                  DSA 2.0
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-emerald-200/70 font-medium tracking-wide">
                Food Rescue & Redistribution
              </p>
            </div>
          </div>

          {/* Primary Navigation Links */}
          <nav className="order-last md:order-none w-full md:w-auto flex items-center space-x-1 lg:space-x-2 overflow-x-auto whitespace-nowrap pb-1 md:pb-0">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'landing'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              {t('nav.home', 'Overview')}
            </button>

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
                {t('nav.donor', 'Donor Hub')}
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
                {t('nav.ngo', 'NGO Hub')}
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
                {t('nav.volunteer', 'Volunteer Hub')}
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
                {t('nav.admin', 'Admin Ops')}
              </button>
            )}

            <button
              onClick={() => onNavigate('dsa-lab')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                currentView === 'dsa-lab'
                  ? 'bg-emerald-500 text-emerald-950 border-emerald-400 shadow-md'
                  : 'bg-emerald-900/80 text-emerald-200 border-emerald-700/50 hover:bg-emerald-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              {t('nav.dsaLab', 'DSA Laboratory')}
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

          {/* Right Controls: Offline Sync Pill + Language Picker + Profile / Logout */}
          <div className="flex items-center gap-2.5">
            {/* Low-Connectivity Offline Sync Status Pill */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSimulatedOffline}
                title={isOnline ? 'Click to simulate Offline Mode' : 'Click to go back Online'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                  isOnline
                    ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50 hover:bg-emerald-800'
                    : 'bg-amber-950/80 text-amber-300 border-amber-600/60 animate-pulse hover:bg-amber-900'
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span className="hidden sm:inline">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    <span>Offline {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
                  </>
                )}
              </button>

              {pendingCount > 0 && (
                <button
                  onClick={triggerSync}
                  disabled={isSyncing}
                  title="Synchronize queued updates with server"
                  className="p-1 px-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold flex items-center gap-1 transition shadow-sm"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Sync</span>
                </button>
              )}
            </div>

            {/* Multilingual Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 text-xs font-medium border border-emerald-700/40"
              >
                <Languages className="w-3.5 h-3.5 text-emerald-300" />
                <span className="uppercase text-[11px] font-bold">{language}</span>
                <ChevronDown className="w-3 h-3 text-emerald-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-emerald-800/60 transition ${
                        language === lang.code ? 'text-emerald-400 font-bold bg-emerald-950/60' : 'text-slate-200'
                      }`}
                    >
                      <span>{lang.nativeLabel}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Session & Logout */}
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none truncate max-w-[130px]">
                    {currentUser.fullName}
                  </p>
                  <span
                    className={`text-[9px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded mt-0.5 inline-block ${
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

                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-700 text-rose-200 hover:text-white border border-rose-700/60 transition shadow-sm font-bold text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('nav.logout', 'Logout')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="whitespace-nowrap px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
