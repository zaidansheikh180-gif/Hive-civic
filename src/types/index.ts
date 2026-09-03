export type SuggestionStatus =
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'planned'
  | 'implemented'
  | 'rejected'
  | 'Under Review'
  | 'Pending'
  | 'Resolved';

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
  | 'Other'
  | 'Roads'
  | 'Electricity'
  | 'Sanitation'
  | 'Public Safety'
  | 'Parks';

export interface Suggestion {
  id: string;
  reference_id?: string;
  category: SuggestionCategory;
  title: string;
  description: string;
  location_text?: string;
  photo_path?: string;
  photo_url?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  is_anonymous?: boolean;
  status: SuggestionStatus;
  support_count?: number;
  created_at?: string;
  updated_at?: string;
  admin_notes?: string;

  // Legacy fields for full backward compatibility
  createdAt?: string;
  supportCount?: number;
  neighborhood?: string;
  officialResponse?: string;
  isUserCreated?: boolean;
}

export interface SuggestionStatusHistory {
  id: string;
  suggestion_id: string;
  old_status?: SuggestionStatus;
  new_status: SuggestionStatus;
  note?: string;
  changed_by?: string;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'moderator';
  created_at: string;
  updated_at: string;
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

// Legacy compatibility types
export type Status = SuggestionStatus;
export type Category = SuggestionCategory;
export type Page = 'landing' | 'citizen' | 'suggest' | 'admin' | 'track' | 'submitted';

declare global {
  interface Window {
    Motion?: any;
  }
}
