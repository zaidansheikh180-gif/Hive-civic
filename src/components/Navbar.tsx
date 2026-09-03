import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { authService } from '../services/authService';
import { ShieldCheck, Plus, Search, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentAdmin = authService.getCurrentAdmin();
  const isLiveSupabase = isSupabaseConfigured();

  const handleSignOut = async () => {
    await authService.signOut();
    window.location.href = '/admin/login';
  };

  const navLinks = [
    { path: '/', label: 'Overview' },
    { path: '/submit', label: 'Submit Suggestion' },
    { path: '/track', label: 'Track Status' },
    { path: '/admin', label: 'Admin Center' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 px-4 sm:px-8 py-3.5 flex justify-between items-center glass">
      {/* Logo: Hexagon polygon SVG + HIVE */}
      <Link
        to="/"
        className="flex items-center space-x-3 group focus:outline-none"
        title="Return to Hive Home"
        id="hive-logo-btn"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform group-hover:scale-105"
        >
          <polygon points="12,2 22,8 22,18 12,24 2,18 2,8" stroke="#E7C226" strokeWidth="2" />
          <polygon points="12,6 18,10 18,16 12,20 6,16 6,10" fill="#E7C226" />
        </svg>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-[0.3em] uppercase text-white group-hover:text-[#E7C226] transition-colors leading-none">
            HIVE
          </span>
          <span className="text-[9px] font-mono tracking-widest text-[#CC9E33]/70 uppercase pt-0.5">
            Digital Suggestion Box
          </span>
        </div>
      </Link>

      {/* Center Navigation Links (Desktop) */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider uppercase">
        {navLinks.map((link) => {
          const isActive =
            link.path === '/'
              ? currentPath === '/'
              : currentPath.startsWith(link.path);

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                isActive
                  ? 'text-[#E7C226] bg-[#E7C226]/10 shadow-[0_0_12px_rgba(231,194,38,0.25)]'
                  : 'text-[#CC9E33]/70 hover:text-[#CC9E33] hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right Nav Action Buttons */}
      <div className="flex items-center space-x-2.5 sm:space-x-4">
        {/* Supabase / Local Storage Sync Pill */}
        <div
          className={`hidden lg:flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-full border ${
            isLiveSupabase
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-[#CC9E33]/10 border-[#CC9E33]/30 text-[#CC9E33]'
          }`}
          title={
            isLiveSupabase
              ? 'Connected to live Supabase cloud database'
              : 'Running on local persistent database. Set VITE_SUPABASE_URL in .env to connect.'
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLiveSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-[#E7C226]'
            }`}
          />
          <span>{isLiveSupabase ? 'Supabase Active' : 'Local DB Active'}</span>
        </div>

        {/* Action button based on auth state */}
        {currentAdmin ? (
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="btn-cut-border hidden sm:inline-flex"
              title={`Logged in as ${currentAdmin.full_name}`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E7C226]" />
                <span className="hidden xl:inline">Admin</span>
              </span>
            </Link>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/40 text-neutral-400 hover:text-red-300 transition-colors"
              title="Sign Out of Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/admin/login"
            className="btn-cut-border hidden sm:inline-flex"
            id="nav-admin-btn"
          >
            <span>Admin Login</span>
          </Link>
        )}

        <Link
          to="/submit"
          id="nav-submit-btn"
          className="btn-cut px-4 sm:px-5 py-2 text-xs sm:text-xs shadow-[0_0_15px_rgba(231,194,38,0.3)] flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Submit</span>
        </Link>
      </div>
    </nav>
  );
};
