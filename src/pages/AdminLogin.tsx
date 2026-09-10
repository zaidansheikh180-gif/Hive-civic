import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { SchemaModal } from '../components/SchemaModal';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Database,
  LogIn,
  Info,
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);

  const isLiveSupabase = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Strictly enforces admin role server/profile-side
      const res = await authService.adminSignIn(email, password);
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication operation failed.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-28 pb-16 px-4 sm:px-8 max-w-md mx-auto flex flex-col justify-center z-10 select-none">
      <div className="glass-panel p-8 border border-[#CC9E33]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#E7C226]/10 border border-[#E7C226]/40 mx-auto flex items-center justify-center text-[#E7C226] shadow-[0_0_20px_rgba(231,194,38,0.3)]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold uppercase font-helvetica tracking-tight text-white">
            Administrative Portal
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            HIVE Civic Triage & Oversight Console
          </p>

          {/* Supabase Status Pill */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1 rounded-full border ${
                isLiveSupabase
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{isLiveSupabase ? 'Supabase Auth & Database Active' : 'Supabase Not Configured'}</span>
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#CC9E33] flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>Administrator Email</span>
            </label>
            <input
              type="email"
              required
              placeholder="admin@municipality.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E7C226]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#CC9E33] flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E7C226]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cut w-full py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(231,194,38,0.3)] disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying Admin Credentials...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In as Municipal Official</span>
              </span>
            )}
          </button>
        </form>

        {/* Security & Role Instructions */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300 space-y-1">
          <div className="flex items-center gap-1.5 text-[#E7C226] font-bold uppercase text-[10px]">
            <Info className="w-3.5 h-3.5" />
            <span>Role-Based Access Enforcement</span>
          </div>
          <p className="text-neutral-400 leading-snug">
            Admin roles are strictly governed by <code className="text-[#E7C226]">public.profiles.role = &apos;admin&apos;</code> in Supabase. Non-admin accounts will be refused access.
          </p>
        </div>

        {/* Database Schema Viewer Button */}
        <div className="pt-2 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => setShowSchemaModal(true)}
            className="text-[11px] font-mono text-[#CC9E33] hover:text-[#E7C226] flex items-center justify-center gap-1.5 mx-auto py-1"
          >
            <Database className="w-3.5 h-3.5" />
            <span>View Database Schema &amp; Setup SQL</span>
          </button>
        </div>

        <div className="text-center space-y-2">
          <Link
            to="/auth/login"
            className="text-[11px] font-mono text-[#E7C226] hover:underline block"
          >
            Are you a citizen? Go to Citizen Sign In &rarr;
          </Link>
          <Link
            to="/"
            className="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center justify-center gap-1"
          >
            <span>Return to public welcome page</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <SchemaModal
        isOpen={showSchemaModal}
        onClose={() => setShowSchemaModal(false)}
      />
    </div>
  );
};
