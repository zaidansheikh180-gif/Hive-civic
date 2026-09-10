import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { suggestionService } from '../services/suggestionService';
import { authService } from '../services/authService';
import { SuggestionCategory, SUGGESTION_CATEGORIES } from '../types';
import {
  Send,
  UploadCloud,
  MapPin,
  FileText,
  Tag,
  ShieldCheck,
  AlertCircle,
  X,
  User,
  Mail,
  Phone,
  Check,
  ArrowLeft,
} from 'lucide-react';

export const SubmitSuggestion: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [category, setCategory] = useState<SuggestionCategory>('Roads & Footpaths');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Photo State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Autofill contact info from citizen session if available
    authService.getCurrentUser().then((user) => {
      if (user) {
        if (!contactName) setContactName(user.full_name);
        if (!contactEmail) setContactEmail(user.email);
      }
    });
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 5MB limit.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Validation
    if (title.trim().length < 5) {
      setErrorMsg('Please provide a descriptive title (at least 5 characters).');
      return;
    }
    if (description.trim().length < 15) {
      setErrorMsg('Please detail the civic suggestion or hazard (at least 15 characters).');
      return;
    }
    if (!locationText.trim()) {
      setErrorMsg('Please provide the physical location or intersection.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Pass photoFile directly so suggestion is created first with real UUID,
      // and photo is uploaded to storage path associated with that real UUID.
      const { referenceId } = await suggestionService.createSuggestion({
        category,
        title: title.trim(),
        description: description.trim(),
        location_text: locationText.trim(),
        photo_file: photoFile,
        is_anonymous: isAnonymous,
        contact_name: isAnonymous ? undefined : contactName.trim() || undefined,
        contact_email: isAnonymous ? undefined : contactEmail.trim() || undefined,
        contact_phone: isAnonymous ? undefined : contactPhone.trim() || undefined,
      });

      // Navigate directly to /app/submitted success route
      navigate(`/app/submitted?ref=${referenceId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register submission. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-4xl mx-auto z-10 select-none">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/app"
          className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Civic Feed</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7C226]/10 border border-[#E7C226]/30 text-[#E7C226] text-xs font-mono uppercase tracking-widest">
          <span>Civic Intake Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-helvetica text-white tracking-tight uppercase">
          Submit a Civic Suggestion
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Propose neighborhood improvements, report infrastructure defects, or recommend community amenities to local municipal planners.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Details Section */}
        <div className="glass-panel p-6 sm:p-8 space-y-6 rounded-2xl border border-white/10">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[#E7C226] flex items-center gap-2">
            <Tag className="w-4 h-4" />
            <span>1. Classification & Overview</span>
          </h2>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-neutral-300 uppercase">
              Municipal Category <span className="text-[#E7C226]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {SUGGESTION_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-lg text-xs font-mono text-center border transition-all ${
                    category === cat
                      ? 'bg-[#E7C226]/20 border-[#E7C226] text-[#E7C226] font-bold shadow-[0_0_12px_rgba(231,194,38,0.25)]'
                      : 'bg-black/30 border-white/10 text-neutral-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-neutral-300 uppercase">
              Proposal Title <span className="text-[#E7C226]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Install Solar Pedestrian Crosswalk Beacon at Maple & 4th"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226] text-sm"
            />
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-neutral-300 uppercase">
              Detailed Description <span className="text-[#E7C226]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the current issue, how it impacts neighborhood safety or convenience, and your proposed resolution..."
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226] text-sm resize-none"
            />
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-neutral-300 uppercase flex items-center justify-between">
              <span>Location / Intersection / Address <span className="text-[#E7C226]">*</span></span>
              <span className="text-[10px] text-neutral-400">Be as specific as possible</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. Northwest corner of Elm Street and 8th Avenue, outside community park"
                className="w-full px-4 py-3 pl-10 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226] text-sm"
              />
              <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        {/* Photographic Evidence Attachment */}
        <div className="glass-panel p-6 sm:p-8 space-y-4 rounded-2xl border border-white/10">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[#E7C226] flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            <span>2. Photographic Evidence (Optional)</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Attach a clear photo of the site, damage, or street condition (JPG, PNG, WEBP &bull; Max 5MB).
          </p>

          {photoPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-[#E7C226]/40 max-w-sm">
              <img
                src={photoPreview}
                alt="Upload preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-white/15 hover:border-[#E7C226]/50 bg-black/20 hover:bg-black/40 cursor-pointer transition-all">
              <UploadCloud className="w-8 h-8 text-neutral-400 mb-2" />
              <span className="text-xs font-mono text-neutral-300">
                Click to select or drag photo here
              </span>
              <span className="text-[10px] font-mono text-neutral-500 mt-1">
                Max file size: 5MB
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submitter Identity & Privacy Controls */}
        <div className="glass-panel p-6 sm:p-8 space-y-6 rounded-2xl border border-white/10">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[#E7C226] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>3. Submitter Identity &amp; Privacy</span>
          </h2>

          {/* Anonymity Checkbox */}
          <div
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
              isAnonymous
                ? 'bg-[#E7C226]/10 border-[#E7C226] text-white'
                : 'bg-black/30 border-white/10 text-neutral-300 hover:border-white/20'
            }`}
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                isAnonymous
                  ? 'bg-[#E7C226] border-[#E7C226] text-black'
                  : 'border-neutral-500 bg-transparent'
              }`}
            >
              {isAnonymous && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Submit Anonymously
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your name and direct contact info will NOT be recorded or displayed on the public civic ledger. You can still track status anytime via your DSB Reference ID.
              </p>
            </div>
          </div>

          {!isAnonymous && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-neutral-300 uppercase">
                  Your Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2.5 pl-9 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226] text-xs font-mono"
                  />
                  <User className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-neutral-300 uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3 py-2.5 pl-9 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226] text-xs font-mono"
                  />
                  <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-neutral-300 uppercase">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(555) 019-2834"
                    className="w-full px-3 py-2.5 pl-9 rounded-xl bg-black/40 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-[#E7C226] text-xs font-mono"
                  />
                  <Phone className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="text-xs font-mono text-neutral-400">
            Submission issues an immutable <span className="text-[#E7C226]">DSB-YYYY-XXXXXX</span> tracking reference.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto btn-cut px-10 py-4 text-sm font-extrabold uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(231,194,38,0.4)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>Recording in Ledger...</span>
              </span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Register Suggestion</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
