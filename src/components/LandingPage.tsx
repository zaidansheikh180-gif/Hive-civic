import React, { useEffect } from 'react';
import { Page } from '../types';
import { Twitter, Linkedin, Facebook } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    const motion = window.Motion ? window.Motion : null;
    if (motion) {
      /* Use motion.animate for JS animations */
      motion.animate(
        '#hero-headline',
        { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] },
        { duration: 0.8, easing: [0.16, 1, 0.3, 1] }
      );
      motion.animate(
        '#hero-subhead',
        { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] },
        { duration: 0.6, delay: 0.15, easing: [0.16, 1, 0.3, 1] }
      );
      motion.animate(
        '#hero-actions',
        { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] },
        { duration: 0.7, delay: 0.3, easing: [0.16, 1, 0.3, 1] }
      );
      motion.animate(
        '#hero-status-card',
        { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] },
        { duration: 0.7, delay: 0.4, easing: [0.16, 1, 0.3, 1] }
      );
      motion.animate(
        '#hero-left-rail',
        { opacity: [0, 1], transform: ['translateX(-16px)', 'translateX(0px)'] },
        { duration: 0.6, delay: 0.1, easing: [0.16, 1, 0.3, 1] }
      );
      motion.animate(
        '.social-btn-motion',
        { opacity: [0, 1], transform: ['scale(0.85)', 'scale(1)'] },
        { duration: 0.5, delay: motion.stagger ? motion.stagger(0.08, { start: 0.45 }) : 0.45 }
      );
    } else {
      /* Fallback to existing CSS animations */
    }
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-between select-none">
      {/* Main Grid: Left Rail + Center Hero + Right Status Column */}
      <main className="grid grid-cols-12 px-6 sm:px-12 pt-28 sm:pt-32 pb-8 items-center flex-1 max-w-[1400px] mx-auto w-full">
        {/* Left Column (Rails / Status) */}
        <div id="hero-left-rail" className="hidden lg:flex col-span-1 h-full flex-col justify-center items-start animate-fadeUp delay-100">
          <div className="rail-text uppercase font-semibold">
            Community Driven 01
          </div>
          <div className="mt-8 space-y-2">
            <div className="w-10 h-10 border border-white rounded-full flex items-center justify-center text-[10px] font-mono">
              01
            </div>
            <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-[10px] font-mono text-white/40">
              02
            </div>
          </div>
        </div>

        {/* Center Content (Hero) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col justify-center space-y-2 animate-fadeUp delay-200">
          <p id="hero-subhead" className="text-xs sm:text-sm uppercase tracking-widest text-white/60 font-medium mb-2 sm:mb-4 font-helvetica">
            Empowering the local neighborhood
          </p>

          <h1 id="hero-headline" className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[80px] font-black leading-[0.92] sm:leading-[0.88] tracking-tighter uppercase font-helvetica">
            Making Local <br />
            <span className="text-[#CC9E33]/80 font-apoc italic lowercase first-letter:uppercase font-normal tracking-tight">Voices Heard</span> <br />
            <span className="gold-glow text-[#E7C226]">
              Hive Community
            </span>
          </h1>

          <div id="hero-actions" className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-12 font-helvetica">
            <p className="max-w-[280px] text-sm text-[#CC9E33]/80 leading-relaxed font-light font-helvetica">
              Improve your neighborhood together. A direct line between citizens and local government bodies.
            </p>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2 text-xs">
                <span className="status-dot bg-[#E7C226] animate-pulse" />
                <span className="text-[#CC9E33] font-mono">24 Active Issues in your area</span>
              </div>
              <button
                id="landing-get-started-btn"
                onClick={() => onNavigate('citizen')}
                className="btn-cut px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg group font-bold tracking-wider shadow-[0_0_25px_rgba(231,194,38,0.35)]"
              >
                Get Started{' '}
                <span className="ml-4 transition-transform duration-200 inline-block group-hover:translate-x-2">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Status Cards / Interactive Mock) */}
        <div className="col-span-12 lg:col-span-3 h-full flex flex-col justify-between items-start lg:items-end pb-4 space-y-6 mt-10 lg:mt-0">
          <div
            id="hero-status-card"
            style={{ animationDelay: '250ms' }}
            className="glass p-6 w-full space-y-6 border border-[#CC9E33]/30 relative overflow-hidden animate-card-timed-open"
          >
            <div className="card-sheen-line" style={{ animationDelay: '450ms' }} />
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-widest text-[#CC9E33]/70">
                Local Status
              </span>
              <span className="text-xs font-bold text-[#E7C226]">LIVE</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#CC9E33]/20 pb-2">
                <span className="text-xs text-white">Electricity</span>
                <span className="text-xs font-mono text-emerald-400">Resolved</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#CC9E33]/20 pb-2">
                <span className="text-xs text-white">Public Safety</span>
                <span className="text-xs font-mono text-[#E7C226]">Review</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white">Sanitation</span>
                <span className="text-xs font-mono text-[#CC9E33]">Pending</span>
              </div>
            </div>
          </div>

          {/* Socials / Connect */}
          <div className="flex space-x-3 self-start lg:self-end">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              title="Hive on X"
              className="btn-cut-sm social-btn-motion text-white"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              title="Hive on LinkedIn"
              className="btn-cut-sm social-btn-motion text-white"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              title="Hive on Facebook"
              className="btn-cut-sm social-btn-motion text-white"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 sm:px-12 py-4 flex flex-col sm:flex-row justify-between items-center text-[10px] tracking-widest uppercase opacity-40 gap-2 border-t border-white/5">
        <div>© 2024 Hive Civic Technology Group</div>
        <div>Security Verified & Encrypted</div>
        <div>Version 1.0.4 - Beta</div>
      </footer>
    </section>
  );
};
