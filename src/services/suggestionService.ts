import {
  Suggestion,
  SuggestionCategory,
  SuggestionStatus,
  SuggestionStatusHistory,
  DashboardStats,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'hive_dsb_suggestions_v2';
const HISTORY_STORAGE_KEY = 'hive_dsb_history_v2';

// Generates a human-readable unique reference ID: DSB-YYYY-XXXXXX
export const generateReferenceId = (): string => {
  const year = new Date().getFullYear();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude visually ambiguous chars like 0, 1, I, O
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DSB-${year}-${randomPart}`;
};

// Realistic initial seed data reflecting required categories and status flows
const SEED_SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug-hive-001',
    reference_id: 'DSB-2026-7F3K9P',
    category: 'Roads & Footpaths',
    title: 'Severe Asphalt Subsidence & Potholes on Elm & 4th Avenue',
    description:
      'Multiple deep fissures and asphalt cavities have developed along the northbound transit lane, forcing cyclists and emergency vehicles into oncoming traffic during peak evening hours.',
    location_text: 'Elm Street & 4th Avenue, Downtown Sector',
    photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    contact_name: 'Elena Vance',
    contact_email: 'elena.vance@citynet.org',
    contact_phone: '+1 (555) 234-8901',
    is_anonymous: false,
    status: 'under_review',
    support_count: 48,
    admin_notes: 'Dispatched municipal road safety inspector. Geotechnical assessment queued for Friday.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sug-hive-002',
    reference_id: 'DSB-2026-9B4X2T',
    category: 'Street Lighting',
    title: 'High-Pressure Sodium Fixture Failure along Parkside Pedestrian Greenway',
    description:
      'Six consecutive streetlight lamp posts are completely dark between Mile Marker 2 and the Community Center footbridge, creating substantial pedestrian safety concerns after dusk.',
    location_text: 'Parkside Greenway Trail, West District',
    is_anonymous: true,
    status: 'planned',
    support_count: 73,
    admin_notes: 'Public Works approved LED retrofit conversion. Contractor scheduled for next Tuesday.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sug-hive-003',
    reference_id: 'DSB-2026-2M8W5R',
    category: 'Waste Management',
    title: 'Smart Solar-Compacting Bins at Central Plaza Transit Hub',
    description:
      'Propose replacing overflowing manual trash cans at the central bus terminal with high-capacity solar-powered compaction units equipped with fill-level telemetry.',
    location_text: 'Central Plaza Transit Terminal, Sector 1',
    contact_name: 'Marcus Chen',
    contact_email: 'mchen.civic@proton.me',
    is_anonymous: false,
    status: 'accepted',
    support_count: 91,
    admin_notes: 'Proposal incorporated into Capital Improvement Project CIP-2026-E.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sug-hive-004',
    reference_id: 'DSB-2026-5K1L8Q',
    category: 'Water & Sanitation',
    title: 'Low-Pressure Water Supply & Murky Sediment in Northridge Heights',
    description:
      'Residents in building blocks 12 through 18 report tap water discoloration and sudden pressure drops between 7:00 AM and 9:30 AM.',
    location_text: 'Northridge Heights, Block 12-18',
    is_anonymous: true,
    status: 'implemented',
    support_count: 112,
    admin_notes: 'Water Authority flushed feeder mains and replaced aged 10-inch pressure regulator valve.',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sug-hive-005',
    reference_id: 'DSB-2026-3N7P4V',
    category: 'Public Spaces',
    title: 'Community Herbal Garden & Accessible Seating at Oakridge Park',
    description:
      'Transform the disused gravel patch near the north pavilion into an accessible raised-bed pollinator and community garden with sensory pathways.',
    location_text: 'Oakridge Community Park, North Pavilion',
    contact_name: 'Amina Al-Mansoor',
    contact_email: 'amina.nature@gmail.com',
    is_anonymous: false,
    status: 'submitted',
    support_count: 34,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sug-hive-006',
    reference_id: 'DSB-2026-8H2C6Y',
    category: 'Transport',
    title: 'Private Helipad Request on Residential Roof Terrace',
    description:
      'Resident requested zoning exemption to convert private penthouse flat roof into chartered helicopter landing pad.',
    location_text: 'Hillside Manor Penthouse, District 4',
    is_anonymous: false,
    status: 'rejected',
    support_count: 3,
    admin_notes: 'Denied: Incompatible with municipal residential noise zoning and FAA clearance protocols.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SEED_HISTORY: SuggestionStatusHistory[] = [
  // sug-hive-001
  {
    id: 'hist-001-a',
    suggestion_id: 'sug-hive-001',
    old_status: undefined,
    new_status: 'submitted',
    note: 'Civic suggestion registered in HIVE intake system.',
    changed_by: 'Citizen Intake System',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hist-001-b',
    suggestion_id: 'sug-hive-001',
    old_status: 'submitted',
    new_status: 'under_review',
    note: 'Triaged by Department of Transportation. Assigned to Inspector T. Morales.',
    changed_by: 'Admin / T. Morales',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // sug-hive-002
  {
    id: 'hist-002-a',
    suggestion_id: 'sug-hive-002',
    old_status: undefined,
    new_status: 'submitted',
    note: 'Anonymous civic suggestion filed.',
    changed_by: 'Citizen Intake System',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hist-002-b',
    suggestion_id: 'sug-hive-002',
    old_status: 'submitted',
    new_status: 'under_review',
    note: 'Field safety team verified unlit stretch.',
    changed_by: 'Admin / Safety Bureau',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hist-002-c',
    suggestion_id: 'sug-hive-002',
    old_status: 'under_review',
    new_status: 'planned',
    note: 'Scheduled for LED luminaire retrofit on next Tuesday maintenance cycle.',
    changed_by: 'Admin / Public Works',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  // sug-hive-003
  {
    id: 'hist-003-a',
    suggestion_id: 'sug-hive-003',
    new_status: 'submitted',
    note: 'Suggestion submitted with community co-signatures.',
    changed_by: 'Citizen Intake System',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hist-003-b',
    suggestion_id: 'sug-hive-003',
    old_status: 'submitted',
    new_status: 'under_review',
    note: 'Environmental Services reviewing waste volume data.',
    changed_by: 'Admin / Env Services',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hist-003-c',
    suggestion_id: 'sug-hive-003',
    old_status: 'under_review',
    new_status: 'accepted',
    note: 'Approved for smart waste pilot program budget allocation.',
    changed_by: 'City Council Oversight Board',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // sug-hive-004
  {
    id: 'hist-004-a',
    suggestion_id: 'sug-hive-004',
    new_status: 'submitted',
    note: 'Water quality alert logged.',
    changed_by: 'Citizen Intake System',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hist-004-b',
    suggestion_id: 'sug-hive-004',
    old_status: 'submitted',
    new_status: 'under_review',
    note: 'Emergency water testing deployed to Northridge.',
    changed_by: 'Water Authority Dispatch',
    created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hist-004-c',
    suggestion_id: 'sug-hive-004',
    old_status: 'under_review',
    new_status: 'planned',
    note: 'Valve procurement and crew staging confirmed.',
    changed_by: 'Water Works Division',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hist-004-d',
    suggestion_id: 'sug-hive-004',
    old_status: 'planned',
    new_status: 'implemented',
    note: 'Water main flushed; pressure restored to 55 PSI. Laboratory analysis verified clean turbidity.',
    changed_by: 'Water Works Chief Engineer',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  // sug-hive-005
  {
    id: 'hist-005-a',
    suggestion_id: 'sug-hive-005',
    new_status: 'submitted',
    note: 'Community greening proposal logged.',
    changed_by: 'Citizen Intake System',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  // sug-hive-006
  {
    id: 'hist-006-a',
    suggestion_id: 'sug-hive-006',
    new_status: 'submitted',
    note: 'Zoning application submitted.',
    changed_by: 'Citizen Intake System',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hist-006-b',
    suggestion_id: 'sug-hive-006',
    old_status: 'submitted',
    new_status: 'under_review',
    note: 'Zoning commission flight path evaluation.',
    changed_by: 'Municipal Planning Board',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hist-006-c',
    suggestion_id: 'sug-hive-006',
    old_status: 'under_review',
    new_status: 'rejected',
    note: 'Denied: Incompatible with municipal residential noise zoning and FAA clearance protocols.',
    changed_by: 'Chief City Planner',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper: Read local suggestions
const readLocalSuggestions = (): Suggestion[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not read local suggestions:', e);
  }
  // Initialize with seed
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_SUGGESTIONS));
  return SEED_SUGGESTIONS;
};

// Helper: Save local suggestions
const saveLocalSuggestions = (items: Suggestion[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save local suggestions:', e);
  }
};

// Helper: Read local history
const readLocalHistory = (): SuggestionStatusHistory[] => {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not read local history:', e);
  }
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(SEED_HISTORY));
  return SEED_HISTORY;
};

// Helper: Save local history
const saveLocalHistory = (hist: SuggestionStatusHistory[]) => {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(hist));
  } catch (e) {
    console.warn('Could not save local history:', e);
  }
};

export const suggestionService = {
  // Create a new civic suggestion
  async createSuggestion(
    input: Omit<Suggestion, 'id' | 'reference_id' | 'status' | 'created_at' | 'updated_at'>
  ): Promise<{ suggestion: Suggestion; referenceId: string }> {
    const referenceId = generateReferenceId();
    const id = `sug-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newSuggestion: Suggestion = {
      ...input,
      id,
      reference_id: referenceId,
      status: 'submitted',
      support_count: 1,
      created_at: now,
      updated_at: now,
    };

    const initialHistory: SuggestionStatusHistory = {
      id: `hist-${Date.now()}`,
      suggestion_id: id,
      new_status: 'submitted',
      note: 'Civic suggestion registered in HIVE decentralized governance registry.',
      changed_by: 'Citizen Intake System',
      created_at: now,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error: sugError } = await supabase.from('suggestions').insert([
          {
            reference_id: referenceId,
            category: newSuggestion.category,
            title: newSuggestion.title,
            description: newSuggestion.description,
            location_text: newSuggestion.location_text,
            photo_path: newSuggestion.photo_path,
            photo_url: newSuggestion.photo_url,
            contact_name: newSuggestion.contact_name,
            contact_email: newSuggestion.contact_email,
            contact_phone: newSuggestion.contact_phone,
            is_anonymous: newSuggestion.is_anonymous,
            status: 'submitted',
          },
        ]);

        if (sugError) {
          console.warn('Supabase insert failed, falling back to local sync:', sugError.message);
        } else {
          // Also insert history in Supabase
          await supabase.from('suggestion_status_history').insert([
            {
              suggestion_id: id,
              new_status: 'submitted',
              note: initialHistory.note,
              changed_by: initialHistory.changed_by,
            },
          ]);
        }
      } catch (err: any) {
        console.warn('Supabase create exception:', err.message);
      }
    }

    // Always maintain local storage sync for instantaneous UI responsiveness
    const currentList = readLocalSuggestions();
    saveLocalSuggestions([newSuggestion, ...currentList]);

    const currentHistory = readLocalHistory();
    saveLocalHistory([...currentHistory, initialHistory]);

    return { suggestion: newSuggestion, referenceId };
  },

  // Get single suggestion by reference ID with its status journey
  async getSuggestionByReference(
    referenceId: string
  ): Promise<{ suggestion: Suggestion; history: SuggestionStatusHistory[] } | null> {
    const cleanRef = referenceId.trim().toUpperCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: sugData, error: sugError } = await supabase
          .from('suggestions')
          .select('*')
          .eq('reference_id', cleanRef)
          .single();

        if (!sugError && sugData) {
          const { data: histData } = await supabase
            .from('suggestion_status_history')
            .select('*')
            .eq('suggestion_id', sugData.id)
            .order('created_at', { ascending: true });

          // Mask private contact details for public tracking compliance
          const safeSuggestion: Suggestion = {
            ...sugData,
            contact_name: undefined,
            contact_email: undefined,
            contact_phone: undefined,
          };

          return {
            suggestion: safeSuggestion,
            history: histData || [],
          };
        }
      } catch (err: any) {
        console.warn('Supabase fetch by reference error:', err.message);
      }
    }

    // Local fallback
    const list = readLocalSuggestions();
    const found = list.find((s) => s.reference_id.toUpperCase() === cleanRef);
    if (!found) return null;

    const allHistory = readLocalHistory();
    const history = allHistory
      .filter((h) => h.suggestion_id === found.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Public tracking must never expose private contact information
    const safeSuggestion: Suggestion = {
      ...found,
      contact_name: undefined,
      contact_email: undefined,
      contact_phone: undefined,
    };

    return { suggestion: safeSuggestion, history };
  },

  // Get suggestions with optional filters and sorting
  async getSuggestions(filters?: {
    search?: string;
    category?: string;
    status?: string;
    sortBy?: 'newest' | 'oldest' | 'support';
  }): Promise<Suggestion[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('suggestions').select('*');

        if (filters?.category && filters.category !== 'All') {
          query = query.eq('category', filters.category);
        }
        if (filters?.status && filters.status !== 'All') {
          query = query.eq('status', filters.status);
        }
        if (filters?.search) {
          query = query.or(
            `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location_text.ilike.%${filters.search}%,reference_id.ilike.%${filters.search}%`
          );
        }

        if (filters?.sortBy === 'oldest') {
          query = query.order('created_at', { ascending: true });
        } else if (filters?.sortBy === 'support') {
          query = query.order('support_count', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err: any) {
        console.warn('Supabase getSuggestions error:', err.message);
      }
    }

    // Local search & filter
    let list = readLocalSuggestions();

    if (filters?.category && filters.category !== 'All') {
      list = list.filter((s) => s.category === filters.category);
    }
    if (filters?.status && filters.status !== 'All') {
      list = list.filter((s) => s.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.location_text.toLowerCase().includes(q) ||
          s.reference_id.toLowerCase().includes(q)
      );
    }

    if (filters?.sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (filters?.sortBy === 'support') {
      list.sort((a, b) => (b.support_count || 0) - (a.support_count || 0));
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  },

  // Get single suggestion by internal ID (Admin workspace)
  async getSuggestionById(
    id: string
  ): Promise<{ suggestion: Suggestion; history: SuggestionStatusHistory[] } | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: sugData, error: sugError } = await supabase
          .from('suggestions')
          .select('*')
          .eq('id', id)
          .single();

        if (!sugError && sugData) {
          const { data: histData } = await supabase
            .from('suggestion_status_history')
            .select('*')
            .eq('suggestion_id', id)
            .order('created_at', { ascending: true });

          return {
            suggestion: sugData,
            history: histData || [],
          };
        }
      } catch (err: any) {
        console.warn('Supabase getSuggestionById error:', err.message);
      }
    }

    const list = readLocalSuggestions();
    const found = list.find((s) => s.id === id || s.reference_id === id);
    if (!found) return null;

    const allHistory = readLocalHistory();
    const history = allHistory
      .filter((h) => h.suggestion_id === found.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return { suggestion: found, history };
  },

  // Update status and append to audit history (Admin action)
  async updateSuggestionStatus(
    id: string,
    newStatus: SuggestionStatus,
    note?: string,
    changedBy: string = 'Municipal Administrator'
  ): Promise<{ success: boolean; updated: Suggestion; history: SuggestionStatusHistory[] }> {
    const list = readLocalSuggestions();
    const index = list.findIndex((s) => s.id === id || s.reference_id === id);

    if (index === -1) {
      throw new Error(`Suggestion with ID ${id} not found.`);
    }

    const current = list[index];
    const oldStatus = current.status;
    const now = new Date().toISOString();

    const updated: Suggestion = {
      ...current,
      status: newStatus,
      admin_notes: note !== undefined ? note : current.admin_notes,
      updated_at: now,
    };

    list[index] = updated;
    saveLocalSuggestions(list);

    const newHistoryItem: SuggestionStatusHistory = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      suggestion_id: current.id,
      old_status: oldStatus,
      new_status: newStatus,
      note: note || `Status transitioned from ${oldStatus.replace('_', ' ')} to ${newStatus.replace('_', ' ')}.`,
      changed_by: changedBy,
      created_at: now,
    };

    const currentHist = readLocalHistory();
    const updatedHist = [...currentHist, newHistoryItem];
    saveLocalHistory(updatedHist);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('suggestions')
          .update({
            status: newStatus,
            admin_notes: updated.admin_notes,
            updated_at: now,
          })
          .eq('id', current.id);

        await supabase.from('suggestion_status_history').insert([
          {
            suggestion_id: current.id,
            old_status: oldStatus,
            new_status: newStatus,
            note: newHistoryItem.note,
            changed_by: changedBy,
          },
        ]);
      } catch (err: any) {
        console.warn('Supabase status update failed, local copy preserved:', err.message);
      }
    }

    const itemHistory = updatedHist
      .filter((h) => h.suggestion_id === current.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return { success: true, updated, history: itemHistory };
  },

  // Get aggregated dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const list = await this.getSuggestions();

    const stats: DashboardStats = {
      total: list.length,
      submitted: 0,
      under_review: 0,
      accepted: 0,
      planned: 0,
      implemented: 0,
      rejected: 0,
      categoryCounts: {
        'Roads & Footpaths': 0,
        'Street Lighting': 0,
        'Waste Management': 0,
        'Water & Sanitation': 0,
        'Public Spaces': 0,
        Transport: 0,
        Education: 0,
        Environment: 0,
        'Community Facilities': 0,
        Other: 0,
      },
      recentUpdatesCount: 0,
    };

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    for (const item of list) {
      if (item.status === 'submitted') stats.submitted++;
      else if (item.status === 'under_review') stats.under_review++;
      else if (item.status === 'accepted') stats.accepted++;
      else if (item.status === 'planned') stats.planned++;
      else if (item.status === 'implemented') stats.implemented++;
      else if (item.status === 'rejected') stats.rejected++;

      if (stats.categoryCounts[item.category] !== undefined) {
        stats.categoryCounts[item.category]++;
      } else {
        stats.categoryCounts['Other']++;
      }

      if (new Date(item.updated_at).getTime() > oneDayAgo) {
        stats.recentUpdatesCount++;
      }
    }

    return stats;
  },

  // Support / Upvote toggle for community suggestions
  async toggleSupport(id: string): Promise<{ supportCount: number; isSupported: boolean }> {
    const list = readLocalSuggestions();
    const item = list.find((s) => s.id === id);
    if (!item) return { supportCount: 0, isSupported: false };

    const supportKey = `hive_supported_${id}`;
    const currentlySupported = localStorage.getItem(supportKey) === 'true';

    let newCount = item.support_count || 0;
    let isSupported = false;

    if (currentlySupported) {
      newCount = Math.max(0, newCount - 1);
      localStorage.removeItem(supportKey);
      isSupported = false;
    } else {
      newCount += 1;
      localStorage.setItem(supportKey, 'true');
      isSupported = true;
    }

    item.support_count = newCount;
    saveLocalSuggestions(list);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('suggestions')
          .update({ support_count: newCount })
          .eq('id', id);
      } catch {
        // ignore
      }
    }

    return { supportCount: newCount, isSupported };
  },
};
