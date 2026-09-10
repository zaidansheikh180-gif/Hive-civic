export type SuggestionStatus =
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'planned'
  | 'implemented'
  | 'rejected';

export type SuggestionCategory =
  | 'Roads & Footpaths'
  | 'Street Lighting'
  | 'Waste Management'
  | 'Water & Sanitation'
  | 'Public Spaces'
  | 'Transport'
  | 'Education'
  | 'Environment'
  | 'Community Facilities'
  | 'Other';

export const SUGGESTION_STATUSES: readonly SuggestionStatus[] = [
  'submitted',
  'under_review',
  'accepted',
  'planned',
  'implemented',
  'rejected',
] as const;

export const SUGGESTION_CATEGORIES: readonly SuggestionCategory[] = [
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
] as const;

export type UserRole = 'citizen' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export type AdminProfile = UserProfile;

export interface Suggestion {
  id: string; // Authoritative PostgreSQL UUID
  reference_id: string; // Citizen-facing unique format: DSB-YYYY-XXXXXX
  category: SuggestionCategory;
  title: string;
  description: string;
  location_text: string;
  photo_path?: string | null;
  photo_url?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_anonymous: boolean;
  user_id?: string | null; // Authenticated submitter UUID
  status: SuggestionStatus;
  support_count: number;
  admin_notes?: string | null;
  created_at?: string;
  updated_at?: string;

  // Legacy field support
  createdAt?: string;
  supportCount?: number;
  neighborhood?: string;
  officialResponse?: string;
  isUserCreated?: boolean;
}

export interface SuggestionStatusHistory {
  id: string;
  suggestion_id: string;
  old_status?: SuggestionStatus | null;
  new_status: SuggestionStatus;
  note?: string | null;
  changed_by: string;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  submitted: number;
  under_review: number;
  accepted: number;
  planned: number;
  implemented: number;
  rejected: number;
  categoryCounts: Record<string, number>;
  recentUpdatesCount: number;
}

export type SceneType =
  | 'home'
  | 'submit'
  | 'success'
  | 'track'
  | 'admin'
  | 'suggestions'
  | 'workspace';

export type Status = SuggestionStatus;
export type Category = SuggestionCategory;
export type Page = 'landing' | 'citizen' | 'suggest' | 'admin' | 'track' | 'submitted';

declare global {
  interface Window {
    Motion?: any;
  }
}
