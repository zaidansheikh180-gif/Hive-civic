import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const CitizenLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const destination = (location.state as any)?.from?.pathname || '/app';

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
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#E7C226]/10 border border-[#E7C226]/40 flex items-center justify-center text-[#E7C226] mx-auto shadow-[0_0_20px_rgba(231,194,38,0.25)]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-helvetica">
            Citizen Sign In
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            Enter HIVE to submit, endorse & track municipal proposals
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
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
