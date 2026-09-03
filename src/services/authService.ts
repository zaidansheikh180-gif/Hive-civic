import { AdminProfile } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const AUTH_STORAGE_KEY = 'hive_admin_auth_v1';

export const authService = {
  // Check if admin is currently authenticated
  getCurrentAdmin(): AdminProfile | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  },

  // Authenticate admin using Supabase or Academic Demo mode
  async signIn(email: string, password: string): Promise<{ user: AdminProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase configured, attempt live Supabase Auth
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return {
            user: null as any,
            error: error.message,
          };
        }

        if (data.user) {
          const profile: AdminProfile = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            full_name: data.user.user_metadata?.full_name || 'Municipal Administrator',
            role: 'admin',
            created_at: data.user.created_at,
            updated_at: new Date().toISOString(),
          };

          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
          return { user: profile };
        }
      } catch (err: any) {
        return { user: null as any, error: err.message || 'Authentication failed' };
      }
    }

    // 2. Academic Demo Administrator Mode
    // Allows student evaluators and community partners to test the admin controls directly
    if (cleanEmail === 'admin@hive.civic.local' || cleanEmail.includes('admin') || password === 'civicadmin2026' || password.length >= 6) {
      const demoProfile: AdminProfile = {
        id: 'admin-academic-001',
        email: cleanEmail || 'admin@hive.civic.local',
        full_name: 'Dr. Sarah Lin (Civic Works Director)',
        role: 'admin',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoProfile));
      return { user: demoProfile };
    }

    return {
      user: null as any,
      error: 'Invalid administrative credentials. Use admin@hive.civic.local or any valid password.',
    };
  },

  // One-click quick login for academic testing & grading
  quickDemoLogin(): AdminProfile {
    const demoProfile: AdminProfile = {
      id: 'admin-academic-001',
      email: 'admin@hive.civic.local',
      full_name: 'Dr. Sarah Lin (Civic Works Director)',
      role: 'admin',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoProfile));
    return demoProfile;
  },

  // Sign out
  async signOut(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out warning:', e);
      }
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: AdminProfile | null) => void) {
    if (isSupabaseConfigured() && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            const profile: AdminProfile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || 'Municipal Administrator',
              role: 'admin',
              created_at: session.user.created_at,
              updated_at: new Date().toISOString(),
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
            callback(profile);
          } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            callback(null);
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }

    return () => {};
  },
};
