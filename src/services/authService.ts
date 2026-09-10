import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface AuthResponse {
  user: UserProfile | null;
  error?: string;
}

const SESSION_STORAGE_KEY = 'hive_authenticated_profile';

export const authService = {
  /**
   * Get currently authenticated user from active Supabase session & PostgreSQL profiles table
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      const user = session.user;

      // Query authoritative public.profiles table
      try {
        const { data: profileData, error: profError } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, created_at, updated_at')
          .eq('id', user.id)
          .maybeSingle();

        if (!profError && profileData) {
          const profile: UserProfile = {
            id: profileData.id,
            email: profileData.email || user.email || '',
            full_name: profileData.full_name || 'Citizen',
            role: (profileData.role as UserRole) || 'citizen',
            created_at: profileData.created_at,
            updated_at: profileData.updated_at,
          };
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
          return profile;
        }
      } catch (profCatch) {
        console.warn('Profile fetch catch:', profCatch);
      }

      // Fallback: derive from Supabase user metadata (default role is strictly 'citizen')
      const fallbackRole: UserRole =
        user.user_metadata?.role === 'admin' ? 'admin' : 'citizen';

      const profile: UserProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || 'Citizen',
        role: fallbackRole,
        created_at: user.created_at,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      return profile;
    } catch (err) {
      console.error('Error fetching current session:', err);
      return null;
    }
  },

  /**
   * Synchronous cached profile lookup for immediate route rendering
   */
  getCurrentUserSync(): UserProfile | null {
    try {
      const cached = localStorage.getItem(SESSION_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
    return null;
  },

  // Backward compatibility alias for existing admin checks
  getCurrentAdmin(): UserProfile | null {
    const u = this.getCurrentUserSync();
    return u && u.role === 'admin' ? u : null;
  },

  /**
   * Citizen Sign In via Supabase Auth
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured() || !supabase) {
      return {
        user: null,
        error: 'Supabase credentials are not configured.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Sign in failed. No user returned by Supabase.' };
      }

      // Fetch profile
      let fullName = data.user.user_metadata?.full_name || 'Citizen';
      let role: UserRole = 'citizen';

      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (prof) {
          fullName = prof.full_name || fullName;
          role = (prof.role as UserRole) || role;
        }
      } catch {
        // use metadata
      }

      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        full_name: fullName,
        role,
        created_at: data.user.created_at,
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      return { user: profile };
    } catch (err: any) {
      return { user: null, error: err.message || 'Authentication failed' };
    }
  },

  /**
   * Administrator Sign In via Supabase Auth with server-side role verification
   */
  async adminSignIn(email: string, password: string): Promise<AuthResponse> {
    const result = await this.signIn(email, password);
    if (result.error || !result.user) {
      return result;
    }

    // Strictly enforce admin role
    if (result.user.role !== 'admin') {
      await this.signOut();
      return {
        user: null,
        error:
          'Access Denied: Your account does not possess municipal administrator privileges.',
      };
    }

    return result;
  },

  /**
   * Citizen Sign Up via Supabase Auth (strictly defaults to role: 'citizen')
   */
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured() || !supabase) {
      return {
        user: null,
        error: 'Supabase credentials are not configured.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim() || 'Citizen',
            role: 'citizen', // Citizen role strictly enforced on signup
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          full_name: fullName.trim() || 'Citizen',
          role: 'citizen',
          created_at: data.user.created_at,
          updated_at: new Date().toISOString(),
        };

        // Ensure profile row exists in public.profiles table
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: cleanEmail,
            full_name: profile.full_name,
            role: 'citizen',
          });
        } catch {
          // Handled by handle_new_user trigger
        }

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        return { user: profile };
      }

      return {
        user: null,
        error:
          'Account created! Please check your email to confirm your account if email confirmation is enabled.',
      };
    } catch (err: any) {
      return { user: null, error: err.message || 'Registration failed' };
    }
  },

  /**
   * Citizen / Admin Password Recovery
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase credentials are not configured.' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/auth/login`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset request failed.' };
    }
  },

  /**
   * Terminate Supabase Auth session
   */
  async signOut(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error:', e);
      }
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('hive_supabase_auth_session');
  },

  /**
   * Real-time listener for Supabase authentication state changes
   */
  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    if (!supabase) {
      return () => {};
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const user = session.user;
          // Attempt to retrieve full profile
          let role: UserRole = 'citizen';
          let fullName = user.user_metadata?.full_name || 'Citizen';

          try {
            const { data: prof } = await supabase
              .from('profiles')
              .select('full_name, role')
              .eq('id', user.id)
              .maybeSingle();

            if (prof) {
              role = (prof.role as UserRole) || role;
              fullName = prof.full_name || fullName;
            }
          } catch {
            // fallback
          }

          const profile: UserProfile = {
            id: user.id,
            email: user.email || '',
            full_name: fullName,
            role,
            created_at: user.created_at,
            updated_at: new Date().toISOString(),
          };

          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
          callback(profile);
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          callback(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  },
};
