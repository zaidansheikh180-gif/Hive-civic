import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  getSupabaseConfigStatus,
  testSupabaseReachability,
  ReachabilityResult,
} from '../services/supabaseClient';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const CitizenLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reachability, setReachability] = useState<ReachabilityResult | null>(null);
  const [testingReachability, setTestingReachability] = useState(false);

  const status = getSupabaseConfigStatus();
  const destination = (location.state as any)?.from?.pathname || '/app';

  const handleTestConnection = async () => {
    setTestingReachability(true);
    try {
      const res = await testSupabaseReachability();
      setReachability(res);
    } finally {
      setTestingReachability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.signIn(email, password);
      if (res.error) {
        setErrorMessage(res.error);
        // Automatically check reachability if network error occurred
        if (
          res.error.toLowerCase().includes('failed to fetch') ||
          res.error.toLowerCase().includes('network')
        ) {
          void handleTestConnection();
        }
      } else if (res.user) {
        navigate(destination, { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative z-10">
      <div className="w-full max-w-md glass-panel p-8 border border-[#E7C226]/30 shadow-[0_0_50px_rgba(231,194,38,0.2)] rounded-2xl relative overflow-hidden animate-fadeUp">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E7C226]/10 blur-2xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#E7C226]/10 border border-[#E7C226]/40 flex items-center justify-center text-[#E7C226] mx-auto shadow-[0_0_20px_rgba(231,194,38,0.25)]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-helvetica">
            Citizen Sign In
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            Enter HIVE to submit, endorse & track municipal proposals
          </p>

          {/* Safe Diagnostics Pill */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-0.5 rounded-full border ${
                status.SUPABASE_CLIENT === 'initialized'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.SUPABASE_CLIENT === 'initialized'
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                }`}
              />
              <span>Client: {status.SUPABASE_CLIENT}</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-700/60 text-neutral-300">
              <span className="text-neutral-500">Host:</span>
              <span className="truncate max-w-[180px]">{status.SUPABASE_HOSTNAME}</span>
            </span>
          </div>
        </div>

        {/* Error Alert with Diagnostics */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 space-y-2.5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
              <div className="leading-relaxed font-sans">{errorMessage}</div>
            </div>

            {/* Reachability diagnostics details if available */}
            {reachability && (
              <div className="mt-2 pt-2 border-t border-red-500/20 text-[11px] font-mono space-y-1 text-neutral-300 bg-black/40 p-2.5 rounded-lg">
                <div className="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                  Direct Network Ping Result
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Target Host:</span>
                  <span className="text-white font-bold">{reachability.hostname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Network Reachable:</span>
                  <span className={reachability.reachable ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                    {reachability.reachable ? 'Reachable (200 OK)' : 'Unreachable (Failed to connect)'}
                  </span>
                </div>
                {reachability.error && (
                  <div className="text-red-300 break-all pt-1">
                    <span className="text-neutral-400">Reason: </span>
                    {reachability.isDnsOrNetworkFailure
                      ? 'DNS NXDOMAIN / Host name not resolved. The domain does not exist or the project is paused/deleted.'
                      : reachability.error}
                  </div>
                )}
              </div>
            )}

            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingReachability}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#E7C226] hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${testingReachability ? 'animate-spin' : ''}`} />
                <span>{testingReachability ? 'Pinging Supabase...' : 'Test Connection'}</span>
              </button>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-neutral-300">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@neighborhood.org"
                className="w-full px-4 py-3 pl-10 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226] text-sm"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono uppercase text-neutral-300">
                Password
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-[11px] text-[#E7C226] hover:underline font-mono"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full px-4 py-3 pl-10 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226] text-sm"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-cut py-4 text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 mt-4 shadow-[0_0_25px_rgba(231,194,38,0.35)] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>Verifying...</span>
              </span>
            ) : (
              <>
                <span>Sign In to HIVE</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-center text-xs">
          <div className="text-neutral-400">
            Don&apos;t have a citizen account?{' '}
            <Link
              to="/auth/register"
              className="text-[#E7C226] font-bold hover:underline font-mono"
            >
              Register Account &rarr;
            </Link>
          </div>

          <div className="pt-2 border-t border-white/5">
            <Link
              to="/admin/login"
              className="text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 text-[11px] font-mono"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E7C226]" />
              <span>Municipal Officials: Access Admin Console &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
