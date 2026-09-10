import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export const CitizenForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(email);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative z-10">
      <div className="w-full max-w-md glass-panel p-8 border border-[#E7C226]/30 shadow-[0_0_50px_rgba(231,194,38,0.2)] rounded-2xl relative overflow-hidden animate-fadeUp">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E7C226]/10 blur-2xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#E7C226]/10 border border-[#E7C226]/40 flex items-center justify-center text-[#E7C226] mx-auto shadow-[0_0_20px_rgba(231,194,38,0.25)]">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-helvetica">
            Password Recovery
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            Receive a secure recovery link via Supabase Auth
          </p>
        </div>

        {/* Success Alert */}
        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div className="font-bold text-white text-sm">Recovery Link Dispatched</div>
              <p className="leading-relaxed">
                If an account matches <strong className="text-white">{email}</strong>, a password reset email has been transmitted. Please check your inbox.
              </p>
            </div>

            <Link
              to="/auth/login"
              className="w-full btn-cut py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-neutral-300">
                Registered Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-cut py-4 text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 mt-4 shadow-[0_0_25px_rgba(231,194,38,0.35)] disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Transmitting...</span>
                </span>
              ) : (
                <>
                  <span>Send Recovery Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 text-center">
              <Link
                to="/auth/login"
                className="text-neutral-400 hover:text-white text-xs font-mono flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
