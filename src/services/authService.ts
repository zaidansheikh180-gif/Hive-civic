import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured, getSupabaseHostname } from './supabaseClient';

export interface AuthResponse {
  user: UserProfile | null;
  error?: string;
}

/**
 * Formats authentication errors.
 * Preserves actual Supabase backend error responses (e.g. invalid credentials, unconfirmed email)
 * while providing actionable diagnostics if a browser network / DNS failure ("Failed to fetch") occurs.
 */
export const formatAuthError = (errOrMessage: any): string => {
  const msg =
    typeof errOrMessage === 'string'
      ? errOrMessage
      : errOrMessage?.message || 'Authentication operation failed.';

  if (
    msg.toLowerCase().includes('failed to fetch') ||
    msg.toLowerCase().includes('fetch failed')
  ) {
    const hostname = getSupabaseHostname();
    return `Network connection error (${msg}): The browser could not reach "${hostname}". The domain does not resolve (DNS NXDOMAIN / net::ERR_NAME_NOT_RESOLVED) or is unreachable. Please verify in your Supabase Dashboard that the project is active (not paused or deleted) and that your VITE_SUPABASE_URL secret matches the project reference.`;
  }
  return msg;
};

/** Supabase Auth is the only client-side source of authentication state. */
const profileFromRow = (row: any, authUser: any): UserProfile => ({
  id: authUser.id,
  email: row?.email || authUser.email || '',
  full_name: row?.full_name || authUser.user_metadata?.full_name || 'Citizen',
  role: (row?.role as UserRole) || 'citizen',
  created_at: row?.created_at || authUser.created_at,
  updated_at: row?.updated_at,
});

const loadProfile = async (authUser: any): Promise<UserProfile | null> => {
  if (!supabase || !authUser) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at, updated_at')
    .eq('id', authUser.id)
    .maybeSingle();
  if (error) {
    console.error('Failed to load authenticated profile:', error.message);
    return null;
  }
  return data ? profileFromRow(data, authUser) : null;
};

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return null;
      return await loadProfile(session.user);
    } catch (err) {
      console.error('Error fetching current authenticated user:', err);
      return null;
    }
  },

  // Deliberately no localStorage-backed synchronous auth state.
  getCurrentUserSync(): UserProfile | null {
    return null;
  },

  // Synchronous admin state would be an unsafe authorization shortcut.
  getCurrentAdmin(): UserProfile | null {
    return null;
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured() || !supabase) {
      return { user: null, error: 'Supabase credentials are not configured.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (error || !data.user) {
        return { user: null, error: formatAuthError(error?.message || 'Sign in failed.') };
      }
      const profile = await loadProfile(data.user);
      if (!profile) {
        await supabase.auth.signOut();
        return { user: null, error: 'Your account profile could not be verified.' };
      }
      return { user: profile };
    } catch (err: any) {
      return { user: null, error: formatAuthError(err.message || 'Authentication failed.') };
    }
  },

  /** Update only the signed-in user's display name; role and email are never writable here. */
  async updateDisplayName(name: string): Promise<AuthResponse> {
    const fullName = name.trim().replace(/\s+/g, ' ');
    if (!fullName || fullName.length > 80) {
      return { user: null, error: 'Name must be between 1 and 80 characters.' };
    }
    if (!isSupabaseConfigured() || !supabase) {
      return { user: null, error: 'Supabase credentials are not configured.' };
    }
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) return { user: null, error: 'Please sign in again.' };
      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', authUser.id)
        .select('id, email, full_name, role, created_at, updated_at')
        .single();
      if (error || !data) return { user: null, error: error?.message || 'Could not update your name.' };
      const updated = profileFromRow(data, authUser);
      window.dispatchEvent(new CustomEvent('hive:profile-updated', { detail: updated }));
      return { user: updated };
    } catch (err: any) {
      return { user: null, error: formatAuthError(err) };
    }
  },

  async adminSignIn(email: string, password: string): Promise<AuthResponse> {
    const result = await this.signIn(email, password);
    if (result.error || !result.user) return result;
    if (result.user.role !== 'admin') {
      await this.signOut();
      return { user: null, error: 'Access denied. This account does not have municipal administrator privileges.' };
    }
    return result;
  },

  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured() || !supabase) {
      return { user: null, error: 'Supabase credentials are not configured.' };
    }
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim() || 'Citizen';
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: cleanName } },
      });
      if (error) return { user: null, error: formatAuthError(error.message) };
      if (!data.user) return { user: null, error: 'Account creation did not return a user.' };

      // The database trigger creates the profile and assigns citizen.
      const profile = await loadProfile(data.user);
      if (profile) return { user: profile };
      return { user: null, error: 'Account created. Please verify your email, then sign in.' };
    } catch (err: any) {
      return { user: null, error: formatAuthError(err.message || 'Registration failed.') };
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase credentials are not configured.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/login`,
      });
      return error ? { success: false, error: formatAuthError(error.message) } : { success: true };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err.message || 'Password reset request failed.') };
    }
  },

  async signOut(): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.warn('Supabase sign out error:', error.message);
  },

  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    if (!supabase) return () => {};
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        if (!session?.user) {
          callback(null);
          return;
        }
        void loadProfile(session.user).then(callback);
      }, 0);
    });
    return () => authListener.subscription.unsubscribe();
  },
};
