import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface FooterCtaProps {
  onExecuteGoalFromLanding?: (goal: string) => void;
  onOpenProspectForm?: () => void;
}

export const FooterCtaSection: React.FC<FooterCtaProps> = ({ onOpenProspectForm }) => {
  const handleStart = () => {
    if (onOpenProspectForm) {
      onOpenProspectForm();
    } else {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-b from-[#071226] via-[#040C1A] to-[#02060D] text-white border-t border-white/10 relative overflow-hidden">
      {/* Decorative ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-r from-[#08B85C]/15 via-[#16B7D9]/20 to-[#1976E8]/15 blur-3xl pointer-events-none" />

      {/* Main Bottom Hero CTA Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
        <div className="rounded-3xl bg-gradient-to-r from-[#0B1835] via-[#071226] to-[#0B1835] border border-[#08B85C]/40 p-8 sm:p-14 text-center max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-[#08B85C]/30 text-xs font-semibold text-[#08B85C] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIAP MENJALANKAN BISNIS DENGAN WORKFORCE MASA DEPAN?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Mulai Orkestrasikan Workforce Anda Hari Ini
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Hentikan pemborosan waktu staf pada tugas rutin. Sambungkan WhatsApp, Google Workspace, dan SOP perusahaan Anda dalam hitungan menit.
          </p>

          {/* High-Converting Direct Action CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#08B85C] via-[#16B7D9] to-[#1976E8] text-white font-bold text-base shadow-xl shadow-[#08B85C]/25 hover:shadow-[#08B85C]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer group"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span>Daftar Seleksi Trial 7 Hari (36 Slot)</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-semibold text-base backdrop-blur-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Pelajari Skema Paket</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#08B85C]" />
              <span>Sovereign Cloud Data Privacy (UU PDP 2024)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-[#1976E8]" />
              <span>Multi-Tenant Enkripsi AES-256</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#08B85C]" />
              <span>Gratis Setup Onboarding 1-on-1</span>
            </span>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="mt-20 pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          {/* Col 1: Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#08B85C] via-[#16B7D9] to-[#1976E8] flex items-center justify-center text-white font-bold shadow-lg">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Orchestree<span className="text-[#08B85C]">.AI</span>
                </span>
                <span className="text-[10px] text-slate-400 -mt-1 font-mono tracking-wider">
                  AI WORKFORCE OPERATING SYSTEM
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Sistem Operasi Manajemen Tenaga Kerja Cerdas pertama di Indonesia yang mengorkestrasikan staf manusia, staf AI, dan ekosistem alat bisnis dalam satu kesatuan operasional.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              PT Orchestree Teknologi Nusantara &copy; {new Date().getFullYear()}. Seluruh hak cipta dilindungi.
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#workforce-universe" className="hover:text-[#08B85C] transition-colors">Workforce Universe</a></li>
              <li><a href="#ai-employees" className="hover:text-[#08B85C] transition-colors">16 AI Employees</a></li>
              <li><a href="#collaboration" className="hover:text-[#08B85C] transition-colors">WhatsApp & Chat Sync</a></li>
              <li><a href="#performance" className="hover:text-[#08B85C] transition-colors">Performance Scoring</a></li>
              <li><a href="#social-creative" className="hover:text-[#08B85C] transition-colors">Social & Video Studio</a></li>
            </ul>
          </div>

          {/* Col 3: Integrasi */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Integrasi</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#collaboration" className="hover:text-[#08B85C] transition-colors">WhatsApp Gateway</a></li>
              <li><a href="#collaboration" className="hover:text-[#08B85C] transition-colors">Telegram Enterprise</a></li>
              <li><a href="#collaboration" className="hover:text-[#08B85C] transition-colors">Slack & Trello Workspace</a></li>
              <li><a href="#collaboration" className="hover:text-[#08B85C] transition-colors">Google Workspace</a></li>
              <li><a href="#collaboration" className="hover:text-[#08B85C] transition-colors">Accurate & Jurnal ERP</a></li>
            </ul>
          </div>

          {/* Col 4: Keamanan & Legal */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Keamanan & Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li><span className="text-[#08B85C] font-semibold">Kepatuhan UU PDP RI</span></li>
              <li><span className="text-slate-300">Isolasi Multi-Tenant</span></li>
              <li><span className="text-slate-300">Kebijakan Privasi</span></li>
              <li><span className="text-slate-300">Syarat & Ketentuan</span></li>
              <li><span className="text-slate-300">Service Level Agreement</span></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
