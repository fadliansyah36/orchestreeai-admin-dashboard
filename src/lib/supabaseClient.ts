import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://exfvfyiwftywqjcsofgf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder')
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[Supabase Configuration Diagnostic]\n' +
    'Koneksi Supabase Belum Terhubung: VITE_SUPABASE_ANON_KEY kosong atau placeholder.\n' +
    'Penyebab umum: Nilai VITE_* di-bake permanen saat BUILD TIME (npm run build).\n' +
    'Solusi: Pastikan diteruskan saat docker build via: --build-arg VITE_SUPABASE_ANON_KEY="$KEY"'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
