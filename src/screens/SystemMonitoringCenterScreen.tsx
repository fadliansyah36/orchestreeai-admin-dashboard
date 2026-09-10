import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Server, ShieldCheck, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { SystemMonitoringOverview } from '../types';

export const SystemMonitoringCenterScreen: React.FC = () => {
  const [overview, setOverview] = useState<SystemMonitoringOverview | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ status: string; providers: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ovData, hData] = await Promise.all([
        api.getSystemMonitoringOverview(),
        api.getHealthStatus(),
      ]);
      setOverview(ovData);
      setHealthStatus(hData);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat status kesehatan sistem.' });
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
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Infrastructure Health & Circuit Breakers (Fase 102)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Status runtime Ktor backend, Kubernetes pods & deployments, serta status circuit breaker provider.
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

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <span className="text-xs text-slate-400 block mb-1">Cluster Health</span>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span>{overview.clusterHealth || 'HEALTHY'}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Backend status: {healthStatus?.status || 'UP'}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <span className="text-xs text-slate-400 block mb-1">Active K8s Pods</span>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {overview.activePods} / {overview.totalPods}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Failed: {overview.failedPods}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <span className="text-xs text-slate-400 block mb-1">Dead Letter Queue</span>
            <div className="text-xl font-bold text-amber-400 font-mono">
              {overview.dlqCount} Items
            </div>
            <p className="text-[11px] text-slate-500 mt-2">Fase 109 Replay</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <span className="text-xs text-slate-400 block mb-1">Security Sentinel Gates</span>
            <div className="text-xl font-bold text-indigo-400">
              {overview.securityGatesPassed ? 'ENFORCED' : 'OFFLINE'}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">ABAC Guardrails</p>
          </div>
        </div>
      )}

      {/* Circuit Breakers Section */}
      {overview && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              <span>Provider Circuit Breakers</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-800/60">
            {overview.circuitBreakers?.map((b, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-slate-800/30 transition">
                <div>
                  <span className="font-semibold text-white block">{b.provider}</span>
                  <span className="text-[11px] text-slate-400">
                    Failure Rate: {b.failureRate}% | Latency: {b.latencyMs}ms
                  </span>
                </div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.status === 'CLOSED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : b.status === 'HALF_OPEN'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
