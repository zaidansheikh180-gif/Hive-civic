import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { suggestionService } from '../services/suggestionService';
import { Suggestion, SuggestionStatusHistory } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ThumbsUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Share2,
} from 'lucide-react';

export const CitizenSuggestionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [history, setHistory] = useState<SuggestionStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasSupported, setHasSupported] = useState(false);

  useEffect(() => {
    if (!id) return;

    suggestionService
      .getSuggestionById(id)
      .then((data) => {
        if (!data) {
          setError('Suggestion not found.');
        } else {
          setSuggestion(data.suggestion);
          setHistory(data.history);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve proposal details.');
      })
      .finally(() => setLoading(false));

    // Check support state
    try {
      const stored = localStorage.getItem('hive_client_supported_ids');
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        if (id && ids.includes(id)) {
          setHasSupported(true);
        }
      }
    } catch {
      // ignore
    }
  }, [id]);

  const handleToggleSupport = async () => {
    if (!suggestion) return;
    try {
      const res = await suggestionService.toggleSupport(suggestion.id);
      setHasSupported(res.isSupported);
      setSuggestion((prev) => (prev ? { ...prev, support_count: res.supportCount } : null));
    } catch (err) {
      console.error('Failed to toggle support:', err);
    }
  };

  const handleCopyRef = () => {
    if (!suggestion) return;
    navigator.clipboard.writeText(suggestion.reference_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E7C226] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-[#CC9E33]">
            Retrieving Immutable Dossier...
          </span>
        </div>
      </div>
    );
  }

  if (error || !suggestion) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass-panel p-8 max-w-md text-center border border-red-500/30 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white uppercase font-helvetica">
            Suggestion Dossier Not Found
          </h2>
          <p className="text-xs text-neutral-300">
            {error || 'This proposal record does not exist or may have been deleted.'}
          </p>
          <Link to="/app/suggestions" className="btn-cut px-6 py-2.5 text-xs font-bold uppercase inline-block">
            Back to My Suggestions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-5xl mx-auto space-y-8 select-none">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <Link
          to="/app/suggestions"
          className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Suggestions</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyRef}
            className="btn-cut-border px-3.5 py-1.5 text-xs font-mono flex items-center gap-2"
          >
            <span>{suggestion.reference_id}</span>
            <span className="text-[10px] text-[#E7C226]">
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>

          <Link
            to={`/app/track?ref=${suggestion.reference_id}`}
            className="btn-cut px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
          >
            Track View &rarr;
          </Link>
        </div>
      </div>

      {/* Main Dossier Card */}
      <div className="glass-panel p-6 sm:p-8 border border-white/10 rounded-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E7C226]">
            {suggestion.category}
          </span>
          <StatusBadge status={suggestion.status} size="md" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-helvetica tracking-tight leading-tight">
          {suggestion.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400 font-mono py-2 border-y border-white/5">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#E7C226]" />
            <span className="text-white">{suggestion.location_text}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>
              {suggestion.created_at
                ? new Date(suggestion.created_at).toLocaleDateString()
                : 'Recent'}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{suggestion.is_anonymous ? 'Submitted Anonymously' : 'Registered Citizen'}</span>
          </span>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono uppercase text-neutral-400">Proposal Description</h2>
          <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
            {suggestion.description}
          </p>
        </div>

        {/* Photo Attachment if available */}
        {suggestion.photo_url && (
          <div className="space-y-2 pt-2">
            <h2 className="text-xs font-mono uppercase text-neutral-400">Civic Photographic Evidence</h2>
            <div className="rounded-xl overflow-hidden border border-white/10 max-w-xl">
              <img
                src={suggestion.photo_url}
                alt="Civic evidence"
                className="w-full max-h-96 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}

        {/* Official Administrative Notes */}
        {suggestion.admin_notes && (
          <div className="p-4 rounded-xl bg-[#E7C226]/10 border border-[#E7C226]/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#E7C226] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#E7C226]" />
              <span>Official Municipal Administrator Note</span>
            </div>
            <p className="text-xs text-neutral-200 leading-relaxed">
              {suggestion.admin_notes}
            </p>
          </div>
        )}

        {/* Endorse action */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleToggleSupport}
            className={`btn-cut px-5 py-2.5 text-xs font-mono flex items-center gap-2 ${
              hasSupported ? 'bg-[#E7C226] text-black font-bold' : ''
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Community Support ({suggestion.support_count || 1})</span>
          </button>
        </div>
      </div>

      {/* Audit History Timeline */}
      <div className="glass-panel p-6 sm:p-8 border border-white/10 rounded-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Clock className="w-5 h-5 text-[#E7C226]" />
          <div>
            <h2 className="text-base font-bold uppercase text-white font-helvetica">
              Official Resolution Timeline
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              Immutable municipal status transition audit log
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-xs font-mono text-neutral-400">
            No audit log entries recorded yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
            {history.map((h, i) => (
              <div key={h.id || i} className="relative space-y-1">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#E7C226] ring-4 ring-black" />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white font-mono uppercase">
                    {h.new_status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    &bull; {new Date(h.created_at).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#E7C226] font-mono bg-[#E7C226]/10 px-1.5 py-0.5 rounded">
                    {h.changed_by}
                  </span>
                </div>
                {h.note && (
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    {h.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
