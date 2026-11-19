import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { NgoDashboard } from './pages/NgoDashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DsaLaboratory } from './pages/DsaLaboratory';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { api } from './services/api';
import { UserSession, UserRole } from './types/mealmesh';
import { ShieldAlert, LogOut, ArrowRight, RotateCcw } from 'lucide-react';
import { LanguageProvider } from './services/i18n';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('App ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white">Application View Recovered</h2>
            <p className="text-xs text-slate-400 font-mono text-left bg-slate-950 p-3 rounded-xl overflow-auto max-h-32 border border-slate-800">
              {this.state.error?.message || 'Component failed to render.'}
            </p>
            <div className="flex gap-2.5 justify-center pt-2">
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-xs transition"
              >
                Go to Portal Home
              </button>
              <button
                onClick={() => {
                  sessionStorage.clear();
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-xs transition"
              >
                Clear Cache & Refresh
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const getInitialRouteInfo = (): { view: string; role?: UserRole } => {
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  if (path === 'volunteer') return { view: 'volunteer', role: 'VOLUNTEER' };
  if (path === 'donor') return { view: 'donor', role: 'DONOR' };
  if (path === 'ngo') return { view: 'ngo', role: 'NGO' };
  if (path === 'admin') return { view: 'admin', role: 'ADMIN' };
  if (path === 'visualizer' || path === 'dsa-lab') return { view: 'dsa-lab' };
  if (path === 'analytics') return { view: 'analytics' };
  if (path === 'landing') return { view: 'landing' };
  if (path === 'login') return { view: 'login' };
  return { view: '' };
};

export function App() {
  const routeInfo = getInitialRouteInfo();

  // Authentication State with Pathname auto-recovery
  // A session exists only after a real login (or a demo-account login).
  // Typing /admin in the address bar must NOT log anyone in.
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => api.getCurrentUser());

  // Default initial view: direct URLs (/volunteer, /donor, /ngo, /admin) work only for a logged-in
  // user of that role; anyone else is sent to the login page.
  const [currentView, setCurrentView] = useState<string>(() => {
    if (routeInfo.role) {
      const user = api.getCurrentUser();
      return user && user.role === routeInfo.role ? routeInfo.view : 'login';
    }
    if (routeInfo.view) return routeInfo.view;
    const user = api.getCurrentUser();
    if (!user) return 'landing';
    switch (user.role) {
      case 'DONOR':
        return 'donor';
      case 'NGO':
        return 'ngo';
      case 'VOLUNTEER':
        return 'volunteer';
      case 'ADMIN':
        return 'admin';
      default:
        return 'landing';
    }
  });

  // Role Switch Guard Modal State
  const [roleGuardAlert, setRoleGuardAlert] = useState<{
    attemptedRole: string;
    targetView: string;
  } | null>(null);

  const handleNavigate = (view: string) => {
    // If not authenticated and attempting to access protected dashboards, redirect to login
    if (!currentUser && ['donor', 'ngo', 'volunteer', 'admin'].includes(view)) {
      setCurrentView('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Strict Role-Based Access Control: Prevent switching from one user to another without logout
    if (currentUser) {
      const isRoleMismatch =
        (view === 'donor' && currentUser.role !== 'DONOR') ||
        (view === 'ngo' && currentUser.role !== 'NGO') ||
        (view === 'volunteer' && currentUser.role !== 'VOLUNTEER') ||
        (view === 'admin' && currentUser.role !== 'ADMIN');

      if (isRoleMismatch) {
        setRoleGuardAlert({
          attemptedRole:
            view === 'donor'
              ? 'DONOR'
              : view === 'ngo'
              ? 'NGO'
              : view === 'volunteer'
              ? 'VOLUNTEER'
              : 'ADMIN',
          targetView: view,
        });
        return;
      }
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDemoLogin = async (role: UserRole) => {
    // If already logged in as another role, block direct switching without logout
    if (currentUser && currentUser.role !== role) {
      setRoleGuardAlert({
        attemptedRole: role,
        targetView:
          role === 'DONOR'
            ? 'donor'
            : role === 'NGO'
            ? 'ngo'
            : role === 'VOLUNTEER'
            ? 'volunteer'
            : 'admin',
      });
      return;
    }

    try {
      const session = await api.demoLogin(role);
      sessionStorage.setItem('mealmesh_session_active', 'true');
      setCurrentUser(session);
      const targetView =
        role === 'DONOR'
          ? 'donor'
          : role === 'NGO'
          ? 'ngo'
          : role === 'VOLUNTEER'
          ? 'volunteer'
          : 'admin';
      setCurrentView(targetView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Demo login error:', err);
    }
  };

  const handleLoginSuccess = (session: UserSession, targetView: string) => {
    sessionStorage.setItem('mealmesh_session_active', 'true');
    setCurrentUser(session);
    setCurrentView(targetView || 'login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mealmesh_session_active');
    api.logout();
    setCurrentUser(null);
    setRoleGuardAlert(null);
    setCurrentView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col bg-[#fcfbf9] text-slate-800 font-sans">
          <Navbar
            currentView={currentView}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            onDemoLogin={handleDemoLogin}
            onLogout={handleLogout}
          />

        {/* Role Switch Guard Modal (Enforcing logout before switching users) */}
        {roleGuardAlert && currentUser && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-sm text-amber-950">
                    Role Switch Restricted
                  </h3>
                  <p className="text-xs text-amber-800">
                    Authentication boundary enforced
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  You are currently signed in as{' '}
                  <strong className="text-slate-900 font-bold">
                    {currentUser.fullName}
                  </strong>{' '}
                  with the role{' '}
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {currentUser.role}
                  </span>
                  .
                </p>
                <p>
                  To maintain data integrity and strict role-based access control, you
                  cannot switch to the{' '}
                  <strong className="text-slate-900 font-bold">
                    {roleGuardAlert.attemptedRole}
                  </strong>{' '}
                  portal without logging out of your current session first.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out & Switch User</span>
                </button>
                <button
                  onClick={() => setRoleGuardAlert(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Stay in Current Account
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1">
          {currentView === 'landing' && (
            <LandingPage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
          )}
          {currentView === 'login' && (
            <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
          )}
          {currentView === 'donor' && <DonorDashboard />}
          {currentView === 'ngo' && <NgoDashboard />}
          {currentView === 'volunteer' && <VolunteerDashboard />}
          {currentView === 'admin' && <AdminDashboard />}
          {currentView === 'dsa-lab' && <DsaLaboratory />}
          {currentView === 'analytics' && <AnalyticsPage />}
        </main>

        <Footer onNavigate={handleNavigate} />
        </div>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
