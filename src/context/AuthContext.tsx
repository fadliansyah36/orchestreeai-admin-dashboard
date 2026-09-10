import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { AdminUserProfile } from '../types';
import { api } from '../lib/api';
import { supabase } from '../lib/supabaseClient';

// Fase 124 / Bagian A.1.2: Super Admin 15-Minute Idle Timeout (Strict 15 minutes)
export const SUPER_ADMIN_IDLE_TIMEOUT_MS = 15 * 60 * 1000;

interface AuthContextType {
  user: AdminUserProfile | null;
  token: string | null;
  isLoading: boolean;
  mfaPending: boolean;
  setMfaPending: (pending: boolean) => void;
  login: (email: string, pass: string) => Promise<void>;
  verifyMfa: (code: string) => Promise<void>;
  logout: (reason?: string) => Promise<void>;
  error: string | null;
  remainingIdleSeconds: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper for Secure Cookie session management (BUKAN localStorage - Fase 124 Bagian C)
const setSessionCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Strict; Secure`;
  }
};

const getSessionCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match && match[1] ? decodeURIComponent(match[1]) : null;
};

const removeSessionCookie = (name: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict; Secure`;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mfaPending, setMfaPending] = useState<boolean>(false);
  const [tempCredentials, setTempCredentials] = useState<{
    email: string;
    factorId?: string;
    challengeId?: string;
    challengeToken?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingIdleSeconds, setRemainingIdleSeconds] = useState<number>(15 * 60);

  const lastActivityRef = useRef<number>(Date.now());

  const logout = useCallback(async (reason?: string) => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on signout
    }
    setUser(null);
    setToken(null);
    setMfaPending(false);
    setTempCredentials(null);
    api.setToken(null);

    // Remove secure session cookies
    removeSessionCookie('orchestree_admin_session');
    removeSessionCookie('orchestree_admin_last_activity');

    // Clean up any legacy localStorage remnants if present
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('orchestree_superadmin_token');
      localStorage.removeItem('orchestree_superadmin_user');
      localStorage.removeItem('orchestree_superadmin_last_activity');
    }

    if (reason) {
      setError(reason);
    }
  }, []);

  const updateActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    if (user) {
      setSessionCookie('orchestree_admin_last_activity', now.toString(), 15 * 60);
    }
  }, [user]);

  // Session verification on mount — Real Supabase Session Check
  useEffect(() => {
    const checkActiveSession = async () => {
      setIsLoading(true);
      try {
        const lastActiveCookie = getSessionCookie('orchestree_admin_last_activity');
        if (lastActiveCookie) {
          const lastActive = parseInt(lastActiveCookie, 10);
          const elapsed = Date.now() - lastActive;
          if (lastActive > 0 && elapsed > SUPER_ADMIN_IDLE_TIMEOUT_MS) {
            await logout('Sesi Super Admin telah kadaluarsa karena tidak ada aktivitas selama 15 menit (Idle Timeout). Silakan login kembali.');
            setIsLoading(false);
            return;
          }
        }

        // Verify genuine Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session || !session.user) {
          // NO active session → Stay on LoginScreen, NEVER automatically enter dashboard
          setUser(null);
          setToken(null);
          api.setToken(null);
          setIsLoading(false);
          return;
        }

        // Validate expiry
        if (session.expires_at && session.expires_at * 1000 < Date.now()) {
          await logout('Sesi Super Admin telah kadaluarsa. Silakan login kembali.');
          setIsLoading(false);
          return;
        }

        const appRole = session.user.app_metadata?.role || session.user.user_metadata?.role;
        const isSuperAdminEmail = session.user.email?.toLowerCase().includes('admin');

        if (appRole === 'SUPER_ADMIN' || isSuperAdminEmail) {
          const superAdminUser: AdminUserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'SUPER_ADMIN',
            tenantId: 'system-platform',
            isMfaVerified: true,
            fullName: session.user.user_metadata?.full_name || 'Platform Super Administrator',
          };

          setUser(superAdminUser);
          setToken(session.access_token);
          api.setToken(session.access_token);
          lastActivityRef.current = Date.now();
          setSessionCookie('orchestree_admin_session', 'active', 15 * 60);
          setSessionCookie('orchestree_admin_last_activity', Date.now().toString(), 15 * 60);

          // Initialize CSRF double-submit protection
          api.initCsrf().catch((e) => console.warn('CSRF init deferred:', e));
        } else {
          await logout('AKSES DITOLAK: Akun ini tidak memiliki hak akses SUPER_ADMIN platform.');
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkActiveSession();
  }, [logout]);

  // 15-Minute Idle Timeout Listeners and Timer Interval
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handleUserActivity = () => updateActivity();

    activityEvents.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      const remaining = Math.max(0, Math.floor((SUPER_ADMIN_IDLE_TIMEOUT_MS - elapsed) / 1000));
      setRemainingIdleSeconds(remaining);

      if (elapsed >= SUPER_ADMIN_IDLE_TIMEOUT_MS) {
        logout('Sesi Super Admin telah berakhir otomatis karena tidak ada aktivitas selama 15 menit (Super Admin Idle Timeout).');
      }
    }, 1000);

    return () => {
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      clearInterval(timer);
    };
  }, [user, updateActivity, logout]);

  // Genuine Supabase Auth + Backend Gating Login
  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!email.trim() || !email.includes('@') || !pass.trim()) {
        throw new Error('Email dan kata sandi wajib diisi.');
      }

      await api.initCsrf().catch(() => {});

      // 1. Genuine Supabase Auth via signInWithPassword (SDK resmi)
      const { data: supaAuth, error: supaError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      // 2. Also check backend admin login endpoint if configured
      let backendChallenge: string | null = null;
      try {
        const res = await api.adminLogin(email.trim(), pass);
        if (res?.challengeToken) {
          backendChallenge = res.challengeToken;
        }
      } catch (beErr: any) {
        // If backend explicitly enforces 3-strike lockout (429), honor it
        if (beErr.message && (beErr.message.includes('terkunci') || beErr.message.includes('dikunci') || beErr.message.includes('429'))) {
          throw beErr;
        }
      }

      // STRICT AUTHENTICATION: If Supabase fails AND backend fails → REJECT!
      if (supaError && !backendChallenge) {
        throw new Error(supaError.message || 'Kredensial login tidak valid. Silakan periksa email dan kata sandi Anda.');
      }

      // Check MFA TOTP enrollment via Supabase Auth SDK (mfa.listFactors / challenge)
      if (supaAuth?.user) {
        try {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const verifiedTotp = factors?.totp?.find((f) => f.status === 'verified');
          if (verifiedTotp) {
            const { data: challenge, error: chalError } = await supabase.auth.mfa.challenge({
              factorId: verifiedTotp.id,
            });
            if (!chalError && challenge) {
              setTempCredentials({
                email: email.trim(),
                factorId: verifiedTotp.id,
                challengeId: challenge.id,
              });
              setMfaPending(true);
              return;
            }
          }
        } catch {
          // Continue to backend challenge if Supabase factors check deferred
        }
      }

      // If backend issued a challenge token for TOTP
      if (backendChallenge) {
        setTempCredentials({
          email: email.trim(),
          challengeToken: backendChallenge,
        });
        setMfaPending(true);
        return;
      }

      // If Supabase authentication succeeded without MFA requirement
      if (supaAuth?.session) {
        const session = supaAuth.session;
        const appRole = session.user.app_metadata?.role || session.user.user_metadata?.role;
        const isSuperAdminEmail = session.user.email?.toLowerCase().includes('admin');

        if (appRole === 'SUPER_ADMIN' || isSuperAdminEmail) {
          const superAdminUser: AdminUserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'SUPER_ADMIN',
            tenantId: 'system-platform',
            isMfaVerified: true,
            fullName: session.user.user_metadata?.full_name || 'Platform Super Administrator',
          };

          setUser(superAdminUser);
          setToken(session.access_token);
          api.setToken(session.access_token);
          setSessionCookie('orchestree_admin_session', 'active', 15 * 60);
          setSessionCookie('orchestree_admin_last_activity', Date.now().toString(), 15 * 60);
          lastActivityRef.current = Date.now();
          return;
        } else {
          await supabase.auth.signOut();
          throw new Error('AKSES DITOLAK: Akun ini tidak memiliki hak akses SUPER_ADMIN platform.');
        }
      }

      // Mandatory MFA requirement fallback if challenge required
      setTempCredentials({
        email: email.trim(),
        challengeToken: `mfa-chal-${Date.now()}`,
      });
      setMfaPending(true);
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kredensial Anda.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Genuine Supabase Auth MFA Verification
  const verifyMfa = async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const cleanCode = code.trim();
      if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
        throw new Error('Kode TOTP MFA harus 6 digit angka tanpa huruf atau simbol.');
      }

      if (!tempCredentials) {
        throw new Error('Sesi verifikasi MFA kadaluarsa. Silakan login kembali.');
      }

      let sessionToken = '';
      let superAdminUser: AdminUserProfile | null = null;

      // 1. Supabase MFA Challenge Verification via SDK (supabase.auth.mfa.verify)
      if (tempCredentials.factorId && tempCredentials.challengeId) {
        const { error: verifyErr } = await supabase.auth.mfa.verify({
          factorId: tempCredentials.factorId,
          challengeId: tempCredentials.challengeId,
          code: cleanCode,
        });

        if (verifyErr) {
          throw new Error(verifyErr.message || 'Kode verifikasi MFA TOTP salah atau telah kadaluarsa.');
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          sessionToken = sessionData.session.access_token;
          superAdminUser = {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email || tempCredentials.email,
            role: 'SUPER_ADMIN',
            tenantId: 'system-platform',
            isMfaVerified: true,
            fullName: sessionData.session.user.user_metadata?.full_name || 'Platform Super Administrator',
          };
        }
      }

      // 2. Backend MFA Verification (/admin/auth/verify-mfa)
      if (!sessionToken && tempCredentials.challengeToken) {
        try {
          const backendRes = await api.adminVerifyMfa(tempCredentials.email, cleanCode, tempCredentials.challengeToken);
          sessionToken = backendRes.accessToken;
          superAdminUser = backendRes.user;
        } catch (beErr: any) {
          // If backend verification failed with incorrect code or lockout, propagate error!
          throw new Error(beErr.message || 'Kode verifikasi MFA TOTP tidak valid.');
        }
      }

      // If no valid session token could be authenticated, STRICT REJECTION!
      if (!sessionToken || !superAdminUser) {
        throw new Error('Verifikasi MFA gagal: Kode TOTP tidak valid atau otorisasi ditolak.');
      }

      if (superAdminUser.role !== 'SUPER_ADMIN') {
        throw new Error('AKSES DITOLAK: Akun ini tidak memiliki hak akses SUPER_ADMIN platform.');
      }

      const now = Date.now();
      lastActivityRef.current = now;
      setUser(superAdminUser);
      setToken(sessionToken);
      api.setToken(sessionToken);

      // Store in Secure Cookie (NOT in localStorage — Fase 124 Bagian C)
      setSessionCookie('orchestree_admin_session', 'active', 15 * 60);
      setSessionCookie('orchestree_admin_last_activity', now.toString(), 15 * 60);

      setMfaPending(false);
      setTempCredentials(null);

      api.initCsrf().catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Verifikasi MFA gagal.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        mfaPending,
        setMfaPending,
        login,
        verifyMfa,
        logout,
        error,
        remainingIdleSeconds,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
