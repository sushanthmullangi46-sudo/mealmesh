import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { NgoDashboard } from './pages/NgoDashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DsaLaboratory } from './pages/DsaLaboratory';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { api } from './services/api';
import { UserSession, UserRole } from './types/mealmesh';

export function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => api.getCurrentUser());

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDemoLogin = async (role: UserRole) => {
    try {
      const session = await api.demoLogin(role);
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
    } catch (err: any) {
      console.error('Demo login error:', err);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCurrentView('landing');
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

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage onNavigate={handleNavigate} onDemoLogin={handleDemoLogin} />
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
