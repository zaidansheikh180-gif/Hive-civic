import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable retrieval
// Direct `import.meta.env.*` expressions allow Vite and esbuild to statically replace
// variables during both development and production builds, while safe optional chaining
// and process.env fallback ensure compatibility in Node testing runtimes.
export const SUPABASE_URL: string = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.SUPABASE_URL) ||
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL : '') ||
  ''
).trim();

export const SUPABASE_ANON_KEY: string = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY : '') ||
  ''
).trim();

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
 * Extracts and returns the hostname from the configured Supabase URL.
 * NEVER exposes paths, credentials, or keys.
 */
export const getSupabaseHostname = (): string => {
  try {
    if (!SUPABASE_URL) return 'not configured';
    const parsed = new URL(SUPABASE_URL);
    return parsed.hostname;
  } catch {
    return 'invalid url format';
  }
};

/**
 * Safe diagnostic status representation.
 * Only indicates present/missing status and hostname; NEVER exposes actual key or token values.
 */
export interface SupabaseConfigStatus {
  SUPABASE_URL: 'configured' | 'not configured';
  SUPABASE_KEY: 'configured' | 'not configured';
  SUPABASE_HOSTNAME: string;
  SUPABASE_CLIENT: 'initialized' | 'not initialized';
  KEY_TYPE: 'publishable (sb_publishable_*)' | 'jwt-anon' | 'unrecognized';
}

/**
 * Reports safe diagnostic status without printing any credentials.
 */
export const getSupabaseConfigStatus = (): SupabaseConfigStatus => {
  const hasUrl = Boolean(SUPABASE_URL && SUPABASE_URL.startsWith('http'));
  const hasKey = Boolean(SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20);
  const keyType = SUPABASE_ANON_KEY.startsWith('sb_publishable_')
    ? 'publishable (sb_publishable_*)'
    : SUPABASE_ANON_KEY.split('.').length === 3
      ? 'jwt-anon'
      : 'unrecognized';

  return {
    SUPABASE_URL: hasUrl ? 'configured' : 'not configured',
    SUPABASE_KEY: hasKey ? 'configured' : 'not configured',
    SUPABASE_HOSTNAME: getSupabaseHostname(),
    SUPABASE_CLIENT: Boolean(isSupabaseConfigured()) ? 'initialized' : 'not initialized',
    KEY_TYPE: keyType,
  };
};

/**
 * Safe reachability test that pings the Supabase public health endpoint
 * without sending or exposing sensitive credentials.
 */
export interface ReachabilityResult {
  reachable: boolean;
  endpoint: string;
  hostname: string;
  status?: number;
  statusText?: string;
  error?: string;
  isDnsOrNetworkFailure?: boolean;
}

export const testSupabaseReachability = async (): Promise<ReachabilityResult> => {
  const hostname = getSupabaseHostname();
  if (!SUPABASE_URL || !SUPABASE_URL.startsWith('http')) {
    return {
      reachable: false,
      endpoint: '',
      hostname,
      error: 'Supabase URL is not configured or is invalid.',
    };
  }

  const endpoint = `${SUPABASE_URL.replace(/\/+$/, '')}/auth/v1/health`;
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
      },
    });
    return {
      reachable: res.ok || res.status < 500,
      endpoint,
      hostname,
      status: res.status,
      statusText: res.statusText,
    };
  } catch (err: any) {
    const msg = err?.message || 'Network request failed';
    const isNetworkErr =
      msg.toLowerCase().includes('failed to fetch') ||
      msg.toLowerCase().includes('network') ||
      err?.name === 'TypeError';
    return {
      reachable: false,
      endpoint,
      hostname,
      error: msg,
      isDnsOrNetworkFailure: isNetworkErr,
    };
  }
};

/**
 * Safely logs diagnostic status to console without printing credential contents.
 */
export const logSupabaseDiagnostics = (): void => {
  const status = getSupabaseConfigStatus();
  console.info('[HIVE Diagnostics]', status);
};

// Expose safe diagnostic and reachability tester on window in browser environments for verification
if (typeof window !== 'undefined') {
  (window as any).__HIVE_SUPABASE_DIAGNOSTICS__ = getSupabaseConfigStatus();
  (window as any).__HIVE_TEST_REACHABILITY__ = testSupabaseReachability;
}

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
