import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  ArrowRight,
  Shield,
  FileCheck,
  Building2,
  Users,
  Compass,
  Layers,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Lock,
  Eye,
  Activity,
  Cpu,
} from 'lucide-react';

export const WelcomeAbout: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      setIsAuthenticated(Boolean(user));
    });
  }, []);

  const handleEnterHive = () => {
    if (isAuthenticated) {
      navigate('/app');
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-between select-none">
      {/* 1. HERO SECTION: 3D-INTEGRATED WORLD ENTRY */}
      <section className="grid grid-cols-12 gap-8 items-center min-h-[75vh] py-8">
        <div className="col-span-12 lg:col-span-8 space-y-6 z-10 animate-fadeUp">
          {/* Status micro-pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7C226]/10 border border-[#E7C226]/30 text-[#E7C226] text-xs font-mono tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#E7C226] animate-pulse" />
            <span>Civic Technology &bull; Academic Research Initiative</span>
          </div>

          {/* Main Display Headline */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase text-white font-helvetica leading-[0.92]">
              HIVE
            </h1>
            <p className="text-2xl sm:text-4xl md:text-5xl font-normal font-apoc italic text-[#E7C226] drop-shadow-[0_0_30px_rgba(231,194,38,0.4)]">
              &ldquo;Decentralized Digital Suggestion Box for Local Governance.&rdquo;
            </p>
          </div>

          {/* Concise Mission Statement */}
          <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl leading-relaxed font-light font-helvetica">
            Bridging the structural gap between neighborhood residents and municipal authorities through an immutable, transparent, and tracked civic intake pipeline.
          </p>

          {/* Core Call to Action: ENTER HIVE */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={handleEnterHive}
              id="enter-hive-hero-btn"
              className="btn-cut px-10 py-5 text-base sm:text-lg font-black uppercase tracking-widest flex items-center gap-3 shadow-[0_0_35px_rgba(231,194,38,0.5)] group transition-all"
            >
              <span>{isAuthenticated ? 'Open HIVE Dashboard' : 'ENTER HIVE'}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5 text-[#0B0B0F]" />
            </button>

            <a
              href="#how-it-works"
              className="btn-cut-border px-6 py-4 text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white"
            >
              Explore Project Overview &darr;
            </a>
          </div>

          {/* Trust & Transparency Metrics Bar */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#CC9E33]/20 max-w-xl">
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#E7C226]">100%</div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                Open Ledger
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#38BDF8]">DSB-ID</div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                Audit Timeline
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#10B981]">6 Stages</div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                Resolution Flow
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Highlights */}
        <div className="col-span-12 lg:col-span-4 space-y-4 z-10 animate-fadeUp delay-200">
          <div className="glass-panel p-6 border border-[#CC9E33]/30 relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#CC9E33]/80">
                Civic Governance Node
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                PROTOTYPE ACTIVE
              </span>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E7C226] flex-shrink-0 mt-0.5" />
                <span>Verified PostgreSQL relational storage with strict Row Level Security</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E7C226] flex-shrink-0 mt-0.5" />
                <span>End-to-end audit trails logged for every municipal status transition</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E7C226] flex-shrink-0 mt-0.5" />
                <span>Citizen accounts with optional anonymous public identity protection</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[10px] font-mono uppercase text-[#E7C226] font-semibold">
                Academic Research Notice
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug">
                HIVE demonstrates decentralized digital ledger workflows for modern urban participation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM & WHY HIVE EXISTS */}
      <section className="py-16 border-t border-[#CC9E33]/20 relative z-10 space-y-8">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-[#E7C226]">
            01 &bull; Origin & Motivation
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-helvetica uppercase text-white tracking-tight">
            The Problem HIVE Addresses
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
            In traditional municipal governance, citizen suggestions, road hazard reports, and community proposals face deep systemic friction:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 border border-red-500/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-mono font-bold">
              01
            </div>
            <h3 className="text-base font-bold text-white uppercase">The Black Hole Effect</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Citizens submit grievances via paper complaint boxes, disparate phone helplines, or one-way email addresses, only to never receive acknowledgment, case reference numbers, or progress tracking.
            </p>
          </div>

          <div className="glass-panel p-6 border border-amber-500/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold">
              02
            </div>
            <h3 className="text-base font-bold text-white uppercase">Opaque Decision Making</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              When projects are approved or rejected, municipal rationales remain locked inside internal committee memos. The community never learns why an initiative succeeded or why funding stalled.
            </p>
          </div>

          <div className="glass-panel p-6 border border-[#E7C226]/20 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7C226]/10 border border-[#E7C226]/30 flex items-center justify-center text-[#E7C226] font-mono font-bold">
              03
            </div>
            <h3 className="text-base font-bold text-white uppercase">Fragmented Community Priorities</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Without a collective civic registry, multiple neighbors submit duplicate reports for the same intersection or park hazard, while municipal teams struggle to prioritize by community demand.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS: THE 4-STAGE PIPELINE */}
      <section id="how-it-works" className="py-16 border-t border-[#CC9E33]/20 relative z-10 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-[#E7C226]">
            02 &bull; Methodology
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-helvetica uppercase text-white tracking-tight">
            How the Digital Suggestion Box Works
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            A transparent, verifiable pipeline linking grassroots proposals with municipal resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 border-t-2 border-t-[#E7C226] space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-[#E7C226]/10 text-[#E7C226] flex items-center justify-center font-mono font-bold text-xs">
                01
              </span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">Intake</span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase">Citizen Submission</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Resident submits a proposal across 10 municipal categories with title, description, location text, and optional photo attachment.
            </p>
          </div>

          <div className="glass-panel p-6 border-t-2 border-t-[#38BDF8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center font-mono font-bold text-xs">
                02
              </span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">Immutable ID</span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase">DSB Reference Key</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Database issues a unique alphanumeric reference ID (e.g. <code className="text-[#E7C226]">DSB-2026-7F3K9P</code>) for perpetual tracking.
            </p>
          </div>

          <div className="glass-panel p-6 border-t-2 border-t-[#CC9E33] space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-[#CC9E33]/10 text-[#CC9E33] flex items-center justify-center font-mono font-bold text-xs">
                03
              </span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">Endorsement</span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase">Community Support</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Fellow residents inspect the proposal on the civic feed and click to endorse, signaling community demand to municipal planners.
            </p>
          </div>

          <div className="glass-panel p-6 border-t-2 border-t-[#10B981] space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-mono font-bold text-xs">
                04
              </span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">Triage</span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase">Official Transition</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Authorized municipal administrators review proposals, transition statuses, and append public audit notes down to implementation.
            </p>
          </div>
        </div>
      </section>

      {/* 4. WHO IT IS FOR: CITIZENS & ADMINISTRATORS */}
      <section className="py-16 border-t border-[#CC9E33]/20 relative z-10 space-y-10">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-[#E7C226]">
            03 &bull; Stakeholders
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-helvetica uppercase text-white tracking-tight">
            Designed for Both Halves of the City
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Citizens Panel */}
          <div className="glass-panel p-8 border border-[#E7C226]/30 space-y-6 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E7C226]/10 border border-[#E7C226]/40 flex items-center justify-center text-[#E7C226]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase text-white font-helvetica">
                  What Citizens Can Do
                </h3>
                <span className="text-xs font-mono text-[#CC9E33]/80">Residents &bull; Neighborhood Associations</span>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E7C226] flex-shrink-0 mt-0.5" />
                <span><strong>Submit Infrastructure Ideas:</strong> Log road hazards, missing crosswalks, waste overflow, and park repairs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E7C226] flex-shrink-0 mt-0.5" />
                <span><strong>Privacy Controls:</strong> Choose &ldquo;Submit Anonymously&rdquo; to protect personal identity from public display.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E7C226] flex-shrink-0 mt-0.5" />
                <span><strong>Track Life-Cycle:</strong> Query your DSB Reference ID anytime to view real-time stage updates and official notes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E7C226] flex-shrink-0 mt-0.5" />
                <span><strong>My Suggestions Portfolio:</strong> View all previous proposals submitted by your authenticated account.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E7C226] flex-shrink-0 mt-0.5" />
                <span><strong>Community Endorsements:</strong> Support proposals from neighbors to elevate critical issues to municipal priority.</span>
              </li>
            </ul>
          </div>

          {/* Administrators Panel */}
          <div className="glass-panel p-8 border border-[#38BDF8]/30 space-y-6 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8]">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase text-white font-helvetica">
                  What Administrators Can Do
                </h3>
                <span className="text-xs font-mono text-[#38BDF8]/80">Municipal Directors &bull; Civic Coordinators</span>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8] flex-shrink-0 mt-0.5" />
                <span><strong>Triage Queue:</strong> Filter submissions across 10 municipal categories and 6 distinct resolution stages.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8] flex-shrink-0 mt-0.5" />
                <span><strong>Transition Statuses:</strong> Move issues through submitted &rarr; under_review &rarr; accepted &rarr; planned &rarr; implemented (or rejected).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8] flex-shrink-0 mt-0.5" />
                <span><strong>Publish Official Notes:</strong> Document why an item was accepted, contractor schedules, or budget considerations.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8] flex-shrink-0 mt-0.5" />
                <span><strong>Demographic Analytics:</strong> Inspect distribution charts to identify high-urgency districts and neglected infrastructure.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8] flex-shrink-0 mt-0.5" />
                <span><strong>Verifiable Ledger:</strong> Maintain tamper-evident history with database-enforced Row Level Security.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. ACADEMIC PROTOTYPE NOTICE & NON-GOVERNMENTAL DISCLAIMER */}
      <section className="py-12 border-t border-[#CC9E33]/20 relative z-10">
        <div className="glass-panel p-6 sm:p-8 border border-amber-500/30 bg-amber-500/5 rounded-2xl space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold font-helvetica uppercase text-white tracking-wide">
                Important Academic Prototype Notice & Legal Disclaimer
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                <strong>HIVE is an academic and community research prototype</strong> designed to investigate the design, trust dynamics, and human-computer interactions of transparent municipal suggestion boxes.
              </p>
              <p className="text-xs text-amber-300/90 leading-relaxed font-mono">
                NOTICE: HIVE is NOT an official government portal, municipal agency, or 911/emergency dispatch system.
                Submissions made here do not trigger legally binding municipal statutory timelines. For acute emergencies, hazardous gas leaks, or immediate life safety risks, please contact your local emergency response authorities immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="py-16 text-center space-y-6 relative z-10">
        <h2 className="text-3xl sm:text-5xl font-black uppercase text-white font-helvetica tracking-tight">
          Ready to Participate?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
          Enter the HIVE civic network to submit proposals, track community infrastructure, and inspect municipal progress.
        </p>
        <div>
          <button
            onClick={handleEnterHive}
            id="enter-hive-footer-btn"
            className="btn-cut px-12 py-5 text-lg font-black uppercase tracking-widest inline-flex items-center gap-3 shadow-[0_0_40px_rgba(231,194,38,0.5)] group"
          >
            <span>{isAuthenticated ? 'Open HIVE Dashboard' : 'ENTER HIVE'}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5 text-[#0B0B0F]" />
          </button>
        </div>
      </section>
    </div>
  );
};
