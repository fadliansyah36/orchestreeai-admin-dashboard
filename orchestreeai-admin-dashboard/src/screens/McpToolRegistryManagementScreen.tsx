import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Search,
  Code,
  Lock,
  Power,
  Trash2,
  Edit2,
  RefreshCw,
  Activity,
  AlertOctagon,
  Eye,
  Sliders
} from 'lucide-react';
import { api } from '../lib/api';
import { McpToolItem } from '../types';

export const McpToolRegistryManagementScreen: React.FC = () => {
  const [tools, setTools] = useState<McpToolItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [requiredRole, setRequiredRole] = useState('STAFF_HUMAN');
  const [restrictedMode, setRestrictedMode] = useState('UNRESTRICTED');
  const [inputSchema, setInputSchema] = useState('{\n  "type": "object",\n  "properties": {},\n  "required": []\n}');

  // Schema Inspection Modal
  const [inspectSchemaTool, setInspectSchemaTool] = useState<McpToolItem | null>(null);

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMcpTools();
      setTools(data);
    } catch (err) {
      console.error('Failed fetching MCP tools', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const openAddModal = () => {
    setEditingToolId(null);
    setToolName('');
    setDescription('');
    setRiskLevel('LOW');
    setRequiredRole('STAFF_HUMAN');
    setRestrictedMode('UNRESTRICTED');
    setInputSchema('{\n  "type": "object",\n  "properties": {},\n  "required": []\n}');
    setIsModalOpen(true);
  };

  const openEditModal = (t: McpToolItem) => {
    setEditingToolId(t.id || t.name);
    setToolName(t.name);
    setDescription(t.description);
    setRiskLevel(t.riskLevel);
    setRequiredRole(t.requiredRole);
    setRestrictedMode(t.restrictedToOperationMode || 'UNRESTRICTED');
    setInputSchema(t.inputSchema || '{\n  "type": "object",\n  "properties": {}\n}');
    setIsModalOpen(true);
  };

  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingToolId) {
        await api.updateMcpTool(editingToolId, {
          name: toolName,
          description,
          riskLevel: riskLevel as any,
          requiredRole,
          restrictedToOperationMode: restrictedMode,
          inputSchema,
        });
      } else {
        await api.createMcpTool({
          name: toolName,
          description,
          riskLevel,
          requiredRole,
          restrictedToOperationMode: restrictedMode,
          inputSchema,
        });
      }
      setIsModalOpen(false);
      await fetchTools();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan MCP tool');
    }
  };

  const handleToggleKillSwitch = async (tool: McpToolItem) => {
    const isKill = tool.status === 'ACTIVE';
    const msg = isKill
      ? `AKTIFKAN KILL-SWITCH: Nonaktifkan paksa tool "${tool.name}" secara global untuk seluruh AI Agent?`
      : `PULIHKAN TOOL: Kembalikan "${tool.name}" ke status ACTIVE?`;
    if (!confirm(msg)) return;

    try {
      await api.toggleMcpToolKillSwitch(tool.id || tool.name);
      await fetchTools();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah kill-switch MCP tool');
    }
  };

  const handleDeleteTool = async (tool: McpToolItem) => {
    if (!confirm(`Hapus tool "${tool.name}" dari registry platform?`)) return;
    try {
      await api.deleteMcpTool(tool.id || tool.name);
      await fetchTools();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus MCP tool');
    }
  };

  const filteredTools = tools.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || t.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[11px] font-semibold mb-2">
            <Lock className="w-3 h-3" />
            <span>Bagian D • PRD Master 15.1 & 25.7 (Fase 93.B MCP Tool Registry)</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            MCP Tool Registry & Global Kill-Switch Guard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manajemen fungsi eksekusi Model Context Protocol, skema JSON Schema, pembatasan risk level, audit RBAC, dan circuit breaker darurat.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTools}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-950/60 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Tool MCP</span>
          </button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari tool MCP atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-full"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Semua Tingkat Risiko</option>
            <option value="LOW">LOW Risk</option>
            <option value="MEDIUM">MEDIUM Risk</option>
            <option value="HIGH">HIGH Risk</option>
            <option value="CRITICAL">CRITICAL Risk</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Total Terdaftar: <span className="font-bold text-white font-mono">{tools.length}</span> tools
        </div>
      </div>

      {/* MCP Tools Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-6">Tool Signature</th>
              <th className="py-3.5 px-6">Deskripsi Fungsional</th>
              <th className="py-3.5 px-6">Risk Level</th>
              <th className="py-3.5 px-6">RBAC Requirement</th>
              <th className="py-3.5 px-6">Status & Kill-Switch</th>
              <th className="py-3.5 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredTools.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  Tidak ada MCP tool yang sesuai.
                </td>
              </tr>
            ) : (
              filteredTools.map((tool) => {
                const isKillSwitched = tool.status === 'DISABLED_BY_KILLSWITCH';
                return (
                  <tr key={tool.id || tool.name} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                            isKillSwitched
                              ? 'bg-rose-950/60 border-rose-800/60 text-rose-400'
                              : 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                          }`}
                        >
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold font-mono text-white text-xs">{tool.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            ID: {tool.id || tool.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 max-w-sm">
                      <p className="text-slate-300 text-xs line-clamp-2">{tool.description}</p>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      {tool.riskLevel === 'CRITICAL' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-950/80 border border-rose-700/60 text-rose-300 font-bold text-[10px]">
                          <ShieldAlert className="w-3 h-3" />
                          <span>CRITICAL</span>
                        </span>
                      )}
                      {tool.riskLevel === 'HIGH' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-orange-950/80 border border-orange-700/60 text-orange-300 font-bold text-[10px]">
                          <ShieldAlert className="w-3 h-3" />
                          <span>HIGH</span>
                        </span>
                      )}
                      {tool.riskLevel === 'MEDIUM' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300 font-bold text-[10px]">
                          <AlertOctagon className="w-3 h-3" />
                          <span>MEDIUM</span>
                        </span>
                      )}
                      {tool.riskLevel === 'LOW' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold text-[10px]">
                          <ShieldCheck className="w-3 h-3" />
                          <span>LOW</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {tool.requiredRole}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      {isKillSwitched ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-400 font-bold text-[10px]">
                          <AlertOctagon className="w-3 h-3" />
                          <span>KILL-SWITCHED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setInspectSchemaTool(tool)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
                          title="Lihat Input Schema"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleKillSwitch(tool)}
                          className={`p-1.5 rounded-lg border transition ${
                            isKillSwitched
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60'
                              : 'bg-rose-950/60 text-rose-400 border-rose-800/60 hover:bg-rose-900/60'
                          }`}
                          title={isKillSwitched ? 'Nyalakan Kembali Tool' : 'Aktifkan Kill-Switch'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(tool)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
                          title="Edit Tool"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTool(tool)}
                          className="p-1.5 rounded-lg bg-slate-800 text-rose-400 border border-slate-700 hover:bg-rose-950/60 hover:border-rose-800 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit MCP Tool Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">
              {editingToolId ? 'Edit Tool MCP' : 'Daftarkan MCP Tool Baru'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Tentukan batasan izin akses, tingkat risiko operasional, dan parameter schema JSON.
            </p>

            <form onSubmit={handleSaveTool} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Tool Signature (Snake Case)
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: database_query, send_whatsapp_message"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Deskripsi Fungsional Tool
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Menjelaskan aksi yang dilakukan tool dan efek sampingnya..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tingkat Risiko (Risk Level)
                  </label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="LOW">LOW (Operasi Baca Bebas)</option>
                    <option value="MEDIUM">MEDIUM (Menulis/Mengubah Data Internal)</option>
                    <option value="HIGH">HIGH (Transaksi Finansial/Delete)</option>
                    <option value="CRITICAL">CRITICAL (Integrasi Eksternal ERP/Database Core)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Role Minimal (RBAC)
                  </label>
                  <select
                    value={requiredRole}
                    onChange={(e) => setRequiredRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="STAFF_HUMAN">STAFF_HUMAN</option>
                    <option value="DEPT_MANAGER">DEPT_MANAGER</option>
                    <option value="TENANT_ADMIN">TENANT_ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Restriksi Mode Operasional
                </label>
                <select
                  value={restrictedMode}
                  onChange={(e) => setRestrictedMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="UNRESTRICTED">Unrestricted (Semua Mode)</option>
                  <option value="SUPERVISED_ONLY">Supervised Only (Perlu Persetujuan Human-in-the-Loop)</option>
                  <option value="AUTONOMOUS_ONLY">Autonomous Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Input JSON Schema
                </label>
                <textarea
                  rows={5}
                  value={inputSchema}
                  onChange={(e) => setInputSchema(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-none"
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
                  {editingToolId ? 'Simpan Perubahan' : 'Daftarkan Tool'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schema Inspector Modal */}
      {inspectSchemaTool && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">
              Input Schema: <span className="font-mono text-amber-400">{inspectSchemaTool.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">{inspectSchemaTool.description}</p>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto max-h-80">
              {inspectSchemaTool.inputSchema || '{\n  "type": "object",\n  "properties": {}\n}'}
            </pre>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={() => setInspectSchemaTool(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
