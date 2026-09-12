import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  DollarSign,
  Zap,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  AlertOctagon,
  RefreshCw,
  Clock,
  Radio,
} from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { UsageAnalytics, AdminUsageAnalyticsResponse } from '../types';
import { HonestErrorBanner, HonestErrorInfo } from '../components/HonestErrorBanner';

export const UsageCostDashboardScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminUsageAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('all');
  const [errorInfo, setErrorInfo] = useState<HonestErrorInfo | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());
  const [realtimeEventCount, setRealtimeEventCount] = useState<number>(0);

  const fetchUsage = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsageAnalytics();
      setAnalytics(data);
      setErrorInfo(null);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('[UsageCost] Backend fetch failed:', err);
      setErrorInfo({
        endpoint: '/admin/usage-analytics',
        status: err?.status || err?.statusCode || 'FETCH_ERROR',
        message:
          err?.message ||
          'Gagal memuat analitik penggunaan token dari backend. Respon tidak valid atau koneksi ditolak.',
        rawDetails: err?.rawDetails || err?.stack || err?.toString(),
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();

    // Supabase Realtime subscription for usage_records (Fase 101: Native Postgres Logical Replication)
    const channel = supabase
      .channel('realtime:usage_records')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'usage_records' },
        (payload) => {
          setRealtimeEventCount((prev) => prev + 1);
          fetchUsage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsage]);

  // Provider breakdown filtering strictly without eliminated providers
  const activeProviders = [
    { id: 'all', name: 'Semua Provider Aktif' },
    { id: 'nvidia_nim', name: 'NVIDIA NIM (Prioritas 1 Reasoning / Prioritas 3 Image)' },
    { id: 'openrouter', name: 'OpenRouter (Prioritas 2 Reasoning & Image)' },
    { id: 'gpt_image_2', name: 'GPT-Image-2 / Apimart (Prioritas 1 Image)' },
  ];

  // Filter breakdown list
  const filteredBreakdown = analytics?.breakdown
    ? analytics.breakdown.filter((item) => {
        if (selectedProviderFilter === 'all') return true;
        const prov = (item.provider || '').toLowerCase();
        return prov.includes(selectedProviderFilter.toLowerCase());
      })
    : [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-5 rounded-xl backdrop-blur">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold mb-2">
            <DollarSign className="w-3 h-3" />
            <span>PRD Master FinOps Intelligence • Endpoint: /admin/usage-analytics</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>LLM Token Consumption & Cost Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pengawasan biaya token real-time, margin keuntungan per tenant, dan optimasi prompt routing otomatis.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Live Sync</span>
            {realtimeEventCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded bg-emerald-900 text-emerald-300 text-[10px] font-mono">
                +{realtimeEventCount}
              </span>
            )}
          </div>
          <button
            onClick={fetchUsage}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Memuat...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* Honest Error Banner if backend fails */}
      {errorInfo && (
        <HonestErrorBanner
          error={errorInfo}
          onRetry={fetchUsage}
          isRetrying={isLoading}
          title="Kegagalan Telemetri Usage Analytics Backend"
        />
      )}

      {/* Active LLM Provider Chain & Elimination Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Konfigurasi Rantai Provider LLM & Image Aktif</h3>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[10px] font-semibold">
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            <span>OpenAI DALL-E & Google Gemini dieliminasi total dari runtime</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Reasoning Chain */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Routing Reasoning & Chat</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Fallback Priority
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-emerald-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px] border border-emerald-700">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-white">NVIDIA NIM Microservices</span>
                    <p className="text-[10px] text-slate-400">meta/llama-3.1-70b-instruct, mistralai/mixtral-8x22b</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  PRIMARY
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-indigo-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 font-mono font-bold flex items-center justify-center text-[10px] border border-indigo-700">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-white">OpenRouter AI Gateway</span>
                    <p className="text-[10px] text-slate-400">Anthropic Claude 3.5, DeepSeek Chat, Meta Llama 405B</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                  FALLBACK
                </span>
              </div>
            </div>
          </div>

          {/* Image Generation Chain */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Routing Image Generation</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Fallback Priority
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-fuchsia-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-fuchsia-950 text-fuchsia-400 font-mono font-bold flex items-center justify-center text-[10px] border border-fuchsia-700">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-white">GPT-Image-2 (Apimart)</span>
                    <p className="text-[10px] text-slate-400">gpt-image-2-turbo, gpt-image-2-hd</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-fuchsia-400 bg-fuchsia-950/60 px-2 py-0.5 rounded border border-fuchsia-800/60">
                  PRIMARY
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-indigo-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 font-mono font-bold flex items-center justify-center text-[10px] border border-indigo-700">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-white">OpenRouter Image Gateway</span>
                    <p className="text-[10px] text-slate-400">FLUX.1 Schnell, Stable Diffusion 3</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                  FALLBACK 1
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-emerald-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-mono font-bold flex items-center justify-center text-[10px] border border-emerald-700">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-white">NVIDIA NIM Visual AI</span>
                    <p className="text-[10px] text-slate-400">stabilityai/stable-diffusion-xl</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  FALLBACK 2
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Cards */}
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
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Bulan Berjalan (MTD)</span>
            <span className="font-mono text-emerald-400">
              Prompt: {analytics?.promptTokens ? analytics.promptTokens.toLocaleString() : '0'}
            </span>
          </div>
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
            <span>Routing: NIM Primary • OpenRouter Fallback</span>
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
          <p className="text-[11px] text-slate-400 mt-2">Efisiensi NIM Multi-Microservice</p>
        </div>
      </div>

      {/* Tenant Breakdown Table with Provider Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white text-sm">Tenant Token & Cost Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rincian konsumsi unit token per organisasi tenant berdasarkan routing model aktif.
            </p>
          </div>

          {/* Provider Filter Dropdown: STRICTLY NO OpenAI or Google Gemini */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Filter Provider:</label>
            <select
              value={selectedProviderFilter}
              onChange={(e) => setSelectedProviderFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {activeProviders.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-6">Tenant ID</th>
              <th className="py-3 px-6">Routing Provider</th>
              <th className="py-3 px-6">Token Consumed</th>
              <th className="py-3 px-6">Estimated Cost (USD)</th>
              <th className="py-3 px-6 text-right">Avg Cost / 1k Tokens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs">
            {filteredBreakdown.length > 0 ? (
              filteredBreakdown.map((b, idx) => {
                const tokenVal = b.tokens ?? b.totalTokens ?? 0;
                const costVal = b.costUsd ?? b.totalCostUsd ?? 0;
                const tenantLabel = b.tenant || b.tenantName || b.tenantId || `tenant-${idx + 1}`;
                const providerLabel = b.provider || 'NVIDIA NIM (Prioritas 1)';
                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-6 font-mono text-slate-200">{tenantLabel}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {providerLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-indigo-400">{tokenVal.toLocaleString()}</td>
                    <td className="py-3.5 px-6 font-mono text-emerald-400">${costVal.toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right font-semibold text-slate-300">
                      {tokenVal > 0 ? `$${((costVal / tokenVal) * 1000).toFixed(4)}` : '$0.0000'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 px-6 text-center text-slate-500">
                  {isLoading
                    ? 'Memuat data konsumsi token...'
                    : 'Tidak ada data konsumsi token tenant yang sesuai dengan filter'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="p-4 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Terakhir diperbarui: {lastRefreshedAt}</span>
          </span>
          <span className="text-[11px] text-slate-500">
            Sumber Data: Endpoint <code className="text-slate-400 font-mono">/admin/usage-analytics</code>
          </span>
        </div>
      </div>
    </div>
  );
};
export default UsageCostDashboardScreen;
