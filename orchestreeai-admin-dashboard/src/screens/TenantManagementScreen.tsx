import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, CheckCircle2, Shield, Users, Bot, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { TenantItem } from '../types';

export const TenantManagementScreen: React.FC = () => {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form state
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantTier, setNewTenantTier] = useState('GROWTH');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTenants();
      setTenants(data);
    } catch (err) {
      console.error('Failed fetching tenants', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();

    // Supabase Realtime subscription for tenants table (Fase 101: Native Postgres Logical Replication)
    const channel = supabase
      .channel('realtime:tenants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenants' },
        (payload) => {
          console.log('[Supabase Realtime] Tenants update received:', payload);
          fetchTenants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createTenant({
        name: newTenantName,
        tier: newTenantTier,
        ownerEmail: newOwnerEmail,
      });
      setIsModalOpen(false);
      setNewTenantName('');
      setNewOwnerEmail('');
      await fetchTenants();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header with Search and Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Tenant & Multi-Tenancy Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Kelola isolasi database, provisioning tenant baru, alokasi tier, dan pemantauan workforce organisasi.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari tenant atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-950/60 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Provision Tenant Baru</span>
          </button>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">Tenant Name & ID</th>
              <th className="py-3.5 px-6">Subscription Tier</th>
              <th className="py-3.5 px-6">Workforce (Users / Agents)</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs">
            {filteredTenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-800/40 transition">
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{tenant.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{tenant.id}</p>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-6">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      tenant.tier === 'ENTERPRISE'
                        ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                        : tenant.tier === 'GROWTH'
                        ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {tenant.tier}
                  </span>
                </td>

                <td className="py-4 px-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tenant.usersCount || 0} Staff</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                      <Bot className="w-3.5 h-3.5" />
                      <span>{tenant.activeAgents || 0} Agents</span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-6">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-semibold uppercase text-[10px]">{tenant.status}</span>
                  </div>
                </td>

                <td className="py-4 px-6 text-right">
                  <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition border border-slate-700">
                    Audit Config
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Provision Tenant Enterprise Baru</h3>
            <p className="text-xs text-slate-400 mb-5">
              Sistem akan membuat skema database terisolasi dan menginisialisasi Chief of Staff default.
            </p>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Organisasi / Perusahaan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PT Nusantara Perkasa"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subscription Tier</label>
                <select
                  value={newTenantTier}
                  onChange={(e) => setNewTenantTier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="STARTER">STARTER (Maks 5 Agents)</option>
                  <option value="GROWTH">GROWTH (Maks 20 Agents)</option>
                  <option value="ENTERPRISE">ENTERPRISE (Unlimited Agents + Custom Fabric)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Tenant Owner</label>
                <input
                  type="email"
                  required
                  placeholder="owner@nusantara.com"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  {isSubmitting ? 'Memproses...' : 'Buat Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
