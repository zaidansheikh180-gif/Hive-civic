import { OrbNoise } from '../components/ui/OrbNoise';
import { LiquidGlassLink } from '../components/ui/LiquidGlassButton';
import { LiquidGlassButton } from '../components/ui/LiquidGlassButton';
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { suggestionService } from '../services/suggestionService';
import { Suggestion, SuggestionStatus, SuggestionStatusHistory } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { StatusTimeline } from '../components/StatusTimeline';
import {
  Search,
  MapPin,
  Calendar,
  ThumbsUp,
  AlertCircle,
  FileText,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface TrackSuggestionProps {
  onStatusChange?: (status: SuggestionStatus) => void;
}

export const TrackSuggestion: React.FC<TrackSuggestionProps> = ({ onStatusChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [inputRef, setInputRef] = useState(initialRef);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [history, setHistory] = useState<SuggestionStatusHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [supportCount, setSupportCount] = useState(0);
  const [hasSupported, setHasSupported] = useState(false);
  const [recentSuggestions, setRecentSuggestions] = useState<Suggestion[]>([]);

  // Load recent real suggestions to give users quick test references if needed
  useEffect(() => {
    suggestionService.getSuggestions().then((items) => {
      setRecentSuggestions(items.slice(0, 4));
    });
  }, []);

  // Auto-search if ref is present in query parameters
  useEffect(() => {
    if (initialRef) {
      setInputRef(initialRef);
      performSearch(initialRef);
    }
  }, [initialRef]);

  const performSearch = async (ref: string) => {
    const clean = ref.trim().toUpperCase();
    if (!clean) return;

    setLoading(true);
    setSearched(true);
    setNotFound(false);

    try {
      const res = await suggestionService.getSuggestionByReference(clean);
      if (res) {
        setSuggestion(res.suggestion);
        setHistory(res.history);
        setSupportCount(res.suggestion.support_count || 1);
        if (onStatusChange) {
          onStatusChange(res.suggestion.status);
        }

        // Check vote state via database
        suggestionService
          .getUserVotedIds()
          .then((ids) => {
            setHasSupported(ids.includes(res.suggestion.id));
          })
          .catch(() => {});
      } else {
        setSuggestion(null);
        setHistory([]);
        setNotFound(true);
      }
    } catch {
      setSuggestion(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputRef.trim().toUpperCase();
    setSearchParams({ ref: clean });
    performSearch(clean);
  };

  const handleSampleClick = (sample: string) => {
    setInputRef(sample);
    setSearchParams({ ref: sample });
    performSearch(sample);
  };

  const handleSupportClick = async () => {
    if (!suggestion) return;
    try {
      const res = await suggestionService.toggleSupport(suggestion.id);
      setSupportCount(res.supportCount);
      setHasSupported(res.isSupported);
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-5xl mx-auto z-10 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/app"
          className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Civic Feed</span>
        </Link>
      </div>

      {/* Search Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7C226]/10 border border-[#E7C226]/30 text-[#E7C226] text-xs font-mono uppercase tracking-widest">
          <Search className="w-3 h-3" />
          <span>Find a proposal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-helvetica uppercase text-white tracking-tight">
          Track a proposal
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 font-apoc italic">
          Enter the reference number you received when you submitted your proposal to see its status and any review notes.
        </p>

        {/* Input Bar */}
        <form onSubmit={handleSearchSubmit} className="pt-4 flex flex-col sm:flex-row sm:items-center gap-3 max-w-xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputRef}
              onChange={(e) => setInputRef(e.target.value.toUpperCase())}
              placeholder="e.g. DSB-2026-7F3K9P"
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-black/60 border border-white/20 text-white font-mono placeholder-neutral-500 text-sm focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226]"
            />
            {inputRef && (
              <LiquidGlassButton
                type="button"
                onClick={() => setInputRef('')}
                aria-label="Clear reference number" className="track-clear absolute right-2 top-1.5 w-9 h-9 p-0 text-neutral-400 hover:text-white text-xs font-mono"
              >
                ✕
              </LiquidGlassButton>
            )}
          </div>
          <LiquidGlassButton
            type="submit"
            disabled={loading || !inputRef.trim()}
            className="btn-cut track-search px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <OrbNoise width={22} height={22} density={60} speed={28} pointer={{ drag: 0 }} />
                <span>Searching...</span>
              </span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </LiquidGlassButton>
        </form>

        {/* Quick Click References from actual Supabase submissions */}
        {recentSuggestions.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-neutral-400">
            <span>Recent Proposals:</span>
            {recentSuggestions.map((item) => (
              <LiquidGlassButton
                key={item.id}
                onClick={() => handleSampleClick(item.reference_id)}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-[#E7C226]/20 border border-white/10 hover:border-[#E7C226]/50 text-[#E7C226] transition-all text-[11px]"
              >
                {item.reference_id}
              </LiquidGlassButton>
            ))}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 flex flex-col items-center gap-3 text-center">
          <OrbNoise width={72} height={72} density={90} speed={28} pointer={{ drag: 0 }} />
          <span className="text-xs font-mono text-[#CC9E33]">Loading proposals...</span>
        </div>
      )}

      {/* Not Found state */}
      {!loading && searched && notFound && (
        <div className="glass-panel p-8 text-center border border-red-500/30 max-w-xl mx-auto rounded-2xl space-y-4 animate-fadeUp">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-white uppercase font-helvetica">
            Reference Not Found
          </h3>
          <p className="text-xs text-neutral-300 font-mono leading-relaxed">
            No proposal was found matching reference identifier &ldquo;<span className="text-[#E7C226]">{inputRef}</span>&rdquo;.
            Please verify formatting (e.g. DSB-2026-XXXXXX) or submit a new proposal.
          </p>
          <div className="pt-2">
            <LiquidGlassLink to="/app/submit" className="btn-cut px-6 py-2.5 text-xs font-bold uppercase inline-block">
              Submit New Suggestion
            </LiquidGlassLink>
          </div>
        </div>
      )}

      {/* Found Proposal Dossier */}
      {!loading && suggestion && (
        <div className="space-y-6 animate-fadeUp">
          {/* Main Card */}
          <div className="glass-panel p-6 sm:p-8 border border-[#E7C226]/40 rounded-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#E7C226] bg-[#E7C226]/10 px-3 py-1 rounded border border-[#E7C226]/30">
                  {suggestion.reference_id}
                </span>
                <span className="text-xs font-mono uppercase text-neutral-400">
                  {suggestion.category}
                </span>
              </div>
              <StatusBadge status={suggestion.status} size="md" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-helvetica tracking-tight">
                {suggestion.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
                {suggestion.description}
              </p>
            </div>

            {suggestion.photo_url && (
              <div className="pt-2">
                <div className="text-xs font-mono text-neutral-400 uppercase mb-2">Photographic Evidence</div>
                <div className="max-w-md rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={suggestion.photo_url}
                    alt="Civic evidence"
                    className="w-full max-h-80 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs font-mono text-neutral-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E7C226]" />
                <span className="truncate">{suggestion.location_text}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <span>
                  {suggestion.created_at
                    ? new Date(suggestion.created_at).toLocaleDateString()
                    : 'Recent'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{suggestion.is_anonymous ? 'Anonymous Submitter' : 'Registered Citizen'}</span>
              </div>
            </div>

            {/* Support button */}
            <div className="pt-2 flex items-center justify-between">
              <LiquidGlassButton
                onClick={handleSupportClick}
                className={`btn-cut px-5 py-2 text-xs font-mono flex items-center gap-2 ${
                  hasSupported ? 'bg-[#E7C226] text-black font-bold' : ''
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Support ({supportCount})</span>
              </LiquidGlassButton>

              <span className="text-[11px] font-mono text-neutral-400">
                Official Reference: {suggestion.reference_id}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="glass-panel p-6 sm:p-8 border border-white/10 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E7C226]" />
              <span>Municipal Progression Stepper</span>
            </h3>
            <StatusTimeline currentStatus={suggestion.status} history={history} />
          </div>
        </div>
      )}
    </div>
  );
};
