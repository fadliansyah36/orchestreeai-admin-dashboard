import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Layers,
  AlertOctagon,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { api } from '../lib/api';
import { SystemMonitoringOverview } from '../types';

export const SystemMonitoringCenterScreen: React.FC = () => {
  const [overview, setOverview] = useState<SystemMonitoringOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSystemMonitoringOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed fetching monitoring overview', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchOverview();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const isHealthy = overview?.status === 'HEALTHY';

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold mb-2">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Bagian G • PRD Master Fase 102 (System Monitoring) & Fase 90 Gate</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            System Monitoring Center & Health Gate
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Telemetri komprehensif pod K8s, latensi multi-LLM circuit breaker, antrean DLQ, insiden keamanan, dan rate-limit throttle.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition ${
              autoRefresh
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse' : ''}`} />
            <span>Auto Refresh: {autoRefresh ? 'ON (15s)' : 'OFF'}</span>
          </button>
          <button
            onClick={fetchOverview}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Ping</span>
          </button>
        </div>
      </div>

      {/* Top Status Banners */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* System Health Status */}
        <div
          className={`border rounded-2xl p-5 shadow-lg relative overflow-hidden ${
            isHealthy
              ? 'bg-slate-900 border-emerald-800/60'
              : 'bg-rose-950/20 border-rose-800/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Global System Status</span>
            <div
              className={`p-2 rounded-xl border ${
                isHealthy
                  ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-400'
                  : 'bg-rose-950/80 border-rose-800/60 text-rose-400'
              }`}
            >
              {isHealthy ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
          </div>
          <p
            className={`text-2xl font-bold mt-3 font-mono ${
              isHealthy ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {overview?.status ?? 'CHECKING...'}
          </p>
          <span className="text-[10px] text-slate-500 mt-1 block font-mono">
            Uptime: {Math.floor((overview?.uptimeSeconds ?? 86400) / 3600)} jam operasional SLA
          </span>
        </div>

        {/* Server Pod Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Kubernetes Pod State</span>
            <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-3 font-mono">
            {overview?.serverHealth.podStatus ?? 'RUNNING'}
          </p>
          <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1 font-mono">
            <span>CPU: {overview?.serverHealth.cpuUsagePercent ?? 0}%</span>
            <span>•</span>
            <span>RAM: {overview?.serverHealth.memoryUsageMb ?? 0} MB</span>
          </div>
        </div>

        {/* Job Queue & DLQ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Job Queue & DLQ</span>
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800/60 text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-3 font-mono">
            {overview?.jobQueueStatus.activeJobs ?? 0} <span className="text-sm font-normal text-slate-400">active</span>
          </p>
          <div className="flex items-center space-x-2 text-[10px] mt-1 font-mono">
            <span className="text-slate-400">DLQ:</span>
            <span
              className={`font-bold ${
                (overview?.jobQueueStatus.deadLetterCount ?? 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {overview?.jobQueueStatus.deadLetterCount ?? 0} failed
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              {(overview?.jobQueueStatus.processedJobs24h ?? 0).toLocaleString()} done/24h
            </span>
          </div>
        </div>

        {/* Security & Rate Limits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Security & Throttling</span>
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-3 font-mono">
            {overview?.securityIncidents.suspiciousAuthAttempts24h ?? 0} <span className="text-sm font-normal text-slate-400">auth alerts</span>
          </p>
          <div className="flex items-center space-x-2 text-[10px] mt-1 font-mono text-slate-400">
            <span>ABAC: {overview?.securityIncidents.abacViolations24h ?? 0}</span>
            <span>•</span>
            <span>Throttle Violations: {overview?.rateLimitViolations.totalViolations24h ?? 0}</span>
          </div>
        </div>
      </div>

      {/* LLM & Model Router Circuit Breaker Health Check */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Provider Health Check & Circuit Breakers (Fase 93.A, 82)</h3>
              <p className="text-[11px] text-slate-400">
                Pemeriksaan konektivitas real-time, latensi respons p95, dan status saklar pemutus sirkuit
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {overview?.providerHealth.length || 0} Provider Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {overview?.providerHealth.map((p) => {
            const isTripped = p.circuitBreakerTripped;
            return (
              <div
                key={p.provider}
                className={`bg-slate-950 border rounded-xl p-4 transition-all ${
                  isTripped
                    ? 'border-rose-800/80 bg-rose-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">{p.provider}</h4>
                  </div>
                  {isTripped ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 border border-rose-800 text-rose-400 flex items-center space-x-1">
                      <AlertOctagon className="w-3 h-3" />
                      <span>TRIPPED</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>ONLINE</span>
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Latency:</span>
                    <span className="font-mono font-bold text-slate-200">{p.latencyMs} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Consecutive Fails:</span>
                    <span
                      className={`font-mono font-bold ${
                        p.consecutiveFailures > 0 ? 'text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      {p.consecutiveFailures}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Circuit Breaker:</span>
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        isTripped ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isTripped ? 'Open (Tripped)' : 'Closed (Healthy)'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Infrastructure & Security Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pod & Server Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <Server className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Server & Resource Telemetry</h3>
              <p className="text-[11px] text-slate-400">Kapasitas server backend Ktor dan thread pool</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Pod Status</span>
              <span className="font-mono font-bold text-emerald-400">
                {overview?.serverHealth.podStatus}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">CPU Usage</span>
              <span className="font-mono font-bold text-white">
                {overview?.serverHealth.cpuUsagePercent}%
              </span>
            </div>
            <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">JVM Heap Memory</span>
              <span className="font-mono font-bold text-white">
                {overview?.serverHealth.memoryUsageMb} MB / {overview?.serverHealth.memoryMaxMb} MB
              </span>
            </div>
            <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Active HTTP Connections</span>
              <span className="font-mono font-bold text-teal-400">
                {overview?.serverHealth.activeConnections} sockets
              </span>
            </div>
          </div>
        </div>

        {/* Security & Rate Limiting Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="font-bold text-white text-sm">Security & ABAC Audit Gate</h3>
              <p className="text-[11px] text-slate-400">Pencegahan anomali akses dan eksekusi tool berisiko</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Suspicious Auth Attempts</span>
              <span className="font-mono font-bold text-rose-400">
                {overview?.securityIncidents.suspiciousAuthAttempts24h}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">ABAC Role Denials</span>
              <span className="font-mono font-bold text-amber-400">
                {overview?.securityIncidents.abacViolations24h}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">High-Risk MCP Executions Blocked</span>
              <span className="font-mono font-bold text-purple-400">
                {overview?.securityIncidents.highRiskMcpExecutions24h}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Rate Limit Violations (24h)</span>
              <span className="font-mono font-bold text-slate-200">
                {overview?.rateLimitViolations.totalViolations24h}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
