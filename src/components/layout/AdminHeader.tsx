import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  const [healthStatus, setHealthStatus] = useState<string>('CHECKING');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getHealthStatus();
      setHealthStatus(res.status);
    } catch {
      setHealthStatus('DEGRADED');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between backdrop-blur shrink-0">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* System Health Status Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Model Router & MCP:</span>
          <span
            className={`font-semibold ${
              healthStatus === 'HEALTHY'
                ? 'text-emerald-400'
                : healthStatus === 'CHECKING'
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {healthStatus}
          </span>
          <button
            onClick={fetchHealth}
            disabled={isRefreshing}
            className="p-1 hover:text-white text-slate-400 transition"
            title="Refresh Health Check"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Global Security Policy Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-950/60 border border-indigo-800/60 rounded-full text-xs text-indigo-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>ABAC & Fail-Closed Guardrails Active</span>
        </div>
      </div>
    </header>
  );
};
