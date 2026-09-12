import React, { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw, Trash2, Search, Tag, X } from 'lucide-react';
import { api } from '../lib/api';
import { MasterDataItem, MasterDataCategoryInfo } from '../types';
import { HonestErrorBanner, HonestErrorInfo } from '../components/HonestErrorBanner';

export const MasterDataManagementScreen: React.FC = () => {
  const [categories, setCategories] = useState<MasterDataCategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [items, setItems] = useState<MasterDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backendError, setBackendError] = useState<HonestErrorInfo | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<string>('INDUSTRY');
  const [newKey, setNewKey] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');

  const fetchData = async () => {
    setIsLoading(true);
    setBackendError(null);
    try {
      const [cats, dataItems] = await Promise.all([
        api.getMasterDataCategories(),
        api.getMasterData(selectedCategory === 'ALL' ? undefined : selectedCategory),
      ]);
      setCategories(cats);
      setItems(dataItems);
    } catch (err: any) {
      setBackendError({
        endpoint: `/admin/master-data${selectedCategory !== 'ALL' ? `?category=${selectedCategory}` : ''}`,
        status: err?.status || 500,
        message: err?.message || 'Gagal memuat master data.',
        rawDetails: err?.rawDetails || err,
      });
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat master data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleCreateMasterData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    setIsSubmitting(true);
    try {
      await api.createMasterData({
        category: newCategory.trim().toUpperCase(),
        key: newKey.trim(),
        value: newValue.trim(),
        description: newDescription.trim() || undefined,
      });
      setMessage({ type: 'success', text: `Master data "${newKey}" berhasil disimpan.` });
      setIsModalOpen(false);
      setNewKey('');
      setNewValue('');
      setNewDescription('');
      fetchData();
    } catch (err: any) {
      setBackendError({
        endpoint: '/admin/master-data',
        status: err?.status || 500,
        message: err?.message || 'Gagal membuat master data.',
        rawDetails: err?.rawDetails || err,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (item: MasterDataItem) => {
    if (!window.confirm(`Yakin ingin menghapus item "${item.key}"?`)) return;
    try {
      await api.deleteMasterData(item.id, item.category);
      setMessage({ type: 'success', text: `Item "${item.key}" berhasil dihapus.` });
      fetchData();
    } catch (err: any) {
      setBackendError({
        endpoint: `/admin/master-data/${item.category}/${item.id}`,
        status: err?.status || 500,
        message: err?.message || 'Gagal menghapus master data.',
        rawDetails: err?.rawDetails || err,
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>Platform Master Data & Domain Presets</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Katalog industri standar, template prompt guardrails, kamus divisi, dan parameter referensi AI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
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
            <span>Tambah Master Data</span>
          </button>
        </div>
      </div>

      {/* Honest Backend Error Banner */}
      <HonestErrorBanner error={backendError} onRetry={fetchData} isRetrying={isLoading} />

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

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            selectedCategory === 'ALL'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Semua Kategori
        </button>
        {categories.map((cat) => (
          <button
            key={cat.category}
            onClick={() => setSelectedCategory(cat.category)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedCategory === cat.category
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <span>{cat.category}</span>
            <span className="text-[10px] opacity-75 font-mono">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Items Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Key / Kode</th>
                <th className="px-4 py-3">Nilai / Value</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    {isLoading ? 'Memuat master data...' : 'Tidak ada master data untuk kategori ini.'}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-indigo-300 border border-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">{item.key}</td>
                    <td className="px-4 py-3 font-medium text-white">{item.value}</td>
                    <td className="px-4 py-3 text-slate-400">{item.description || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-400 transition"
                        title="Hapus Master Data"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Master Data */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Tambah Master Data Baru</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateMasterData} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Contoh: INDUSTRY, GUARDRAIL, PROMPT_TEMPLATE"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Key / Kode Unik</label>
                <input
                  type="text"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Contoh: HEALTHCARE, AGENT_SAFETY_V2"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nilai / Value</label>
                <textarea
                  required
                  rows={3}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Isi konten nilai atau konfigurasi JSON"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Deskripsi (Opsional)</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Keterangan singkat peruntukan item"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Master Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
