import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { suggestionService } from '../services/suggestionService';
import { Suggestion, SuggestionCategory, SuggestionStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  ArrowRight,
  MapPin,
  Clock,
  ThumbsUp,
  ShieldCheck,
  Plus,
} from 'lucide-react';

const CATEGORIES: ('All' | SuggestionCategory)[] = [
  'All',
  'Roads & Footpaths',
  'Street Lighting',
  'Waste Management',
  'Water & Sanitation',
  'Public Spaces',
  'Transport',
  'Education',
  'Environment',
  'Community Facilities',
  'Other',
];

const STATUSES: ('All' | SuggestionStatus)[] = [
  'All',
  'submitted',
  'under_review',
  'accepted',
  'planned',
  'implemented',
  'rejected',
];

export const AdminSuggestions: React.FC = () => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'support'>('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.getCurrentAdmin()) {
      navigate('/admin/login');
      return;
    }
    loadSuggestions();
  }, [navigate]);

  const loadSuggestions = async () => {
    setLoading(true);
    const list = await suggestionService.getSuggestions({
      search,
      category: selectedCategory,
      status: selectedStatus,
      sortBy,
    });
    setSuggestions(list);
    setLoading(false);
  };

  useEffect(() => {
    loadSuggestions();
  }, [search, selectedCategory, selectedStatus, sortBy]);

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto z-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 border border-[#CC9E33]/30">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#E7C226]">
            Civic Registry Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-helvetica uppercase text-white tracking-tight">
            Suggestion Management
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            Full administrative ledger, triage actions, and lifecycle status audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="btn-cut-border px-4 py-2 text-xs font-semibold uppercase"
          >
            <span>Overview Metrics</span>
          </Link>
          <Link
            to="/submit"
            className="btn-cut px-4 py-2 text-xs font-bold uppercase flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Entry</span>
          </Link>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="glass-panel p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
        {/* Search */}
        <div className="lg:col-span-5 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location, ID, or description..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226]"
          />
        </div>

        {/* Category Dropdown */}
        <div className="lg:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-[#E7C226]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="lg:col-span-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-[#E7C226]"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="lg:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white focus:outline-none focus:border-[#E7C226]"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="support">Sort: Most Endorsed</option>
          </select>
        </div>
      </div>

      {/* Suggestions List Table */}
      <div className="glass-panel border border-[#CC9E33]/30 overflow-hidden">
        <div className="p-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Displaying {suggestions.length} Civic Records</span>
          <span>Click row to open comprehensive administrative dossier</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#E7C226]">
            Loading civic registry items...
          </div>
        ) : suggestions.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-xs">
            No suggestions match the selected search or filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {suggestions.map((item) => (
              <Link
                key={item.id}
                to={`/admin/suggestions/${item.id}`}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#E7C226]/5 transition-colors group block"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#E7C226] bg-[#E7C226]/10 px-2 py-0.5 rounded border border-[#E7C226]/30">
                      {item.reference_id}
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded text-neutral-300">
                      {item.category}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                    {item.is_anonymous && (
                      <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded">
                        Anonymous
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-[#E7C226] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#E7C226]" />
                      <span>{item.location_text}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#CC9E33]" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#E7C226]">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{item.support_count || 0} Endorsements</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:flex-col lg:items-end gap-2 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
                  <span className="text-[10px] font-mono text-neutral-400">
                    Updated: {new Date(item.updated_at).toLocaleDateString()}
                  </span>
                  <span className="btn-cut-border text-[11px] px-3 py-1.5 flex items-center gap-1 group-hover:border-[#E7C226]">
                    <span className="flex items-center gap-1">
                      <span>Triage Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
