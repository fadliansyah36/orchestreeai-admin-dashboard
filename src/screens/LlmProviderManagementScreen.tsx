import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  RefreshCw,
  Zap,
  Power,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Activity,
} from 'lucide-react';
import { api } from '../lib/api';
import { LlmProviderItem, ImageProviderItem, LlmProviderModelItem } from '../types';

export const LlmProviderManagementScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'llm' | 'image'>('llm');
  const [llmProviders, setLlmProviders] = useState<LlmProviderItem[]>([]);
  const [imageProviders, setImageProviders] = useState<ImageProviderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Provider Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [providerName, setProviderName] = useState('');
  const [providerType, setProviderType] = useState('openai');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const [llmData, imgData] = await Promise.all([
        api.getLlmProviders(),
        api.getImageProviders(),
      ]);
      setLlmProviders(llmData);
      setImageProviders(imgData);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat provider LLM.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleToggleLlm = async (id: string, currentEnabled: boolean) => {
    try {
      await api.toggleLlmProviderStatus(id);
      setMessage({ type: 'success', text: `Status provider berhasil diperbarui.` });
      fetchProviders();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal mengubah status provider.' });
    }
  };

  const handleDeleteLlm = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus provider ini?')) return;
    try {
      await api.deleteLlmProvider(id);
      setMessage({ type: 'success', text: 'Provider berhasil dihapus.' });
      fetchProviders();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal menghapus provider.' });
    }
  };

  const handleCreateLlm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createLlmProvider({
        name: providerName,
        providerType,
        baseUrl: baseUrl || undefined,
        apiKey: apiKey || undefined,
        enabled: true,
      });
      setMessage({ type: 'success', text: `Provider ${providerName} berhasil ditambahkan.` });
      setIsModalOpen(false);
      setProviderName('');
      setBaseUrl('');
      setApiKey('');
      fetchProviders();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal menambahkan provider.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>LLM & Image Provider Routing Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manajemen model foundation AI, failover prioritization, circuit breaker, dan API credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProviders}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Provider</span>
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

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('llm')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'llm'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>LLM Reasoning & Chat ({llmProviders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'image'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image Generation Providers ({imageProviders.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'llm' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {llmProviders.map((provider) => (
            <div key={provider.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{provider.name}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {provider.providerType}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 truncate max-w-[200px]">
                    {provider.baseUrl || 'Official Cloud Endpoint'}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleLlm(provider.id, provider.enabled)}
                  className={`p-1.5 rounded-lg border transition ${
                    provider.enabled
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/40'
                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                  }`}
                  title={provider.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-t border-slate-800/60 text-slate-400">
                  <span>Prioritas Failover:</span>
                  <span className="font-semibold text-slate-200">#{provider.fallbackPriority ?? 1}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-slate-800/60 text-slate-400">
                  <span>Spesialisasi Task:</span>
                  <span className="font-semibold text-emerald-400">{provider.taskSpecialization || 'General Purpose'}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-slate-800/60 text-slate-400">
                  <span>Status Sirkuit:</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Activity className="w-3 h-3" />
                    <span>{provider.status || 'ONLINE'}</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {provider.models?.length ?? 0} Model Aktif
                </span>
                <button
                  onClick={() => handleDeleteLlm(provider.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition"
                  title="Hapus Provider"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {imageProviders.map((provider) => (
            <div key={provider.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{provider.name}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {provider.providerType}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Pri: #{provider.priority}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                <p className="font-semibold text-slate-300 mb-1">Model Terdaftar:</p>
                <div className="flex flex-wrap gap-1">
                  {provider.models?.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Provider */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <span>Registrasi LLM Provider Baru</span>
            </h3>
            <form onSubmit={handleCreateLlm} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Provider</label>
                <input
                  type="text"
                  required
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="Contoh: OpenAI Platform Dedicated"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tipe Provider</label>
                <select
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="openai">OpenAI (GPT-4o, o1, etc)</option>
                  <option value="anthropic">Anthropic (Claude 3.5 Sonnet/Opus)</option>
                  <option value="gemini">Google Gemini (1.5 Flash, 1.5 Pro)</option>
                  <option value="deepseek">DeepSeek (V3, R1 Reasoner)</option>
                  <option value="custom_ollama">Self-Hosted Ollama / vLLM</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Base URL (Opsional jika standard)</label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">API Key (Securely Encrypted)</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
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
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
