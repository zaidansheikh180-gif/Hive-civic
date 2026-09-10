import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { suggestionService } from '../services/suggestionService';
import { authService } from '../services/authService';
import {
  Suggestion,
  SuggestionCategory,
  SuggestionStatus,
  DashboardStats,
  UserProfile,
  SUGGESTION_CATEGORIES,
  SUGGESTION_STATUSES,
} from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { SchemaModal } from '../components/SchemaModal';
import {
  Plus,
  Search,
  MapPin,
  ThumbsUp,
  ArrowRight,
  Database,
  Flame,
  CheckCircle2,
  FolderHeart,
  Clock,
  Filter,
  Shield,
} from 'lucide-react';

export const CitizenAppFeed: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authService.getCurrentUserSync());
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'support'>('newest');

  // Voting state
  const [supportedMap, setSupportedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    authService.getCurrentUser().then(setCurrentUser);

    // Hydrate local support cache for visual indicator
    try {
      const stored = localStorage.getItem('hive_client_supported_ids');
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const map: Record<string, boolean> = {};
        ids.forEach((id) => (map[id] = true));
        setSupportedMap(map);
      }
    } catch {
      // ignore
    }

    loadData();
  }, [selectedCategory, selectedStatus, sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      const schemaStatus = await suggestionService.checkSchemaStatus();
      if (!schemaStatus.tablesExist) {
        setSchemaMissing(true);
      } else {
        setSchemaMissing(false);
      }

      const [items, dashboardStats] = await Promise.all([
        suggestionService.getSuggestions({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          status: selectedStatus === 'All' ? undefined : selectedStatus,
          search: searchTerm,
          sortBy,
        }),
        suggestionService.getDashboardStats(),
      ]);

      setSuggestions(items);
      setStats(dashboardStats);
    } catch (err) {
      console.error('Failed to load civic proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleSupport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await suggestionService.toggleSupport(id);
      setSupportedMap((prev) => ({ ...prev, [id]: res.isSupported }));
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, support_count: res.supportCount } : s))
      );
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-between select-none">
      {/* 1. Header Banner & Welcome */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#E7C226]">
              <span className="w-2 h-2 rounded-full bg-[#E7C226] animate-pulse" />
              <span>Civic Ledger &bull; Live Community Stream</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white font-helvetica tracking-tight">
              {currentUser ? `Welcome, ${currentUser.full_name}` : 'Civic Community Feed'}
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Inspect active infrastructure initiatives, submit new proposals, and endorse neighborhood solutions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/app/suggestions"
              className="btn-cut-border px-4 py-2.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2"
            >
              <FolderHeart className="w-4 h-4 text-[#E7C226]" />
              <span>My Suggestions</span>
            </Link>

            <Link
              to="/app/submit"
              className="btn-cut px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(231,194,38,0.4)]"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Suggestion</span>
            </Link>
          </div>
        </div>

        {/* Missing Schema Alert Banner if Supabase table is not yet run */}
        {schemaMissing && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Supabase Schema Initialization Required:</strong>
                <p className="text-neutral-300 mt-0.5">
                  The PostgreSQL tables have not been created yet in your Supabase project. Click below to copy the schema to your SQL Editor.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSchemaModalOpen(true)}
              className="btn-cut px-4 py-2 text-xs font-bold uppercase tracking-wider flex-shrink-0"
            >
              Copy SQL Schema
            </button>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 border border-white/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Total Proposals
            </div>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              {stats ? stats.total : 0}
            </div>
          </div>
          <div className="glass-panel p-4 border border-white/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8]">
              Under Review
            </div>
            <div className="text-2xl font-mono font-bold text-[#38BDF8] mt-1">
              {stats ? stats.under_review : 0}
            </div>
          </div>
          <div className="glass-panel p-4 border border-white/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#E7C226]">
              Planned Work
            </div>
            <div className="text-2xl font-mono font-bold text-[#E7C226] mt-1">
              {stats ? stats.planned : 0}
            </div>
          </div>
          <div className="glass-panel p-4 border border-white/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#10B981]">
              Implemented
            </div>
            <div className="text-2xl font-mono font-bold text-[#10B981] mt-1">
              {stats ? stats.implemented : 0}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="space-y-4 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, neighborhood, or reference ID (e.g. DSB-2026-XXXXXX)..."
              className="w-full px-4 py-3 pl-10 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226] text-xs font-mono"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            className="btn-cut px-6 py-3 text-xs font-bold uppercase tracking-wider"
          >
            Search
          </button>
        </form>

        {/* Category Scroll Filter (10 exact categories) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-[#E7C226] text-black font-bold shadow-[0_0_12px_rgba(231,194,38,0.4)]'
                : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All Categories
          </button>
          {SUGGESTION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#E7C226] text-black font-bold shadow-[0_0_12px_rgba(231,194,38,0.4)]'
                  : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#E7C226]"
            >
              <option value="All">All Statuses</option>
              {SUGGESTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#E7C226]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="support">Highest Community Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Suggestions Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#E7C226] border-t-transparent animate-spin" />
            <span className="text-xs font-mono text-[#CC9E33]">Querying Supabase Ledger...</span>
          </div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="glass-panel p-12 text-center border border-white/10 space-y-4 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-[#E7C226] mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white uppercase font-helvetica">
            No Suggestions Found
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto font-mono">
            {searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All'
              ? 'No proposals matched your current search filters.'
              : 'The civic registry has not received any submissions yet. Be the first to shape your neighborhood!'}
          </p>
          <div className="pt-2">
            <Link to="/app/submit" className="btn-cut px-6 py-2.5 text-xs font-bold uppercase">
              Submit the First Proposal
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((item) => {
            const hasSupported = Boolean(supportedMap[item.id]);

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/app/track?ref=${item.reference_id}`)}
                className="glass-panel p-6 border border-white/10 hover:border-[#E7C226]/50 hover:bg-[#E7C226]/5 transition-all cursor-pointer flex flex-col justify-between group rounded-2xl relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Card Header: Reference ID + Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-[#CC9E33] bg-[#CC9E33]/15 px-2 py-0.5 rounded border border-[#CC9E33]/30">
                      {item.reference_id}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  {/* Title & Category */}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#E7C226]">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-[#E7C226] transition-colors line-clamp-2 leading-snug mt-0.5">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Location & Image Indicator */}
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-[#E7C226] flex-shrink-0" />
                    <span className="truncate">{item.location_text}</span>
                  </div>

                  {item.photo_url && (
                    <div className="pt-1">
                      <img
                        src={item.photo_url}
                        alt="Civic evidence"
                        className="w-full h-32 object-cover rounded-lg border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

                {/* Card Footer: Vote button + Track arrow */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={(e) => handleToggleSupport(item.id, e)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
                      hasSupported
                        ? 'bg-[#E7C226]/20 border-[#E7C226] text-[#E7C226]'
                        : 'bg-white/5 border-white/10 text-neutral-300 hover:border-[#E7C226]/40 hover:text-white'
                    }`}
                    title="Endorse this civic proposal"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Support ({item.support_count || 1})</span>
                  </button>

                  <span className="text-xs font-mono text-[#E7C226] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schema Modal */}
      <SchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />
    </div>
  );
};
