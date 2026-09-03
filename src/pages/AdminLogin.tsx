import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { ShieldCheck, Lock, Mail, ArrowRight, GraduationCap, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@hive.civic.local');
  const [password, setPassword] = useState('civicadmin2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLiveSupabase = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.signIn(email, password);
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    authService.quickDemoLogin();
    navigate('/admin');
  };

  return (
    <div className="relative min-h-screen pt-28 pb-16 px-4 sm:px-8 max-w-md mx-auto flex flex-col justify-center z-10">
      <div className="glass-panel p-8 border border-[#CC9E33]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
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
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#CC9E33] flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>Admin Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E7C226]"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E7C226]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-cut w-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(231,194,38,0.3)] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In as Administrator'}
          </button>
        </form>

        {/* Evaluator / Academic Demo One-Click Access */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 text-center">
            Evaluator & Academic Mode
          </div>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-3 rounded-lg bg-white/5 hover:bg-[#E7C226]/10 border border-white/10 hover:border-[#E7C226]/50 text-neutral-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all"
          >
            <GraduationCap className="w-4 h-4 text-[#E7C226]" />
            <span>Instant Demo Admin Access</span>
          </button>
        </div>

        <div className="text-center pt-1">
          <Link
            to="/"
            className="text-[11px] font-mono text-[#CC9E33]/70 hover:text-[#CC9E33] flex items-center justify-center gap-1"
          >
            <span>Return to public portal</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
