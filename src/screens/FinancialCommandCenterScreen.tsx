import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Building2, RefreshCw, Layers, ArrowUpRight, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { FinancialCommandCenterResponse } from '../types';

export const FinancialCommandCenterScreen: React.FC = () => {
  const [data, setData] = useState<FinancialCommandCenterResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getFinancialCommandCenter();
      setData(res);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat data Financial Command Center.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Financial Command Center (Fase 114.4)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Eksekutif metrik: MRR, ARR, sirkulasi kredit, gross margin compute, dan konsumsi per tenant.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
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

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs font-semibold text-slate-400">MRR (Monthly Run Rate)</span>
            <div className="text-2xl font-bold text-white tracking-tight mt-1">
              Rp {data.kpis.mrr.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-emerald-400 mt-2 font-mono">
              ARR: Rp {data.kpis.arr.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs font-semibold text-slate-400">Active Subscriptions</span>
            <div className="text-2xl font-bold text-indigo-400 tracking-tight mt-1">
              {data.kpis.activeSubscriptionsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Langganan berbayar aktif
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs font-semibold text-slate-400">Total Kredit Beredar</span>
            <div className="text-2xl font-bold text-amber-400 tracking-tight mt-1">
              {data.kpis.totalCreditsCirculating.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Terpakai: {data.kpis.totalCreditsConsumed.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs font-semibold text-slate-400">Gross Compute Margin</span>
            <div className="text-2xl font-bold text-cyan-400 tracking-tight mt-1">
              {data.kpis.netMarginPercentage}%
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Compute Cost: Rp {data.kpis.estimatedComputeCostIdr.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      )}

      {/* Breakdown: Plan Distribution & Top Consumers */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plan Distribution */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Distribusi Paket Komersial</h3>
            <div className="space-y-3">
              {data.planDistribution.map((plan, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="font-semibold text-white">{plan.planName}</span>
                  <div className="text-right">
                    <span className="font-bold text-indigo-400 mr-2">{plan.count} tenant</span>
                    <span className="text-slate-400">({plan.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Consumers */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Peringkat Konsumsi Kredit Terbesar</h3>
            <div className="space-y-3">
              {data.topTenantsByConsumption.map((tenant, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <div>
                    <span className="font-semibold text-white block">{tenant.tenantName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{tenant.tenantId}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-400 block font-mono">{tenant.creditsConsumed.toLocaleString('id-ID')} Kredit</span>
                    <span className="text-slate-400 text-[11px]">{tenant.percentageOfTotal}% total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
