import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable retrieval
const meta = import.meta as any;
export const SUPABASE_URL: string =
  (typeof meta !== 'undefined' && meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  '';

export const SUPABASE_ANON_KEY: string =
  (typeof meta !== 'undefined' && meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

/**
 * Validates that Supabase credentials are provided and non-empty.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_ANON_KEY &&
      SUPABASE_URL.startsWith('http') &&
      SUPABASE_ANON_KEY.length > 20
  );
};

/**
 * Reusable Supabase client instance using ONLY the public anon key.
 * Security mandate: Never expose service-role or secret keys in browser code.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Helper to get active Supabase client or throw a clear error.
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    throw new Error(
      'Supabase client is not initialized. Please verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment configuration.'
    );
  }
  return supabase;
};
