import React, { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw, Trash2, Search, Tag } from 'lucide-react';
import { api } from '../lib/api';
import { MasterDataItem, MasterDataCategoryInfo } from '../types';

export const MasterDataManagementScreen: React.FC = () => {
  const [categories, setCategories] = useState<MasterDataCategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [items, setItems] = useState<MasterDataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cats, dataItems] = await Promise.all([
        api.getMasterDataCategories(),
        api.getMasterData(selectedCategory === 'ALL' ? undefined : selectedCategory),
      ]);
      setCategories(cats);
      setItems(dataItems);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat master data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
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
