import React, { useState, useEffect } from 'react';
import { Layers, Plus, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, Key } from 'lucide-react';
import { api } from '../lib/api';
import { AppRegistryItem } from '../types';

export const ThirdPartyAppRegistryManagementScreen: React.FC = () => {
  const [apps, setApps] = useState<AppRegistryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAppRegistry();
      setApps(data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat registry aplikasi pihak ketiga.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Third-Party App & OAuth Connectors Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Koneksi OAuth 2.0, Webhook integrations, ERP/CRM bridges, dan capability migration status.
          </p>
        </div>
        <button
          onClick={fetchApps}
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

      {/* Grid of Apps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => (
          <div key={app.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span>{app.appName}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {app.appType}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Client ID: {app.clientId || 'N/A'}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  app.isConnected
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {app.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/60 pt-3">
              <div className="flex justify-between">
                <span>Auth Type:</span>
                <span className="font-semibold text-slate-200">{app.authType || 'OAuth 2.0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Capability:</span>
                <span className="text-indigo-400 font-semibold">{app.capabilityStatus || 'PRODUCTION_READY'}</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 mb-1">OAuth Scopes:</span>
                <div className="flex flex-wrap gap-1">
                  {app.scopes?.map((s, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
