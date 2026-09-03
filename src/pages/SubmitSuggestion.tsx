import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { suggestionService } from '../services/suggestionService';
import { uploadSuggestionPhoto } from '../services/storageService';
import { SuggestionCategory } from '../types';
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
} from 'lucide-react';

const CATEGORIES: SuggestionCategory[] = [
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

      let photoPath: string | undefined;
      let photoUrl: string | undefined;

      if (photoFile) {
        const uploadRes = await uploadSuggestionPhoto(photoFile, 'TEMP-REF');
        if (uploadRes.error) {
          console.warn('Photo upload warning:', uploadRes.error);
        } else {
          photoPath = uploadRes.path;
          photoUrl = uploadRes.url;
        }
      }

      const { referenceId } = await suggestionService.createSuggestion({
        category,
        title: title.trim(),
        description: description.trim(),
        location_text: locationText.trim(),
        photo_path: photoPath,
        photo_url: photoUrl,
        is_anonymous: isAnonymous,
        contact_name: isAnonymous ? undefined : contactName.trim() || undefined,
        contact_email: isAnonymous ? undefined : contactEmail.trim() || undefined,
        contact_phone: isAnonymous ? undefined : contactPhone.trim() || undefined,
      });

      // Navigate directly to dedicated /submitted success route
      navigate(`/submitted?ref=${referenceId}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register submission. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-4xl mx-auto z-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7C226]/10 border border-[#E7C226]/30 text-[#E7C226] text-xs font-mono uppercase tracking-widest">
          <span>Civic Intake Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-helvetica text-white tracking-tight uppercase">
          Submit a Civic Suggestion
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 font-apoc italic">
          Every suggestion enters the public ledger, receives a unique reference ID, and is reviewed by local authorities.
        </p>
      </div>

      {/* Main Glass Form Container */}
      <div className="glass-panel p-6 sm:p-10 border border-[#CC9E33]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 flex items-center gap-3 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Category Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#CC9E33] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Municipal Category *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 text-xs rounded-lg font-medium border text-center transition-all ${
                    category === cat
                      ? 'bg-[#E7C226] text-black border-[#E7C226] font-bold shadow-[0_0_12px_rgba(231,194,38,0.4)]'
                      : 'bg-white/5 border-white/10 text-neutral-300 hover:border-[#CC9E33]/50 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Suggestion Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#CC9E33] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Proposal Title *</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Broken storm drain causing flooding on Elm & 4th"
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226] transition-all"
            />
          </div>

          {/* 3. Detailed Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#CC9E33] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Detailed Problem or Proposal *</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details about the condition, safety hazard, public benefit, or proposed intervention..."
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226] transition-all"
            />
          </div>

          {/* 4. Location Text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#CC9E33] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E7C226]" />
              <span>Exact Physical Location / Landmark *</span>
            </label>
            <input
              type="text"
              required
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="e.g., West sidewalk of Oakridge Park, opposite building #42"
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#E7C226] focus:ring-1 focus:ring-[#E7C226] transition-all"
            />
          </div>

          {/* 5. Photo Upload (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#CC9E33] flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Attach Visual Evidence / Photo (Optional)</span>
            </label>

            {photoPreview ? (
              <div className="relative inline-block border border-[#E7C226]/50 rounded-xl overflow-hidden group">
                <img
                  src={photoPreview}
                  alt="Suggestion evidence preview"
                  className="w-48 h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:text-red-400 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-white/15 hover:border-[#E7C226]/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.02]">
                <UploadCloud className="w-8 h-8 text-[#CC9E33] mb-2" />
                <span className="text-xs text-neutral-300 font-medium">
                  Click or drag photo here to attach
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5">
                  Supports JPG, PNG, WEBP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 6. Anonymous Submission Switch */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#E7C226]" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                    Submit Anonymously
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Omit your personal name, email, and phone from administrative records.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                id="anonymous-toggle"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 accent-[#E7C226] rounded cursor-pointer"
              />
            </div>

            {/* Optional Contact fields when NOT anonymous */}
            {!isAnonymous && (
              <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-mono text-[#CC9E33] mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Your Name</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E7C226]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#CC9E33] mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="jane@example.org"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E7C226]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#CC9E33] mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-[#E7C226]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-cut w-full py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(231,194,38,0.4)] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Registering Suggestion...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Suggestion into HIVE</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
