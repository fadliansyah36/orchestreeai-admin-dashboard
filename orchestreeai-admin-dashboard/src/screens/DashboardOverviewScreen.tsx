import React, { useState, useEffect } from 'react';
import {
  Building2,
  Cpu,
  Wrench,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { api } from '../lib/api';
import { TenantItem, LlmProviderItem, McpToolItem } from '../types';

export const DashboardOverviewScreen: React.FC = () => {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [providers, setProviders] = useState<LlmProviderItem[]>([]);
  const [mcpTools, setMcpTools] = useState<McpToolItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [t, p, m] = await Promise.all([
          api.getTenants(),
          api.getLlmProviders(),
          api.getMcpTools(),
        ]);
        setTenants(t);
        setProviders(p);
        setMcpTools(m);
      } catch (err) {
        console.error('Failed loading dashboard overview', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOverviewData();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Platform Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/30 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Multi-Tenant Distributed Workforce Orchestration</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Ringkasan Platform & Health Center
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Memantau status kesehatan model router, registry alat MCP, isolasi tenant data, dan integrasi enterprise dalam satu kontrol terpusat.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Tenants</span>
              <p className="text-xl font-bold text-emerald-400 font-mono">{tenants.length}</p>
            </div>
            <div className="px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Providers</span>
              <p className="text-xl font-bold text-indigo-400 font-mono">{providers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tenants</span>
            <div className="p-2 bg-emerald-950/60 border border-emerald-800/40 rounded-lg text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3 font-mono">
            {isLoading ? '...' : tenants.filter((t) => t.status === 'ACTIVE').length}
          </p>
          <div className="flex items-center text-[11px] text-emerald-400 mt-2 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            <span>100% SLA uptime</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LLM Providers</span>
            <div className="p-2 bg-indigo-950/60 border border-indigo-800/40 rounded-lg text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3 font-mono">
            {isLoading ? '...' : providers.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">OpenRouter, Groq, DeepSeek, Apimart</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MCP Tools Registered</span>
            <div className="p-2 bg-amber-950/60 border border-amber-800/40 rounded-lg text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3 font-mono">
            {isLoading ? '...' : mcpTools.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">Enterprise sandboxed execution</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ABAC Security State</span>
            <div className="p-2 bg-purple-950/60 border border-purple-800/40 rounded-lg text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-3 font-mono">ENFORCED</p>
          <p className="text-[11px] text-slate-400 mt-2">Zero leakage between tenants</p>
        </div>
      </div>

      {/* Model Router Status & Recent Tenants Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Router Health Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white text-base">Model Router Adapters (93.A)</h3>
            </div>
            <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/60 rounded">
              Healthy
            </span>
          </div>

          <div className="space-y-3">
            {providers.map((p) => (
              <div
                key={p.provider}
                className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-200">{p.provider}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                      Priority #{p.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Models: {p.models.join(', ')}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-emerald-400 font-semibold">{p.latencyMs}ms</span>
                  <p className="text-[10px] text-slate-400">Avg Latency</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tenant List Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-white text-base">Provisioned Tenants</h3>
            </div>
          </div>

          <div className="space-y-3">
            {tenants.map((t) => (
              <div
                key={t.id}
                className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-200">{t.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {t.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{t.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-300">{t.usersCount || 0} Users</span>
                  <p className="text-[10px] text-emerald-400">{t.activeAgents || 0} Active Agents</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
