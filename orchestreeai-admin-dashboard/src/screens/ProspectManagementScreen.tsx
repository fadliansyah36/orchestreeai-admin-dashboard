import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  MessageSquare,
  Sparkles,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  X,
  FileText,
  ShieldCheck,
  Send,
  Loader2
} from 'lucide-react';
import { api } from '../lib/api';
import {
  ProspectRegistrationItem,
  ProspectAnalyticsResponse,
  TrialSelectionStatus,
  MeetingStatus
} from '../types';

export const ProspectManagementScreen: React.FC = () => {
  const [prospects, setProspects] = useState<ProspectRegistrationItem[]>([]);
  const [analytics, setAnalytics] = useState<ProspectAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInterest, setFilterInterest] = useState<string>('');
  const [filterTrialStatus, setFilterTrialStatus] = useState<string>('');
  const [filterMeetingStatus, setFilterMeetingStatus] = useState<string>('');

  // Modals state
  const [selectedProspect, setSelectedProspect] = useState<ProspectRegistrationItem | null>(null);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingDateTime, setMeetingDateTime] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  const [trialSelectModalOpen, setTrialSelectModalOpen] = useState(false);
  const [trialStatusChoice, setTrialStatusChoice] = useState<'selected_for_trial' | 'not_selected' | 'rejected'>('selected_for_trial');
  const [trialNotes, setTrialNotes] = useState('');

  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchProspectsData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [prospectList, analyticsData] = await Promise.all([
        api.getProspectRegistrations({
          search: searchQuery || undefined,
          interest_option: filterInterest || undefined,
          trial_status: filterTrialStatus || undefined,
          meeting_status: filterMeetingStatus || undefined
        }),
        api.getProspectAnalytics().catch(() => null)
      ]);
      setProspects(prospectList);
      if (analyticsData) setAnalytics(analyticsData);
    } catch (err: any) {
      console.error('Failed to load prospects:', err);
      setErrorMsg(err.message || 'Gagal memuat data pendaftaran prospek.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspectsData();
  }, [filterInterest, filterTrialStatus, filterMeetingStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProspectsData();
  };

  // 1. Action: Select for Trial (Toggle / Set status)
  const handleConfirmTrialSelection = async () => {
    if (!selectedProspect) return;
    setActionLoading(selectedProspect.id);
    setErrorMsg(null);
    try {
      const updated = await api.selectProspectForTrial(selectedProspect.id, {
        status: trialStatusChoice,
        adminNotes: trialNotes
      });
      setSuccessMsg(`Status kurasi trial prospek ${updated.companyName} berhasil diubah menjadi: ${updated.trialSelectionStatus}`);
      setTrialSelectModalOpen(false);
      fetchProspectsData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengubah status kurasi trial.');
    } finally {
      setActionLoading(null);
    }
  };

  // 2. Action: Schedule Meeting
  const handleConfirmScheduleMeeting = async () => {
    if (!selectedProspect || !meetingDateTime) {
      setErrorMsg('Waktu & tanggal meeting wajib diisi.');
      return;
    }
    setActionLoading(selectedProspect.id);
    setErrorMsg(null);
    try {
      const updated = await api.scheduleProspectMeeting(selectedProspect.id, {
        meetingScheduledAt: new Date(meetingDateTime).toISOString(),
        meetingStatus: 'scheduled',
        adminNotes: meetingNotes
      });
      setSuccessMsg(`Meeting presentasi untuk ${updated.companyName} berhasil dijadwalkan!`);
      setMeetingModalOpen(false);
      fetchProspectsData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menjadwalkan meeting.');
    } finally {
      setActionLoading(null);
    }
  };

  // 3. Action: Activate Trial Tenant
  const handleActivateTrial = async (prospect: ProspectRegistrationItem) => {
    if (!window.confirm(`Aktifkan Tenant Trial 7 Hari (1,000 AI Credits) untuk perusahaan "${prospect.companyName}"?`)) {
      return;
    }
    setActionLoading(prospect.id);
    setErrorMsg(null);
    try {
      const res = await api.activateProspectTrial(prospect.id);
      setSuccessMsg(res.message);
      fetchProspectsData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengaktifkan tenant trial.');
    } finally {
      setActionLoading(null);
    }
  };

  // Format WhatsApp Link
  const getWhatsAppLink = (phone: string, name: string, company: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    const text = encodeURIComponent(
      `Halo ${name}, salam dari tim OrchestreeAI. Kami telah menerima pendaftaran kuesioner Anda untuk perusahaan ${company}. Kami ingin mendiskusikan ketersediaan slot trial & integrasi autonomous AI workforce untuk Anda.`
    );
    return `https://wa.me/${clean}?text=${text}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <span>Manajemen Pendaftar Prospek</span>
            <span className="text-xs uppercase font-mono px-3 py-1 rounded-full bg-[#08B85C]/20 text-[#08B85C] border border-[#08B85C]/30">
              Super Admin Kurasi
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pendaftar kuesioner publik tidak dibatasi. Super Admin secara independen mengkurasi dan memilih 36 slot Trial 7 Hari serta menjadwalkan presentasi solusi.
          </p>
        </div>

        <button
          onClick={fetchProspectsData}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Alert Banners */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#08B85C]/15 border border-[#08B85C]/30 text-[#08B85C] text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-white hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Analytics KPI Header (36 Slots Trial Counter) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Registered */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pendaftar</span>
            <Users className="w-4 h-4 text-[#16B7D9]" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{analytics?.totalRegistered ?? prospects.length}</span>
            <span className="text-xs text-slate-400">Organisasi</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Lead masuk dari kuesioner landing page</p>
        </div>

        {/* Card 2: 36 Slots Trial Selection (CRITICAL RULE) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#08B85C]/15 to-[#16B7D9]/10 border border-[#08B85C]/30 shadow-lg shadow-[#08B85C]/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#08B85C]">Slot Trial Terpilih</span>
            <Sparkles className="w-4 h-4 text-[#08B85C]" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{analytics?.selectedForTrialCount ?? 0}</span>
            <span className="text-xs font-bold text-[#08B85C]">/ 36 Kuota Maksimal</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#08B85C] to-[#16B7D9] h-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  (((analytics?.selectedForTrialCount ?? 0) / 36) * 100),
                  100
                )}%`
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">Dipilih sendiri oleh Super Admin</p>
        </div>

        {/* Card 3: Activated Trial Tenants */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Trial Diaktivasi</span>
            <ShieldCheck className="w-4 h-4 text-[#1976E8]" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{analytics?.activatedTrialCount ?? 0}</span>
            <span className="text-xs text-slate-400">Tenant Aktif</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tenant live dengan 1,000 AI Credits</p>
        </div>

        {/* Card 4: Scheduled Meetings */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Presentasi Terjadwal</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{analytics?.scheduledMeetingCount ?? 0}</span>
            <span className="text-xs text-slate-400">Sesi Demo</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Meeting solusi enterprise terjadwal</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama pendaftar, email, nama perusahaan, atau nomor telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#16B7D9] transition-all"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#1976E8] text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
          >
            Cari
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-white/5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Opsi Minat Pendaftar</label>
            <select
              value={filterInterest}
              onChange={(e) => setFilterInterest(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B1A3A] border border-white/15 text-white text-xs focus:outline-none focus:border-[#16B7D9]"
            >
              <option value="">Semua Opsi Minat</option>
              <option value="direct_trial_or_subscription">Ikut Seleksi 36 Slot Trial</option>
              <option value="schedule_meeting_presentation">Jadwalkan Presentasi Solusi</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status Kurasi Trial</label>
            <select
              value={filterTrialStatus}
              onChange={(e) => setFilterTrialStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B1A3A] border border-white/15 text-white text-xs focus:outline-none focus:border-[#16B7D9]"
            >
              <option value="">Semua Status Trial</option>
              <option value="not_selected">Belum Dipilih (Not Selected)</option>
              <option value="selected_for_trial">Dipilih untuk Trial (Selected)</option>
              <option value="trial_activated">Tenant Trial Diaktivasi</option>
              <option value="rejected">Ditolak / Tidak Memenuhi Syarat</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status Meeting Presentasi</label>
            <select
              value={filterMeetingStatus}
              onChange={(e) => setFilterMeetingStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B1A3A] border border-white/15 text-white text-xs focus:outline-none focus:border-[#16B7D9]"
            >
              <option value="">Semua Status Meeting</option>
              <option value="not_scheduled">Belum Terjadwal</option>
              <option value="scheduled">Terjadwal (Scheduled)</option>
              <option value="completed">Selesai Presentasi</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prospect Table / Cards */}
      <div className="rounded-3xl border border-white/10 bg-[#071226]/80 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#16B7D9] mx-auto" />
            <p className="text-xs">Memuat daftar pendaftar prospek...</p>
          </div>
        ) : prospects.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-white">Tidak ada data prospek yang cocok</p>
            <p className="text-xs">Coba ubah kata kunci pencarian atau bersihkan filter di atas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Pendaftar & Kontak</th>
                  <th className="px-5 py-3.5 font-bold">Perusahaan & Industri</th>
                  <th className="px-5 py-3.5 font-bold">Opsi Minat & Paket</th>
                  <th className="px-5 py-3.5 font-bold">Status Kurasi Trial</th>
                  <th className="px-5 py-3.5 font-bold">Status Meeting</th>
                  <th className="px-5 py-3.5 font-bold text-right">Aksi Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {prospects.map((p) => {
                  const isTrialActive = p.trialSelectionStatus === 'trial_activated';
                  const isTrialSelected = p.trialSelectionStatus === 'selected_for_trial';
                  const isMeetingScheduled = p.meetingStatus === 'scheduled';

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Column 1: Pendaftar & Kontak */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <strong className="text-white text-sm block font-bold">{p.fullName}</strong>
                          <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                            <Mail className="w-3 h-3 text-[#16B7D9]" />
                            <span>{p.email}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                            <Phone className="w-3 h-3 text-[#08B85C]" />
                            <span>{p.phoneNumber}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            Daftar: {new Date(p.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Perusahaan & Industri */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <strong className="text-white block font-semibold">{p.companyName}</strong>
                          <span className="text-slate-300 block text-[11px]">{p.jobTitle}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 inline-block border border-white/10">
                            {p.industryName || 'Industri Terbuka'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Ukuran: {p.companySizeRange || '11-50'} karyawan
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Opsi Minat & Paket */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {p.interestOption === 'direct_trial_or_subscription' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#08B85C]/15 border border-[#08B85C]/30 text-[#08B85C] text-[10px] font-bold">
                              <Sparkles className="w-3 h-3" />
                              <span>Seleksi Trial 7 Hari</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#1976E8]/15 border border-[#1976E8]/30 text-[#1976E8] text-[10px] font-bold">
                              <Calendar className="w-3 h-3" />
                              <span>Presentasi Enterprise</span>
                            </span>
                          )}
                          {p.interestedPlanName && (
                            <span className="text-[11px] text-slate-300 block">
                              Paket: <strong>{p.interestedPlanName}</strong>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Status Kurasi Trial */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {isTrialActive ? (
                            <span className="px-2.5 py-1 rounded-full bg-[#08B85C]/20 border border-[#08B85C]/40 text-[#08B85C] text-[11px] font-bold inline-flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Trial Diaktivasi</span>
                            </span>
                          ) : isTrialSelected ? (
                            <span className="px-2.5 py-1 rounded-full bg-[#16B7D9]/20 border border-[#16B7D9]/40 text-[#16B7D9] text-[11px] font-bold inline-flex items-center space-x-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Dipilih untuk Trial</span>
                            </span>
                          ) : p.trialSelectionStatus === 'rejected' ? (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-semibold">
                              Ditolak
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-white/10 text-slate-400 text-[10px]">
                              Belum Dipilih
                            </span>
                          )}
                          {p.activatedTenantId && (
                            <span className="text-[10px] font-mono text-slate-500 block">
                              ID: {p.activatedTenantId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Status Meeting */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {isMeetingScheduled ? (
                            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-bold inline-flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Terjadwal</span>
                            </span>
                          ) : p.meetingStatus === 'completed' ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                              Selesai
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-white/10 text-slate-400 text-[10px]">
                              Belum Dijadwalkan
                            </span>
                          )}
                          {p.meetingScheduledAt && (
                            <span className="text-[10px] text-purple-300 block">
                              {new Date(p.meetingScheduledAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 6: Aksi Super Admin */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* WhatsApp Direct */}
                          <a
                            href={getWhatsAppLink(p.phoneNumber, p.fullName, p.companyName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-[#08B85C]/15 hover:bg-[#08B85C]/30 text-[#08B85C] transition-colors"
                            title="Hubungi via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* Email Direct */}
                          <a
                            href={`mailto:${p.email}?subject=Tindak%20Lanjut%20Pendaftaran%20OrchestreeAI%20-%20${encodeURIComponent(p.companyName)}`}
                            className="p-2 rounded-lg bg-[#1976E8]/15 hover:bg-[#1976E8]/30 text-[#1976E8] transition-colors"
                            title="Kirim Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>

                          {/* Kurasi Trial Selection Button */}
                          <button
                            onClick={() => {
                              setSelectedProspect(p);
                              setTrialStatusChoice(p.trialSelectionStatus === 'selected_for_trial' ? 'not_selected' : 'selected_for_trial');
                              setTrialNotes(p.adminNotes || '');
                              setTrialSelectModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Ubah Status Kurasi Trial"
                          >
                            Kurasi Trial
                          </button>

                          {/* Schedule Meeting Button */}
                          <button
                            onClick={() => {
                              setSelectedProspect(p);
                              setMeetingDateTime(p.meetingScheduledAt ? new Date(p.meetingScheduledAt).toISOString().slice(0, 16) : '');
                              setMeetingNotes(p.adminNotes || '');
                              setMeetingModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Jadwalkan Presentasi"
                          >
                            Meeting
                          </button>

                          {/* Activate Trial Button (Direct Provisioning) */}
                          {!isTrialActive && (
                            <button
                              onClick={() => handleActivateTrial(p)}
                              disabled={actionLoading === p.id}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#08B85C] to-[#16B7D9] text-white text-[11px] font-extrabold shadow-md shadow-[#08B85C]/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
                              title="Aktivasi Tenant Trial 7 Hari (1,000 Credits)"
                            >
                              {actionLoading === p.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <span>Aktivasi</span>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Kurasi Trial Selection */}
      {trialSelectModalOpen && selectedProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#071226] border border-white/15 rounded-3xl p-6 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#08B85C]" />
                <span>Kurasi Slot Trial 7 Hari</span>
              </h3>
              <button onClick={() => setTrialSelectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 text-slate-300">
              <p>Perusahaan: <strong className="text-white">{selectedProspect.companyName}</strong></p>
              <p>Pendaftar: <strong className="text-white">{selectedProspect.fullName}</strong> ({selectedProspect.jobTitle})</p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Pilih Keputusan Kurasi Super Admin:</label>
              <select
                value={trialStatusChoice}
                onChange={(e) => setTrialStatusChoice(e.target.value as 'selected_for_trial' | 'not_selected' | 'rejected')}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B1A3A] border border-white/15 text-white text-xs focus:outline-none focus:border-[#08B85C]"
              >
                <option value="selected_for_trial">✓ Pilih untuk 36 Slot Trial (Selected)</option>
                <option value="not_selected">○ Belum Dipilih / Masih Ditinjau</option>
                <option value="rejected">✕ Tolak / Tidak Memenuhi Kualifikasi</option>
              </select>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Catatan Admin / Evaluasi Kesiapan:</label>
                <textarea
                  rows={3}
                  value={trialNotes}
                  onChange={(e) => setTrialNotes(e.target.value)}
                  placeholder="Contoh: Kebutuhan integrasi logistik cocok dengan AI Dispatcher & Agent Fleet."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#08B85C]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setTrialSelectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-slate-300 hover:bg-white/20 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmTrialSelection}
                disabled={actionLoading === selectedProspect.id}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#08B85C] to-[#1976E8] text-xs font-bold text-white hover:brightness-110 transition-all flex items-center space-x-1.5"
              >
                {actionLoading === selectedProspect.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan Keputusan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Schedule Meeting */}
      {meetingModalOpen && selectedProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#071226] border border-white/15 rounded-3xl p-6 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Jadwalkan Presentasi & Demo Solusi</span>
              </h3>
              <button onClick={() => setMeetingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 text-slate-300">
              <p>Perusahaan: <strong className="text-white">{selectedProspect.companyName}</strong></p>
              <p>Kontak: <strong className="text-white">{selectedProspect.fullName}</strong> ({selectedProspect.phoneNumber})</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal & Waktu Sesi Demo:</label>
                <input
                  type="datetime-local"
                  value={meetingDateTime}
                  onChange={(e) => setMeetingDateTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0B1A3A] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Link Meeting & Agenda:</label>
                <textarea
                  rows={3}
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="Contoh: Google Meet: https://meet.google.com/xxx-yyyy-zzz. Agenda: Demo koordinasi Chief of Staff & Agent Sales."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setMeetingModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-slate-300 hover:bg-white/20 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmScheduleMeeting}
                disabled={actionLoading === selectedProspect.id}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-[#1976E8] text-xs font-bold text-white hover:brightness-110 transition-all flex items-center space-x-1.5"
              >
                {actionLoading === selectedProspect.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Jadwalkan Sesi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
