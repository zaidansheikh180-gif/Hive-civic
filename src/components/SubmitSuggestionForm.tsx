import React, { useState } from 'react';
import { Page, Category, Suggestion } from '../types';
import { ArrowLeft, Sparkles, Send, CheckCircle } from 'lucide-react';

interface SubmitSuggestionFormProps {
  onAddSuggestion: (suggestion: Omit<Suggestion, 'id' | 'createdAt' | 'supportCount'>) => void;
  onNavigate: (page: Page) => void;
}

export const SubmitSuggestionForm: React.FC<SubmitSuggestionFormProps> = ({
  onAddSuggestion,
  onNavigate,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Roads');
  const [neighborhood, setNeighborhood] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide a title and detailed description for your suggestion.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Simulate quick submission
    setTimeout(() => {
      onAddSuggestion({
        title: title.trim(),
        category,
        neighborhood: neighborhood.trim() || 'Central Community District',
        description: description.trim(),
        status: 'Pending',
        isUserCreated: true,
      });

      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        onNavigate('citizen');
      }, 1200);
    }, 600);
  };

  return (
    <section className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      {/* Center glassmorphic box (max-width 600px) over video background */}
      <div className="w-full max-w-[600px] glass-panel p-6 sm:p-8 relative z-10 animate-fadeUp delay-100 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15">
        {/* Back navigation button */}
        <button
          onClick={() => onNavigate('citizen')}
          className="btn-cut-border px-3 py-1.5 text-xs text-neutral-300 hover:text-white uppercase tracking-wider mb-6 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </button>

        {showSuccess ? (
          <div className="py-12 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center mx-auto text-[#10B981] shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black uppercase text-white tracking-tight">
              Suggestion Submitted!
            </h2>
            <p className="text-neutral-300 text-sm max-w-sm mx-auto">
              Your voice has been recorded in the Hive decentralized registry and transmitted to local administrators.
            </p>
            <div className="text-xs font-mono text-[#E7C226] pt-2">
              Redirecting to your feed...
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-[#E7C226] text-xs font-mono tracking-widest uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Civic Intake Station</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-normal font-apoc italic tracking-tight text-white">
                Submit Suggestion
              </h2>
              <p className="text-xs text-[#CC9E33]/80 mt-1">
                Help city administrators identify municipal hazards, infrastructure flaws, and neighborhood ideas.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#CC9E33] mb-1.5">
                  Issue Title <span className="text-[#E7C226]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hazardous Pothole on Elm Street"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="hive-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>

              {/* Category Dropdown (Roads, Sanitation, Electricity, Public Safety) */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#CC9E33] mb-1.5">
                  Category <span className="text-[#E7C226]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="hive-input w-full px-3.5 py-2.5 text-sm bg-[#0B0B0F] text-white cursor-pointer"
                >
                  <option value="Roads" className="bg-[#0B0B0F] text-white">
                    Roads (Potholes, paving, traffic signals)
                  </option>
                  <option value="Sanitation" className="bg-[#0B0B0F] text-white">
                    Sanitation (Trash overflow, drainage, waste collection)
                  </option>
                  <option value="Electricity" className="bg-[#0B0B0F] text-white">
                    Electricity (Power lines, streetlights, transformer outages)
                  </option>
                  <option value="Public Safety" className="bg-[#0B0B0F] text-white">
                    Public Safety (Crossings, hazards, visibility, signage)
                  </option>
                </select>
              </div>

              {/* Neighborhood / Locality */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#CC9E33] mb-1.5">
                  Neighborhood or Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Downtown, Westside, North Hill"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="hive-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>

              {/* Description Textarea */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#CC9E33] mb-1.5">
                  Detailed Description <span className="text-[#E7C226]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the exact location, safety risks, or recommendations for municipal resolution..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="hive-input w-full px-3.5 py-2.5 text-sm resize-none"
                />
              </div>

              {/* Notice */}
              <div className="p-3 bg-white/5 rounded-lg border border-[#CC9E33]/20 text-[11px] text-[#CC9E33]/80">
                <span className="text-white font-medium">Public Transparency Notice:</span> Submissions become visible to neighborhood residents and local administrative teams to accelerate civic triage.
              </div>

              {/* Full width .btn-cut Honey Gold primary button "Submit Suggestion" */}
              <div className="pt-2">
                <button
                  id="submit-suggestion-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-cut w-full py-3.5 font-extrabold uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(231,194,38,0.35)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering with Hive...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Suggestion</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
};
