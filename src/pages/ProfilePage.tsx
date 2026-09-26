import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, UserRound, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

export const ProfilePage: React.FC = () => {
  const location = useLocation();
  const home = location.pathname.startsWith('/admin') ? '/admin' : '/app';
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    void authService.getCurrentUser().then((user) => {
      if (!active) return;
      setProfile(user);
      setName(user?.full_name ?? '');
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    setSaved(false);
    const result = await authService.updateDisplayName(name);
    if (result.error || !result.user) {
      setError(result.error || 'Could not update your name.');
    } else {
      setProfile(result.user);
      setName(result.user.full_name);
      setSaved(true);
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center text-[#E7C226] font-mono text-sm">Loading profile...</div>;
  if (!profile) return <div className="min-h-[70vh] flex items-center justify-center text-neutral-300">Profile unavailable. Please sign in again.</div>;

  return (
    <div className="relative z-10 min-h-[80vh] pt-28 pb-16 px-4 sm:px-8 max-w-2xl mx-auto">
      <Link to={home} className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#CC9E33] hover:text-[#E7C226] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to {home === '/admin' ? 'admin dashboard' : 'civic feed'}
      </Link>
      <div className="glass-panel rounded-2xl border border-[#CC9E33]/30 p-6 sm:p-9 space-y-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <header className="flex items-center gap-4 border-b border-white/10 pb-6">
          <div className="w-12 h-12 rounded-xl border border-[#E7C226]/40 bg-[#E7C226]/10 flex items-center justify-center text-[#E7C226]">
            <UserRound className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-mono text-[#CC9E33]">HIVE Account</p>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Your Profile</h1>
          </div>
        </header>
        <form onSubmit={save} className="space-y-5">
          <div>
            <label htmlFor="profile-full-name" className="block text-xs uppercase tracking-wider font-mono text-[#CC9E33] mb-2">Display name</label>
            <input id="profile-full-name" type="text" autoComplete="name" required maxLength={80}
              value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }}
              className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-white focus:border-[#E7C226] focus:outline-none"
            />
            <p className="mt-2 text-xs text-neutral-400">This name appears in your dashboard and navigation.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><span className="block text-xs uppercase tracking-wider font-mono text-[#CC9E33] mb-2">Email</span><span className="block break-all rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-300">{profile.email}</span></div>
            <div><span className="block text-xs uppercase tracking-wider font-mono text-[#CC9E33] mb-2">Account role</span><span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-300 capitalize"><ShieldCheck className="w-4 h-4 text-[#E7C226]" />{profile.role}</span></div>
          </div>
          <p className="text-xs text-neutral-500">Email and account role can't be changed here.</p>
          {error && <p role="alert" className="flex gap-2 text-red-300 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</p>}
          {saved && <p role="status" className="flex gap-2 text-emerald-300 text-sm"><CheckCircle2 className="w-4 h-4 shrink-0" />Name saved.</p>}
          <button type="submit" disabled={saving || !name.trim() || name.trim() === profile.full_name}
            className="btn-cut px-7 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : 'Save name'}
          </button>
        </form>
      </div>
    </div>
  );
};
