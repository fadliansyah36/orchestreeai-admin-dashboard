import React, { useState, useEffect } from 'react';
import { UserCheck, RefreshCw, CheckCircle2, Calendar, ShieldCheck, Zap, Mail, Phone, Building2 } from 'lucide-react';
import { api } from '../lib/api';
import { ProspectRegistrationItem, ProspectAnalyticsResponse } from '../types';

export const ProspectManagementScreen: React.FC = () => {
  const [prospects, setProspects] = useState<ProspectRegistrationItem[]>([]);
  const [analytics, setAnalytics] = useState<ProspectAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [list, stats] = await Promise.all([
        api.getProspectRegistrations(),
        api.getProspectAnalytics(),
      ]);
      setProspects(list);
      setAnalytics(stats);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat data prospek pendaftar.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectTrial = async (id: string) => {
    setProcessingId(id);
    try {
      await api.selectProspectForTrial(id, { trialStatus: 'SELECTED', trialNotes: 'Super Admin manual approval' });
      setMessage({ type: 'success', text: 'Prospek berhasil dipilih untuk alokasi 36 slot trial 7 hari.' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memilih prospek trial.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleActivateTrial = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await api.activateProspectTrial(id);
      setMessage({
        type: 'success',
        text: `Tenant trial aktif! ID: ${res.tenantId}, Saldo: ${res.initialCredits} kredit, Berlaku hingga: ${new Date(res.trialExpiresAt).toLocaleDateString('id-ID')}`,
      });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal mengaktifkan tenant trial.' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <span>Prospect Registrations & 36 Trial Slot Allocation (Fase 127)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pendaftar kuesioner publik, seleksi kuota eksklusif 36 slot trial 7 hari, dan auto-provisioning tenant trial 1,000 kredit.
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

      {/* Analytics Banner */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">Total Pendaftar</span>
            <span className="text-xl font-bold text-white mt-1 block">{analytics.totalLeads}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">Trial Slots Terpakai</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">
              {analytics.trialSlotsOccupied} / {analytics.maxTrialSlots}
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">Jadwal Demo Terjadwal</span>
            <span className="text-xl font-bold text-indigo-400 mt-1 block">{analytics.scheduledDemos}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">Conversion Rate</span>
            <span className="text-xl font-bold text-cyan-400 mt-1 block">{analytics.conversionRate}%</span>
          </div>
        </div>
      )}

      {/* Prospects Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Nama & Perusahaan</th>
                <th className="px-4 py-3">Kontak Email / Telp</th>
                <th className="px-4 py-3">Opsi Minat</th>
                <th className="px-4 py-3">Status Trial</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {prospects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    {isLoading ? 'Memuat prospek...' : 'Belum ada pendaftaran masuk.'}
                  </td>
                </tr>
              ) : (
                prospects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-white block">{p.fullName}</span>
                      <span className="text-[11px] text-slate-400">{p.companyName} ({p.industryName || 'General'})</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-300">
                      <div>{p.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {p.interestOption}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.trialStatus === 'ACTIVATED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : p.trialStatus === 'SELECTED'
                            ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p.trialStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {p.trialStatus === 'PENDING' && (
                        <button
                          onClick={() => handleSelectTrial(p.id)}
                          disabled={processingId === p.id}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded text-[11px] transition"
                        >
                          Pilih Trial
                        </button>
                      )}
                      {p.trialStatus === 'SELECTED' && (
                        <button
                          onClick={() => handleActivateTrial(p.id)}
                          disabled={processingId === p.id}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px] transition"
                        >
                          Aktivasi Tenant (1k Credit)
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
