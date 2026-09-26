import { LiquidGlassButton } from '../components/ui/LiquidGlassButton';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { InView } from '../components/InView';
import {
  ArrowRight,
  CheckCircle2,
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
      <section className="grid grid-cols-12 gap-8 lg:gap-14 items-center min-h-[75vh] py-10 lg:py-16">
        <div className="col-span-12 lg:col-span-8 space-y-7 z-10 animate-fadeUp">
          {/* Status micro-pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7C226]/10 border border-[#E7C226]/30 text-[#E7C226] text-xs font-mono tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#E7C226] animate-pulse" />
            <span>A clearer route from ideas to action</span>
          </div>

          {/* Main Display Headline */}
          <div className="space-y-3">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase text-white font-helvetica leading-[0.92]">
              HIVE
            </h1>
            <p className="text-3xl sm:text-4xl md:text-5xl font-normal font-apoc italic text-[#E7C226] leading-[1.1] max-w-3xl">
              Make local issues<br className="hidden sm:block" /> impossible to ignore.
            </p>
          </div>

          {/* Concise Mission Statement */}
          <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl leading-relaxed font-light font-helvetica">
            Share an idea for your neighborhood, get a reference number, and follow what happens next. HIVE makes every step visible.
          </p>

          {/* Core Call to Action: ENTER HIVE */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <LiquidGlassButton
              onClick={handleEnterHive}
              id="enter-hive-hero-btn"
              className="btn-cut px-8 py-4 text-sm sm:text-base font-bold uppercase tracking-wider flex items-center gap-3 group"
            >
              <span>{isAuthenticated ? 'Open HIVE Dashboard' : 'ENTER HIVE'}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5 text-[#0B0B0F]" />
            </LiquidGlassButton>

            <a
              href="#how-it-works"
              className="hive-glass btn-cut-border px-6 py-4 text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white"
            >
              <span>How it works &darr;</span>
            </a>
          </div>

          {/* Trust & Transparency Metrics Bar */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-7 border-t border-[#CC9E33]/20 max-w-xl">
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#E7C226]">01</div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                Submit
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#E7C226]">02</div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                Track
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-[#E7C226]">03</div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                See progress
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Highlights */}
        <div className="col-span-12 lg:col-span-4 space-y-4 z-10 animate-fadeUp delay-200">
          <div className="glass-panel p-6 border border-[#CC9E33]/30 relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#CC9E33]/80">
                How HIVE works
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                RESEARCH PROTOTYPE
              </span>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E7C226] flex-shrink-0 mt-0.5" />
                <span>Describe a local issue or an idea worth pursuing.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E7C226] flex-shrink-0 mt-0.5" />
                <span>Get a reference number to return to your submission.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E7C226] flex-shrink-0 mt-0.5" />
                <span>See updates as a proposal moves through review.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[10px] font-mono uppercase text-[#E7C226] font-semibold">
                Academic Research Notice
              </div>
              <p className="text-[11px] text-neutral-400 leading-snug">
                An academic prototype, not an official government service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* An editorial sequence: the problem, the route, and the boundary. */}
      <InView as="section" once variants={{ hidden: { opacity: 0, transform: 'translateY(16px)' }, visible: { opacity: 1, transform: 'translateY(0px)' } }} transition={{ duration: 0.55, ease: 'easeOut' }} className="py-20 md:py-28 px-4 sm:px-8 -mx-4 sm:-mx-8 border-t border-[#CC9E33]/20 relative z-10 bg-[#0B0B0F]/95">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 md:gap-20 items-start">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#E7C226] mb-5">The problem</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">Good ideas need a way forward.</h2>
          </div>
          <div className="space-y-5 max-w-xl md:pt-10 text-base sm:text-lg leading-relaxed text-neutral-300">
            <p>When a local issue is raised, it should not disappear into a form. The person who submitted it needs a record they can return to.</p>
            <p>HIVE gives each proposal a reference number and a visible review history, so the next step is easier to find.</p>
          </div>
        </div>
      </InView>

      <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-8 -mx-4 sm:-mx-8 border-t border-[#CC9E33]/20 relative z-10 scroll-mt-20 bg-[#0B0B0F]/95">
        <div className="max-w-2xl mb-10 md:mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#E7C226] mb-5">The route</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">From a local issue to a clear record.</h2>
        </div>
        <div className="border-t border-white/15">
          {[
            ['01', 'Tell us what needs attention', 'Describe the issue, its location, and what would help. You can add a photo.'],
            ['02', 'Keep your reference number', 'Every submitted proposal gets an ID you can use to find it again.'],
            ['03', 'See where it stands', 'Follow the review stage and any notes added to the record.'],
            ['04', 'Support other proposals', 'Explore ideas from your community and endorse the ones you care about.'],
          ].map(([number, title, description]) => (
            <InView key={number} once variants={{ hidden: { opacity: 0, transform: 'translateY(12px)' }, visible: { opacity: 1, transform: 'translateY(0px)' } }} transition={{ duration: 0.45, ease: 'easeOut' }} className="grid sm:grid-cols-[5rem_1fr_1.2fr] gap-2 sm:gap-8 py-7 sm:py-9 border-b border-white/15 items-baseline">
              <span className="font-mono text-[#E7C226] text-sm">{number}</span>
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h3>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-lg">{description}</p>
            </InView>
          ))}
        </div>
      </section>

      <InView as="section" once variants={{ hidden: { opacity: 0, transform: 'translateY(16px)' }, visible: { opacity: 1, transform: 'translateY(0px)' } }} transition={{ duration: 0.55, ease: 'easeOut' }} className="py-16 md:py-20 px-4 sm:px-8 -mx-4 sm:-mx-8 border-t border-[#CC9E33]/20 relative z-10 bg-[#0B0B0F]/95">
        <div className="max-w-3xl">
          <p className="text-xs font-mono uppercase tracking-widest text-[#E7C226] mb-5">About this project</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Built to make the process easier to follow.</h2>
          <p className="text-neutral-300 leading-relaxed mb-6">Residents can submit and track proposals. Reviewers can update their status and add notes. The record stays in one place.</p>
          <div className="border-l-2 border-[#E7C226] pl-5 text-sm text-neutral-300 leading-relaxed">
            <strong className="block text-white mb-1">An academic research prototype, not a government service.</strong>
            HIVE does not contact emergency services or start official municipal response timelines. For an immediate safety issue, contact your local emergency service directly.
          </div>
        </div>
      </InView>

      <section className="py-20 md:py-28 px-4 sm:px-8 -mx-4 sm:-mx-8 border-t border-[#CC9E33]/20 relative z-10 bg-[#0B0B0F]/95 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
        <div className="max-w-xl">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Have something to raise?</h2>
          <p className="text-neutral-400">Start a proposal, or sign in to see what your neighbors are working on.</p>
        </div>
        <LiquidGlassButton onClick={handleEnterHive} id="enter-hive-footer-btn" className="btn-cut px-8 py-4 text-sm font-bold uppercase tracking-wider inline-flex items-center gap-3 group self-start sm:self-auto">
          <span>{isAuthenticated ? 'Open HIVE' : 'Enter HIVE'}</span>
          <ArrowRight className="w-5 h-5 text-[#0B0B0F]" />
        </LiquidGlassButton>
      </section>
    </div>
  );
};
