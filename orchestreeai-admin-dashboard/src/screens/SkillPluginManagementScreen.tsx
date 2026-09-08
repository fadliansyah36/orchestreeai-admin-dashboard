import React, { useState, useEffect } from 'react';
import {
  Puzzle,
  Plus,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Code2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Upload,
  RefreshCw,
  Search,
  Filter,
  FileCode,
  FileText
} from 'lucide-react';
import { api } from '../lib/api';
import { SkillPluginItem, SkillPluginUploadResult } from '../types';

export const SkillPluginManagementScreen: React.FC = () => {
  const [plugins, setPlugins] = useState<SkillPluginItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [runtimeFilter, setRuntimeFilter] = useState('ALL');

  // Basic Create Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [author, setAuthor] = useState('');
  const [runtime, setRuntime] = useState('WASM');

  // Security Upload Modal (Fase 92.C)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadPluginName, setUploadPluginName] = useState('');
  const [uploadVersion, setUploadVersion] = useState('1.0.0');
  const [uploadAuthor, setUploadAuthor] = useState('');
  const [manifestJson, setManifestJson] = useState('{\n  "name": "enterprise-sentiment",\n  "version": "1.0.0",\n  "declaredTools": ["sentiment_analyzer", "text_cleaner"]\n}');
  const [skillDefinitionMd, setSkillDefinitionMd] = useState('# Enterprise Skill\n\n## Tools\n- `sentiment_analyzer`\n- `text_cleaner`\n\n## Permissions\n- Read-only text analysis');
  const [uploadResult, setUploadResult] = useState<SkillPluginUploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchPlugins = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSkillPlugins();
      setPlugins(data);
    } catch (err) {
      console.error('Failed fetching skill plugins', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const handleRegisterPlugin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSkillPlugin({
        name,
        version,
        author,
        executionRuntime: runtime,
      });
      setIsModalOpen(false);
      setName('');
      setAuthor('');
      await fetchPlugins();
    } catch (err: any) {
      alert(err.message || 'Gagal mendaftarkan skill plugin');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateSkillPluginStatus(id, newStatus);
      await fetchPlugins();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status plugin');
    }
  };

  const handleDeletePlugin = async (plugin: SkillPluginItem) => {
    if (!confirm(`Hapus plugin "${plugin.name}" (${plugin.id}) dari marketplace?`)) return;
    try {
      await api.deleteSkillPlugin(plugin.id);
      await fetchPlugins();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus plugin');
    }
  };

  const handleUploadPlugin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadResult(null);
    try {
      const res = await api.uploadSkillPlugin({
        pluginName: uploadPluginName,
        version: uploadVersion,
        author: uploadAuthor,
        manifestJson,
        skillDefinitionMd,
      });
      setUploadResult(res);
      await fetchPlugins();
    } catch (err: any) {
      alert(err.message || 'Upload gagal diverifikasi oleh engine keamanan');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredPlugins = plugins.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesRuntime = runtimeFilter === 'ALL' || p.runtime === runtimeFilter;
    return matchesSearch && matchesStatus && matchesRuntime;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[11px] font-semibold mb-2">
            <Puzzle className="w-3 h-3" />
            <span>Bagian C • PRD Master Fase 92.C (Skill Marketplace, WASM & JVM Runtime)</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Autonomous Skill Plugin Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Validasi keamanan statis AST, persetujuan modul WASM/JVM/Python, audit risk score, dan lifecycle marketplace skill platform.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPlugins}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setUploadResult(null);
              setUploadPluginName('');
              setUploadAuthor('');
              setIsUploadModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-950/60 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Plugin Package (ZIP/AST)</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-950/60 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Daftar Manual</span>
          </button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari plugin atau author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="APPROVED">Disetujui (APPROVED)</option>
            <option value="PENDING_APPROVAL">Menunggu Review (PENDING)</option>
            <option value="REJECTED">Ditolak (REJECTED)</option>
          </select>

          <select
            value={runtimeFilter}
            onChange={(e) => setRuntimeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Semua Runtime</option>
            <option value="WASM">WASM Sandbox</option>
            <option value="JVM_NATIVE">JVM Native Plugin</option>
            <option value="PYTHON_CONTAINER">Python Container Microservice</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Total Plugin: <span className="font-bold text-white font-mono">{filteredPlugins.length}</span>
        </div>
      </div>

      {/* Plugins Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">Skill Name & Version</th>
              <th className="py-3.5 px-6">Author</th>
              <th className="py-3.5 px-6">Execution Runtime</th>
              <th className="py-3.5 px-6">Declared Tools / Capabilities</th>
              <th className="py-3.5 px-6">Total Installs</th>
              <th className="py-3.5 px-6">Approval Status</th>
              <th className="py-3.5 px-6 text-right">Moderasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredPlugins.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Tidak ada skill plugin yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredPlugins.map((plugin) => (
                <tr key={plugin.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
                        <Puzzle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{plugin.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">v{plugin.version}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-slate-300 font-medium">
                    {plugin.author}
                  </td>

                  <td className="py-4 px-6">
                    <span className="inline-flex items-center space-x-1 font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      <Code2 className="w-3 h-3 text-purple-400" />
                      <span>{plugin.runtime}</span>
                    </span>
                  </td>

                  <td className="py-4 px-6 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {(plugin.declaredTools || []).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono bg-slate-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-900/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span className="font-mono font-medium text-slate-300">
                      {plugin.downloads.toLocaleString()}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    {plugin.status === 'APPROVED' && (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>Disetujui</span>
                      </span>
                    )}
                    {plugin.status === 'PENDING_APPROVAL' && (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 border border-amber-800/60 text-amber-400">
                        <Clock className="w-3 h-3" />
                        <span>Menunggu Review</span>
                      </span>
                    )}
                    {plugin.status === 'REJECTED' && (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/60 border border-rose-800/60 text-rose-400">
                        <XCircle className="w-3 h-3" />
                        <span>Ditolak</span>
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      {plugin.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleStatusChange(plugin.id, 'APPROVED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60 text-[11px] font-semibold"
                          title="Setujui"
                        >
                          Approve
                        </button>
                      )}
                      {plugin.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleStatusChange(plugin.id, 'REJECTED')}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/60 hover:bg-rose-900/60 text-[11px] font-semibold"
                          title="Tolak"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePlugin(plugin)}
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

      {/* Manual Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Daftarkan Skill Plugin Manual</h3>
            <p className="text-xs text-slate-400 mb-5">
              Registrasikan metadata modul autonomous skill baru ke dalam sistem katalog.
            </p>

            <form onSubmit={handleRegisterPlugin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Skill Plugin
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: Indonesian E-Faktur Generator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Versi Semantic
                </label>
                <input
                  type="text"
                  required
                  placeholder="1.0.0"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Author / Pengembang
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: PT Nusantara FinTech / Orchestree Labs"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Runtime Lingkungan Eksekusi
                </label>
                <select
                  value={runtime}
                  onChange={(e) => setRuntime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="WASM">WASM Sandbox Isolated (Default)</option>
                  <option value="JVM_NATIVE">JVM Native In-Process Plugin</option>
                  <option value="PYTHON_CONTAINER">Python Container Microservice</option>
                </select>
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
                  Daftarkan Plugin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload AST / Package Security Modal (Fase 92.C) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">
              Upload & Validasi Keamanan Plugin Package (Fase 92.C)
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Engine akan melakukan static AST security scan, deteksi tool declarations, dan audit perizinan sandbox WASM sebelum diterbitkan ke marketplace.
            </p>

            <form onSubmit={handleUploadPlugin} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Plugin
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: doc-sentiment-analyzer"
                    value={uploadPluginName}
                    onChange={(e) => setUploadPluginName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Versi
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadVersion}
                    onChange={(e) => setUploadVersion(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: FinLabs"
                    value={uploadAuthor}
                    onChange={(e) => setUploadAuthor(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                  <FileCode className="w-3.5 h-3.5 text-purple-400" />
                  <span>Plugin Manifest (manifest.json)</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={manifestJson}
                  onChange={(e) => setManifestJson(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Skill Definition & Permissions (SKILL.md)</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={skillDefinitionMd}
                  onChange={(e) => setSkillDefinitionMd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Upload Result Feedback */}
              {uploadResult && (
                <div
                  className={`p-4 rounded-xl border ${
                    uploadResult.securityScanPassed
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold text-xs mb-1">
                    {uploadResult.securityScanPassed ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    )}
                    <span>
                      {uploadResult.securityScanPassed
                        ? 'Validasi Keamanan Lolos • Status APPROVED'
                        : 'Validasi Keamanan Gagal • Ditolak'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Declared Tools Terdaftar:{' '}
                    <span className="font-mono font-semibold">
                      {uploadResult.declaredTools.join(', ') || 'None'}
                    </span>
                  </p>
                  {uploadResult.validationErrors && (
                    <ul className="list-disc list-inside text-[10px] text-rose-400 mt-1">
                      {uploadResult.validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Memindai AST...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Validasi & Upload Plugin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
