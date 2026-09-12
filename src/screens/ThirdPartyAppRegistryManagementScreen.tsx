import React, { useState, useEffect } from 'react';
import { Layers, Plus, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, Key, Trash2, Power, X } from 'lucide-react';
import { api } from '../lib/api';
import { AppRegistryItem } from '../types';
import { HonestErrorBanner, HonestErrorInfo } from '../components/HonestErrorBanner';

export const ThirdPartyAppRegistryManagementScreen: React.FC = () => {
  const [apps, setApps] = useState<AppRegistryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backendError, setBackendError] = useState<HonestErrorInfo | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [appName, setAppName] = useState<string>('');
  const [appType, setAppType] = useState<string>('CRM');
  const [clientId, setClientId] = useState<string>('');
  const [authType, setAuthType] = useState<string>('OAuth 2.0');
  const [scopesStr, setScopesStr] = useState<string>('read, write');

  const fetchApps = async () => {
    setIsLoading(true);
    setBackendError(null);
    try {
      const data = await api.getAppRegistry();
      setApps(data);
    } catch (err: any) {
      setBackendError({
        endpoint: '/admin/app-registry',
        status: err?.status || 500,
        message: err?.message || 'Gagal memuat registry aplikasi pihak ketiga.',
        rawDetails: err?.rawDetails || err,
      });
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat registry aplikasi pihak ketiga.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;
    setIsSubmitting(true);
    try {
      const scopes = scopesStr.split(',').map((s) => s.trim()).filter(Boolean);
      await api.createAppRegistry({
        appName: appName.trim(),
        appType,
        clientId: clientId.trim() || `app_${Math.random().toString(36).substring(2, 9)}`,
        authType,
        scopes,
      });
      setMessage({ type: 'success', text: `Aplikasi "${appName}" berhasil didaftarkan.` });
      setIsModalOpen(false);
      setAppName('');
      setClientId('');
      fetchApps();
    } catch (err: any) {
      setBackendError({
        endpoint: '/admin/app-registry',
        status: err?.status || 500,
        message: err?.message || 'Gagal mendaftarkan aplikasi.',
        rawDetails: err?.rawDetails || err,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleConnection = async (app: AppRegistryItem) => {
    const nextState = !app.isConnected;
    try {
      await api.updateAppRegistry(app.id, { isConnected: nextState });
      setMessage({
        type: 'success',
        text: `Status koneksi "${app.appName}" diubah ke ${nextState ? 'CONNECTED' : 'DISCONNECTED'}.`,
      });
      fetchApps();
    } catch (err: any) {
      setBackendError({
        endpoint: `/admin/app-registry/${app.id}`,
        status: err?.status || 500,
        message: err?.message || 'Gagal memperbarui status koneksi aplikasi.',
        rawDetails: err?.rawDetails || err,
      });
    }
  };

  const handleDeleteApp = async (app: AppRegistryItem) => {
    if (!window.confirm(`Yakin ingin menghapus aplikasi "${app.appName}" dari registry?`)) return;
    try {
      await api.deleteAppRegistry(app.id);
      setMessage({ type: 'success', text: `Aplikasi "${app.appName}" berhasil dihapus.` });
      fetchApps();
    } catch (err: any) {
      setBackendError({
        endpoint: `/admin/app-registry/${app.id}`,
        status: err?.status || 500,
        message: err?.message || 'Gagal menghapus aplikasi.',
        rawDetails: err?.rawDetails || err,
      });
    }
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={fetchApps}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition self-start sm:self-auto"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Aplikasi</span>
          </button>
        </div>
      </div>

      {/* Honest Backend Error Banner */}
      <HonestErrorBanner error={backendError} onRetry={fetchApps} isRetrying={isLoading} />

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
                <p className="text-xs text-slate-400 mt-1 font-mono text-[11px]">Client ID: {app.clientId || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    app.isConnected
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {app.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
                <button
                  onClick={() => handleDeleteApp(app)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                  title="Hapus Aplikasi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
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

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => handleToggleConnection(app)}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  app.isConnected
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{app.isConnected ? 'Putus Sambungan (Disconnect)' : 'Sambungkan Connector (Connect)'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Daftarkan Aplikasi Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Daftarkan Aplikasi / Konektor Baru</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateApp} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Aplikasi</label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Contoh: Salesforce CRM, SAP S/4HANA, HubSpot"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipe Integrasi</label>
                  <select
                    value={appType}
                    onChange={(e) => setAppType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CRM">CRM</option>
                    <option value="ERP">ERP</option>
                    <option value="COMMUNICATION">COMMUNICATION</option>
                    <option value="STORAGE">STORAGE</option>
                    <option value="CUSTOM_WEBHOOK">CUSTOM_WEBHOOK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Auth Type</label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="OAuth 2.0">OAuth 2.0</option>
                    <option value="API Key">API Key</option>
                    <option value="mTLS">mTLS</option>
                    <option value="Webhook HMAC">Webhook HMAC</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Client ID / API Key</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="app-client-id-xyz"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">OAuth Scopes (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={scopesStr}
                  onChange={(e) => setScopesStr(e.target.value)}
                  placeholder="contacts.read, deals.write, webhook.receive"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Mendaftarkan...' : 'Simpan Aplikasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
