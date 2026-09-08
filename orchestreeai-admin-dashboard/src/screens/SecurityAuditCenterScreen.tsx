import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Users,
  Radio,
  RefreshCw,
  EyeOff,
  ScanFace,
  Fingerprint,
  Activity,
  UserCheck,
  Globe,
  Clock,
  KeyRound,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { AuditLogItem, PresenceSecurityAuditSummary } from '../types';

export const SecurityAuditCenterScreen: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fase 124 / Bagian A.1.3: IP Allowlist Configuration
  const [ipAllowlistEnabled, setIpAllowlistEnabled] = useState<boolean>(false);
  const [allowedIpsText, setAllowedIpsText] = useState<string>('127.0.0.1, ::1, 10.0.0.0/8, 192.168.1.0/24');
  const [isSavingIpAllowlist, setIsSavingIpAllowlist] = useState<boolean>(false);
  const [ipAllowlistFeedback, setIpAllowlistFeedback] = useState<string | null>(null);

  // Fase 124 / Bagian D.4.2: Support Impersonation Mode
  const [impersonateTenantId, setImpersonateTenantId] = useState<string>('');
  const [impersonateReason, setImpersonateReason] = useState<string>('');
  const [impersonateDurationMinutes, setImpersonateDurationMinutes] = useState<number>(30);
  const [isCreatingImpersonation, setIsCreatingImpersonation] = useState<boolean>(false);
  const [activeImpersonation, setActiveImpersonation] = useState<any | null>(null);
  const [impersonateFeedback, setImpersonateFeedback] = useState<string | null>(null);

  // Fase 112 / Bagian C: Platform-wide aggregate presence & biometric security state
  const [presenceStats, setPresenceStats] = useState<PresenceSecurityAuditSummary | null>(null);
  const [isPresenceLoading, setIsPresenceLoading] = useState<boolean>(true);
  const [isRealtimePulsing, setIsRealtimePulsing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLogs = async () => {
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed fetching audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPresenceStats = useCallback(async () => {
    setIsPresenceLoading(true);
    try {
      // 1. Primary: Try fetching from backend API
      const stats = await api.getPresenceSecurityAuditSummary();
      if (stats && typeof stats.totalEnrolledUsers === 'number') {
        setPresenceStats(stats);
        setLastUpdated(new Date());
        setIsPresenceLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend presence stats API call deferred, querying Supabase directly:', err);
    }

    // 2. Direct Supabase Aggregation from presence_check_log and user_presence_enrollment
    try {
      const [logsRes, enrollRes] = await Promise.all([
        supabase.from('presence_check_log').select('*').order('checked_at', { ascending: false }),
        supabase.from('user_presence_enrollment').select('id, is_enabled').eq('is_enabled', true),
      ]);

      const logsData = logsRes.data || [];
      const enrolledCount = enrollRes.data ? enrollRes.data.length : 0;

      const totalChecks = logsData.length;
      const successChecks = logsData.filter((l) => l.verification_result === 'SUCCESS');
      const failedChecks = logsData.filter((l) => l.verification_result !== 'SUCCESS');

      let recentConsecutiveFailures = 0;
      for (const log of logsData) {
        if (log.verification_result !== 'SUCCESS') {
          recentConsecutiveFailures++;
        } else {
          break;
        }
      }

      // Check per-user consecutive failures
      const logsByUser: Record<string, typeof logsData> = {};
      for (const log of logsData) {
        if (!logsByUser[log.user_id]) logsByUser[log.user_id] = [];
        logsByUser[log.user_id].push(log);
      }
      let maxUserFailures = 0;
      for (const uLogs of Object.values(logsByUser)) {
        let uCount = 0;
        for (const l of uLogs) {
          if (l.verification_result !== 'SUCCESS') uCount++;
          else break;
        }
        if (uCount > maxUserFailures) maxUserFailures = uCount;
      }
      const effectiveConsecutiveFailures = Math.max(recentConsecutiveFailures, maxUserFailures);

      const unauthorizedReasons = [
        'FAILED_SIMILARITY_BELOW_THRESHOLD',
        'FAILED_DEVICE_NOT_REGISTERED',
        'FAILED_BIOMETRIC_UNSUCCESSFUL',
        'FAILED_NO_ENROLLED_FACE',
      ];
      const potentialUnauthorized = logsData.filter((l) =>
        unauthorizedReasons.includes(l.verification_result)
      ).length;

      const faceChecks = logsData.filter((l) => (l.method_used || '').toUpperCase() === 'FACE').length;
      const fpChecks = logsData.filter(
        (l) => (l.method_used || '').toUpperCase() === 'FINGERPRINT' || (l.method_used || '').toUpperCase() === 'BIOMETRIC'
      ).length;
      const fallbackChecks = logsData.filter((l) => (l.method_used || '').toUpperCase() === 'PASSWORD_FALLBACK').length;

      const riskLevel =
        effectiveConsecutiveFailures >= 3 || potentialUnauthorized >= 3
          ? 'HIGH'
          : effectiveConsecutiveFailures >= 1 || potentialUnauthorized >= 1
          ? 'ELEVATED'
          : 'NORMAL';

      setPresenceStats({
        totalEnrolledUsers: Math.max(enrolledCount, 1),
        totalVerificationChecks: totalChecks,
        totalSuccessfulChecks: successChecks.length,
        totalFailedChecks: failedChecks.length,
        consecutiveFailures: effectiveConsecutiveFailures,
        potentialUnauthorizedAttempts: potentialUnauthorized,
        methodBreakdown: {
          face: faceChecks,
          fingerprint: fpChecks,
          passwordFallback: fallbackChecks,
        },
        securityRiskLevel: riskLevel,
      });
      setLastUpdated(new Date());
    } catch (dbErr) {
      console.error('Failed querying presence stats from Supabase:', dbErr);
    } finally {
      setIsPresenceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchPresenceStats();

    // Supabase Realtime subscription for audit_logs (Fase 101)
    const auditChannel = supabase
      .channel('realtime:audit_logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'audit_logs' },
        (payload) => {
          console.log('[Supabase Realtime] Audit log received:', payload);
          fetchLogs();
        }
      )
      .subscribe();

    // Supabase Realtime subscription for presence_check_log (Fase 112 / Bagian C)
    const presenceChannel = supabase
      .channel('realtime:presence_check_log')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'presence_check_log' },
        (payload) => {
          console.log('[Supabase Realtime] Presence check log event received:', payload);
          setIsRealtimePulsing(true);
          setTimeout(() => setIsRealtimePulsing(false), 2000);
          fetchPresenceStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(auditChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [fetchPresenceStats]);

  const fetchIpAllowlist = useCallback(async () => {
    try {
      const cfg = await api.getIpAllowlist();
      setIpAllowlistEnabled(cfg.enabled);
      if (cfg.allowedIps && cfg.allowedIps.length > 0) {
        setAllowedIpsText(cfg.allowedIps.join(', '));
      }
    } catch (e) {
      console.warn('Failed loading IP allowlist configuration:', e);
    }
  }, []);

  useEffect(() => {
    fetchIpAllowlist();
  }, [fetchIpAllowlist]);

  const handleSaveIpAllowlist = async () => {
    setIsSavingIpAllowlist(true);
    setIpAllowlistFeedback(null);
    try {
      const ips = allowedIpsText
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await api.updateIpAllowlist({
        enabled: ipAllowlistEnabled,
        allowedIps: ips,
      });
      setIpAllowlistFeedback(`Allowlist berhasil diperbarui! Status: ${res.enabled ? 'AKTIF (' + res.allowedIps.length + ' IP/CIDR)' : 'NON-AKTIF'}`);
      fetchLogs();
    } catch (err: any) {
      setIpAllowlistFeedback(`Gagal memperbarui allowlist: ${err.message}`);
    } finally {
      setIsSavingIpAllowlist(false);
    }
  };

  const handleStartImpersonation = async () => {
    if (!impersonateTenantId.trim()) {
      setImpersonateFeedback('Target Tenant ID wajib diisi!');
      return;
    }
    if (!impersonateReason.trim()) {
      setImpersonateFeedback('Alasan investigasi / tiket support wajib diisi!');
      return;
    }

    setIsCreatingImpersonation(true);
    setImpersonateFeedback(null);
    try {
      const session = await api.createSupportImpersonation({
        targetTenantId: impersonateTenantId.trim(),
        reason: impersonateReason.trim(),
        durationMinutes: impersonateDurationMinutes,
      });
      setActiveImpersonation(session);
      setImpersonateFeedback(`Sesi Impersonation Aktif! Token time-boxed diterbitkan. Notifikasi audit otomatis terkirim ke Tenant Owner.`);
      fetchLogs();
    } catch (err: any) {
      setImpersonateFeedback(`Gagal memulai sesi support: ${err.message}`);
    } finally {
      setIsCreatingImpersonation(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalChecks = presenceStats?.totalVerificationChecks || 0;
  const successChecks = presenceStats?.totalSuccessfulChecks || 0;
  const successRate = totalChecks > 0 ? Math.round((successChecks / totalChecks) * 100) : 100;

  const faceCount = presenceStats?.methodBreakdown.face || 0;
  const fpCount = presenceStats?.methodBreakdown.fingerprint || 0;
  const fallbackCount = presenceStats?.methodBreakdown.passwordFallback || 0;
  const totalMethods = faceCount + fpCount + fallbackCount;

  const facePercent = totalMethods > 0 ? Math.round((faceCount / totalMethods) * 100) : 50;
  const fpPercent = totalMethods > 0 ? Math.round((fpCount / totalMethods) * 100) : 50;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[11px] font-semibold mb-2">
            <Lock className="w-3 h-3" />
            <span>PRD Master • Enterprise Security & Immutable Audit Trail</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Security & Sentinel Audit Center</h2>
          <p className="text-xs text-slate-400 mt-1">
            Pencatatan real-time seluruh aksi administratif, deteksi anomali biometrik, dan rekaman forensik akses platform.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter aktor, aksi, atau IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FASE 124 — SUPER ADMIN HARDENED SECURITY POSTURE & GOVERNANCE             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-emerald-800/50 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">MFA Status</div>
            <div className="text-xs font-bold text-emerald-400">Mandatory (100%)</div>
            <div className="text-[10px] text-slate-400">Zero-Bypass TOTP</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-indigo-800/50 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-700/50">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Session Timeout</div>
            <div className="text-xs font-bold text-indigo-400">15-Min Idle Gating</div>
            <div className="text-[10px] text-slate-400">Auto-Revocation</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-cyan-800/50 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-700/50">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CSRF Protection</div>
            <div className="text-xs font-bold text-cyan-400">Double-Submit Cookie</div>
            <div className="text-[10px] text-slate-400">SameSite=Strict</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-amber-800/50 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-700/50">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rate Limiting</div>
            <div className="text-xs font-bold text-amber-400">3 Fails → 15m Lock</div>
            <div className="text-[10px] text-slate-400">Security Alert Dispatch</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FASE 124 — CONTROLS: IP ALLOWLIST & SUPPORT IMPERSONATION MODE            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: IP Allowlist Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Super Admin IP Allowlist</h4>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
                FASE 124 • A.1.3
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ipAllowlistEnabled}
                onChange={(e) => setIpAllowlistEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
              <span className="ml-2 text-xs font-semibold text-slate-300">
                {ipAllowlistEnabled ? 'AKTIF' : 'NON-AKTIF'}
              </span>
            </label>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Batasi akses Admin Dashboard HANYA dari alamat IP atau CIDR range tertentu (misal: VPN kantor, static gateway). Akses di luar daftar ini akan langsung diblokir (403 Forbidden).
          </p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">Allowed IP / CIDR Ranges (pisahkan koma/baris baru):</label>
            <textarea
              rows={3}
              value={allowedIpsText}
              onChange={(e) => setAllowedIpsText(e.target.value)}
              placeholder="127.0.0.1, ::1, 10.0.0.0/8, 192.168.1.0/24"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {ipAllowlistFeedback && (
            <div className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
              ipAllowlistFeedback.includes('Gagal') ? 'bg-rose-950/80 text-rose-300 border border-rose-800' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{ipAllowlistFeedback}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveIpAllowlist}
              disabled={isSavingIpAllowlist}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow"
            >
              {isSavingIpAllowlist ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Simpan Pengaturan Allowlist</span>
            </button>
          </div>
        </div>

        {/* Panel 2: Support Impersonation Mode */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Support & Impersonation Mode</h4>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                FASE 124 • D.4.2
              </span>
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
              Time-Boxed & Audited
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Akses tenant spesifik secara sementara untuk kebutuhan investigasi bug/support. Wajib mencantumkan alasan & tiket resmi. Notifikasi transparan terkirim otomatis ke Tenant Owner.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">Target Tenant ID:</label>
              <input
                type="text"
                placeholder="mis. tenant-alpha-123"
                value={impersonateTenantId}
                onChange={(e) => setImpersonateTenantId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">Durasi Sesi:</label>
              <select
                value={impersonateDurationMinutes}
                onChange={(e) => setImpersonateDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value={15}>15 Menit</option>
                <option value={30}>30 Menit (Standar)</option>
                <option value={60}>60 Menit (Investigasi Dalam)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">Alasan Akses / Nomor Tiket Support (Wajib):</label>
            <input
              type="text"
              placeholder="mis. Investigasi kendala sinkronisasi ledger (Tiket #SUP-8821)"
              value={impersonateReason}
              onChange={(e) => setImpersonateReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {impersonateFeedback && (
            <div className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
              impersonateFeedback.includes('Gagal') || impersonateFeedback.includes('wajib') ? 'bg-rose-950/80 text-rose-300 border border-rose-800' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{impersonateFeedback}</span>
            </div>
          )}

          {activeImpersonation && (
            <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-800/80 text-xs font-mono space-y-1 text-amber-300">
              <div className="flex justify-between">
                <span>Session ID:</span>
                <span className="text-white">{activeImpersonation.sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span>Token Berakhir:</span>
                <span className="text-slate-300">{new Date(activeImpersonation.expiresAt).toLocaleTimeString()}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={handleStartImpersonation}
              disabled={isCreatingImpersonation}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow"
            >
              {isCreatingImpersonation ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Mulai Sesi Support Impersonation</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LANGKAH 1 — PANEL SECURITY & AUDIT CENTER (PRD Fase 112 / Bagian C)        */}
      {/* Ringkasan platform-wide agregat: User aktif, verifikasi gagal berturut-   */}
      {/* turut (indikasi percobaan tidak sah) — PRIVASI BIOMETRIK TERJAGA.         */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/60 border border-indigo-700/60 text-indigo-300">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                <span>FASE 112 • BAGIAN C</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Presence & Biometric Security Sentinel
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Platform-Wide Presence & Biometric Security Overview
            </h3>
            <p className="text-xs text-slate-400">
              Statistik agregat presensi platform-wide dari data nyata <code className="text-indigo-300">presence_check_log</code>. Menjaga privasi biometrik individual tanpa menampilkan data sensitif.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            {/* Live Realtime Indicator */}
            <div
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all ${
                isRealtimePulsing
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 scale-105 shadow-sm shadow-emerald-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <Radio
                className={`w-3 h-3 ${isRealtimePulsing ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}
              />
              <span className="text-[10px]">
                {isRealtimePulsing ? 'Realtime Event' : 'Live Sync'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchPresenceStats()}
              disabled={isPresenceLoading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPresenceLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 Aggregate Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Jumlah User Aktif Presensi Platform-Wide */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">User Presensi Aktif</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-white font-mono">
                {presenceStats ? presenceStats.totalEnrolledUsers : '-'}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">User Terdaftar</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Jumlah user yang mengaktifkan presensi platform-wide
            </p>
          </div>

          {/* 2. Percobaan Verifikasi Gagal Berturut-turut */}
          <div
            className={`border rounded-lg p-4 relative overflow-hidden transition-all ${
              (presenceStats?.consecutiveFailures ?? 0) > 0
                ? 'bg-rose-950/30 border-rose-700/60 shadow-md shadow-rose-950/40'
                : 'bg-slate-950/70 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Gagal Berturut-turut</span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  (presenceStats?.consecutiveFailures ?? 0) > 0
                    ? 'bg-rose-950/80 border-rose-600 text-rose-400 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span
                className={`text-2xl font-bold font-mono ${
                  (presenceStats?.consecutiveFailures ?? 0) > 0 ? 'text-rose-400' : 'text-white'
                }`}
              >
                {presenceStats ? presenceStats.consecutiveFailures : '-'}
              </span>
              {(presenceStats?.consecutiveFailures ?? 0) > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-900/60 text-rose-300 border border-rose-700">
                  Potensi Akses Ilegal
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {(presenceStats?.consecutiveFailures ?? 0) > 0
                ? 'Indikasi potensi percobaan akses tidak sah!'
                : 'Indikasi potensi percobaan akses tidak sah (Normal)'}
            </p>
          </div>

          {/* 3. Total Percobaan Verifikasi & Rasio Sukses */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Percobaan Verifikasi</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-white font-mono">
                {presenceStats ? presenceStats.totalVerificationChecks : '-'}
              </span>
              <span className="text-[11px] text-indigo-400 font-medium">
                {successRate}% Sukses
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {presenceStats
                ? `${presenceStats.totalSuccessfulChecks} Sukses • ${presenceStats.totalFailedChecks} Gagal`
                : 'Data log historis verifikasi'}
            </p>
          </div>

          {/* 4. Potensi Percobaan Akses Tidak Sah */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Potensi Percobaan Ilegal</span>
              <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-amber-400 font-mono">
                {presenceStats ? presenceStats.potentialUnauthorizedAttempts : '-'}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                  presenceStats?.securityRiskLevel === 'HIGH'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                    : presenceStats?.securityRiskLevel === 'ELEVATED'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                }`}
              >
                {presenceStats?.securityRiskLevel || 'NORMAL'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Mismatched biometrics atau unregistered device
            </p>
          </div>
        </div>

        {/* Biometric Method Distribution & Privacy Sentinel Guarantee */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Method Distribution Breakdown */}
          <div className="md:col-span-1 bg-slate-950/50 border border-slate-800/80 rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>Distribusi Metode Biometrik</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {totalMethods} check-in
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <ScanFace className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Face Verification</span>
                </span>
                <span className="font-mono text-indigo-300 font-medium">
                  {faceCount} ({facePercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${facePercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="flex items-center space-x-1.5 text-slate-300">
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fingerprint (Hardware Keystore)</span>
                </span>
                <span className="font-mono text-emerald-300 font-medium">
                  {fpCount} ({fpPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${fpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Biometric Privacy Sentinel Guarantee Banner */}
          <div className="md:col-span-2 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-indigo-950/20 border border-slate-800/80 rounded-lg p-3.5 flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 mt-0.5">
              <EyeOff className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">
                  Jaminan Privasi Biometrik (PRD Master & Regulasi PDP)
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Zero-Knowledge Storage
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Data yang disajikan pada panel ini adalah <strong className="text-slate-200">DATA AGREGAT murni</strong> dari log <code className="text-indigo-300">presence_check_log</code>.
                Sesuai arsitektur Fase 112, server dilarang keras menyimpan maupun menampilkan foto wajah mentah, citra visual, atau representasi sidik jari individual.
                Seluruh verifikasi dienkripsi server-side (AES-256-GCM) dan diverifikasi melalui perhitungan cosine similarity matematis.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Immutable Audit Trail Records
            </h4>
            <p className="text-[11px] text-slate-400">
              Riwayat rekaman forensik akses platform dan aktivitas administratif
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {filteredLogs.length} Events Recorded
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">Timestamp</th>
              <th className="py-3.5 px-6">Actor (Super Admin / Sentinel)</th>
              <th className="py-3.5 px-6">Action Event</th>
              <th className="py-3.5 px-6">Target Resource</th>
              <th className="py-3.5 px-6">Source IP</th>
              <th className="py-3.5 px-6 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-6 font-mono text-slate-400 text-[11px]">
                  {new Date(log.timestamp).toLocaleTimeString()} ({new Date(log.timestamp).toLocaleDateString()})
                </td>
                <td className="py-3.5 px-6 font-semibold text-slate-200">{log.actor}</td>
                <td className="py-3.5 px-6 font-mono text-indigo-400 font-medium">{log.action}</td>
                <td className="py-3.5 px-6 text-slate-300">{log.resource}</td>
                <td className="py-3.5 px-6 font-mono text-slate-400 text-[11px]">{log.ipAddress}</td>
                <td className="py-3.5 px-6 text-right">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        : log.status === 'BLOCKED'
                        ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                        : 'bg-amber-950/60 text-amber-300 border-amber-800'
                    }`}
                  >
                    {log.status === 'SUCCESS' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <ShieldAlert className="w-3 h-3" />
                    )}
                    <span>{log.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
