import React, { useState } from 'react';
import { api } from '../services/api';
import { UserSession, UserRole } from '../types/mealmesh';
import {
  Utensils,
  HeartHandshake,
  Bike,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Database,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (session: UserSession, targetView: string) => void;
  onNavigate: (view: string) => void;
}

const PRESET_PERSONAS = [
  {
    role: 'DONOR' as UserRole,
    title: 'Food Donor',
    name: 'Chef Suresh Kumar',
    organization: 'ITC Gardenia Kitchen, Koramangala',
    email: 'donor.koramangala@mealmesh.org',
    password: 'demo123',
    icon: Utensils,
    color: 'emerald',
    badge: 'FSSAI Certified Donor',
    features: ['Publish Surplus Food', 'Priority Min-Heap Queue', 'Auto-Match with Nearby NGOs'],
    targetView: 'donor',
  },
  {
    role: 'NGO' as UserRole,
    title: 'NGO Coordinator',
    name: 'Ramesh Narayan',
    organization: 'Akshaya Patra Foundation Hub',
    email: 'ngo.akshayapatra@mealmesh.org',
    password: 'demo123',
    icon: HeartHandshake,
    color: 'blue',
    badge: 'Verified Shelter & Hub',
    features: ['Claim for Distribution', 'Storage Capacity Gauge', 'Real-Time Food Discovery'],
    targetView: 'ngo',
  },
  {
    role: 'VOLUNTEER' as UserRole,
    title: 'Delivery Volunteer',
    name: 'Rahul Sharma',
    organization: 'Two-Wheeler Fleet (KA-01-EQ-1001)',
    email: 'volunteer.rahul@mealmesh.org',
    password: 'demo123',
    icon: Bike,
    color: 'amber',
    badge: 'Rapid Logistics Transporter',
    features: ['Mission Dispatch Hub', 'Dijkstra Shortest Path Route', 'Pickup & Delivery Tracking'],
    targetView: 'volunteer',
  },
  {
    role: 'ADMIN' as UserRole,
    title: 'Central Administrator',
    name: 'System Administrator',
    organization: 'MealMesh Operations Plane',
    email: 'admin@mealmesh.org',
    password: 'demo123',
    icon: ShieldCheck,
    color: 'slate',
    badge: 'System Governance',
    features: ['NGO Accreditation', 'User Directory', 'Fleet Telemetry & LIFO Rollbacks'],
    targetView: 'admin',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign in state
  const [email, setEmail] = useState('donor.koramangala@mealmesh.org');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign up state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('demo123');
  const [regRole, setRegRole] = useState<'DONOR' | 'NGO' | 'VOLUNTEER'>('DONOR');
  const [regOrgName, setRegOrgName] = useState('');
  const [regPhone, setRegPhone] = useState('+91 98765 43210');

  // Quick 1-click persona login
  const handlePersonaLogin = async (persona: typeof PRESET_PERSONAS[0]) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const session = await api.demoLogin(persona.role);
      onLoginSuccess(session, persona.targetView);
    } catch (err: any) {
      setErrorMsg(err.message || 'Persona login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const session = await api.login(email.trim(), password);
      const target =
        session.role === 'DONOR'
          ? 'donor'
          : session.role === 'NGO'
          ? 'ngo'
          : session.role === 'VOLUNTEER'
          ? 'volunteer'
          : 'admin';
      onLoginSuccess(session, target);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const session = await api.register({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        organizationName: regOrgName || regFullName,
        phone: regPhone,
      });
      const target =
        session.role === 'DONOR'
          ? 'donor'
          : session.role === 'NGO'
          ? 'ngo'
          : 'volunteer';
      onLoginSuccess(session, target);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
          <Database className="w-3.5 h-3.5 text-emerald-700" />
          <span>Role-Based Access Control · JWT Sign-In</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Your Account Identity
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          MealMesh enforces role-based security across food donors, redistribution NGOs, rapid delivery volunteers, and operations administrators.
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="max-w-md mx-auto p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: 4 ROLE PERSONA CARDS (ONE-CLICK LOGIN) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Demo Accounts (1-Click Sign In, password demo123)
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            Pre-seeded Database Accounts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_PERSONAS.map((p) => {
            const Icon = p.icon;
            const isEmerald = p.color === 'emerald';
            const isBlue = p.color === 'blue';
            const isAmber = p.color === 'amber';

            const cardBorder = isEmerald
              ? 'hover:border-emerald-500 hover:shadow-emerald-500/10'
              : isBlue
              ? 'hover:border-blue-500 hover:shadow-blue-500/10'
              : isAmber
              ? 'hover:border-amber-500 hover:shadow-amber-500/10'
              : 'hover:border-slate-800 hover:shadow-slate-800/10';

            const btnBg = isEmerald
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : isBlue
              ? 'bg-blue-600 hover:bg-blue-700'
              : isAmber
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-slate-900 hover:bg-slate-800';

            const badgeBg = isEmerald
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isBlue
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : isAmber
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-300';

            return (
              <div
                key={p.role}
                className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all flex flex-col justify-between space-y-4 ${cardBorder}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeBg}`}>
                      {p.title}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 font-medium truncate">{p.organization}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">{p.email}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Portal Access
                    </span>
                    <ul className="text-[11px] text-slate-600 space-y-0.5">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handlePersonaLogin(p)}
                    disabled={loading}
                    className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 ${btnBg}`}
                  >
                    <span>Log in as {p.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setEmail(p.email);
                      setPassword(p.password);
                      setAuthMode('signin');
                    }}
                    className="w-full text-center text-[10px] text-slate-400 hover:text-slate-700 font-semibold py-1"
                  >
                    Fill credentials below &darr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: MANUAL SIGN IN / REGISTER FORM */}
      <div className="max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Toggle Mode */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
          <button
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-2 rounded-lg transition ${
              authMode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Direct Account Sign In
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className={`flex-1 py-2 rounded-lg transition ${
              authMode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            Register New Account
          </button>
        </div>

        {/* SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. donor.koramangala@mealmesh.org"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo123"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard demonstration password for all accounts is: <strong>demo123</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In with Database Credentials'}
            </button>
          </form>
        )}

        {/* SIGN UP FORM */}
        {authMode === 'signup' && (
          <form onSubmit={handleCustomRegister} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'DONOR', label: 'Food Donor' },
                  { role: 'NGO', label: 'NGO Shelter' },
                  { role: 'VOLUNTEER', label: 'Volunteer' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.role}
                    onClick={() => setRegRole(item.role as any)}
                    className={`py-2 rounded-lg font-bold text-[11px] border transition ${
                      regRole === item.role
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Anand Murthy"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organization / Base Name</label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={regOrgName}
                  onChange={(e) => setRegOrgName(e.target.value)}
                  placeholder="e.g. Royal Banquet Hall or Care Home"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="anand@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Choose password"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Register and Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
