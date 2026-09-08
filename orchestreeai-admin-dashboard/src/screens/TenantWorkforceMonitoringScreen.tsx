import React, { useState, useEffect } from 'react';
import {
  Users,
  Bot,
  Building2,
  TrendingUp,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api';
import { WorkforceMonitoringSummary } from '../types';

export const TenantWorkforceMonitoringScreen: React.FC = () => {
  const [summary, setSummary] = useState<WorkforceMonitoringSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWorkforceSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed fetching workforce summary', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const totalDeptCount = summary?.departmentDistribution?.reduce((acc, d) => acc + d.count, 0) || 1;
  const totalAiCount = summary?.aiJobTitleDistribution?.reduce((acc, a) => acc + a.count, 0) || 1;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 text-[11px] font-semibold mb-2">
            <Users className="w-3 h-3" />
            <span>Bagian F • PRD Master Fase 91.A, H (Cross-Tenant Workforce & Department Telemetry)</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Department & AI Workforce Cross-Tenant Monitoring
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visibilitas penetrasi 14 divisi bisnis, distribusi 15 AI Job Titles, dan rasio Human-to-AI across enterprise tenants.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSummary}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Active Departments</span>
            <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3 font-mono">
            {summary?.totalActiveDepartments ?? '—'}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Tersebar di 14 Divisi Bisnis Master Data
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total AI Agents Deployed</span>
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-3 font-mono">
            {summary?.totalAiAgents ?? '—'}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Agen otonom & tersupervisi aktif
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Human-to-AI Workforce Ratio</span>
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-3 font-mono">
            {summary?.humanToAiRatio ?? '—'}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Target sinergi produktivitas hybrid
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Master Data Alignment</span>
            <div className="p-2 rounded-xl bg-teal-950/80 border border-teal-800/60 text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-teal-400 mt-3 font-mono">
            100%
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Strict SSOT (Tanpa ghost / rogue roles)
          </span>
        </div>
      </div>

      {/* Two Column Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Distribusi Adopsi Divisi (Department)</h3>
                <p className="text-[11px] text-slate-400">Jumlah tenant yang mengaktifkan divisi tertentu</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {summary?.departmentDistribution?.length || 0} Divisi Aktif
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {summary?.departmentDistribution?.map((dept) => {
              const pct = dept.percentage || Math.round((dept.count / totalDeptCount) * 100) || 0;
              return (
                <div key={dept.departmentName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{dept.departmentName}</span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-slate-300 font-bold">{dept.count} tenants</span>
                      <span className="text-slate-500 text-[11px]">({pct}%)</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Job Title Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Distribusi AI Job Titles (Fase 91.H)</h3>
                <p className="text-[11px] text-slate-400">Jumlah agen aktif per profesi kecerdasan buatan</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {summary?.aiJobTitleDistribution?.length || 0} AI Jobs
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {summary?.aiJobTitleDistribution?.map((job) => {
              const pct = job.percentage || Math.round((job.count / totalAiCount) * 100) || 0;
              return (
                <div key={job.jobTitle} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{job.jobTitle}</span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-purple-300 font-bold">{job.count} agents</span>
                      <span className="text-slate-500 text-[11px]">({pct}%)</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
