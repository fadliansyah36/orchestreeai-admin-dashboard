import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Save,
  RefreshCw,
  Calculator,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { api } from '../lib/api';
import {
  CreditMeteringRuleItem,
  CreditCostFactorItem,
  CreditCostContext,
  CreditCostResult,
} from '../types';

export const CreditMeteringConfigurationScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metering' | 'factors' | 'simulator'>('metering');
  const [rules, setRules] = useState<CreditMeteringRuleItem[]>([]);
  const [factors, setFactors] = useState<CreditCostFactorItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Metering Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CreditMeteringRuleItem | null>(null);
  const [ruleFormData, setRuleFormData] = useState<CreditMeteringRuleItem>({
    activityType: '',
    baseWorkUnitMin: 1.0,
    baseWorkUnitMax: 1.0,
    unitType: 'per_interaction',
    description: '',
  });

  // Cost Factor Modal
  const [isFactorModalOpen, setIsFactorModalOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState<CreditCostFactorItem | null>(null);
  const [factorFormData, setFactorFormData] = useState<CreditCostFactorItem>({
    factorType: 'model_cost_factor',
    factorKey: '',
    factorValue: 1.0,
    description: '',
  });

  // Live Simulator Form State
  const [simContext, setSimContext] = useState<CreditCostContext>({
    activityType: 'chat_completion',
    complexityLevel: 'medium',
    modelUsed: 'gemini-1.5-flash',
    toolsInvoked: 1,
    executionType: 'sync',
  });
  const [simResult, setSimResult] = useState<CreditCostResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCreditMeteringRules();
      setRules(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat credit metering rules dari backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFactors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getCreditCostFactors();
      setFactors(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat credit cost factors dari backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'metering') {
      fetchRules();
    } else if (activeTab === 'factors') {
      fetchFactors();
    } else if (activeTab === 'simulator') {
      fetchRules();
      fetchFactors();
    }
  }, [activeTab, fetchRules, fetchFactors]);

  const handleOpenCreateRule = () => {
    setEditingRule(null);
    setRuleFormData({
      activityType: '',
      baseWorkUnitMin: 1.0,
      baseWorkUnitMax: 1.0,
      unitType: 'per_interaction',
      description: '',
    });
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (r: CreditMeteringRuleItem) => {
    setEditingRule(r);
    setRuleFormData({ ...r });
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const payload: CreditMeteringRuleItem = {
        ...ruleFormData,
        baseWorkUnitMin: Number(ruleFormData.baseWorkUnitMin),
        baseWorkUnitMax: Number(ruleFormData.baseWorkUnitMax),
      };
      await api.saveCreditMeteringRule(payload);
      setSuccessMessage(`Metering rule "${ruleFormData.activityType}" berhasil disimpan ke PostgreSQL`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setIsRuleModalOpen(false);
      await fetchRules();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan metering rule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (activityType: string) => {
    if (!confirm(`Hapus metering rule: ${activityType}?`)) return;
    setIsLoading(true);
    try {
      await api.deleteCreditMeteringRule(activityType);
      setSuccessMessage(`Rule ${activityType} berhasil dihapus.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchRules();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus metering rule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateFactor = () => {
    setEditingFactor(null);
    setFactorFormData({
      factorType: 'model_cost_factor',
      factorKey: '',
      factorValue: 1.0,
      description: '',
    });
    setIsFactorModalOpen(true);
  };

  const handleOpenEditFactor = (f: CreditCostFactorItem) => {
    setEditingFactor(f);
    setFactorFormData({ ...f });
    setIsFactorModalOpen(true);
  };

  const handleSaveFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const payload: CreditCostFactorItem = {
        ...factorFormData,
        factorValue: Number(factorFormData.factorValue),
      };
      await api.saveCreditCostFactor(payload);
      setSuccessMessage(`Cost factor "${factorFormData.factorType} : ${factorFormData.factorKey}" berhasil disimpan.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setIsFactorModalOpen(false);
      await fetchFactors();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan cost factor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFactor = async (factorType: string, factorKey: string) => {
    if (!confirm(`Hapus cost factor: ${factorType} / ${factorKey}?`)) return;
    setIsLoading(true);
    try {
      await api.deleteCreditCostFactor(factorType, factorKey);
      setSuccessMessage(`Cost factor ${factorKey} berhasil dihapus.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchFactors();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus cost factor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    setError(null);
    try {
      const res = await api.simulateCreditCost(simContext);
      setSimResult(res);
    } catch (err: any) {
      setError(err.message || 'Simulasi kalkulasi kredit gagal');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Notice */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Credit Metering & Multiplier Factors Hub</h2>
            <p className="text-xs text-slate-400">
              Formula: <code>AI CREDIT COST = Base Work Unit × Complexity × Model × Tool × Execution</code>.
              Perubahan angka langsung aktif secara real-time tanpa rebuild.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono bg-teal-950/60 text-teal-400 border border-teal-800/60 px-2.5 py-1 rounded">
            PostgreSQL Real-Time Formula
          </span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-center space-x-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex items-center space-x-3 text-emerald-300 text-sm">
          <Check className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="flex-1">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('metering')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center space-x-2 ${
            activeTab === 'metering'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>2.1 Credit Metering Rules (Base Work Units)</span>
        </button>
        <button
          onClick={() => setActiveTab('factors')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center space-x-2 ${
            activeTab === 'factors'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>2.2 Credit Cost Factors (Multipliers)</span>
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center space-x-2 ${
            activeTab === 'simulator'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>2.3 Live Calculation Simulator</span>
        </button>
      </div>

      {/* TAB 1: Metering Rules */}
      {activeTab === 'metering' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Credit Metering Rules</h3>
              <p className="text-xs text-slate-400">
                Nilai <code>base_work_unit</code> menentukan basis unit kredit untuk tiap jenis aktivitas AI.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchRules}
                disabled={isLoading}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleOpenCreateRule}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Metering Rule</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Activity Type</th>
                  <th className="py-3 px-4">Base Work Unit (Min - Max)</th>
                  <th className="py-3 px-4">Unit Type</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      {isLoading ? 'Memuat data rules...' : 'Tidak ada metering rules terdaftar.'}
                    </td>
                  </tr>
                ) : (
                  rules.map((r) => (
                    <tr key={r.activityType} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-400">{r.activityType}</td>
                      <td className="py-3 px-4 font-mono text-emerald-300">
                        {r.baseWorkUnitMin} — {r.baseWorkUnitMax}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{r.unitType}</td>
                      <td className="py-3 px-4 text-slate-300">{r.description}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditRule(r)}
                          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-teal-400 rounded transition-colors"
                          title="Edit Rule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(r.activityType)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
                          title="Hapus Rule"
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
      )}

      {/* TAB 2: Cost Factors */}
      {activeTab === 'factors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Credit Cost Multiplier Factors</h3>
              <p className="text-xs text-slate-400">
                Faktor pengali komputasi: <code>complexity_factor</code>, <code>model_cost_factor</code>, <code>tool_factor</code>, dan <code>execution_factor</code>.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchFactors}
                disabled={isLoading}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleOpenCreateFactor}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Cost Factor</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Factor Type</th>
                  <th className="py-3 px-4">Factor Key</th>
                  <th className="py-3 px-4">Multiplier Value</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {factors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      {isLoading ? 'Memuat faktor...' : 'Tidak ada data cost factors.'}
                    </td>
                  </tr>
                ) : (
                  factors.map((f) => (
                    <tr key={`${f.factorType}_${f.factorKey}`} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">{f.factorType}</td>
                      <td className="py-3 px-4 font-mono font-bold text-teal-400">{f.factorKey}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">
                        {f.factorValue}x
                      </td>
                      <td className="py-3 px-4 text-slate-300">{f.description}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditFactor(f)}
                          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-teal-400 rounded transition-colors"
                          title="Edit Factor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFactor(f.factorType, f.factorKey)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
                          title="Hapus Factor"
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
      )}

      {/* TAB 3: Live Calculation Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Live Credit Cost Simulator</h3>
            <p className="text-xs text-slate-400">
              Uji seketika hasil perhitungan formula kredit langsung terhadap aturan dan multiplier di database Supabase PostgreSQL.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Context Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm text-xs">
              <h4 className="font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Parameter Konteks Eksekusi AI</span>
              </h4>

              <div>
                <label className="block text-slate-400 mb-1">Jenis Aktivitas (Activity Type)</label>
                <select
                  value={simContext.activityType}
                  onChange={(e) => setSimContext({ ...simContext, activityType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none font-mono"
                >
                  <option value="chat_completion">chat_completion</option>
                  <option value="tool_execution">tool_execution</option>
                  <option value="workflow_step">workflow_step</option>
                  <option value="fine_tuning">fine_tuning</option>
                  <option value="embedding">embedding</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tingkat Kompleksitas</label>
                  <select
                    value={simContext.complexityLevel}
                    onChange={(e) => setSimContext({ ...simContext, complexityLevel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="simple">simple (1.0x)</option>
                    <option value="medium">medium (1.5x)</option>
                    <option value="complex">complex (2.5x)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Model LLM yang Digunakan</label>
                  <select
                    value={simContext.modelUsed}
                    onChange={(e) => setSimContext({ ...simContext, modelUsed: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none font-mono"
                  >
                    <option value="gemini-1.5-flash">gemini-1.5-flash (0.8x)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (1.5x)</option>
                    <option value="gpt-4o">gpt-4o (2.0x)</option>
                    <option value="claude-3-5-sonnet">claude-3-5-sonnet (2.0x)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Jumlah MCP Tools Terpanggil</label>
                  <input
                    type="number"
                    min={0}
                    value={simContext.toolsInvoked}
                    onChange={(e) => setSimContext({ ...simContext, toolsInvoked: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-500">0: no_tool (1.0x), 1: single (1.2x), &gt;1: multi (1.5x)</span>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tipe Eksekusi</label>
                  <select
                    value={simContext.executionType}
                    onChange={(e) => setSimContext({ ...simContext, executionType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="sync">sync (1.0x)</option>
                    <option value="async_background">async_background (0.9x)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors shadow-sm mt-2"
              >
                <Calculator className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Menghitung via Backend...' : 'Hitung Estimasi Kredit (Live API)'}</span>
              </button>
            </div>

            {/* Live Result Display */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm text-xs flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Hasil Kalkulasi Estimasi Kredit Live</span>
                </h4>

                {!simResult ? (
                  <div className="py-12 text-center text-slate-500">
                    Klik tombol "Hitung Estimasi Kredit" untuk memverifikasi kalkulasi rumus.
                  </div>
                ) : (
                  <div className="space-y-4 pt-3">
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-center">
                      <span className="text-slate-400 text-xs">Total AI Credit Cost Diperlukan:</span>
                      <div className="text-3xl font-mono font-bold text-emerald-400 mt-1">
                        {simResult.estimatedCost} <span className="text-sm font-normal text-slate-400">Credits</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-slate-300 mb-2">Breakdown Multiplier Faktor:</h5>
                      <div className="space-y-1.5 bg-slate-950 border border-slate-800/80 rounded-lg p-3 font-mono text-[11px]">
                        <div className="flex justify-between text-slate-300">
                          <span>Base Work Unit:</span>
                          <span className="text-teal-400 font-semibold">{simResult.breakdown.base ?? 1.0}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Complexity Factor:</span>
                          <span className="text-teal-400 font-semibold">{simResult.breakdown.complexity ?? 1.0}x</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Model Cost Factor:</span>
                          <span className="text-teal-400 font-semibold">{simResult.breakdown.model ?? 1.0}x</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Tool Factor:</span>
                          <span className="text-teal-400 font-semibold">{simResult.breakdown.tool ?? 1.0}x</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Execution Factor:</span>
                          <span className="text-teal-400 font-semibold">{simResult.breakdown.execution ?? 1.0}x</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3 text-[11px] text-emerald-300 flex items-center space-x-2">
                      <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>
                        Tervalidasi: Perubahan angka base_work_unit di tabel atas langsung mempengaruhi hasil di sini tanpa rebuild server!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL METERING RULE */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">
                {editingRule ? `Edit Rule: ${editingRule.activityType}` : 'Tambah Credit Metering Rule'}
              </h3>
              <button onClick={() => setIsRuleModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Activity Type</label>
                <input
                  type="text"
                  required
                  value={ruleFormData.activityType}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, activityType: e.target.value })}
                  placeholder="e.g. chat_completion"
                  disabled={!!editingRule}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Base Work Unit Min</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min={0.1}
                    value={ruleFormData.baseWorkUnitMin}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, baseWorkUnitMin: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Base Work Unit Max</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min={0.1}
                    value={ruleFormData.baseWorkUnitMax}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, baseWorkUnitMax: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Unit Type</label>
                <input
                  type="text"
                  required
                  value={ruleFormData.unitType}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, unitType: e.target.value })}
                  placeholder="e.g. per_interaction"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={ruleFormData.description}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded font-medium shadow-sm"
                >
                  Simpan Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL COST FACTOR */}
      {isFactorModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">
                {editingFactor ? `Edit Factor: ${editingFactor.factorKey}` : 'Tambah Credit Cost Factor'}
              </h3>
              <button onClick={() => setIsFactorModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFactor} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Factor Type</label>
                <select
                  value={factorFormData.factorType}
                  onChange={(e) => setFactorFormData({ ...factorFormData, factorType: e.target.value })}
                  disabled={!!editingFactor}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none font-mono"
                >
                  <option value="complexity_factor">complexity_factor</option>
                  <option value="model_cost_factor">model_cost_factor</option>
                  <option value="tool_factor">tool_factor</option>
                  <option value="execution_factor">execution_factor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Factor Key</label>
                <input
                  type="text"
                  required
                  value={factorFormData.factorKey}
                  onChange={(e) => setFactorFormData({ ...factorFormData, factorKey: e.target.value })}
                  placeholder="e.g. gpt-4o, simple, multi_tool"
                  disabled={!!editingFactor}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Multiplier Value (Factor Value)</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  min={0.01}
                  value={factorFormData.factorValue}
                  onChange={(e) => setFactorFormData({ ...factorFormData, factorValue: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={factorFormData.description}
                  onChange={(e) => setFactorFormData({ ...factorFormData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFactorModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded font-medium shadow-sm"
                >
                  Simpan Factor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
