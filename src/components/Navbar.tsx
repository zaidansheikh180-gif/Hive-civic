import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { authService } from '../services/authService';
import { UserProfile } from '../types';
import {
  ShieldCheck,
  Plus,
  LogOut,
  User,
  FolderHeart,
  Search,
  Building2,
  LogIn,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(
    authService.getCurrentUserSync()
  );
  const isLiveSupabase = isSupabaseConfigured();

  const isAdminArea = currentPath.startsWith('/admin');

  useEffect(() => {
    // Initial fetch from session
    authService.getCurrentUser().then(setCurrentUser);

    // Real-time auth subscription
    const unsubscribe = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    if (isAdminArea) {
      navigate('/admin/login');
    } else {
      navigate('/auth/login');
    }
  };

  // Nav links based on context
  const getNavLinks = () => {
    if (isAdminArea) {
      return [
        { path: '/admin', label: 'Admin Dashboard' },
        { path: '/admin/suggestions', label: 'Triage Queue' },
        { path: '/app', label: 'Citizen View' },
      ];
    }

    return [
      { path: '/', label: 'About HIVE' },
      { path: '/app', label: 'Civic Feed' },
      { path: '/app/submit', label: 'Submit' },
      { path: '/app/track', label: 'Track' },
      ...(currentUser ? [{ path: '/app/suggestions', label: 'My Suggestions' }] : []),
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 px-4 sm:px-8 py-3.5 flex justify-between items-center glass select-none">
      {/* Logo: Hexagon polygon SVG + HIVE */}
      <Link
        to={currentUser ? (isAdminArea ? '/admin' : '/app') : '/'}
        className="flex items-center space-x-3 group focus:outline-none"
        title="Return to HIVE Home"
        id="hive-logo-btn"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform group-hover:scale-105 flex-shrink-0"
        >
          <polygon points="12,2 22,8 22,18 12,24 2,18 2,8" stroke="#E7C226" strokeWidth="2" />
          <polygon points="12,6 18,10 18,16 12,20 6,16 6,10" fill="#E7C226" />
        </svg>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-[0.3em] uppercase text-white group-hover:text-[#E7C226] transition-colors leading-none">
            {isAdminArea ? 'HIVE ADMIN' : 'HIVE'}
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
              : currentPath === link.path ||
                (link.path !== '/' && currentPath.startsWith(link.path));

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                isActive
                  ? 'text-[#E7C226] bg-[#E7C226]/10 shadow-[0_0_12px_rgba(231,194,38,0.25)] font-bold'
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
        {/* Supabase Status Pill */}
        <div
          className={`hidden lg:flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border ${
            isLiveSupabase
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
          title={
            isLiveSupabase
              ? 'Connected to live Supabase cloud database via anon client'
              : 'Supabase URL and Anon key missing in environment'
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLiveSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>{isLiveSupabase ? 'Supabase Active' : 'Supabase Inactive'}</span>
        </div>

        {/* Authenticated User state */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            <Link
              to={currentUser.role === 'admin' ? '/admin' : '/app/suggestions'}
              className="btn-cut-border px-3 py-1.5 text-xs font-mono hidden sm:inline-flex items-center gap-1.5"
              title={`Authenticated as ${currentUser.full_name} (${currentUser.role})`}
            >
              {currentUser.role === 'admin' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-[#E7C226]" />
              ) : (
                <User className="w-3.5 h-3.5 text-[#E7C226]" />
              )}
              <span className="hidden xl:inline">{currentUser.full_name.split(' ')[0]}</span>
              <span className="text-[10px] text-[#E7C226] font-bold uppercase">
                [{currentUser.role}]
              </span>
            </Link>

            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/40 text-neutral-400 hover:text-red-300 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/auth/login"
              className="btn-cut-border px-3.5 py-1.5 text-xs font-mono hidden sm:inline-flex items-center gap-1.5"
              id="nav-citizen-login-btn"
            >
              <LogIn className="w-3.5 h-3.5 text-[#E7C226]" />
              <span>Citizen Sign In</span>
            </Link>

            <Link
              to="/admin/login"
              className="text-xs font-mono text-neutral-400 hover:text-white px-2 py-1 hidden xl:inline-block"
              title="Municipal Administrator Portal"
            >
              Admin &rarr;
            </Link>
          </div>
        )}

        {/* Primary CTA button */}
        <Link
          to="/app/submit"
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
