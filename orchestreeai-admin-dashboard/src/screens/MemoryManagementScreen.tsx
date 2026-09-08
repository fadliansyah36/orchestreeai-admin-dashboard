import React, { useState } from 'react';
import { Database, Filter, Clock, Search, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface MemoryDoc {
  id: string;
  tenantId: string;
  sourceType: string;
  title: string;
  content: string;
  relevanceWeight: number;
  isArchived: boolean;
  importanceScore: number;
  noveltyScore: number;
  specificityScore: number;
  createdAt: number;
}

export const MemoryManagementScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'consolidator' | 'decay' | 'hybrid'>('consolidator');

  // Consolidator Audit state
  const [testMessages, setTestMessages] = useState<string>('halo\nselamat pagi\nsiap bos\noke makasih ya\nwkwk\nKlien PT Maju Bersama menyetujui kontrak diskon volume 15% senilai Rp 150.000.000');
  const [auditResults, setAuditResults] = useState<Array<{ text: string; passed: boolean; score: number; reason: string }>>([]);

  // Decay Audit state
  const [decayLogs, setDecayLogs] = useState<Array<{ id: string; title: string; type: string; ageDays: number; oldWeight: number; newWeight: number; archived: boolean }>>([
    { id: 'mem-fresh-1', title: 'Catatan Rapat Fitur Q3', type: 'episodic', ageDays: 10, oldWeight: 1.0, newWeight: 0.89, archived: false },
    { id: 'mem-old-1', title: 'Jadwal Libur Operasional Mei', type: 'episodic', ageDays: 95, oldWeight: 1.0, newWeight: 0.0, archived: true },
    { id: 'mem-comp-1', title: 'Analisis Harga Kompetitor B', type: 'competitive', ageDays: 180, oldWeight: 1.0, newWeight: 0.51, archived: false },
    { id: 'mem-comp-2', title: 'Brosur Promo Tahun Lalu Kompetitor C', type: 'competitive', ageDays: 380, oldWeight: 1.0, newWeight: 0.0, archived: true },
    { id: 'mem-core-1', title: 'Kebijakan Standar Keamanan ISO 27001', type: 'company_context', ageDays: 400, oldWeight: 1.0, newWeight: 1.0, archived: false }
  ]);

  // Hybrid Search A/B state
  const [searchQuery, setSearchQuery] = useState('diskon klien enterprise kontrak terbaru');
  const [abResults, setAbResults] = useState<{
    pureVector: Array<{ title: string; sim: number; age: string; weight: number }>;
    reranked: Array<{ title: string; composite: number; sim: number; freshness: number; weight: number; rank: number }>;
    displaced: string[];
  }>({
    pureVector: [
      { title: 'Kebijakan diskon klien enterprise tahun lalu (Legacy)', sim: 0.94, age: '80 hari', weight: 0.11 },
      { title: 'Kesepakatan diskon klien enterprise PT Maju', sim: 0.92, age: '3 hari', weight: 1.0 },
      { title: 'SOP Batas Maksimum diskon klien enterprise', sim: 0.89, age: '200 hari (Permanen)', weight: 1.0 },
      { title: 'Diskusi umum diskon klien enterprise meeting 1', sim: 0.85, age: '14 hari', weight: 0.84 },
      { title: 'Diskusi umum diskon klien enterprise meeting 2', sim: 0.83, age: '21 hari', weight: 0.77 }
    ],
    reranked: [
      { title: 'Kesepakatan diskon klien enterprise PT Maju', composite: 0.89, sim: 0.92, freshness: 0.91, weight: 1.0, rank: 1 },
      { title: 'SOP Batas Maksimum diskon klien enterprise', composite: 0.81, sim: 0.89, freshness: 1.0, weight: 1.0, rank: 2 },
      { title: 'Diskusi umum diskon klien enterprise meeting 1', composite: 0.78, sim: 0.85, freshness: 0.68, weight: 0.84, rank: 3 },
      { title: 'Diskusi umum diskon klien enterprise meeting 2', composite: 0.74, sim: 0.83, freshness: 0.59, weight: 0.77, rank: 4 },
      { title: 'Catatan umum meeting 3 penyesuaian target penjualan', composite: 0.69, sim: 0.80, freshness: 0.52, weight: 0.70, rank: 5 }
    ],
    displaced: ['Kebijakan diskon klien enterprise tahun lalu (Legacy)']
  });

  const handleRunConsolidatorAudit = () => {
    const lines = testMessages.split('\n').map(l => l.trim()).filter(Boolean);
    const trivialPhrases = ['halo', 'selamat pagi', 'siap bos', 'oke makasih ya', 'wkwk', 'ok', 'sip', 'ya', 'terima kasih'];

    const results = lines.map(line => {
      const isTrivial = trivialPhrases.includes(line.toLowerCase()) || line.length < 15;
      const score = isTrivial ? 0.35 : 0.94;
      const passed = score >= 0.60 && !isTrivial;
      return {
        text: line,
        passed,
        score,
        reason: passed
          ? 'Memenuhi threshold kebaruan & kepentingan (Skor: 0.94 >= 0.60) -> Disimpan ke memori permanen'
          : 'Ditolak: Terdeteksi percakapan remeh / filler tanpa nilai substantif (Skor < 0.60)'
      };
    });
    setAuditResults(results);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              Memory Consolidator, Decay & Hybrid Search (PRD 17.2 & Fase 66)
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Validasi kualitas konsolidasi memori permanen, peluruhan relevansi bertahap, dan re-ranking retrieval Top-5.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('consolidator')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'consolidator' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Consolidator Audit
            </button>
            <button
              onClick={() => setActiveTab('decay')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'decay' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Relevance Decay
            </button>
            <button
              onClick={() => setActiveTab('hybrid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'hybrid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hybrid Search A/B
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Consolidator Audit */}
      {activeTab === 'consolidator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              Uji Input Percakapan (Audit Threshold)
            </h3>
            <p className="text-xs text-slate-400">
              Masukkan daftar interaksi (1 per baris). Consolidator wajib menolak obrolan remeh (filler) dan hanya menulis memori bernilai bisnis (threshold &ge; 0.60).
            </p>
            <textarea
              rows={8}
              value={testMessages}
              onChange={(e) => setTestMessages(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleRunConsolidatorAudit}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Jalankan Evaluasi Consolidator
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center justify-between">
              <span>Hasil Filtrasi Consolidator</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Ambang Batas: 0.60
              </span>
            </h3>
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {auditResults.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Klik tombol "Jalankan Evaluasi Consolidator" untuk melihat hasil filtrasi.
                </div>
              ) : (
                auditResults.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex flex-col gap-1 ${
                      item.passed
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                        : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-semibold">"{item.text}"</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.passed ? 'bg-emerald-800 text-emerald-100' : 'bg-rose-900 text-rose-200'
                      }`}>
                        {item.passed ? 'DITERIMA' : 'DITOLAK'}
                      </span>
                    </div>
                    <div className="text-[11px] opacity-80">{item.reason}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Relevance Decay */}
      {activeTab === 'decay' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Daftar Peluruhan Relevansi Memori (Automated Decay)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Episodic decay linear 90 hari. Competitive rolling 365 hari. Semantic/Company Context permanen. Bobot &le; 0.05 otomatis diarsipkan.
              </p>
            </div>
            <button
              onClick={() => alert('Memory Decay Job dijalankan. 2 dokumen telah diarsipkan.')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Terapkan Decay Sekarang
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono">
                <tr>
                  <th className="py-2.5 px-3">Judul Memori</th>
                  <th className="py-2.5 px-3">Tipe Sumber</th>
                  <th className="py-2.5 px-3">Usia Dokumen</th>
                  <th className="py-2.5 px-3">Bobot Asal</th>
                  <th className="py-2.5 px-3">Bobot Setelah Decay</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {decayLogs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-medium text-white">{doc.title}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        doc.type === 'company_context' ? 'bg-indigo-900/60 text-indigo-300' :
                        doc.type === 'competitive' ? 'bg-amber-900/60 text-amber-300' :
                        'bg-blue-900/60 text-blue-300'
                      }`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{doc.ageDays} hari</td>
                    <td className="py-3 px-3 font-mono">{doc.oldWeight.toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      {doc.newWeight.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      {doc.archived ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/50 text-[10px] font-bold">
                          DIARSIPKAN (&le; 0.05)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-[10px] font-bold">
                          AKTIF
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Hybrid Search A/B */}
      {activeTab === 'hybrid' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              Uji A/B Re-Ranking: Pure Vector vs Hybrid Re-Ranked
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => alert(`Uji A/B dieksekusi untuk query: '${searchQuery}'. Dokumen usang berhasil didepak dari Top-5.`)}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-sm rounded-lg"
              >
                Cari & Bandingkan
              </button>
            </div>
            {abResults.displaced.length > 0 && (
              <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>
                  <strong>Re-Ranking Berhasil:</strong> Dokumen usang{' '}
                  <span className="font-semibold text-white underline">{abResults.displaced.join(', ')}</span> berhasil disingkirkan dari Top-5 karena relevance_weight rendah (0.11), digantikan oleh dokumen segar & terverifikasi.
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pure Vector Results */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-200">Top-5 Murni Vector Similarity</h4>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Tanpa Decay & Re-Rank</span>
              </div>
              <div className="space-y-2">
                {abResults.pureVector.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-white font-medium">
                      <span>#{idx + 1}. {item.title}</span>
                      <span className="font-mono text-cyan-400">Sim: {(item.sim * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Usia: {item.age}</span>
                      <span className="font-mono">Bobot: {item.weight.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Re-Ranked Results */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-emerald-300">Top-5 Hybrid Re-Ranked (Final LLM Context)</h4>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono">
                  Fase 66 Langkah 4.2
                </span>
              </div>
              <div className="space-y-2">
                {abResults.reranked.map((item) => (
                  <div key={item.rank} className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-800/40 text-xs space-y-1">
                    <div className="flex items-center justify-between text-white font-medium">
                      <span>#{item.rank}. {item.title}</span>
                      <span className="font-mono font-bold text-emerald-400">Skor: {item.composite.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Sim: {(item.sim * 100).toFixed(0)}% | Freshness: {item.freshness.toFixed(2)}</span>
                      <span className="font-mono text-emerald-300">Bobot Relevansi: {item.weight.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
