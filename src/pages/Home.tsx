import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { suggestionService } from '../services/suggestionService';
import { Suggestion, DashboardStats } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Send,
  Search,
  CheckCircle2,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  MapPin,
  Flame,
} from 'lucide-react';

export const Home: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSuggestions, setRecentSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    suggestionService.getDashboardStats().then(setStats);
    suggestionService.getSuggestions({ sortBy: 'newest' }).then((list) => {
      setRecentSuggestions(list.slice(0, 3));
    });
  }, []);

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-between">
      {/* 1. Hero Grid Section */}
      <div className="grid grid-cols-12 gap-6 items-center min-h-[75vh] py-8">
        {/* Left Col: Main Typography & CTAs */}
        <div className="col-span-12 lg:col-span-7 space-y-6 z-10 animate-fadeUp">
          <div className="flex items-center gap-2 text-[#E7C226] text-xs font-mono tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#E7C226] animate-pulse" />
            <span>Digital Suggestion Box for Local Governance</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight uppercase text-white font-helvetica leading-none">
              HIVE
            </h1>
            <p className="text-3xl sm:text-4xl font-normal font-apoc italic text-[#E7C226] drop-shadow-[0_0_25px_rgba(231,194,38,0.35)]">
              &ldquo;Your voice shapes the place you live.&rdquo;
            </p>
          </div>

          <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
            An open academic civic platform empowering residents to submit infrastructure hazards, neighborhood proposals, and urban improvements directly into a transparent, tracked municipal workflow.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/submit"
              className="btn-cut px-7 py-3.5 text-sm sm:text-base font-extrabold uppercase tracking-wider flex items-center gap-2.5 shadow-[0_0_25px_rgba(231,194,38,0.4)]"
            >
              <Send className="w-4 h-4" />
              <span>Submit a Suggestion</span>
            </Link>

            <Link
              to="/track"
              className="btn-cut-border px-6 py-3.5 text-sm font-semibold uppercase tracking-wider flex items-center gap-2"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Track a Suggestion</span>
              </span>
            </Link>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#CC9E33]/20 max-w-lg">
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#E7C226]">
                {stats ? stats.total : '6+'}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                Total Proposals
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#10B981]">
                {stats ? stats.implemented : '1'}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                Implemented
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#38BDF8]">
                {stats ? stats.under_review + stats.planned : '3'}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                Active In Progress
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Transparency Feed Snapshot */}
        <div className="col-span-12 lg:col-span-5 space-y-4 z-10 animate-fadeUp delay-200">
          <div className="glass-panel p-6 border border-[#CC9E33]/30 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#E7C226]">
                <Flame className="w-4 h-4 text-[#E7C226]" />
                <span>Live Civic Stream</span>
              </div>
              <span className="text-[10px] font-mono text-[#CC9E33]/70">
                Transparent Ledger
              </span>
            </div>

            <div className="space-y-3">
              {recentSuggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/track?ref=${item.reference_id}`}
                  className="block p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#E7C226]/50 hover:bg-[#E7C226]/5 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-[#CC9E33] bg-[#CC9E33]/15 px-2 py-0.5 rounded">
                      {item.reference_id}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-[#E7C226] transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#E7C226]" />
                      <span className="truncate max-w-[150px]">{item.location_text}</span>
                    </span>
                    <span className="text-[#E7C226] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Track <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Want to inspect all records?</span>
              <Link
                to="/admin/suggestions"
                className="text-[#E7C226] hover:underline flex items-center gap-1 font-mono uppercase text-[11px]"
              >
                <span>Browse Registry</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Civic Lifecycle 3-Step Overview Section */}
      <div className="py-12 border-t border-[#CC9E33]/20 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-apoc italic text-white">
            How the Digital Suggestion Box Works
          </h2>
          <p className="text-xs sm:text-sm text-[#CC9E33]/80 mt-1">
            A three-stage transparent pipeline connecting citizen feedback with actionable governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 border-l-4 border-l-[#E7C226] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#E7C226]/10 flex items-center justify-center text-[#E7C226] font-mono font-bold">
              01
            </div>
            <h3 className="text-lg font-bold text-white">Citizen Submission</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Citizens describe issues or ideas across 10 municipal categories, with optional location tags, photos, and anonymous privacy protection.
            </p>
          </div>

          <div className="glass-panel p-6 border-l-4 border-l-[#38BDF8] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#38BDF8]/10 flex items-center justify-center text-[#38BDF8] font-mono font-bold">
              02
            </div>
            <h3 className="text-lg font-bold text-white">Unique DSB Reference ID</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Every submission immediately generates a unique, human-readable reference ID (e.g. DSB-2026-7F3K9P) used to track the civic timeline publicly.
            </p>
          </div>

          <div className="glass-panel p-6 border-l-4 border-l-[#10B981] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] font-mono font-bold">
              03
            </div>
            <h3 className="text-lg font-bold text-white">Administrative Triage & Notes</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Municipal coordinators review the suggestion, transition its status from under review to implementation, and log transparent audit notes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
