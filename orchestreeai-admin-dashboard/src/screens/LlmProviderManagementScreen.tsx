import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Trash2,
  Edit2,
  Power,
  ImageIcon,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api';
import { LlmProviderItem, ImageProviderItem } from '../types';

export const LlmProviderManagementScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'llm' | 'image'>('llm');
  const [providers, setProviders] = useState<LlmProviderItem[]>([]);
  const [imageProviders, setImageProviders] = useState<ImageProviderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // LLM Modal State
  const [isLlmModalOpen, setIsLlmModalOpen] = useState<boolean>(false);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [providerName, setProviderName] = useState('');
  const [providerType, setProviderType] = useState('OPENROUTER');
  const [baseUrl, setBaseUrl] = useState('');
  const [taskSpecialization, setTaskSpecialization] = useState('general');
  const [fallbackPriority, setFallbackPriority] = useState<number>(1);
  const [apiKey, setApiKey] = useState('');
  const [modelsInput, setModelsInput] = useState('');

  // Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [imageName, setImageName] = useState('');
  const [imageProviderType, setImageProviderType] = useState('OPENAI_DALLE3');
  const [imagePriority, setImagePriority] = useState<number>(1);
  const [imageApiKey, setImageApiKey] = useState('');
  const [imageModelsInput, setImageModelsInput] = useState('dall-e-3, dall-e-2');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [llmData, imgData] = await Promise.all([
        api.getLlmProviders(),
        api.getImageProviders()
      ]);
      setProviders(llmData);
      setImageProviders(imgData);
    } catch (err) {
      console.error('Failed fetching providers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddLlmModal = () => {
    setEditingProviderId(null);
    setProviderName('');
    setProviderType('OPENROUTER');
    setBaseUrl('');
    setTaskSpecialization('general');
    setFallbackPriority(providers.length + 1);
    setApiKey('');
    setModelsInput('deepseek-chat, gpt-4o, claude-3-5-sonnet');
    setIsLlmModalOpen(true);
  };

  const openEditLlmModal = (p: LlmProviderItem) => {
    setEditingProviderId(p.id || p.provider);
    setProviderName(p.provider);
    setProviderType(p.providerType || 'OPENROUTER');
    setBaseUrl(p.baseUrl || '');
    setTaskSpecialization(p.taskSpecialization || 'general');
    setFallbackPriority(p.priority || 1);
    setApiKey('');
    setModelsInput(p.models.join(', '));
    setIsLlmModalOpen(true);
  };

  const handleSaveLlmProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedModels = modelsInput
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);

      if (editingProviderId) {
        await api.updateLlmProvider(editingProviderId, {
          name: providerName,
          providerType,
          baseUrl: baseUrl || undefined,
          taskSpecialization,
          fallbackPriority,
          models: parsedModels,
        });
      } else {
        await api.createLlmProvider({
          name: providerName,
          providerType,
          baseUrl: baseUrl || undefined,
          taskSpecialization,
          fallbackPriority,
          apiKey: apiKey || undefined,
          models: parsedModels,
        });
      }
      setIsLlmModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan konfigurasi LLM provider');
    }
  };

  const handleDeleteLlm = async (id: string) => {
    if (!confirm(`Hapus provider ini dari failover routing pool?`)) return;
    try {
      await api.deleteLlmProvider(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus provider');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.toggleLlmProviderStatus(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status provider');
    }
  };

  const handleSaveImageProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedModels = imageModelsInput
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);

      await api.createImageProvider({
        name: imageName,
        providerType: imageProviderType,
        models: parsedModels,
        priority: imagePriority,
        apiKey: imageApiKey || undefined,
      });
      setIsImageModalOpen(false);
      setImageName('');
      setImageApiKey('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal mendaftarkan image provider');
    }
  };

  const handleDeleteImageProvider = async (id: string) => {
    if (!confirm('Hapus image generation provider ini?')) return;
    try {
      await api.deleteImageProvider(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus provider');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-[11px] font-semibold mb-2">
            <Zap className="w-3 h-3" />
            <span>Bagian A • PRD Master 15.1, 25.4 (Fase 93.A) & Studio Layout (Fase 82)</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            LLM & Image Generation Routing Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi urutan failover multi-provider, isolasi kredensial per environment, circuit breaker, dan spesialisasi tugas autonomous agent.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Health Ping</span>
          </button>
          {activeTab === 'llm' ? (
            <button
              onClick={openAddLlmModal}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-950/60 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah LLM Provider</span>
            </button>
          ) : (
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-950/60 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Image Provider</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('llm')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'llm'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>LLM Providers Pool ({providers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'image'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image Generation Providers ({imageProviders.length})</span>
        </button>
      </div>

      {/* Tab Content: LLM Providers */}
      {activeTab === 'llm' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((p) => {
              const isActive = p.status === 'ACTIVE';
              return (
                <div
                  key={p.id || p.provider}
                  className={`bg-slate-900 border rounded-xl p-5 shadow-lg relative flex flex-col justify-between transition-all ${
                    isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-75'
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base">{p.provider}</h3>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                              Priority #{p.priority}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                                isActive
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                                  : 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                                }`}
                              />
                              <span>{p.status}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleToggleStatus(p.id || p.provider)}
                          title={isActive ? 'Nonaktifkan Provider' : 'Aktifkan Provider'}
                          className={`p-1.5 rounded-lg border transition ${
                            isActive
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditLlmModal(p)}
                          title="Edit Provider"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLlm(p.id || p.provider)}
                          title="Hapus Provider"
                          className="p-1.5 rounded-lg bg-slate-800 text-rose-400 border border-slate-700 hover:bg-rose-950/60 hover:border-rose-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Tipe Adaptor:</span>
                        <span className="text-slate-200 font-mono text-[11px] font-semibold">
                          {p.providerType || 'OPENROUTER'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Spesialisasi:</span>
                        <span className="text-indigo-300 font-medium capitalize">
                          {p.taskSpecialization || 'general'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Avg Latensi:</span>
                        <span className="text-emerald-400 font-mono font-medium">{p.latencyMs} ms</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Secret Token:</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {p.apiKeySecretRef || '••••••••'}
                        </span>
                      </div>

                      {/* Models Badge List */}
                      <div className="mt-3">
                        <span className="text-[11px] text-slate-400 block mb-1.5">Registered Models:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {p.models.map((model) => (
                            <span
                              key={model}
                              className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono"
                            >
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: Image Providers */}
      {activeTab === 'image' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {imageProviders.map((img) => (
              <div
                key={img.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{img.name}</h3>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                            Priority #{img.priority}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                            {img.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteImageProvider(img.id)}
                      title="Hapus Image Provider"
                      className="p-1.5 rounded-lg bg-slate-800 text-rose-400 border border-slate-700 hover:bg-rose-950/60 hover:border-rose-800 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Provider Engine:</span>
                      <span className="text-purple-300 font-mono text-[11px] font-semibold">
                        {img.providerType}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Avg Render Latency:</span>
                      <span className="text-emerald-400 font-mono font-medium">{img.latencyMs} ms</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Secret Token:</span>
                      <span className="text-slate-400 font-mono text-[10px]">{img.apiKeySecretRef}</span>
                    </div>

                    <div className="mt-3">
                      <span className="text-[11px] text-slate-400 block mb-1.5">Supported Image Models:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {img.models.map((model) => (
                          <span
                            key={model}
                            className="text-[10px] bg-slate-800 text-purple-200 px-2 py-0.5 rounded border border-purple-900/60 font-mono"
                          >
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LLM Modal */}
      {isLlmModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">
              {editingProviderId ? 'Edit LLM Provider' : 'Daftarkan LLM Provider Baru'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Tentukan parameter failover, prioritas fallback, dan model ketersediaan.
            </p>

            <form onSubmit={handleSaveLlmProvider} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Provider
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Anthropic, Groq, Ollama"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tipe Adapter Provider
                  </label>
                  <select
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="OPENROUTER">OpenRouter Multi-Model</option>
                    <option value="GROQ">Groq LPU Ultra-Low Latency</option>
                    <option value="DEEPSEEK">DeepSeek Native API</option>
                    <option value="OPENAI">OpenAI Direct</option>
                    <option value="ANTHROPIC">Anthropic Claude</option>
                    <option value="OLLAMA">Ollama Local On-Premise</option>
                    <option value="CUSTOM_REST">Custom Enterprise REST LLM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Spesialisasi Tugas
                  </label>
                  <select
                    value={taskSpecialization}
                    onChange={(e) => setTaskSpecialization(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="general">General Reasoning & Chat</option>
                    <option value="fast_intent">Fast Intent Classifier (Low Latency)</option>
                    <option value="reasoning">Deep Strategic CoT Reasoning</option>
                    <option value="coding">Code & MCP Execution Specialist</option>
                    <option value="vision">Vision Multimodal Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Fallback Priority (1 = Utama)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={fallbackPriority}
                    onChange={(e) => setFallbackPriority(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Base URL (Opsional jika standard)
                </label>
                <input
                  type="text"
                  placeholder="https://api.groq.com/openai/v1"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  API Key / Secret Token (Tersimpan aman di Vault)
                </label>
                <input
                  type="password"
                  placeholder={editingProviderId ? 'Kosongkan jika tidak ingin mengubah key' : 'sk-••••••••••••••••'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Model Identifiers (Dipisah koma)
                </label>
                <input
                  type="text"
                  required
                  placeholder="deepseek-chat, gpt-4o, claude-3-5-sonnet"
                  value={modelsInput}
                  onChange={(e) => setModelsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLlmModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  {editingProviderId ? 'Simpan Perubahan' : 'Daftarkan Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Provider Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Tambah Image Provider</h3>
            <p className="text-xs text-slate-400 mb-5">
              Integrasi engine generative image enterprise untuk Studio Layout (Fase 82).
            </p>

            <form onSubmit={handleSaveImageProvider} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Provider
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: OpenAI DALL-E, Stability AI"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Provider Engine
                </label>
                <select
                  value={imageProviderType}
                  onChange={(e) => setImageProviderType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="OPENAI_DALLE3">OpenAI DALL-E 3</option>
                  <option value="STABILITY_FLUX">Black Forest Labs FLUX / SD</option>
                  <option value="MIDJOURNEY_GATEWAY">Midjourney Gateway API</option>
                  <option value="APIMART_IMAGE">Apimart Generative Image</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Priority
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={imagePriority}
                  onChange={(e) => setImagePriority(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-••••••••••••••••"
                  value={imageApiKey}
                  onChange={(e) => setImageApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Supported Models (Dipisah koma)
                </label>
                <input
                  type="text"
                  required
                  value={imageModelsInput}
                  onChange={(e) => setImageModelsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Simpan Image Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
