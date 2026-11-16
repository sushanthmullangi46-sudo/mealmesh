import React, { useState } from 'react';
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
import { ShieldAlert, LogOut, ArrowRight } from 'lucide-react';

export function App() {
  // Always require authentication when opening the page fresh
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const isSessionActive = sessionStorage.getItem('mealmesh_session_active');
    if (!isSessionActive) {
      api.logout();
      return null;
    }
    return api.getCurrentUser();
  });

  // Default initial view: If not logged in, immediately show Login Page
  const [currentView, setCurrentView] = useState<string>(() => {
    const isSessionActive = sessionStorage.getItem('mealmesh_session_active');
    if (!isSessionActive) return 'login';
    const user = api.getCurrentUser();
    if (!user) return 'login';
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
        return 'login';
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
                To maintain data integrity and strict DBMS access isolation, you
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
  );
}

export default App;
