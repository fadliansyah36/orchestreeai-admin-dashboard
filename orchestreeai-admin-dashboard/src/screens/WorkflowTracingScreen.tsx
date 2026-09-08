import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Cpu,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { api } from '../lib/api';

interface SpanRecord {
  spanId: string;
  traceId: string;
  executionId: string;
  tenantId: string;
  nodeId: string;
  nodeType: string;
  status: string;
  durationMs: number;
  startTimeMs: number;
  endTimeMs: number;
  attributes: Record<string, string>;
  errorMessage?: string;
}

interface ExecutionSummary {
  executionId: string;
  traceId: string;
  tenantId: string;
  nodeCount: number;
  totalDurationMs: number;
  status: string;
  startedAt: number;
}

interface CalibrationRecord {
  id: string;
  tenantId: string;
  confidenceBucket: number;
  claimedConfidence: number;
  actualAccuracy: number;
  sampleSize: number;
  deviation: number;
  isCalibrated: boolean;
  calibrationDate: number;
}

export const WorkflowTracingScreen: React.FC = () => {
  const [recentExecutions, setRecentExecutions] = useState<ExecutionSummary[]>([]);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [spans, setSpans] = useState<SpanRecord[]>([]);
  const [currentTraceId, setCurrentTraceId] = useState<string>('');
  const [isLoadingSpans, setIsLoadingSpans] = useState<boolean>(false);
  const [isLoadingExecutions, setIsLoadingExecutions] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calibration State
  const [calibrations, setCalibrations] = useState<CalibrationRecord[]>([]);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [auditSummary, setAuditSummary] = useState<string>('');

  const loadExecutions = async () => {
    setIsLoadingExecutions(true);
    try {
      const data = await api.getWorkflowTraces();
      if (Array.isArray(data)) {
        setRecentExecutions(data);
        if (data.length > 0 && !selectedExecutionId) {
          queryExecution(data[0].executionId);
        }
      }
    } catch (err: any) {
      console.error('Failed fetching traces', err);
    } finally {
      setIsLoadingExecutions(false);
    }
  };

  const queryExecution = async (execId: string) => {
    if (!execId.trim()) return;
    setIsLoadingSpans(true);
    setErrorMessage(null);
    setSelectedExecutionId(execId);
    try {
      const data = await api.getWorkflowTraceByExecution(execId);
      if (data && data.spans) {
        setSpans(data.spans);
        setCurrentTraceId(data.traceId || '');
      } else {
        setSpans([]);
        setErrorMessage(`Tidak ditemukan span OpenTelemetry untuk execution_id: ${execId}`);
      }
    } catch (err: any) {
      setSpans([]);
      setErrorMessage(err.message || 'Gagal memuat span trace');
    } finally {
      setIsLoadingSpans(false);
    }
  };

  const loadCalibration = async () => {
    try {
      const data = await api.getConfidenceCalibration('tenant-default');
      if (Array.isArray(data)) {
        setCalibrations(data);
      }
      const audit = await api.getConfidenceAuditReport('tenant-default');
      if (audit && audit.auditSummary) {
        setAuditSummary(audit.auditSummary);
      }
    } catch (err: any) {
      console.error('Failed fetching calibration', err);
    }
  };

  const handleTriggerCalibration = async () => {
    setIsCalibrating(true);
    try {
      await api.triggerConfidenceCalibration('tenant-default');
      await loadCalibration();
    } catch (err: any) {
      console.error('Calibration trigger error', err);
    } finally {
      setIsCalibrating(false);
    }
  };

  useEffect(() => {
    loadExecutions();
    loadCalibration();
  }, []);

  const totalDurationMs = spans.reduce((sum, s) => sum + s.durationMs, 0);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold mb-2">
            <Activity className="w-3 h-3" />
            <span>OpenTelemetry Tracing • Jaeger / Tempo OTLP Exporter</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Workflow Node Tracing & Observability</h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualisasi pelacakan span per node (satu trace_id per workflow execution) dengan durasi presisi dan status eksekusi.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
            OTel Collector: Connected
          </span>
          <button
            onClick={() => {
              loadExecutions();
              if (selectedExecutionId) queryExecution(selectedExecutionId);
              loadCalibration();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh Traces"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            queryExecution(searchQuery);
          }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari berdasarkan execution_id (contoh: exec-a1b2c3d4)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoadingSpans || !searchQuery.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition flex items-center space-x-2"
          >
            {isLoadingSpans ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Query Trace</span>
          </button>
        </form>

        {/* Quick Pills for Recent Executions */}
        {recentExecutions.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase">Eksekusi Alur Kerja Terbaru:</p>
            <div className="flex flex-wrap gap-2">
              {recentExecutions.slice(0, 8).map((ex) => (
                <button
                  key={ex.executionId}
                  onClick={() => {
                    setSearchQuery(ex.executionId);
                    queryExecution(ex.executionId);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono border transition flex items-center space-x-2 ${
                    selectedExecutionId === ex.executionId
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      ex.status === 'COMPLETED'
                        ? 'bg-emerald-400'
                        : ex.status === 'PAUSED_FOR_APPROVAL'
                        ? 'bg-amber-400'
                        : 'bg-red-400'
                    }`}
                  />
                  <span>{ex.executionId}</span>
                  <span className="text-[10px] text-slate-500">({ex.totalDurationMs}ms)</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Execution Spans Breakdown */}
      {selectedExecutionId && (
        <div className="space-y-4">
          {/* Metadata Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Workflow Execution</span>
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-bold font-mono text-white">{selectedExecutionId}</h3>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800">
                  {spans.length} Nodes Traced
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">OpenTelemetry Trace ID</span>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-indigo-300">
                  {currentTraceId || 'Generating...'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Total Trace Duration</span>
              <div className="flex items-center space-x-2 text-white font-bold text-lg font-mono">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{totalDurationMs} ms</span>
              </div>
            </div>
          </div>

          {/* Node Spans Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h4 className="font-semibold text-white text-sm">Seluruh Node dari Execution ({spans.length} Spans)</h4>
              </div>
              <span className="text-xs text-slate-400">Durasi per node tercatat via OTel Span</span>
            </div>

            {errorMessage ? (
              <div className="p-8 text-center text-amber-400 space-y-2">
                <AlertTriangle className="w-8 h-8 mx-auto" />
                <p className="text-sm font-semibold">{errorMessage}</p>
              </div>
            ) : spans.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tidak ada span yang ditemukan untuk eksekusi ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Node ID (Span Name)</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Durasi (ms)</th>
                      <th className="py-3 px-4 min-w-[200px]">Relative Timeline</th>
                      <th className="py-3 px-4">Span ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {spans.map((span, idx) => {
                      const percentage = totalDurationMs > 0 ? Math.round((span.durationMs / totalDurationMs) * 100) : 0;
                      return (
                        <tr key={span.spanId} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 text-slate-500 font-semibold">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-white text-xs">node.{span.nodeId}</span>
                            {span.errorMessage && (
                              <p className="text-[10px] text-red-400 font-sans mt-0.5">{span.errorMessage}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                              {span.nodeType}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                span.status === 'SUCCESS'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                  : span.status === 'NEEDS_HUMAN'
                                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                                  : 'bg-red-950/80 text-red-400 border border-red-800'
                              }`}
                            >
                              {span.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-white">{span.durationMs} ms</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all"
                                  style={{ width: `${Math.max(percentage, 3)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-400 w-8 text-right">{percentage}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">{span.spanId.slice(0, 8)}...</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: Confidence Calibration & Empirical Grounding */}
      <div className="pt-6 border-t border-slate-800/80 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[11px] font-semibold mb-2">
              <TrendingUp className="w-3 h-3" />
              <span>LANGKAH 2 • Closed-Loop Empirical Calibration (PRD Addendum 2 Bagian 75.3)</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Confidence Calibration Intelligence</h3>
            <p className="text-xs text-slate-400 mt-1">
              Validasi akurasi riil dari skor keyakinan AI Agent terhadap outcome aktual (REINFORCE vs CORRECT).
            </p>
          </div>

          <button
            onClick={handleTriggerCalibration}
            disabled={isCalibrating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition flex items-center space-x-2 self-start md:self-auto"
          >
            {isCalibrating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Jalankan Kalibrasi Mingguan</span>
          </button>
        </div>

        {/* Audit Warning Banner if Miscalibrated */}
        {auditSummary && (
          <div className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
            auditSummary.includes('tidak terkalibrasi') || auditSummary.includes('bermasalah')
              ? 'bg-amber-950/50 border-amber-800/80 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
          }`}>
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-bold text-sm text-white">Ringkasan Audit Kalibrasi Terakhir</p>
              <p className="mt-0.5 text-slate-300 leading-relaxed">{auditSummary}</p>
            </div>
          </div>
        )}

        {/* Buckets Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <h4 className="font-semibold text-white text-sm">Kalibrasi Skor Confidence per Bucket 10%</h4>
            <span className="text-xs text-slate-400">Deviasi &gt; 15% memicu alert otomatis</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Bucket Klaim AI</th>
                  <th className="py-3 px-4">Akurasi Riil (Empiris)</th>
                  <th className="py-3 px-4">Sample Size (N)</th>
                  <th className="py-3 px-4">Deviasi Absolut</th>
                  <th className="py-3 px-4">Status Kalibrasi</th>
                  <th className="py-3 px-4">Diagnosa Integritas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {calibrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      Belum ada data kalibrasi tercatat. Klik "Jalankan Kalibrasi Mingguan" untuk mengagregasi.
                    </td>
                  </tr>
                ) : (
                  calibrations.map((calib) => {
                    const dev = calib.deviation;
                    const isMiscalibrated = !calib.isCalibrated;
                    return (
                      <tr key={calib.id || calib.confidenceBucket} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-bold text-white">{calib.confidenceBucket}%</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">
                          {calib.actualAccuracy.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-slate-300">{calib.sampleSize} keputusan</td>
                        <td className="py-3 px-4 text-slate-300">{dev.toFixed(1)}%</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              !isMiscalibrated
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950/80 text-red-400 border border-red-800'
                            }`}
                          >
                            {!isMiscalibrated ? 'Terkalibrasi' : 'TIDAK TERKALIBRASI'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans text-xs">
                          {isMiscalibrated ? (
                            <span className="text-amber-400 font-medium">
                              Overconfidence bias: Klaim {calib.confidenceBucket}%, riil {calib.actualAccuracy.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-400">Tervalidasi sesuai probabilitas riil</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
