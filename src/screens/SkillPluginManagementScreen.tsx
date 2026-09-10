import React, { useState, useEffect } from 'react';
import { Puzzle, Plus, RefreshCw, Upload, CheckCircle2, ShieldCheck, Trash2, Power } from 'lucide-react';
import { api } from '../lib/api';
import { SkillPluginItem } from '../types';

export const SkillPluginManagementScreen: React.FC = () => {
  const [plugins, setPlugins] = useState<SkillPluginItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPlugins = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSkillPlugins();
      setPlugins(data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memuat daftar plugin keahlian.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const handleToggleStatus = async (plugin: SkillPluginItem) => {
    const nextStatus = plugin.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await api.updateSkillPluginStatus(plugin.id, nextStatus);
      setMessage({ type: 'success', text: `Status plugin "${plugin.name}" diubah menjadi ${nextStatus}.` });
      fetchPlugins();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal mengubah status plugin.' });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-indigo-400" />
            <span>Autonomous Skill Plugin & Extension Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ekosistem plugin runtime WASM dan Python sandbox untuk kapabilitas fungsional karyawan AI.
          </p>
        </div>
        <button
          onClick={fetchPlugins}
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

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plugins.map((plugin) => (
          <div key={plugin.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span>{plugin.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                    v{plugin.version}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{plugin.description || 'Extension capability package'}</p>
              </div>
              <button
                onClick={() => handleToggleStatus(plugin)}
                className={`p-1.5 rounded-lg border transition ${
                  plugin.status === 'ACTIVE'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/40'
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                }`}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/60 pt-3">
              <div className="flex justify-between">
                <span>Runtime:</span>
                <span className="font-mono text-emerald-400 font-semibold">{plugin.executionRuntime}</span>
              </div>
              <div className="flex justify-between">
                <span>Author:</span>
                <span className="text-slate-200">{plugin.author}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`font-semibold ${
                    plugin.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {plugin.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
