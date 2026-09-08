import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  PieChart,
  Users,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { api } from '../lib/api';
import {
  FinancialCommandCenterResponse,
  PlanDistributionItem,
  TopTenantConsumptionItem,
} from '../types';

export const FinancialCommandCenterScreen: React.FC = () => {
  const [data, setData] = useState<FinancialCommandCenterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getFinancialCommandCenter();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat analitik Financial Command Center');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpis = data?.kpis;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Financial & Credit Command Center</h2>
            <p className="text-xs text-slate-400">
              Prinsip: <strong>ONE CENTRAL CREDIT LEDGER → ONE BILLING SOURCE OF TRUTH</strong>.
              Analisis MRR, alokasi kredit, efisiensi komputasi, dan margin keuntungan platform.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2.5 py-1 rounded">
            Live Supabase Financial Metrics
          </span>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-center space-x-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 4.1: Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* MRR */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Monthly Recurring (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            IDR {kpis ? (kpis.mrr / 1_000_000).toFixed(1) : '0'}M
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            ARR: IDR {kpis ? (kpis.arr / 1_000_000).toFixed(0) : '0'}M
          </p>
        </div>

        {/* Subscriptions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Subscriptions</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-400 mt-2">
            {kpis?.activeSubscriptionsCount ?? 0}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Organisasi berbayar aktif</p>
        </div>

        {/* Circulating Credits */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Credits Beredar</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-2">
            {kpis ? (kpis.totalCreditsCirculating / 1_000).toFixed(1) : '0'}k
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Saldo aktif di wallet tenant</p>
        </div>

        {/* Consumed Credits */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Credits Terpakai (MTD)</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-2">
            {kpis ? (kpis.totalCreditsConsumed / 1_000).toFixed(1) : '0'}k
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Total konsumsi AI workforce</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-2">
            IDR {kpis ? (kpis.totalRevenueIdr / 1_000_000).toFixed(1) : '0'}M
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Topup MTD: IDR {data ? (data.recentTopUpsTotal / 1_000_000).toFixed(1) : '0'}M
          </p>
        </div>

        {/* Net Margin */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Net Gross Margin</span>
            <Zap className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono text-teal-400 mt-2">
            {kpis?.netMarginPercentage ? kpis.netMarginPercentage.toFixed(1) : '0.0'}%
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Revenue vs Compute LLM</p>
        </div>
      </div>

      {/* 4.2: Distribution & Consumption Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">Distribusi Paket Komersial Aktif</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total {kpis?.activeSubscriptionsCount ?? 0} subscriptions
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {!data || data.planDistribution.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">Tidak ada data distribusi paket.</div>
            ) : (
              data.planDistribution.map((item: PlanDistributionItem) => (
                <div key={item.planCode} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-medium text-white">{item.planName} ({item.planCode})</span>
                    <span className="font-mono text-slate-400">{item.count} tenant ({item.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Consuming Tenants */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-100">Top 5 Tenants by Credit Consumption</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">MTD Usage Ranking</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {!data || data.topTenantsByConsumption.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">Belum ada catatan konsumsi tenant.</div>
            ) : (
              data.topTenantsByConsumption.map((t: TopTenantConsumptionItem) => (
                <div
                  key={t.tenantId}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-100">{t.tenantName}</div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-2 mt-0.5">
                      <span>{t.tenantId}</span>
                      <span>•</span>
                      <span className="text-emerald-400 uppercase">{t.planCode}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-sky-400">
                      {t.creditsConsumed.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">Credits</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {t.percentageOfTotal.toFixed(1)}% dari total platform
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Compliance & Audit Proof Footer */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            SSOT Billing Engine: <code>ONE TENANT → ONE SUBSCRIPTION → ONE AI CREDIT BALANCE → ONE CENTRAL CREDIT LEDGER</code>
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Last Synced: {data ? new Date(data.timestamp).toLocaleTimeString('id-ID') : '-'}
        </div>
      </div>
    </div>
  );
};
