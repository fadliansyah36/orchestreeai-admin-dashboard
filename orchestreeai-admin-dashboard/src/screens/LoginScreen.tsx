import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, verifyMfa, mfaPending, isLoading, error } = useAuth();
  const [email, setEmail] = useState('superadmin@orchestree.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [totpCode, setTotpCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setFormError(err.message || 'Login gagal.');
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await verifyMfa(totpCode);
    } catch (err: any) {
      setFormError(err.message || 'Verifikasi MFA gagal.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/80 mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">OrchestreeAI Platform</h1>
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mt-1">
            Super Admin Web Console
          </p>
          <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 bg-purple-950/60 border border-purple-800/60 rounded-full text-[11px] text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>MFA TOTP Enforced • Role-Restricted</span>
          </div>
        </div>

        {/* Error notification */}
        {(error || formError) && (
          <div className="mb-6 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start space-x-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>{error || formError}</p>
          </div>
        )}

        {!mfaPending ? (
          /* Step 1: Email & Password */
          <form onSubmit={handleInitialLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Super Admin</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="superadmin@orchestree.ai"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-950/60 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>Memverifikasi Kredensial...</span>
              ) : (
                <>
                  <span>Lanjutkan ke Verifikasi MFA</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Multi-Factor Authentication TOTP */
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center mb-4">
              <p className="text-xs text-slate-300 font-medium">
                Masukkan 6-digit kode OTP dari aplikasi Authenticator Anda (Google Authenticator / 1Password)
              </p>
              <p className="text-[11px] text-emerald-400 font-mono mt-1">{email}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kode Autentikasi 6-Digit (TOTP)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                  placeholder="123456"
                  className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl py-2.5 pl-10 pr-3.5 text-center font-mono text-lg tracking-widest text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || totpCode.length !== 6}
              className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-950/60 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? <span>Mengautentikasi Sesi...</span> : <span>Verifikasi & Masuk Dashboard</span>}
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-slate-800/80 pt-4 space-y-2">
          <div className="flex items-center justify-center space-x-3 text-[10px] text-slate-400 font-mono">
            <span>• 15-Min Idle Timeout</span>
            <span>• 3-Strike Lockout Guard</span>
            <span>• Strict CSRF Gating</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Akses portal ini dipantau secara ketat. Seluruh aktivitas administratif dicatat lengkap ke Security Audit Ledger.
          </p>
        </div>
      </div>
    </div>
  );
};
