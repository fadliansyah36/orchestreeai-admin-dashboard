import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, RefreshCw, Timer } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  const { remainingIdleSeconds } = useAuth();
  const [healthStatus, setHealthStatus] = useState<string>('CHECKING');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const minutesLeft = Math.floor(remainingIdleSeconds / 60);
  const secondsLeft = remainingIdleSeconds % 60;
  const formattedIdleTime = `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`;
  const isUrgent = remainingIdleSeconds <= 120; // Last 2 minutes

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

      <div className="flex items-center space-x-3">
        {/* 15-Minute Session Idle Timeout Badge */}
        <div
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
            isUrgent
              ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse font-bold'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
          }`}
          title="Sesi Super Admin kadaluarsa setelah 15 menit tanpa aktivitas (Idle Timeout Fase 124 Bagian A.1.2)"
        >
          <Timer className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-400' : 'text-amber-400'}`} />
          <span className="hidden md:inline font-sans text-slate-400">Sesi Idle:</span>
          <span className={isUrgent ? 'text-rose-200' : 'text-amber-300'}>{formattedIdleTime}</span>
        </div>

        {/* System Health Status Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium hidden sm:inline">Router & MCP:</span>
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
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-950/60 border border-indigo-800/60 rounded-full text-xs text-indigo-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>MFA Enforced</span>
        </div>
      </div>
    </header>
  );
};
