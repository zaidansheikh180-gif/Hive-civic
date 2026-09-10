import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CitizenRegister: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Role is strictly assigned as 'citizen' on backend & auth metadata
      const res = await authService.signUp(email, password, fullName);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        navigate('/app', { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative z-10">
      <div className="w-full max-w-md glass-panel p-8 border border-[#E7C226]/30 shadow-[0_0_50px_rgba(231,194,38,0.2)] rounded-2xl relative overflow-hidden animate-fadeUp">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E7C226]/10 blur-2xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#E7C226]/10 border border-[#E7C226]/40 flex items-center justify-center text-[#E7C226] mx-auto shadow-[0_0_20px_rgba(231,194,38,0.25)]">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-helvetica">
            Create Citizen Account
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            Register to submit verified municipal proposals and track resolution
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
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full px-4 py-3 pl-10 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226] text-sm"
              />
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

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
            <label className="text-xs font-mono uppercase text-neutral-300">
              Password (min. 6 characters)
            </label>
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

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-neutral-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full px-4 py-3 pl-10 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226] text-sm"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#E7C226]/5 border border-[#E7C226]/20 text-[11px] text-neutral-300 font-mono flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#E7C226] flex-shrink-0 mt-0.5" />
            <span>Accounts are granted verified <strong>citizen</strong> status. Municipal administrative access is controlled strictly database-side.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-cut py-4 text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 mt-4 shadow-[0_0_25px_rgba(231,194,38,0.35)] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>Creating Account...</span>
              </span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-neutral-400">
          Already registered?{' '}
          <Link
            to="/auth/login"
            className="text-[#E7C226] font-bold hover:underline font-mono"
          >
            Sign In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
