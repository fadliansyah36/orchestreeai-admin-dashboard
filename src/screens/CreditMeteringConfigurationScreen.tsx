import React, { useState, useEffect } from 'react';
import { Sliders, Plus, RefreshCw, Calculator, ShieldCheck, Zap, Layers } from 'lucide-react';
import { api } from '../lib/api';
import {
  CreditMeteringRuleItem,
  CreditCostFactorItem,
  CreditCostContext,
  CreditCostResult,
} from '../types';

export const CreditMeteringConfigurationScreen: React.FC = () => {
  const [rules, setRules] = useState<CreditMeteringRuleItem[]>([]);
  const [factors, setFactors] = useState<CreditCostFactorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cost simulator state
  const [simContext, setSimContext] = useState<CreditCostContext>({
    activityType: 'chat_completion',
    complexityLevel: 'simple',
    modelUsed: 'gemini-1.5-flash',
    toolsInvoked: 0,
    executionType: 'sync',
  });
  const [simResult, setSimResult] = useState<CreditCostResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rulesData, factorsData] = await Promise.all([
        api.getCreditMeteringRules(),
        api.getCreditCostFactors(),
      ]);
      setRules(rulesData);
      setFactors(factorsData);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat aturan credit metering.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await api.simulateCreditCost(simContext);
      setSimResult(res);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal melakukan simulasi biaya.' });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>Credit Metering & Multiplier Rules (Fase 114.2)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi Base Work Units dan bobot pengali: Complexity, Foundation Model, Tool Invocations, dan Execution Type.
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

      {/* Calculator Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-400" />
          <span>Live Credit Cost Calculator (Backend API)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Activity Type</label>
            <select
              value={simContext.activityType}
              onChange={(e) => setSimContext({ ...simContext, activityType: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
            >
              <option value="chat_completion">Chat Completion (1.0)</option>
              <option value="tool_execution">Tool Execution (1.5)</option>
              <option value="workflow_step">Workflow Step (0.8)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Complexity</label>
            <select
              value={simContext.complexityLevel}
              onChange={(e) => setSimContext({ ...simContext, complexityLevel: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
            >
              <option value="simple">Simple (1.0)</option>
              <option value="medium">Medium (1.5)</option>
              <option value="complex">Complex (2.5)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Model Used</label>
            <select
              value={simContext.modelUsed}
              onChange={(e) => setSimContext({ ...simContext, modelUsed: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (0.8)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (1.5)</option>
              <option value="gpt-4o">GPT-4o (2.0)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Tools Invoked</label>
            <select
              value={simContext.toolsInvoked}
              onChange={(e) => setSimContext({ ...simContext, toolsInvoked: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
            >
              <option value="0">Tanpa Tool (1.0)</option>
              <option value="1">1 Tool (1.2)</option>
              <option value="3">Multi-Tool (1.5)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {isSimulating ? 'Menghitung...' : 'Hitung Biaya'}
            </button>
          </div>
        </div>

        {simResult && (
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">Estimasi Biaya Transaksi:</span>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {simResult.estimatedCost} Kredit
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Formula: {simResult.breakdown.base} × {simResult.breakdown.complexity} × {simResult.breakdown.model} × {simResult.breakdown.tool} × {simResult.breakdown.execution}
            </div>
          </div>
        )}
      </div>

      {/* Tables of Rules & Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Base Work Units */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Base Work Unit Rules</h3>
          </div>
          <div className="divide-y divide-slate-800/60">
            {rules.map((r, idx) => (
              <div key={idx} className="p-3.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-white block">{r.activityType}</span>
                  <span className="text-slate-400 text-[11px]">{r.description || 'Base rule'}</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">{r.baseWorkUnits} Units</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Multiplier Factors */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Cost Multiplier Factors</h3>
          </div>
          <div className="divide-y divide-slate-800/60">
            {factors.map((f, idx) => (
              <div key={idx} className="p-3.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-white block">{f.factorKey}</span>
                  <span className="text-slate-400 text-[11px]">{f.factorType}</span>
                </div>
                <span className="font-mono text-indigo-400 font-bold">{f.multiplier}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
