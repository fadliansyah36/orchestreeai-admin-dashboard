import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  ShieldCheck,
  Key,
  RefreshCw,
  ExternalLink,
  Trash2,
  Edit2,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Lock,
  Search,
  Building2,
  ShoppingCart,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { api } from '../lib/api';
import { AppRegistryItem } from '../types';

export const ThirdPartyAppRegistryManagementScreen: React.FC = () => {
  const [apps, setApps] = useState<AppRegistryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [appName, setAppName] = useState('');
  const [appType, setAppType] = useState<'ERP' | 'CRM' | 'MARKETPLACE' | 'PAYMENT' | 'MESSAGING'>('ERP');
  const [clientId, setClientId] = useState('');
  const [authType, setAuthType] = useState('OAUTH2');
  const [scopesStr, setScopesStr] = useState('erp:read, inventory:sync');
  const [status, setStatus] = useState('ACTIVE');
  const [capabilityStatus, setCapabilityStatus] = useState('SUPPORTED');

  // Mark Migration Modal
  const [migrationApp, setMigrationApp] = useState<AppRegistryItem | null>(null);
  const [migrationReason, setMigrationReason] = useState('Official API deprecated by platform. Migrating to manual webhook/link bridge.');

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAppRegistry();
      setApps(data);
    } catch (err) {
      console.error('Failed fetching App Registry', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const openAddModal = () => {
    setEditingAppId(null);
    setAppName('');
    setAppType('ERP');
    setClientId(`client_${Date.now().toString().slice(-6)}`);
    setAuthType('OAUTH2');
    setScopesStr('read:orders, write:inventory');
    setStatus('ACTIVE');
    setCapabilityStatus('SUPPORTED');
    setIsModalOpen(true);
  };

  const openEditModal = (app: AppRegistryItem) => {
    setEditingAppId(app.id);
    setAppName(app.appName);
    setAppType(app.appType as any);
    setClientId(app.clientId);
    setAuthType(app.authType || 'OAUTH2');
    setScopesStr((app.scopes || []).join(', '));
    setStatus(app.status);
    setCapabilityStatus(app.capabilityStatus || 'SUPPORTED');
    setIsModalOpen(true);
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scopes = scopesStr.split(',').map((s) => s.trim()).filter(Boolean);
      if (editingAppId) {
        await api.updateAppRegistry(editingAppId, {
          appName,
          appType,
          clientId,
          scopes,
          status,
          capabilityStatus,
          authType,
        });
      } else {
        await api.createAppRegistry({
          appName,
          appType,
          clientId: clientId || `client_${appName.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString().slice(-4)}`,
          scopes,
          status,
          capabilityStatus,
          authType,
        });
      }
      setIsModalOpen(false);
      await fetchApps();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan aplikasi');
    }
  };

  const handleDeleteApp = async (app: AppRegistryItem) => {
    if (!confirm(`Hapus integrasi "${app.appName}" dari katalog?`)) return;
    try {
      await api.deleteAppRegistry(app.id);
      await fetchApps();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus aplikasi');
    }
  };

  const handleTriggerMigration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!migrationApp) return;
    try {
      await api.markAppMigration(migrationApp.id, migrationReason);
      setMigrationApp(null);
      await fetchApps();
    } catch (err: any) {
      alert(err.message || 'Gagal menandai migrasi aplikasi');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ERP':
        return <Building2 className="w-5 h-5" />;
      case 'CRM':
        return <Layers className="w-5 h-5" />;
      case 'MARKETPLACE':
        return <ShoppingCart className="w-5 h-5" />;
      case 'PAYMENT':
        return <CreditCard className="w-5 h-5" />;
      case 'MESSAGING':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  const filteredApps = apps.filter((a) => {
    const matchesSearch =
      a.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.clientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || a.appType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold mb-2">
            <Layers className="w-3 h-3" />
            <span>Bagian E • PRD Master Fase 93.C & Transisi Fase 58-60</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Third-Party App Registry & OAuth Connectors
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Katalog konektor ERP, CRM, E-Commerce, Payment Gateway, dan Manajemen Migrasi API Marketplace ke Manual Link.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchApps}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-950/60 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Integrasi App</span>
          </button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari aplikasi atau client ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="ERP">ERP Systems (Odoo, SAP)</option>
            <option value="CRM">CRM Platforms (HubSpot)</option>
            <option value="MARKETPLACE">Marketplaces (Tokopedia, Shopee)</option>
            <option value="PAYMENT">Payment Gateways (Xendit)</option>
            <option value="MESSAGING">Messaging (WhatsApp, Slack)</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Total Terdaftar: <span className="font-bold text-white font-mono">{apps.length}</span> apps
        </div>
      </div>

      {/* App Registry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredApps.map((app) => {
          const isMigration = app.capabilityStatus === 'MIGRATION_REQUIRED' || app.capabilityStatus === 'MANUAL_LINK_ONLY';
          return (
            <div
              key={app.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg relative flex flex-col justify-between transition-all ${
                isMigration ? 'border-amber-900/70 bg-gradient-to-b from-amber-950/20 to-slate-900' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold ${
                        isMigration
                          ? 'bg-amber-950/80 border-amber-800/80 text-amber-400'
                          : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400'
                      }`}
                    >
                      {getTypeIcon(app.appType)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{app.appName}</h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {app.appType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {app.authType || 'OAUTH2'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(app)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteApp(app)}
                      className="p-1.5 rounded-lg bg-slate-800 text-rose-400 border border-slate-700 hover:bg-rose-950/60 hover:border-rose-800 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Capability & Migration Status */}
                <div className="mt-3">
                  {isMigration ? (
                    <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-800/60 text-amber-300 text-[11px] flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Status: {app.capabilityStatus}</span>
                        <span className="text-[10px] text-amber-200/80 block mt-0.5">
                          {app.manualLinkMigrationNotice || 'Migrasi manual link aktif'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Direct Native API Supported</span>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Client ID:</span>
                    <span className="font-mono text-slate-200 text-[11px]">{app.clientId}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Active Tenants:</span>
                    <span className="font-bold text-white font-mono">{app.connectedTenants || 0}</span>
                  </div>

                  <div className="mt-2">
                    <span className="text-[11px] text-slate-400 block mb-1">OAuth Scopes:</span>
                    <div className="flex flex-wrap gap-1">
                      {(app.scopes || []).map((scope) => (
                        <span
                          key={scope}
                          className="text-[10px] font-mono bg-slate-800/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">ID: {app.id}</span>
                {!isMigration && (
                  <button
                    onClick={() => {
                      setMigrationApp(app);
                      setMigrationReason('Official API deprecated by platform. Migrating to manual webhook/link bridge.');
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Tandai Migrasi (Fase 58-60)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit App Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">
              {editingAppId ? 'Edit Integrasi Third-Party App' : 'Daftarkan Integrasi App Baru'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Kelola konfigurasi protokol OAuth2 dan kapabilitas konektor.
            </p>

            <form onSubmit={handleSaveApp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Aplikasi
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: Accurate Online, Tokopedia Gateway"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kategori Integrasi
                  </label>
                  <select
                    value={appType}
                    onChange={(e) => setAppType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="ERP">ERP System</option>
                    <option value="CRM">CRM Platform</option>
                    <option value="MARKETPLACE">Marketplace</option>
                    <option value="PAYMENT">Payment Gateway</option>
                    <option value="MESSAGING">Messaging Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tipe Autentikasi
                  </label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="OAUTH2">OAuth 2.0 (PKCE)</option>
                    <option value="API_KEY">Static API Key / Secret</option>
                    <option value="WEBHOOK_HMAC">Webhook HMAC Signature</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Client ID
                </label>
                <input
                  type="text"
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  OAuth Scopes (Dipisah koma)
                </label>
                <input
                  type="text"
                  required
                  placeholder="orders:read, inventory:write, webhook:receive"
                  value={scopesStr}
                  onChange={(e) => setScopesStr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kapabilitas
                  </label>
                  <select
                    value={capabilityStatus}
                    onChange={(e) => setCapabilityStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="SUPPORTED">SUPPORTED (Direct API)</option>
                    <option value="MIGRATION_REQUIRED">MIGRATION_REQUIRED</option>
                    <option value="MANUAL_LINK_ONLY">MANUAL_LINK_ONLY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Migration Modal */}
      {migrationApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">
              Tandai Migrasi ke Manual Link (Fase 58-60)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Aplikasi: <span className="font-bold text-white">{migrationApp.appName}</span> ({migrationApp.clientId})
            </p>

            <form onSubmit={handleTriggerMigration} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alasan Migrasi / Deprecasi API
                </label>
                <textarea
                  rows={3}
                  required
                  value={migrationReason}
                  onChange={(e) => setMigrationReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl text-[11px] text-amber-300 space-y-1">
                <p className="font-semibold">Konsekuensi Transisi:</p>
                <p className="text-amber-200/80">
                  Tenant yang terhubung akan dialihkan ke instruksi Manual Link / Export-Import Webhook sesuai standar Fase 58-60.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMigrationApp(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Konfirmasi Migrasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
