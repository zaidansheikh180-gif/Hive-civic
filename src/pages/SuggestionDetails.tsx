import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { suggestionService } from '../services/suggestionService';
import { Suggestion, SuggestionStatus, SuggestionStatusHistory } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { StatusTimeline } from '../components/StatusTimeline';
import {
  ArrowLeft,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Tag,
  ThumbsUp,
  FileEdit,
  History,
} from 'lucide-react';

const STATUS_OPTIONS: { key: SuggestionStatus; label: string; desc: string }[] = [
  { key: 'submitted', label: 'Submitted', desc: 'Initial intake status' },
  { key: 'under_review', label: 'Under Review', desc: 'Assigned to municipal engineers' },
  { key: 'accepted', label: 'Accepted', desc: 'Approved for civic intervention & budget' },
  { key: 'planned', label: 'Planned', desc: 'Scheduled into contractor calendar' },
  { key: 'implemented', label: 'Implemented', desc: 'Field resolution verified complete' },
  { key: 'rejected', label: 'Rejected', desc: 'Incompatible with municipal bylaws' },
];

export const SuggestionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [history, setHistory] = useState<SuggestionStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Status Change State
  const [newStatus, setNewStatus] = useState<SuggestionStatus>('under_review');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.getCurrentAdmin()) {
      navigate('/admin/login');
      return;
    }
    if (id) {
      loadData(id);
    }
  }, [id, navigate]);

  const loadData = async (targetId: string) => {
    setLoading(true);
    const data = await suggestionService.getSuggestionById(targetId);
    if (data) {
      setSuggestion(data.suggestion);
      setHistory(data.history);
      setNewStatus(data.suggestion.status);
      setAdminNote(data.suggestion.admin_notes || '');
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion) return;

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const currentAdmin = authService.getCurrentAdmin();
      const adminName = currentAdmin?.full_name || 'Municipal Administrator';

      const res = await suggestionService.updateSuggestionStatus(
        suggestion.id,
        newStatus,
        adminNote.trim() || undefined,
        adminName
      );

      setSuggestion(res.updated);
      setHistory(res.history);
      setSuccessMsg(`Status successfully transitioned to ${newStatus.replace('_', ' ').toUpperCase()} and recorded in public ledger.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update suggestion status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center text-xs font-mono text-[#E7C226] z-10 relative">
        Loading investigation dossier...
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="min-h-screen pt-32 text-center text-xs font-mono text-red-400 z-10 relative space-y-4">
        <div>Suggestion record not found.</div>
        <Link to="/admin/suggestions" className="btn-cut px-4 py-2 text-xs">
          Return to Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-6xl mx-auto z-10 space-y-8">
      {/* Top Nav Backlink */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/suggestions"
          className="text-xs font-mono uppercase text-[#CC9E33] hover:text-[#E7C226] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registry List</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400">Current Status:</span>
          <StatusBadge status={suggestion.status} size="md" />
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 flex items-center gap-3 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 flex items-center gap-3 text-xs sm:text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Suggestion Dossier (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 sm:p-8 border border-[#CC9E33]/30 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#E7C226] bg-[#E7C226]/10 px-3 py-1 rounded border border-[#E7C226]/40">
                  {suggestion.reference_id}
                </span>
                <span className="text-xs font-mono uppercase bg-white/5 border border-white/10 px-2.5 py-1 rounded text-neutral-300">
                  {suggestion.category}
                </span>
                <span className="text-xs font-mono text-[#E7C226] flex items-center gap-1 bg-[#E7C226]/5 px-2 py-0.5 rounded">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{suggestion.support_count || 0} Endorsements</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold font-helvetica uppercase text-white leading-snug">
                {suggestion.title}
              </h1>
            </div>

            {/* Location & Metadata Bar */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-neutral-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E7C226] flex-shrink-0" />
                <span className="truncate">{suggestion.location_text}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#CC9E33] flex-shrink-0" />
                <span>Submitted: {new Date(suggestion.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Description Narrative */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                Detailed Proposal Description
              </h4>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/10">
                {suggestion.description}
              </p>
            </div>

            {/* Attached Photo */}
            {suggestion.photo_url && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Field Photo Evidence
                </h4>
                <div className="rounded-xl overflow-hidden border border-white/15">
                  <img
                    src={suggestion.photo_url}
                    alt={suggestion.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Contact Information Section (Admin Eyes Only) */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#CC9E33] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Submitter Identity (Confidential)</span>
              </h4>

              {suggestion.is_anonymous ? (
                <div className="text-xs text-neutral-400 font-mono italic">
                  Citizen requested anonymous submission. No personal contact data stored.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-neutral-300 pt-1">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Name:</span>
                    <span>{suggestion.contact_name || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Email:</span>
                    <span>{suggestion.contact_email || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Phone:</span>
                    <span>{suggestion.contact_phone || 'Not provided'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Administrative Triage & Status Control (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Action Form */}
          <div className="glass-panel p-6 border-2 border-[#E7C226]/50 shadow-[0_0_30px_rgba(231,194,38,0.15)] space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <ShieldCheck className="w-5 h-5 text-[#E7C226]" />
              <h3 className="text-sm font-mono uppercase font-bold text-white tracking-wider">
                Triage & Lifecycle Action
              </h3>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              {/* Status Radio / Select */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#CC9E33]">
                  Transition Status To:
                </label>
                <div className="space-y-1.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <label
                      key={opt.key}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        newStatus === opt.key
                          ? 'bg-[#E7C226]/15 border-[#E7C226] text-white shadow-[0_0_10px_rgba(231,194,38,0.2)]'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="target_status"
                          value={opt.key}
                          checked={newStatus === opt.key}
                          onChange={() => setNewStatus(opt.key)}
                          className="accent-[#E7C226]"
                        />
                        <span className="text-xs font-mono font-bold uppercase">
                          {opt.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {opt.desc}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Administrative Resolution Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#CC9E33] flex items-center gap-1">
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Public Works Resolution Note</span>
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g., Geotechnical inspector completed evaluation. Crew scheduled for Tuesday maintenance cycle."
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-[#E7C226]"
                />
                <span className="text-[10px] text-neutral-400 font-mono block">
                  This note will be visible to citizens when tracking reference {suggestion.reference_id}.
                </span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-cut w-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(231,194,38,0.3)] disabled:opacity-50"
              >
                {saving ? (
                  <span>Committing Changes...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Commit Status Change</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Audit History Log */}
          <div className="glass-panel p-6 border border-white/10 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#E7C226] flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>Full Audit Trail</span>
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {history.map((hist, idx) => (
                <div
                  key={hist.id || idx}
                  className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[#E7C226] uppercase font-bold text-[11px]">
                      {hist.new_status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {new Date(hist.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    {hist.note}
                  </p>
                  {hist.changed_by && (
                    <div className="text-[10px] font-mono text-[#CC9E33]/70">
                      Logged by: {hist.changed_by}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
