import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsSummary, NgoProfile } from '../types/mealmesh';
import {
  ShieldCheck,
  RotateCcw,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  Building,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [ngos, setNgos] = useState<NgoProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [undoMessage, setUndoMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, n, l] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getAdminNgos(),
        api.getAuditLogs(),
      ]);
      setStats(s);
      setNgos(n);
      setAuditLogs(l);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVerify = async (ngoId: string, currentStatus: boolean) => {
    try {
      await api.verifyNgo(ngoId, !currentStatus);
      setUndoMessage(`Updated verification status for NGO. Action pushed to Reversible Stack.`);
      loadData();
      setTimeout(() => setUndoMessage(null), 5000);
    } catch (err: any) {
      alert('Verification update failed: ' + err.message);
    }
  };

  const handleUndo = async () => {
    try {
      const msg = await api.undoAdminAction();
      setUndoMessage(msg);
      loadData();
      setTimeout(() => setUndoMessage(null), 5000);
    } catch (err: any) {
      alert('Undo failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-900 text-white">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">Central Admin Operations</h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            System governance, NGO verification audit, and reversible operations using the custom LIFO Stack.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Undo Last Action (LIFO Stack)
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {undoMessage && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{undoMessage}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Donors
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            {stats?.activeDonorsCount || 15}
          </h3>
          <span className="text-[11px] text-emerald-700 font-semibold">FSSAI Certified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Partner NGOs
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            {stats?.registeredNgosCount || 10}
          </h3>
          <span className="text-[11px] text-blue-700 font-semibold">Shelters & Hubs</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Volunteer Transporters
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            {stats?.activeVolunteersCount || 12}
          </h3>
          <span className="text-[11px] text-amber-700 font-semibold">Two & Four Wheelers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Rescued Food
          </span>
          <h3 className="text-2xl font-extrabold text-emerald-800 mt-1">
            {stats?.totalFoodRescuedKg.toLocaleString() || '1,845'} kg
          </h3>
          <span className="text-[11px] text-emerald-700 font-semibold">Zero Wastage Target</span>
        </div>
      </div>

      {/* NGO Verification Table & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* NGO Verification Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              NGO Registration & Verification Management
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              {ngos.length} registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Organization</th>
                  <th className="py-2.5 px-3">Reg. Number</th>
                  <th className="py-2.5 px-3">Capacity</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ngos.map((ngo) => (
                  <tr key={ngo.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {ngo.organizationName}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Bengaluru Hub
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {ngo.registrationNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {ngo.maxStorageCapacityKg} kg
                    </td>
                    <td className="py-3 px-3">
                      {ngo.verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleVerify(ngo.id, ngo.verified)}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition shadow-sm ${
                          ngo.verified
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {ngo.verified ? 'Revoke' : 'Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Audit Log Stream (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              Real-Time Audit Trail
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">Immutable Events</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No recent audit events logged.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 hover:bg-slate-100/60 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] font-mono">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
