import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Fingerprint,
  UserCheck,
} from 'lucide-react';
import { api } from '../lib/api';
import { AuditLogItem, PresenceSecurityAuditSummary } from '../types';

export const SecurityAuditCenterScreen: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [presenceStats, setPresenceStats] = useState<PresenceSecurityAuditSummary | null>(null);
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [newIp, setNewIp] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [logsData, presenceData, ipsData] = await Promise.all([
        api.getAuditLogs(),
        api.getPresenceSecurityAuditSummary(),
        api.getIpAllowlist(),
      ]);
      setLogs(logsData);
      setPresenceStats(presenceData);
      setAllowlist(ipsData.allowedIps || []);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat log audit keamanan.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    const updated = [...allowlist, newIp.trim()];
    try {
      await api.updateIpAllowlist({ enabled: true, allowedIps: updated });
      setAllowlist(updated);
      setNewIp('');
      setMessage({ type: 'success', text: `IP ${newIp} berhasil ditambahkan ke allowlist.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memperbarui IP allowlist.' });
    }
  };

  const filteredLogs = logs.filter((l) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.operatorId.toLowerCase().includes(search.toLowerCase()) ||
    l.resource.toLowerCase().includes(search.toLowerCase()) ||
    l.ipAddress.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Security, Forensics & ABAC Sentinel Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log forensik akses Super Admin, verifikasi kehadiran biometrik tanpa raw embedding, dan proteksi IP allowlist.
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

      {/* Biometric Presence Security Overview */}
      {presenceStats && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <span>Biometric Presence Security Telemetry (Fase 112)</span>
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                presenceStats.securityRiskLevel === 'HIGH'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : presenceStats.securityRiskLevel === 'ELEVATED'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              Risk: {presenceStats.securityRiskLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Enrolled Users</span>
              <span className="text-lg font-bold text-white">{presenceStats.totalEnrolledUsers}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Total Verifikasi</span>
              <span className="text-lg font-bold text-white">{presenceStats.totalVerificationChecks}</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Sukses / Gagal</span>
              <span className="text-lg font-bold text-emerald-400">
                {presenceStats.totalSuccessfulChecks} / <span className="text-rose-400">{presenceStats.totalFailedChecks}</span>
              </span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Percobaan Tidak Sah</span>
              <span className="text-lg font-bold text-amber-400">{presenceStats.potentialUnauthorizedAttempts}</span>
            </div>
          </div>
        </div>
      )}

      {/* IP Allowlist Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>Super Admin CIDR / IP Allowlist</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {allowlist.map((ip, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">
              {ip}
            </span>
          ))}
        </div>
        <form onSubmit={handleAddIp} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            placeholder="Tambah IP (misal: 203.0.113.1)"
            className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"
          >
            Tambah IP
          </button>
        </form>
      </div>

      {/* Forensic Audit Log Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Forensic Audit Log Trail</h3>
          <div className="w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari log..."
              className="w-full px-3 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Aksi</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {isLoading ? 'Memuat log forensik...' : 'Tidak ada catatan audit.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {typeof log.timestamp === 'number' ? new Date(log.timestamp).toLocaleString('id-ID') : log.timestamp}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{log.operatorId}</td>
                    <td className="px-4 py-3 font-mono text-indigo-300">{log.action}</td>
                    <td className="px-4 py-3 text-slate-300">{log.resource}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
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
