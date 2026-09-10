import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { suggestionService } from '../services/suggestionService';
import { authService } from '../services/authService';
import { Suggestion, UserProfile } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  FolderHeart,
  Plus,
  ArrowRight,
  MapPin,
  Calendar,
  Search,
  ExternalLink,
  ChevronRight,
  Inbox,
  AlertCircle,
} from 'lucide-react';

export const MySuggestions: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authService.getCurrentUserSync());
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      setCurrentUser(user);
      if (user) {
        suggestionService
          .getMySuggestions(user.id)
          .then(setSuggestions)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  const filtered = suggestions.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.title.toLowerCase().includes(term) ||
      s.reference_id.toLowerCase().includes(term) ||
      s.category.toLowerCase().includes(term) ||
      s.location_text.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-between select-none">
      {/* Header */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#E7C226]">
              <FolderHeart className="w-4 h-4 text-[#E7C226]" />
              <span>Citizen Portfolio &bull; Submissions Ledger</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white font-helvetica tracking-tight">
              My Civic Suggestions
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Proposals submitted by your authenticated account ({currentUser?.email})
            </p>
          </div>

          <Link
            to="/app/submit"
            className="btn-cut px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(231,194,38,0.4)] self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Suggestion</span>
          </Link>
        </div>

        {/* Search Input */}
        {suggestions.length > 0 && (
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your proposals by title or DSB reference..."
              className="w-full px-4 py-2.5 pl-10 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226] text-xs font-mono"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          </div>
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#E7C226] border-t-transparent animate-spin" />
            <span className="text-xs font-mono text-[#CC9E33]">
              Loading your submitted proposals...
            </span>
          </div>
        </div>
      ) : suggestions.length === 0 ? (
        /* Empty State */
        <div className="glass-panel p-12 text-center border border-white/10 max-w-2xl mx-auto rounded-2xl space-y-5 my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#E7C226]/10 border border-[#E7C226]/30 text-[#E7C226] mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(231,194,38,0.2)]">
            <Inbox className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold uppercase text-white font-helvetica">
              No Suggestions Submitted Yet
            </h2>
            <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
              You haven&apos;t lodged any civic proposals with HIVE yet. Take the lead in improving your local neighborhood by submitting your first report or proposal today.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/app/submit"
              className="btn-cut px-8 py-3 text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2 shadow-[0_0_20px_rgba(231,194,38,0.4)]"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Your First Proposal</span>
            </Link>
          </div>
        </div>
      ) : (
        /* List of items */
        <div className="space-y-3">
          {filtered.map((sug) => {
            const dateStr = sug.created_at
              ? new Date(sug.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recently';

            return (
              <div
                key={sug.id}
                onClick={() => navigate(`/app/suggestions/${sug.id}`)}
                className="glass-panel p-5 border border-white/10 hover:border-[#E7C226]/40 hover:bg-[#E7C226]/5 transition-all cursor-pointer rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-mono text-[#E7C226] bg-[#E7C226]/10 px-2.5 py-0.5 rounded border border-[#E7C226]/30">
                      {sug.reference_id}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      {sug.category}
                    </span>
                    <StatusBadge status={sug.status} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#E7C226] transition-colors truncate">
                    {sug.title}
                  </h3>

                  <div className="flex items-center gap-4 text-[11px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-[#E7C226] flex-shrink-0" />
                      <span className="truncate">{sug.location_text}</span>
                    </span>
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      <span>{dateStr}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <span className="text-xs font-mono text-[#E7C226] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Inspect Dossier</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
