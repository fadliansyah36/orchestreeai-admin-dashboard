import React, { useState, useEffect } from 'react';
import { UserCheck, Bot, Users, RefreshCw, Activity, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { WorkforceMonitoringSummary, TenantItem } from '../types';

export const TenantWorkforceMonitoringScreen: React.FC = () => {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [summary, setSummary] = useState<WorkforceMonitoringSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTenants = async () => {
    try {
      const data = await api.getTenants();
      setTenants(data);
      if (data.length > 0 && !selectedTenantId) {
        setSelectedTenantId(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load tenants:', err);
    }
  };

  const fetchWorkforceData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getWorkforceSummary();
      setSummary(res);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat telemetri workforce.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
    fetchWorkforceData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <span>Tenant Workforce & Human-AI Collaboration Telemetry (Fase 91.A, H)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Super Admin global visibility. Monitor kapasitas karyawan AI, human-in-the-loop pairing, dan aktivitas harian per tenant.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tenants.length > 0 && (
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Semua Tenant (Platform-wide)</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.id})
                </option>
              ))}
            </select>
          )}
          <button
            onClick={fetchWorkforceData}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 text-xs rounded-lg border ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Overview Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">Total AI Agents</span>
            <span className="text-2xl font-bold text-white mt-1 block flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <span>{summary.totalAiAgents}</span>
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">Active Human Workers</span>
            <span className="text-2xl font-bold text-white mt-1 block flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>{summary.totalHumanWorkers}</span>
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">Human to AI Ratio</span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <span>{summary.humanToAiRatio}:1</span>
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">Total Departments</span>
            <span className="text-2xl font-bold text-cyan-400 mt-1 block flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span>{summary.totalDepartments}</span>
            </span>
          </div>
        </div>
      )}

      {/* Department Breakdown Table */}
      {summary && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Department Telemetry Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Departemen</th>
                  <th className="px-4 py-3">Human Workers</th>
                  <th className="px-4 py-3">AI Agents</th>
                  <th className="px-4 py-3">Active Tasks</th>
                  <th className="px-4 py-3 text-right">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {summary.departmentBreakdown?.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-semibold text-white">{dept.department}</td>
                    <td className="px-4 py-3 text-slate-300">{dept.humanCount} Human</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">{dept.aiCount} AI</td>
                    <td className="px-4 py-3 font-mono text-slate-200">{dept.activeTasks}</td>
                    <td className="px-4 py-3 text-right font-mono text-cyan-400">{dept.completionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
