import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { suggestionService } from '../services/suggestionService';
import { Suggestion, DashboardStats, AdminProfile } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
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

  useEffect(() => {
    const current = authService.getCurrentAdmin();
    if (!current) {
      navigate('/admin/login');
      return;
    }
    setAdmin(current);

    suggestionService.getDashboardStats().then(setStats);
    suggestionService.getSuggestions({ sortBy: 'newest' }).then((items) => {
      setRecentList(items.slice(0, 5));
    });
  }, [navigate]);

  if (!admin) return null;

  // Transform category counts into recharts array
  const categoryData = stats
    ? Object.entries(stats.categoryCounts).map(([cat, count]) => ({
        name: cat,
        count,
      }))
    : [];

  const statusPieData = stats
    ? [
        { name: 'Submitted', value: stats.submitted, key: 'submitted' },
        { name: 'Under Review', value: stats.under_review, key: 'under_review' },
        { name: 'Accepted', value: stats.accepted, key: 'accepted' },
        { name: 'Planned', value: stats.planned, key: 'planned' },
        { name: 'Implemented', value: stats.implemented, key: 'implemented' },
        { name: 'Rejected', value: stats.rejected, key: 'rejected' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto z-10 space-y-8">
      {/* Top Banner with Admin Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 border border-[#CC9E33]/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#E7C226]/15 border border-[#E7C226]/40 flex items-center justify-center text-[#E7C226] shadow-[0_0_15px_rgba(231,194,38,0.3)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#E7C226]">
              Administrative Operations Console
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
          <Link
            to="/admin/suggestions"
            className="btn-cut px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(231,194,38,0.3)]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Manage Suggestions</span>
          </Link>

          <button
            onClick={async () => {
              await authService.signOut();
              navigate('/admin/login');
            }}
            className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/40 text-neutral-400 hover:text-red-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="glass-panel p-4 border border-white/10 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
            Total
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {stats ? stats.total : 0}
          </div>
        </div>

        <div className="glass-panel p-4 border border-[#CC9E33]/30 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#CC9E33]">
            Submitted
          </div>
          <div className="text-2xl font-bold font-mono text-[#CC9E33]">
            {stats ? stats.submitted : 0}
          </div>
        </div>

        <div className="glass-panel p-4 border border-[#E7C226]/40 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#E7C226]">
            Under Review
          </div>
          <div className="text-2xl font-bold font-mono text-[#E7C226]">
            {stats ? stats.under_review : 0}
          </div>
        </div>

        <div className="glass-panel p-4 border border-[#38BDF8]/30 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8]">
            Accepted
          </div>
          <div className="text-2xl font-bold font-mono text-[#38BDF8]">
            {stats ? stats.accepted : 0}
          </div>
        </div>

        <div className="glass-panel p-4 border border-[#818CF8]/30 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#818CF8]">
            Planned
          </div>
          <div className="text-2xl font-bold font-mono text-[#818CF8]">
            {stats ? stats.planned : 0}
          </div>
        </div>

        <div className="glass-panel p-4 border border-[#10B981]/40 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#10B981]">
            Implemented
          </div>
          <div className="text-2xl font-bold font-mono text-[#10B981]">
            {stats ? stats.implemented : 0}
          </div>
        </div>

        <div className="glass-panel p-4 border border-[#EF4444]/30 space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#EF4444]">
            Rejected
          </div>
          <div className="text-2xl font-bold font-mono text-[#EF4444]">
            {stats ? stats.rejected : 0}
          </div>
        </div>
      </div>

      {/* Analytics Visualizers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-8 glass-panel p-6 border border-[#CC9E33]/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase tracking-wider text-[#E7C226] flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Suggestions by Municipal Category</span>
            </h3>
            <span className="text-[10px] font-mono text-neutral-400">
              Distribution across 10 civic areas
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis
                  dataKey="name"
                  stroke="#CC9E33"
                  fontSize={10}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis stroke="#CC9E33" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14141B',
                    borderColor: '#E7C226',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#FFF',
                  }}
                />
                <Bar dataKey="count" fill="#E7C226" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, idx) => (
                    <Cell key={idx} fill={idx % 2 === 0 ? '#E7C226' : '#CC9E33'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="lg:col-span-4 glass-panel p-6 border border-[#CC9E33]/30 space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-mono uppercase tracking-wider text-[#E7C226] flex items-center gap-2">
            <Inbox className="w-4 h-4" />
            <span>Workflow Status Share</span>
          </h3>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {statusPieData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={STATUS_COLORS[entry.key] || '#E7C226'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14141B',
                    borderColor: '#E7C226',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#FFF',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-white/10">
            {statusPieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[d.key] }}
                />
                <span className="text-neutral-300 truncate">
                  {d.name}: {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Triage Activity Table */}
      <div className="glass-panel p-6 border border-[#CC9E33]/30 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-wider text-[#E7C226] flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Recent Suggestions Requiring Action</span>
          </h3>
          <Link
            to="/admin/suggestions"
            className="text-xs text-[#E7C226] hover:underline font-mono uppercase flex items-center gap-1"
          >
            <span>Open All ({stats?.total || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-white/10">
          {recentList.map((item) => (
            <Link
              key={item.id}
              to={`/admin/suggestions/${item.id}`}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 px-3 rounded-lg transition-colors group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#CC9E33] font-bold">
                    {item.reference_id}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded">
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
