import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, RefreshCw, ShieldCheck, Layers, Users, Bot } from 'lucide-react';
import { api } from '../lib/api';
import { TenantItem } from '../types';

export const TenantManagementScreen: React.FC = () => {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTenantName, setNewTenantName] = useState<string>('');
  const [newTenantTier, setNewTenantTier] = useState<string>('starter');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTenants();
      setTenants(data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat daftar tenant.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;
    setIsSubmitting(true);
    try {
      await api.createTenant({
        name: newTenantName.trim(),
        tier: newTenantTier,
        ownerEmail: `admin@${newTenantName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'tenant'}.orchestree.biz.id`,
      });
      setMessage({ type: 'success', text: `Tenant "${newTenantName}" berhasil dibuat.` });
      setNewTenantName('');
      setIsModalOpen(false);
      fetchTenants();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal membuat tenant.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTenants = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    (t.tier && t.tier.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Multi-Tenant Governance & Isolation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Super Admin scope platform-wide. Manajemen isolasi database, alokasi paket, dan kuota workforce.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTenants}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tenant Baru</span>
          </button>
        </div>
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari tenant berdasarkan nama, id, atau paket..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Tenants Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Nama Tenant</th>
                <th className="px-4 py-3">ID Tenant</th>
                <th className="px-4 py-3">Paket Komersial</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Human / AI Workforce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    {isLoading ? 'Memuat data tenant...' : 'Tidak ada data tenant ditemukan.'}
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-300">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{tenant.name}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{tenant.id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {tenant.tier || 'Standard'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {tenant.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-slate-400">
                        {tenant.userCount ?? 0} Human / {tenant.agentCount ?? 0} AI
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Tenant */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>Daftarkan Tenant Baru</span>
            </h3>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Organisasi / Perusahaan</label>
                <input
                  type="text"
                  required
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  placeholder="Contoh: PT Inovasi Maju Bersama"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Paket Komersial Awal</label>
                <select
                  value={newTenantTier}
                  onChange={(e) => setNewTenantTier(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="starter">Starter (1,000 credit)</option>
                  <option value="growth">Growth (6,000 credit)</option>
                  <option value="enterprise">Enterprise (30,000 credit)</option>
                  <option value="custom">Custom Enterprise</option>
                </select>
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
                  {isSubmitting ? 'Memproses...' : 'Simpan Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
