import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface TrackSuggestionProps {
  onStatusChange?: (status: SuggestionStatus) => void;
}

const SAMPLE_REFS = [
  'DSB-2026-7F3K9P', // under_review
  'DSB-2026-9B4X2T', // planned
  'DSB-2026-5K1L8Q', // implemented
  'DSB-2026-8H2C6Y', // rejected
];

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

  // Auto-search if ref is present in query parameters
  useEffect(() => {
    if (initialRef) {
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
        setSupportCount(res.suggestion.support_count || 0);
        if (onStatusChange) {
          onStatusChange(res.suggestion.status);
        }
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
    setSearchParams({ ref: inputRef.trim().toUpperCase() });
    performSearch(inputRef);
  };

  const handleSampleClick = (sample: string) => {
    setInputRef(sample);
    setSearchParams({ ref: sample });
    performSearch(sample);
  };

  const handleSupportClick = async () => {
    if (!suggestion) return;
    const res = await suggestionService.toggleSupport(suggestion.id);
    setSupportCount(res.supportCount);
    setHasSupported(res.isSupported);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-5xl mx-auto z-10 space-y-8">
      {/* Search Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7C226]/10 border border-[#E7C226]/30 text-[#E7C226] text-xs font-mono uppercase tracking-widest">
          <Search className="w-3 h-3" />
          <span>Transparent Civic Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-helvetica uppercase text-white tracking-tight">
          Track Suggestion Status
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 font-apoc italic">
          Enter your unique DSB reference number to view real-time stage progression, public works notes, and resolution updates.
        </p>

        {/* Input Bar */}
        <form onSubmit={handleSearchSubmit} className="pt-4 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputRef}
              onChange={(e) => setInputRef(e.target.value.toUpperCase())}
              placeholder="e.g., DSB-2026-7F3K9P"
              className="w-full pl-4 pr-10 py-3 rounded-lg bg-black/60 border border-white/20 text-white font-mono placeholder-neutral-500 text-sm focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226]"
            />
            {inputRef && (
              <button
                type="button"
                onClick={() => setInputRef('')}
                className="absolute right-3 top-3.5 text-neutral-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !inputRef.trim()}
            className="btn-cut px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Track</span>
          </button>
        </form>

        {/* Sample Reference Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-mono text-neutral-400">
          <span>Try sample IDs:</span>
          {SAMPLE_REFS.map((sample) => (
            <button
              key={sample}
              onClick={() => handleSampleClick(sample)}
              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:border-[#E7C226]/50 hover:text-[#E7C226] text-neutral-300 transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Result State: Not Found */}
      {searched && notFound && (
        <div className="glass-panel p-8 text-center max-w-lg mx-auto border border-red-500/30 space-y-3 animate-fadeIn">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-white uppercase font-mono">
            No Suggestion Found
          </h3>
          <p className="text-xs text-neutral-300">
            No records match reference identifier <span className="font-mono text-white">&ldquo;{inputRef}&rdquo;</span>. Please check for typographical errors or test one of the sample identifiers above.
          </p>
        </div>
      )}

      {/* Result State: Suggestion Found */}
      {suggestion && (
        <div className="space-y-8 animate-fadeUp">
          {/* 1. Spatial Stage Timeline */}
          <div className="glass-panel p-6 sm:p-8 border border-[#CC9E33]/30">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#E7C226]">
                <Layers className="w-4 h-4" />
                <span>Spatial Status Journey</span>
              </div>
              <StatusBadge status={suggestion.status} size="lg" />
            </div>

            <StatusTimeline currentStatus={suggestion.status} history={history} />
          </div>

          {/* 2. Full Suggestion Dossier Card */}
          <div className="glass-panel p-6 sm:p-8 border border-[#CC9E33]/30 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#CC9E33] bg-[#CC9E33]/15 px-2.5 py-1 rounded">
                  {suggestion.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                  {suggestion.title}
                </h2>
              </div>

              {/* Support Counter */}
              <button
                onClick={handleSupportClick}
                className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-mono uppercase transition-all ${
                  hasSupported
                    ? 'bg-[#E7C226] text-black border-[#E7C226] font-bold shadow-[0_0_15px_rgba(231,194,38,0.4)]'
                    : 'bg-white/5 border-white/15 text-neutral-300 hover:border-[#E7C226] hover:text-[#E7C226]'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{supportCount} Community Endorsements</span>
              </button>
            </div>

            {/* Meta Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E7C226] flex-shrink-0" />
                <span className="truncate">{suggestion.location_text}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#CC9E33] flex-shrink-0" />
                <span>
                  Submitted:{' '}
                  {new Date(suggestion.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                <span>
                  Last Updated:{' '}
                  {new Date(suggestion.updated_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                Citizen Narrative
              </h4>
              <p className="text-sm text-neutral-200 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5">
                {suggestion.description}
              </p>
            </div>

            {/* Attached Photo */}
            {suggestion.photo_url && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Field Photo Evidence
                </h4>
                <div className="rounded-xl overflow-hidden border border-white/15 max-w-md">
                  <img
                    src={suggestion.photo_url}
                    alt={suggestion.title}
                    className="w-full h-56 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Official Administrative Response Notes */}
            {suggestion.admin_notes && (
              <div className="p-4 rounded-xl bg-[#E7C226]/10 border border-[#E7C226]/40 space-y-1">
                <div className="text-xs font-mono uppercase font-bold text-[#E7C226] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Official Municipal Resolution Notes</span>
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  {suggestion.admin_notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
