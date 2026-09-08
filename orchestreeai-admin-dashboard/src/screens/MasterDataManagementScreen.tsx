import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Search,
  Tag,
  FileText,
  Trash2,
  Edit2,
  RefreshCw,
  FolderTree,
  CheckCircle,
  Sparkles,
  Layers,
  Filter
} from 'lucide-react';
import { api } from '../lib/api';
import { MasterDataItem, MasterDataCategoryInfo } from '../types';

export const MasterDataManagementScreen: React.FC = () => {
  const [categories, setCategories] = useState<MasterDataCategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('department_categories');
  const [items, setItems] = useState<MasterDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalCategory, setModalCategory] = useState<string>('department_categories');
  const [itemKey, setItemKey] = useState<string>('');
  const [itemValue, setItemValue] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');

  const fetchCategories = async () => {
    try {
      const cats = await api.getMasterDataCategories();
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0].categoryId);
      }
    } catch (err) {
      console.error('Failed fetching categories', err);
    }
  };

  const fetchItems = async (cat: string) => {
    setIsLoading(true);
    try {
      const data = await api.getMasterData(cat);
      setItems(data);
    } catch (err) {
      console.error('Failed fetching master data items', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchItems(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMasterData({
        category: modalCategory,
        key: itemKey,
        value: itemValue,
        description: itemDescription || undefined,
      });
      setIsModalOpen(false);
      setItemKey('');
      setItemValue('');
      setItemDescription('');
      await fetchCategories();
      await fetchItems(selectedCategory);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan master data');
    }
  };

  const handleDelete = async (item: MasterDataItem) => {
    if (!confirm(`Hapus entri "${item.key}" (${item.value})?`)) return;
    try {
      await api.deleteMasterData(item.id, item.category);
      await fetchCategories();
      await fetchItems(selectedCategory);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus entri master data');
    }
  };

  const openAddModal = (catId?: string) => {
    setModalCategory(catId || selectedCategory || 'department_categories');
    setItemKey('');
    setItemValue('');
    setItemDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MasterDataItem) => {
    setModalCategory(item.category);
    setItemKey(item.key);
    setItemValue(item.value);
    setItemDescription(item.description || '');
    setIsModalOpen(true);
  };

  const currentCategoryInfo = categories.find((c) => c.categoryId === selectedCategory);

  const filteredItems = items.filter((it) => {
    const q = searchQuery.toLowerCase();
    return (
      it.key.toLowerCase().includes(q) ||
      it.value.toLowerCase().includes(q) ||
      (it.description && it.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300 text-[11px] font-semibold mb-2">
            <Database className="w-3 h-3" />
            <span>Bagian B • PRD Master Fase 91 (10 Kategori Master Data Platform)</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Master Data & Industry Presets Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standardisasi katalog enterprise Indonesia: 14 Divisi, 9 Job Level, 20 Industri, Model Lisensi, Template Studio, hingga Sumber Data RAG Terverifikasi.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              fetchCategories();
              fetchItems(selectedCategory);
            }}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => openAddModal()}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-950/60 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Entri Master</span>
          </button>
        </div>
      </div>

      {/* 10 Category Quick Pills / Navigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
            <FolderTree className="w-4 h-4 text-emerald-400" />
            <span>Pilih Kategori Katalog (10 Domain Resmi):</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Total {categories.reduce((acc, c) => acc + c.itemCount, 0)} entri terdaftar
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.categoryId;
            return (
              <button
                key={cat.categoryId}
                onClick={() => {
                  setSelectedCategory(cat.categoryId);
                  setSearchQuery('');
                }}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-emerald-600/15 border-emerald-500/50 shadow-md shadow-emerald-950/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold truncate pr-1">{cat.displayName}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {cat.itemCount}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 truncate mt-1">
                  {cat.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder={`Cari di ${currentCategoryInfo?.displayName || 'katalog'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Reset
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-2">
          <span>Menampilkan</span>
          <span className="font-bold text-white font-mono">{filteredItems.length}</span>
          <span>dari {items.length} entri</span>
        </div>
      </div>

      {/* Table of Items */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-5 py-3">ID & Status</th>
                <th className="px-5 py-3">
                  {currentCategoryInfo?.keyLabel || 'Kode / Key'}
                </th>
                <th className="px-5 py-3">
                  {currentCategoryInfo?.valueLabel || 'Nama / Value'}
                </th>
                <th className="px-5 py-3">Deskripsi / Metadata</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>Memuat data katalog...</span>
                      </div>
                    ) : (
                      <span>Tidak ada entri master data yang sesuai kriteria pencarian.</span>
                    )}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-500">{item.id}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60">
                        {item.key}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-white">{item.value}</span>
                    </td>
                    <td className="px-5 py-3.5 max-w-md">
                      <p className="text-slate-400 text-xs line-clamp-2">
                        {item.description || '-'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg bg-slate-800 text-rose-400 border border-slate-700 hover:bg-rose-950/60 hover:border-rose-800 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Entri Master Data Platform</h3>
            <p className="text-xs text-slate-400 mb-5">
              Simpan entri katalog master data yang akan direferensikan oleh seluruh tenant.
            </p>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kategori Master Data
                </label>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.displayName} ({c.categoryId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kode / Kunci Unik (Key)
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: FIN, EXEC, LEVEL_5, IND_FINTECH"
                  value={itemKey}
                  onChange={(e) => setItemKey(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nilai / Nama Resmi (Value)
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: Finance & Accounting, Senior Vice President"
                  value={itemValue}
                  onChange={(e) => setItemValue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Deskripsi / Konteks Operasional
                </label>
                <textarea
                  rows={3}
                  placeholder="Catatan regulasi atau panduan peran..."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
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
                  Simpan Entri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
