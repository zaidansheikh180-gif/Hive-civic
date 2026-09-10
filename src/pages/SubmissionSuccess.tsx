import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Check,
  Search,
  Plus,
  ArrowRight,
  FolderHeart,
  ExternalLink,
} from 'lucide-react';

export const SubmissionSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const refId = searchParams.get('ref') || 'DSB-2026-7F3K9P';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(refId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative min-h-screen pt-28 pb-16 px-4 sm:px-8 max-w-3xl mx-auto flex flex-col items-center justify-center text-center z-10 select-none">
      {/* Glowing Checkmark Emblem */}
      <div className="w-20 h-20 rounded-full bg-[#E7C226]/15 border-2 border-[#E7C226] flex items-center justify-center text-[#E7C226] mb-6 shadow-[0_0_35px_rgba(231,194,38,0.5)] animate-fadeUp">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>

      <div className="space-y-3 max-w-xl mb-8 animate-fadeUp delay-100">
        <div className="text-xs font-mono uppercase tracking-[0.25em] text-[#E7C226]">
          Civic Ledger Entry Confirmed
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-helvetica uppercase text-white tracking-tight">
          Suggestion Received
        </h1>
        <p className="text-sm text-neutral-300 font-apoc italic leading-relaxed">
          Your proposal has been registered into the municipal public intake queue. Use your unique reference identifier to monitor each stage of review and field response.
        </p>
      </div>

      {/* Prominent Reference Identifier Card */}
      <div className="w-full max-w-md glass-panel p-6 sm:p-8 border-2 border-[#E7C226]/60 shadow-[0_0_40px_rgba(231,194,38,0.2)] mb-8 animate-fadeUp delay-200">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#CC9E33] block mb-2">
          Your Official Tracking Identifier
        </span>

        <div className="text-2xl sm:text-3xl font-mono font-black tracking-widest py-3 px-4 bg-black/60 rounded-xl border border-[#E7C226]/40 select-all mb-4 text-[#E7C226]">
          {refId}
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-[#E7C226]/20 border border-white/15 hover:border-[#E7C226] text-white text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#10B981]" />
              <span className="text-[#10B981]">Reference ID Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#E7C226]" />
              <span>Copy Reference Identifier</span>
            </>
          )}
        </button>
      </div>

      {/* Action Next Steps */}
      <div className="flex flex-wrap items-center justify-center gap-4 animate-fadeUp delay-300">
        <Link
          to={`/app/track?ref=${encodeURIComponent(refId)}`}
          className="btn-cut px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(231,194,38,0.3)]"
        >
          <Search className="w-4 h-4" />
          <span>Track Status Now</span>
        </Link>

        <Link
          to="/app/suggestions"
          className="btn-cut-border px-5 py-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
        >
          <FolderHeart className="w-4 h-4 text-[#E7C226]" />
          <span>View My Suggestions</span>
        </Link>

        <Link
          to="/app/submit"
          className="btn-cut-border px-5 py-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Another</span>
        </Link>

        <Link
          to="/app"
          className="px-5 py-3 rounded-lg text-neutral-400 hover:text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
        >
          <span>Return to Feed</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
