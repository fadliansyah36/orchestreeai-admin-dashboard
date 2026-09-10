import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Zap, BarChart3, PieChart, ArrowUpRight } from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { UsageAnalytics } from '../types';

export const UsageCostDashboardScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsage = async () => {
    try {
      const data = await api.getUsageAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed fetching usage analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();

    // Supabase Realtime subscription for usage_records (Fase 101: Native Postgres Logical Replication)
    const channel = supabase
      .channel('realtime:usage_records')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'usage_records' },
        (payload) => {
          console.log('[Supabase Realtime] Usage record update received:', payload);
          fetchUsage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold mb-2">
          <DollarSign className="w-3 h-3" />
          <span>PRD Master Bagian 15.1 & 25.6 • FinOps Intelligence</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">LLM Token Consumption & Cost Intelligence</h2>
        <p className="text-xs text-slate-400 mt-1">
          Pengawasan biaya token real-time, margin keuntungan per tenant, dan optimasi prompt routing otomatis.
        </p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Platform Tokens</span>
            <div className="p-2 bg-emerald-950/60 border border-emerald-800/40 rounded-lg text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3 font-mono">
            {isLoading ? '...' : (analytics?.totalTokens !== undefined ? analytics.totalTokens.toLocaleString() : '0')}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">Bulan Berjalan (MTD)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total LLM Cost (USD)</span>
            <div className="p-2 bg-indigo-950/60 border border-indigo-800/40 rounded-lg text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-3 font-mono">
            ${isLoading ? '...' : (analytics?.totalCostUsd !== undefined ? analytics.totalCostUsd.toFixed(2) : '0.00')}
          </p>
          <div className="flex items-center text-[11px] text-emerald-400 mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            <span>Telemetri LLM Router Aktif</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Cost per 1K Tokens</span>
            <div className="p-2 bg-purple-950/60 border border-purple-800/40 rounded-lg text-purple-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3 font-mono">
            {analytics && analytics.totalTokens > 0
              ? `$${((analytics.totalCostUsd / analytics.totalTokens) * 1000).toFixed(4)}`
              : '$0.0000'}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">Router Smart Fallback Blend</p>
        </div>
      </div>

      {/* Tenant Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800">
          <h3 className="font-semibold text-white text-sm">Tenant Token & Cost Breakdown</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-6">Tenant ID</th>
              <th className="py-3 px-6">Token Consumed</th>
              <th className="py-3 px-6">Estimated Cost (USD)</th>
              <th className="py-3 px-6 text-right">Avg Cost / 1k Tokens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs">
            {(analytics?.breakdown && analytics.breakdown.length > 0) ? (
              analytics.breakdown.map((b) => (
                <tr key={b.tenant} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-6 font-mono text-slate-200">{b.tenant}</td>
                  <td className="py-3.5 px-6 font-mono text-indigo-400">{b.tokens.toLocaleString()}</td>
                  <td className="py-3.5 px-6 font-mono text-emerald-400">${b.costUsd.toFixed(2)}</td>
                  <td className="py-3.5 px-6 text-right font-semibold text-slate-300">
                    {b.tokens > 0 ? `$${((b.costUsd / b.tokens) * 1000).toFixed(4)}` : '$0.0000'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 px-6 text-center text-slate-500">
                  Tidak ada data konsumsi token tenant yang tersedia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
