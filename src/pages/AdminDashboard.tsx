import { LiquidGlassLink } from '../components/ui/LiquidGlassButton';
import { LiquidGlassButton } from '../components/ui/LiquidGlassButton';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { suggestionService } from '../services/suggestionService';
import { Suggestion, DashboardStats, AdminProfile } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  Sparkles,
  XCircle,
  ArrowRight,
  TrendingUp,
  Inbox,
  LogOut,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  submitted: '#CC9E33',
  under_review: '#E7C226',
  accepted: '#38BDF8',
  planned: '#818CF8',
  implemented: '#10B981',
  rejected: '#EF4444',
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentList, setRecentList] = useState<Suggestion[]>([]);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void authService.getCurrentUser().then((current) => {
      if (!active) return;
      // ProtectedRoute guards this page, but identity still comes from the verified profile.
      if (!current || (current.role !== 'admin' && current.role !== 'moderator')) {
        navigate('/admin/login');
        return;
      }
      setAdmin(current);
      void suggestionService.getDashboardStats().then((value) => { if (active) setStats(value); }).catch(() => { if (active) setStatsError('Statistics could not be loaded.'); });
      void suggestionService.getSuggestions({ sortBy: 'newest' }).then((items) => {
        if (active) setRecentList(items.slice(0, 5));
      }).catch(() => { if (active) setRecentError('Recent proposals could not be loaded.'); })
        .finally(() => { if (active) setRecentLoading(false); });
    });
    return () => { active = false; };
  }, [navigate]);

  if (!admin) return null;

  // Each count is readable as text without relying on a chart tooltip or color.
  const categoryData = stats
    ? Object.entries(stats.categoryCounts).map(([cat, count]) => ({
        name: cat,
        count,
      }))
    : [];

  const statusData = stats ? [
    { name: 'Submitted', value: stats.submitted, key: 'submitted' },
    { name: 'Under Review', value: stats.under_review, key: 'under_review' },
    { name: 'Accepted', value: stats.accepted, key: 'accepted' },
    { name: 'Planned', value: stats.planned, key: 'planned' },
    { name: 'Implemented', value: stats.implemented, key: 'implemented' },
    { name: 'Rejected', value: stats.rejected, key: 'rejected' },
  ] : [];
  const metric = (value: number | undefined) => statsError ? 'Unavailable' : stats ? value : '...';

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto z-10 space-y-8">
      {/* Top Banner with Admin Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 border border-[#CC9E33]/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#E7C226]/15 border border-[#E7C226]/40 flex items-center justify-center text-[#E7C226]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#E7C226]">
              Review workspace
            </div>
            <h1 className="text-xl sm:text-2xl font-bold uppercase font-helvetica text-white">
              {admin.full_name}
            </h1>
            <div className="text-xs text-neutral-400 font-mono">
              Role: <span className="text-[#CC9E33] uppercase">{admin.role}</span> | {admin.email}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LiquidGlassLink
            to="/admin/suggestions"
            className="btn-cut px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Manage Suggestions</span>
          </LiquidGlassLink>

          <LiquidGlassButton
            onClick={async () => {
              await authService.signOut();
              navigate('/admin/login');
            }}
            className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/40 text-neutral-400 hover:text-red-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </LiquidGlassButton>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="glass-panel p-4 border border-white/10 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
            Total
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metric(stats?.total)}
          </div>
        </div>

        <div className="glass-panel p-4 border border-[#CC9E33]/30 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#CC9E33]">
            Submitted
          </div>
          <div className="text-2xl font-bold font-mono text-[#CC9E33]">
            {metric(stats?.submitted)}
          </div>
        </div>

        <div className="glass-panel p-4 border border-[#E7C226]/40 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#E7C226]">
            Under Review
          </div>
          <div className="text-2xl font-bold font-mono text-[#E7C226]">
            {metric(stats?.under_review)}
          </div>
        </div>

        <div className="glass-panel p-4 border border-[#38BDF8]/30 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8]">
            Accepted
          </div>
          <div className="text-2xl font-bold font-mono text-[#38BDF8]">
            {metric(stats?.accepted)}
          </div>
        </div>

        <div className="glass-panel p-4 border border-[#818CF8]/30 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#818CF8]">
            Planned
          </div>
          <div className="text-2xl font-bold font-mono text-[#818CF8]">
            {metric(stats?.planned)}
          </div>
        </div>

        <div className="glass-panel p-4 border border-[#10B981]/40 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#10B981]">
            Implemented
          </div>
          <div className="text-2xl font-bold font-mono text-[#10B981]">
            {metric(stats?.implemented)}
          </div>
        </div>

        <div className="glass-panel p-4 border border-[#EF4444]/30 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#EF4444]">
            Rejected
          </div>
          <div className="text-2xl font-bold font-mono text-[#EF4444]">
            {metric(stats?.rejected)}
          </div>
        </div>
      </div>

      {(statsError || !stats) && (
        <div role={statsError ? 'alert' : 'status'} className="glass-panel p-4 border border-white/10 text-sm text-neutral-300">
          {statsError || <span className="flex items-center gap-3"><span className="inline-block w-4 h-4 rounded-full border-2 border-[#E7C226] border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading statistics...</span>}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="glass-panel p-6 border border-[#CC9E33]/30 space-y-4" aria-label="Proposals by category">
          <h2 className="text-sm font-mono uppercase tracking-wider text-[#E7C226] flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Proposals by category
          </h2>
          {stats && (categoryData.length ? (
            <ul className="space-y-3">
              {categoryData.sort((a, b) => b.count - a.count).map(({ name, count }) => (
                <li key={name} className="space-y-1">
                  <div className="flex justify-between gap-3 text-sm text-neutral-200">
                    <span className="min-w-0 break-words">{name}</span><strong className="font-mono shrink-0">{count}</strong>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
                    <div className="h-full rounded-full bg-[#E7C226]" style={{ width: `${stats.total ? count / stats.total * 100 : 0}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-neutral-400">No proposals to show by category yet.</p>)}
        </section>
        <section className="glass-panel p-6 border border-[#CC9E33]/30 space-y-4" aria-label="Proposals by status">
          <h2 className="text-sm font-mono uppercase tracking-wider text-[#E7C226] flex items-center gap-2">
            <Inbox className="w-4 h-4" /> By status
          </h2>
          {stats && (stats.total ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {statusData.map(({ key, name, value }) => (
                <li key={key} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 p-3 text-sm text-neutral-200">
                  <span className="flex items-center gap-2 min-w-0"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[key] }} aria-hidden="true" />{name}</span>
                  <strong className="font-mono">{value}</strong>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-neutral-400">No proposals to show by status yet.</p>)}
        </section>
      </div>

      {/* Recent Triage Activity Table */}
      <div className="glass-panel p-6 border border-[#CC9E33]/30 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-wider text-[#E7C226] flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Recent proposals</span>
          </h3>
          <Link
            to="/admin/suggestions"
            className="text-xs text-[#E7C226] hover:underline font-mono uppercase flex items-center gap-1"
          >
            <span>Open All ({stats ? stats.total : statsError ? "unavailable" : "..."})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-white/10">
          {recentLoading && <div role="status" className="py-6 flex items-center gap-3 text-sm text-neutral-300"><span className="inline-block w-4 h-4 rounded-full border-2 border-[#E7C226] border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading recent proposals...</div>}
          {recentError && <p role="alert" className="py-6 text-sm text-red-200">{recentError}</p>}
          {!recentLoading && !recentError && recentList.length === 0 && <p className="py-6 text-sm text-neutral-400">No recent proposals yet.</p>}
          {recentList.map((item) => (
            <Link
              key={item.id}
              to={`/admin/suggestions/${item.id}`}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 px-3 rounded-lg transition-colors group"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-[#CC9E33] font-bold">
                    {item.reference_id}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded break-words">
                    {item.category}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-[#E7C226] transition-colors">
                  {item.title}
                </div>
                <div className="text-xs text-neutral-400 truncate max-w-xl">
                  {item.location_text}
                </div>
              </div>

              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center flex-shrink-0 text-xs font-mono">
                <span className="text-neutral-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                <span className="text-[#E7C226] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
