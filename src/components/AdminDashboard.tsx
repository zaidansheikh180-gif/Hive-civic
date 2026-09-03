import React, { useState, useEffect } from 'react';
import { Page, Suggestion, Status } from '../types';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  MessageSquare,
  X,
  Filter,
} from 'lucide-react';

interface AdminDashboardProps {
  suggestions: Suggestion[];
  onUpdateStatus: (id: string, newStatus: Status, officialNote?: string) => void;
  onNavigate: (page: Page) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  suggestions,
  onUpdateStatus,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<Status | 'All'>('All');
  const [editingItem, setEditingItem] = useState<Suggestion | null>(null);
  const [modalStatus, setModalStatus] = useState<Status>('Under Review');
  const [modalResponse, setModalResponse] = useState('');

  // Calculations for stats
  const totalOpen = suggestions.filter((s) => s.status !== 'Resolved').length;
  const resolvedCount = suggestions.filter((s) => s.status === 'Resolved').length;

  const filtered = suggestions.filter((s) => {
    if (activeTab === 'All') return true;
    return s.status === activeTab;
  });

  useEffect(() => {
    const motion = window.Motion ? window.Motion : null;
    if (motion) {
      /* Use motion.animate for JS animations */
      motion.animate(
        '.admin-stat-card',
        { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] },
        { duration: 0.45, delay: motion.stagger ? motion.stagger(0.06) : 0.05, easing: [0.16, 1, 0.3, 1] }
      );
      motion.animate(
        '.admin-issue-row',
        { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] },
        { duration: 0.4, delay: motion.stagger ? motion.stagger(0.04) : 0.03 }
      );
    } else {
      /* Fallback to existing CSS animations */
    }
  }, [activeTab]);

  const handleOpenModal = (item: Suggestion) => {
    setEditingItem(item);
    setModalStatus(item.status);
    setModalResponse(item.officialResponse || '');
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateStatus(editingItem.id, modalStatus, modalResponse.trim() || undefined);
    setEditingItem(null);
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Under Review':
        return '#E7C226'; // Golden Ratio Neon -> Gold
      case 'Pending':
        return '#CC9E33'; // Muted Gold
      case 'Resolved':
        return '#10B981'; // Green
    }
  };

  return (
    <section className="min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#CC9E33]/20 animate-fadeUp delay-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E7C226] animate-ping" />
            <span className="text-xs uppercase tracking-widest font-mono text-[#E7C226] font-semibold">
              Municipal Governance Center
            </span>
          </div>
          {/* Title: Admin Control Center (Apoc Revelations Italic) */}
          <h1 className="text-3xl sm:text-5xl font-normal font-apoc italic tracking-tight text-[#E7C226] drop-shadow-[0_0_20px_rgba(231,194,38,0.35)]">
            Admin Control Center
          </h1>
          <p className="text-sm text-[#CC9E33]/80 mt-1 max-w-xl">
            Triage neighborhood proposals, assign municipal response personnel, and broadcast transparent resolutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('citizen')}
            className="btn-cut-border px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[#CC9E33] hover:text-white"
          >
            <span>View Citizen Feed</span>
          </button>
        </div>
      </div>

      {/* Two glassmorphic stats cards at the top with Timed Opening */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
        {/* Card 1: Total Open Issues (Honey Gold numbers) */}
        <div
          style={{ animationDelay: '0ms' }}
          className="admin-stat-card glass-panel p-6 border-l-4 border-l-[#E7C226] relative overflow-hidden animate-card-timed-open"
        >
          <div className="card-sheen-line" style={{ animationDelay: '180ms' }} />
          <div className="flex items-center justify-between text-[#CC9E33] mb-2">
            <span className="text-xs uppercase tracking-widest font-mono">Open Proposals</span>
            <AlertTriangle className="w-4 h-4 text-[#E7C226]" />
          </div>
          <div className="text-4xl sm:text-5xl font-black text-[#E7C226] font-mono tracking-tight drop-shadow-[0_0_15px_rgba(231,194,38,0.45)]">
            {totalOpen}
          </div>
          <div className="text-xs text-[#CC9E33]/80 mt-2">
            Total Open Issues: <strong className="text-white">{totalOpen}</strong> (Pending & Under Review)
          </div>
        </div>

        {/* Card 2: Resolved This Week (Green numbers) */}
        <div
          style={{ animationDelay: '90ms' }}
          className="admin-stat-card glass-panel p-6 border-l-4 border-l-[#10B981] relative overflow-hidden animate-card-timed-open"
        >
          <div className="card-sheen-line" style={{ animationDelay: '270ms' }} />
          <div className="flex items-center justify-between text-[#CC9E33] mb-2">
            <span className="text-xs uppercase tracking-widest font-mono">Resolved Works</span>
            <CheckCircle className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-4xl sm:text-5xl font-black text-[#10B981] font-mono tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            {resolvedCount}
          </div>
          <div className="text-xs text-[#CC9E33]/80 mt-2">
            Resolved This Week: <strong className="text-white">{resolvedCount}</strong> closed civic matters
          </div>
        </div>

        {/* Card 3: Under Review (Golden Ratio Neon) */}
        <div
          style={{ animationDelay: '180ms' }}
          className="admin-stat-card glass-panel p-6 border-l-4 border-l-[#E7C226] relative overflow-hidden animate-card-timed-open"
        >
          <div className="card-sheen-line" style={{ animationDelay: '360ms' }} />
          <div className="flex items-center justify-between text-[#CC9E33] mb-2">
            <span className="text-xs uppercase tracking-widest font-mono">Active Investigation</span>
            <ShieldCheck className="w-4 h-4 text-[#E7C226]" />
          </div>
          <div className="text-4xl sm:text-5xl font-black text-[#E7C226] font-mono tracking-tight drop-shadow-[0_0_15px_rgba(231,194,38,0.4)]">
            {suggestions.filter((s) => s.status === 'Under Review').length}
          </div>
          <div className="text-xs text-[#CC9E33]/80 mt-2">
            Dispatched to field teams & inspectors
          </div>
        </div>

        {/* Card 4: Total Submissions */}
        <div
          style={{ animationDelay: '270ms' }}
          className="admin-stat-card glass-panel p-6 border-l-4 border-l-[#CC9E33]/60 relative overflow-hidden animate-card-timed-open"
        >
          <div className="card-sheen-line" style={{ animationDelay: '450ms' }} />
          <div className="flex items-center justify-between text-[#CC9E33] mb-2">
            <span className="text-xs uppercase tracking-widest font-mono">All Submissions</span>
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
            {suggestions.length}
          </div>
          <div className="text-xs text-[#CC9E33]/80 mt-2">
            Decentralized community suggestions logged
          </div>
        </div>
      </div>

      {/* Admin Filter Tabs */}
      <div className="flex items-center gap-2 pb-4 border-b border-[#CC9E33]/20 mb-6 overflow-x-auto scrollbar-none animate-fadeUp delay-300">
        <Filter className="w-4 h-4 text-[#CC9E33] mr-2 flex-shrink-0" />
        {(['All', 'Under Review', 'Pending', 'Resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === tab
                ? 'bg-[#E7C226] text-[#0B0B0F] shadow-[0_0_12px_rgba(231,194,38,0.35)] font-bold'
                : 'bg-white/5 text-[#CC9E33] border border-[#CC9E33]/20 hover:bg-[#CC9E33]/15 hover:text-white'
            }`}
          >
            {tab} ({tab === 'All' ? suggestions.length : suggestions.filter((s) => s.status === tab).length})
          </button>
        ))}
      </div>

      {/* Admin List: Vertical list of timed opening glass items */}
      <div key={activeTab} className="space-y-4 perspective-container">
        {filtered.map((item, idx) => {
          const rowDelay = idx * 75;
          return (
            <div
              key={item.id}
              style={{ animationDelay: `${rowDelay}ms` }}
              className="admin-issue-row glass-panel glass-panel-hover p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10 relative overflow-hidden animate-card-timed-open"
            >
              {/* Timed Sheen Sweep */}
              <div
                className="card-sheen-line"
                style={{ animationDelay: `${rowDelay + 180}ms` }}
              />

              {/* Left: Status indicator, Title, Category, Metadata */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Colored status dot */}
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: getStatusColor(item.status),
                      boxShadow: `0 0 8px ${getStatusColor(item.status)}`,
                    }}
                    title={item.status}
                  />

                  <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-semibold">
                    {item.category}
                  </span>

                  <span
                    className="text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${getStatusColor(item.status)}25`,
                      color: getStatusColor(item.status),
                      border: `1px solid ${getStatusColor(item.status)}50`,
                    }}
                  >
                    {item.status}
                  </span>

                  <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {item.createdAt}
                  </span>

                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#FFB300]" />
                    {item.neighborhood}
                  </span>

                  <span className="text-[10px] font-mono text-[#CC9E33]/60 bg-white/5 px-2 py-0.5 rounded">
                    № {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-normal font-apoc italic text-white">
                  {item.title}
                </h3>

                {/* Description preview */}
                <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
                  {item.description}
                </p>

                {/* Official response snippet if existing */}
                {item.officialResponse && (
                  <div className="text-xs text-[#10B981] bg-[#10B981]/10 border-l-2 border-[#10B981] p-2 rounded-r mt-2">
                    <strong>Municipal Note:</strong> {item.officialResponse}
                  </div>
                )}
              </div>

              {/* Right: Actions with .btn-cut-sm */}
              <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                {/* Quick Resolve Button if not yet resolved */}
                {item.status !== 'Resolved' && (
                  <button
                    onClick={() => onUpdateStatus(item.id, 'Resolved', 'Resolved by municipal department')}
                    title="Quick resolve this issue"
                    className="btn-cut-sm px-3.5 py-1.5 bg-[#10B981] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#20e097]"
                  >
                    Resolve
                  </button>
                )}

                {/* Update Button (Opens dialog modal) */}
                <button
                  onClick={() => handleOpenModal(item)}
                  title="Update status or add official municipal notes"
                  className="btn-cut-sm-border px-3.5 py-1.5 text-white text-xs font-semibold uppercase tracking-wider hover:text-[#E7C226]"
                >
                  <span>Update</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Update / Resolve */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel max-w-lg w-full p-6 border border-[#CC9E33]/30 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#CC9E33]/20 mb-4">
              <div>
                <span className="text-xs font-mono uppercase text-[#E7C226] font-semibold">
                  Update Civic Matter
                </span>
                <h3 className="text-xl font-normal font-apoc italic text-white truncate max-w-[320px]">
                  {editingItem.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-[#CC9E33] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#CC9E33] mb-1.5">
                  Change Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Under Review', 'Pending', 'Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setModalStatus(st)}
                      className={`py-2 px-2 text-xs font-bold rounded border transition-all text-center ${
                        modalStatus === st
                          ? 'bg-[#E7C226] text-[#0B0B0F] border-[#E7C226] shadow-[0_0_10px_rgba(231,194,38,0.3)]'
                          : 'bg-white/5 text-[#CC9E33] border-[#CC9E33]/20 hover:bg-[#CC9E33]/15'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#CC9E33] mb-1.5">
                  Official Municipal Response Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Department of Transportation has scheduled repair crew for Thursday morning."
                  value={modalResponse}
                  onChange={(e) => setModalResponse(e.target.value)}
                  className="hive-input w-full p-2.5 text-xs text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="btn-cut-border px-4 py-2 text-xs uppercase tracking-wider text-[#CC9E33] hover:text-white"
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="btn-cut px-5 py-2 font-extrabold uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(231,194,38,0.35)]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
