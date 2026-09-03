import React, { useState } from 'react';
import { Page, Suggestion, Status, Category } from '../types';
import { TiltCard } from './TiltCard';
import {
  Plus,
  ThumbsUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Search,
  Check,
  RotateCcw,
  Maximize2,
  X,
  Copy,
  Sparkles,
  Share2,
} from 'lucide-react';

interface CitizenDashboardProps {
  suggestions: Suggestion[];
  onNavigate: (page: Page) => void;
  onSupport: (id: string) => void;
  supportedIds: Set<string>;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  suggestions,
  onNavigate,
  onSupport,
  supportedIds,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<Status | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDossier, setActiveDossier] = useState<Suggestion | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sequenceKey, setSequenceKey] = useState(0);

  // Filter items
  const filtered = suggestions.filter((s) => {
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Replay timed card opening cascade
  const handleReplaySequence = () => {
    setSequenceKey((k) => k + 1);
  };

  const handleCopyId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const refCode = `CIVIC-${id.slice(-6).toUpperCase()}`;
    navigator.clipboard?.writeText(refCode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusDotColor = (status: Status) => {
    switch (status) {
      case 'Under Review':
        return '#E7C226'; // Honey/Gold
      case 'Pending':
        return '#CC9E33'; // Muted Gold
      case 'Resolved':
        return '#10B981'; // Green
    }
  };

  const getStatusBadgeStyles = (status: Status) => {
    switch (status) {
      case 'Under Review':
        return 'bg-[#E7C226]/15 text-[#E7C226] border-[#E7C226]/40 shadow-[0_0_10px_rgba(231,194,38,0.2)]';
      case 'Pending':
        return 'bg-[#CC9E33]/15 text-[#CC9E33] border-[#CC9E33]/40';
      case 'Resolved':
        return 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'Under Review':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'Pending':
        return <Clock3 className="w-3.5 h-3.5" />;
      case 'Resolved':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
    }
  };

  // If a modal is open and user clicks back or ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDossier(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section className="min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Header section with Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#CC9E33]/20 animate-fadeUp delay-100">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E7C226] animate-ping" />
            <span className="text-xs uppercase tracking-widest font-mono text-[#E7C226]">
              Citizen Portal
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-normal font-apoc italic tracking-tight text-white">
            My Suggestions
          </h1>
          <p className="text-sm text-[#CC9E33]/80 mt-1 max-w-xl">
            Track civic proposals, vote on neighborhood issues, and monitor municipal resolution in real-time.
          </p>
        </div>

        {/* Action Button: + New Suggestion */}
        <button
          id="new-suggestion-btn"
          onClick={() => onNavigate('suggest')}
          className="btn-cut px-6 py-3.5 font-extrabold uppercase tracking-wider text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(231,194,38,0.35)] self-start sm:self-auto"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>+ New Suggestion</span>
        </button>
      </div>

      {/* Filter & Search Bar + Replay Trigger */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeUp delay-200">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {(['All', 'Under Review', 'Pending', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedStatus(st);
                setSequenceKey((k) => k + 1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap border transition-all ${
                selectedStatus === st
                  ? 'bg-[#E7C226] text-[#0B0B0F] border-[#E7C226] shadow-[0_0_12px_rgba(231,194,38,0.35)] font-bold'
                  : 'bg-white/5 text-[#CC9E33]/90 border-[#CC9E33]/25 hover:bg-[#CC9E33]/15 hover:text-white'
              }`}
            >
              {st === 'All' ? 'All Issues' : st}
              {st === 'Under Review' && ' (Review)'}
              {st === 'Pending' && ' (Pending)'}
              {st === 'Resolved' && ' (Resolved)'}
            </button>
          ))}
        </div>

        {/* Search input + Replay Sequence button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-[#CC9E33] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by keyword or street..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSequenceKey((k) => k + 1);
              }}
              className="hive-input w-full pl-9 pr-4 py-2 text-xs text-white placeholder-[#CC9E33]/50"
            />
          </div>

          <button
            onClick={handleReplaySequence}
            title="Replay timed cards opening sequence"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white/5 border border-[#CC9E33]/30 text-[#E7C226] hover:bg-[#E7C226]/10 hover:border-[#E7C226] transition-all whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Replay Timing</span>
          </button>
        </div>
      </div>

      {/* Grid of Cards with Timed Opening & 3D Tilt */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center my-8 animate-fadeIn border border-[#CC9E33]/25">
          <p className="text-[#CC9E33]/80 text-sm mb-4">
            No suggestions found matching your filter criteria.
          </p>
          <button
            onClick={() => {
              setSelectedStatus('All');
              setSelectedCategory('All');
              setSearchQuery('');
              setSequenceKey((k) => k + 1);
            }}
            className="btn-cut px-5 py-2 text-xs font-bold uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          key={sequenceKey}
          className="perspective-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((item, idx) => {
            const hasSupported = supportedIds.has(item.id);
            const sequenceIndex = String(idx + 1).padStart(2, '0');
            const staggerDelay = idx * 90;

            return (
              <TiltCard
                key={`${sequenceKey}-${item.id}`}
                staggerMs={staggerDelay}
                onClick={() => setActiveDossier(item)}
                className="group citizen-card-wrapper border border-white/10 hover:border-[#E7C226]/60 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Card Top: Colored Status Dot + Category + Timed Sequence Badge + Status Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {/* Colored Status Dot with Pulse */}
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse"
                        style={{
                          backgroundColor: getStatusDotColor(item.status),
                          boxShadow: `0 0 10px ${getStatusDotColor(item.status)}`,
                        }}
                        title={`Status: ${item.status}`}
                      />
                      <span className="text-xs uppercase font-mono tracking-wider text-[#CC9E33]/80">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Timed Arrival Index Tag */}
                      <span className="text-[10px] font-mono text-[#CC9E33]/60 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        № {sequenceIndex}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${getStatusBadgeStyles(
                          item.status
                        )}`}
                      >
                        {getStatusIcon(item.status)}
                        <span>{item.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-normal font-apoc italic text-white mb-2 leading-snug tracking-tight group-hover:text-[#E7C226] transition-colors">
                    {item.title}
                  </h3>

                  {/* Description Preview */}
                  <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3 mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Card Footer: Metadata, Official Response note, & Support Counter */}
                <div className="space-y-3 pt-3 border-t border-[#CC9E33]/15">
                  {/* Official Response if present */}
                  {item.officialResponse && (
                    <div className="p-2.5 bg-white/5 border-l-2 border-[#10B981] rounded-r text-[11px] text-neutral-200">
                      <span className="text-[#10B981] font-semibold block mb-0.5">
                        Official Municipal Response:
                      </span>
                      <span className="line-clamp-2">{item.officialResponse}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[#CC9E33]/80">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#E7C226]" />
                      <span className="truncate max-w-[130px]">{item.neighborhood}</span>
                    </div>

                    <div className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{item.createdAt}</span>
                    </div>
                  </div>

                  {/* Action row: Open Dossier micro-hint + Support button */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#E7C226]/80 group-hover:text-[#E7C226] transition-colors">
                      <Maximize2 className="w-3 h-3" />
                      <span className="font-mono text-[11px] underline underline-offset-4">Open Dossier</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSupport(item.id);
                      }}
                      title="Support this civic suggestion"
                      className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all rounded ${
                        hasSupported
                          ? 'bg-[#E7C226] text-[#0B0B0F] shadow-[0_0_12px_rgba(231,194,38,0.4)] font-bold'
                          : 'bg-white/10 text-white hover:bg-[#E7C226]/20 hover:text-[#E7C226] border border-white/10 hover:border-[#E7C226]/40'
                      }`}
                    >
                      {hasSupported ? (
                        <>
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Supported ({item.supportCount})</span>
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="w-3 h-3" />
                          <span>Support ({item.supportCount})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}

      {/* Expanded Card Opening Dossier Modal */}
      {activeDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel p-6 sm:p-8 border border-[#E7C226]/40 shadow-[0_0_40px_rgba(231,194,38,0.2)] animate-modal-unfold rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Sheen */}
            <div className="card-sheen-line" />

            {/* Header / Close button */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E7C226] animate-ping" />
                <span className="text-xs uppercase font-mono tracking-widest text-[#E7C226] font-semibold">
                  Civic Dossier #{activeDossier.id.slice(-6).toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setActiveDossier(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Close Dossier (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6 pt-6">
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getStatusDotColor(activeDossier.status),
                      boxShadow: `0 0 10px ${getStatusDotColor(activeDossier.status)}`,
                    }}
                  />
                  <span className="text-xs uppercase font-mono tracking-wider text-[#CC9E33]">
                    {activeDossier.category} Department
                  </span>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${getStatusBadgeStyles(
                    activeDossier.status
                  )}`}
                >
                  {getStatusIcon(activeDossier.status)}
                  <span>{activeDossier.status}</span>
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-normal font-apoc italic text-white tracking-tight leading-snug">
                {activeDossier.title}
              </h2>

              {/* Location & Timestamp */}
              <div className="flex items-center gap-4 text-xs text-[#CC9E33]/90 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#E7C226]" />
                  <span>{activeDossier.neighborhood}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Clock className="w-4 h-4 text-[#E7C226]" />
                  <span>Logged: {activeDossier.createdAt}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-[#CC9E33] mb-2 font-semibold">
                  Citizen Statement & Problem Analysis
                </h4>
                <p className="text-sm text-neutral-200 leading-relaxed bg-black/30 p-4 rounded-lg border border-white/5 whitespace-pre-line">
                  {activeDossier.description}
                </p>
              </div>

              {/* 4-Stage Civic Lifecycle Timeline */}
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider text-[#CC9E33] mb-3 font-semibold">
                  Civic Resolution Lifecycle
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
                  {/* Step 1 */}
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs">
                    <span className="font-mono text-[10px] block opacity-70">STAGE 01</span>
                    <strong className="block mt-0.5">Submitted</strong>
                    <span className="text-[10px] opacity-75">Verified Citizen</span>
                  </div>

                  {/* Step 2 */}
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs">
                    <span className="font-mono text-[10px] block opacity-70">STAGE 02</span>
                    <strong className="block mt-0.5">Community Backing</strong>
                    <span className="text-[10px] opacity-75">{activeDossier.supportCount} Endorsements</span>
                  </div>

                  {/* Step 3 */}
                  <div
                    className={`p-2.5 rounded text-xs border ${
                      activeDossier.status === 'Under Review' || activeDossier.status === 'Resolved'
                        ? 'bg-[#E7C226]/15 border-[#E7C226]/40 text-[#E7C226]'
                        : 'bg-white/5 border-white/10 text-neutral-400'
                    }`}
                  >
                    <span className="font-mono text-[10px] block opacity-70">STAGE 03</span>
                    <strong className="block mt-0.5">Municipal Review</strong>
                    <span className="text-[10px] opacity-75">Field Inspection</span>
                  </div>

                  {/* Step 4 */}
                  <div
                    className={`p-2.5 rounded text-xs border ${
                      activeDossier.status === 'Resolved'
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-neutral-400'
                    }`}
                  >
                    <span className="font-mono text-[10px] block opacity-70">STAGE 04</span>
                    <strong className="block mt-0.5">Resolution</strong>
                    <span className="text-[10px] opacity-75">
                      {activeDossier.status === 'Resolved' ? 'Closed Work' : 'In Queue'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Official Municipal Response Note */}
              {activeDossier.officialResponse ? (
                <div className="p-4 bg-[#10B981]/10 border-l-4 border-[#10B981] rounded-r">
                  <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Official Municipal Resolution Notice</span>
                  </div>
                  <p className="text-xs text-neutral-200 leading-relaxed">
                    {activeDossier.officialResponse}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-white/5 border-l-2 border-[#CC9E33] rounded-r text-xs text-[#CC9E33]/80">
                  <span>Waiting for department inspector notes. Current community backing: </span>
                  <strong className="text-white font-bold">{activeDossier.supportCount} neighborhood residents</strong>.
                </div>
              )}

              {/* Action Buttons in Modal */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleCopyId(activeDossier.id)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-[#E7C226]" />
                  <span>
                    {copiedId === activeDossier.id ? 'Copied Reference!' : 'Copy Reference ID'}
                  </span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => onSupport(activeDossier.id)}
                    className={`flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 ${
                      supportedIds.has(activeDossier.id)
                        ? 'bg-[#E7C226] text-[#0B0B0F] shadow-[0_0_15px_rgba(231,194,38,0.4)]'
                        : 'bg-white/10 text-white hover:bg-[#E7C226]/20 hover:text-[#E7C226] border border-white/20'
                    }`}
                  >
                    {supportedIds.has(activeDossier.id) ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Supported (+1)</span>
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-4 h-4" />
                        <span>Back Proposal (+1)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveDossier(null)}
                    className="btn-cut px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
