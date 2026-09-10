import {
  Suggestion,
  SuggestionCategory,
  SuggestionStatus,
  SuggestionStatusHistory,
  DashboardStats,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { uploadSuggestionPhoto } from './storageService';

export const generateReferenceId = (): string => {
  const year = new Date().getFullYear();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 6; i++) randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  return `DSB-${year}-${randomPart}`;
};

export interface SchemaStatus { tablesExist: boolean; message?: string; }
export interface CreateSuggestionInput {
  category: SuggestionCategory; title: string; description: string; location_text: string;
  photo_path?: string | null; photo_url?: string | null; photo_file?: File | null;
  contact_name?: string | null; contact_email?: string | null; contact_phone?: string | null;
  is_anonymous?: boolean;
}

const requireClient = () => {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase client is not configured.');
  return supabase;
};

const PUBLIC_FIELDS = 'id, reference_id, category, title, description, location_text, photo_url, is_anonymous, status, support_count, created_at, updated_at';

export const suggestionService = {
  async checkSchemaStatus(): Promise<SchemaStatus> {
    if (!isSupabaseConfigured() || !supabase) return { tablesExist: false, message: 'Supabase credentials are not configured.' };
    const { error } = await supabase.from('suggestions').select('id').limit(1);
    if (error) return { tablesExist: false, message: error.message };
    return { tablesExist: true };
  },

  async createSuggestion(input: CreateSuggestionInput): Promise<{ suggestion: Suggestion; referenceId: string }> {
    const client = requireClient();
    const { data: { session } } = await client.auth.getSession();
    if (!session?.user) throw new Error('Authentication is required to submit a suggestion.');

    const referenceId = generateReferenceId();
    const insertPayload = {
      reference_id: referenceId,
      category: input.category,
      title: input.title.trim(),
      description: input.description.trim(),
      location_text: input.location_text.trim(),
      contact_name: input.is_anonymous ? null : input.contact_name?.trim() || null,
      contact_email: input.is_anonymous ? null : input.contact_email?.trim() || null,
      contact_phone: input.is_anonymous ? null : input.contact_phone?.trim() || null,
      is_anonymous: Boolean(input.is_anonymous),
      user_id: session.user.id,
      status: 'submitted' as SuggestionStatus,
      support_count: 1,
    };

    const { data, error } = await client.from('suggestions').insert(insertPayload).select('*').single();
    if (error || !data) throw new Error(error?.message || 'Failed to persist suggestion in Supabase.');

    let suggestion = data as Suggestion;
    if (input.photo_file) {
      const upload = await uploadSuggestionPhoto(input.photo_file, data.id);
      if (upload.error) throw new Error(upload.error);
      if (upload.path && upload.url) {
        const { data: attached, error: attachError } = await client.rpc('attach_suggestion_photo', {
          p_suggestion_id: data.id, p_photo_path: upload.path, p_photo_url: upload.url,
        });
        if (attachError) throw new Error(attachError.message);
        if (attached) suggestion = attached as Suggestion;
      }
    }
    return { suggestion, referenceId: suggestion.reference_id };
  },

  async getSuggestionByReference(referenceId: string): Promise<{ suggestion: Suggestion; history: SuggestionStatusHistory[] } | null> {
    const client = requireClient();
    const cleanRef = referenceId.trim().toUpperCase();
    const { data, error } = await client.from('public_suggestions').select(PUBLIC_FIELDS).eq('reference_id', cleanRef).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const { data: history, error: historyError } = await client.from('public_suggestion_status_history')
      .select('id, suggestion_id, old_status, new_status, note, created_at').eq('suggestion_id', data.id).order('created_at', { ascending: true });
    if (historyError) throw new Error(historyError.message);
    return {
      suggestion: data as Suggestion,
      history: (history || []).map((row: any) => ({ ...row, changed_by: 'HIVE Civic Workflow' })) as SuggestionStatusHistory[],
    };
  },

  async getSuggestionById(id: string): Promise<{ suggestion: Suggestion; history: SuggestionStatusHistory[] } | null> {
    const client = requireClient();
    const { data, error } = await client.from('suggestions').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const { data: history, error: historyError } = await client.from('suggestion_status_history')
      .select('*').eq('suggestion_id', id).order('created_at', { ascending: false });
    if (historyError) throw new Error(historyError.message);
    return { suggestion: data as Suggestion, history: (history || []) as SuggestionStatusHistory[] };
  },

  async getMySuggestions(userId: string): Promise<Suggestion[]> {
    const client = requireClient();
    const { data, error } = await client.from('suggestions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as Suggestion[];
  },

  async getSuggestions(filters?: { search?: string; category?: string; status?: string; sortBy?: 'newest' | 'oldest' | 'support' }): Promise<Suggestion[]> {
    const client = requireClient();
    let query = client.from('public_suggestions').select(PUBLIC_FIELDS);
    if (filters?.category && filters.category !== 'All') query = query.eq('category', filters.category);
    if (filters?.status && filters.status !== 'All') query = query.eq('status', filters.status);
    if (filters?.search?.trim()) {
      const s = filters.search.trim().replace(/[%_]/g, '');
      if (s) query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%,location_text.ilike.%${s}%,reference_id.ilike.%${s}%`);
    }
    if (filters?.sortBy === 'oldest') query = query.order('created_at', { ascending: true });
    else if (filters?.sortBy === 'support') query = query.order('support_count', { ascending: false });
    else query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as Suggestion[];
  },

  async updateSuggestionStatus(id: string, newStatus: SuggestionStatus, adminNote?: string): Promise<{ updated: Suggestion; history: SuggestionStatusHistory[] }> {
    const client = requireClient();
    const { data: updated, error } = await client.from('suggestions').update({
      status: newStatus,
      ...(adminNote !== undefined ? { admin_notes: adminNote } : {}),
      updated_at: new Date().toISOString(),
    }).eq('id', id).select('*').single();
    if (error || !updated) throw new Error(error?.message || 'Failed to update suggestion status.');
    const { data: history, error: historyError } = await client.from('suggestion_status_history').select('*')
      .eq('suggestion_id', id).order('created_at', { ascending: false });
    if (historyError) throw new Error(historyError.message);
    return { updated: updated as Suggestion, history: (history || []) as SuggestionStatusHistory[] };
  },

  async incrementSupport(id: string): Promise<number> {
    const client = requireClient();
    const { data, error } = await client.rpc('add_support', { p_suggestion_id: id });
    if (error) throw new Error(error.message);
    return Number(data ?? 0);
  },

  async toggleSupport(id: string): Promise<{ supportCount: number; isSupported: boolean }> {
    const client = requireClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error('Authentication is required to support a suggestion.');
    const { data: existing, error: lookupError } = await client.from('suggestion_supports')
      .select('suggestion_id').eq('suggestion_id', id).eq('user_id', user.id).maybeSingle();
    if (lookupError) throw new Error(lookupError.message);
    const rpc = existing ? 'remove_support' : 'add_support';
    const { data: count, error } = await client.rpc(rpc, { p_suggestion_id: id });
    if (error) throw new Error(error.message);
    return { supportCount: Number(count ?? 0), isSupported: !existing };
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const client = requireClient();
    const { data, error } = await client.from('suggestions').select('status, category, created_at');
    if (error || !data) throw new Error(error?.message || 'Failed to load dashboard statistics.');
    const stats: DashboardStats = { total: data.length, submitted: 0, under_review: 0, accepted: 0, planned: 0, implemented: 0, rejected: 0, categoryCounts: {}, recentUpdatesCount: 0 };
    const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    data.forEach((row: any) => {
      if (row.status === 'submitted') stats.submitted++;
      else if (row.status === 'under_review') stats.under_review++;
      else if (row.status === 'accepted') stats.accepted++;
      else if (row.status === 'planned') stats.planned++;
      else if (row.status === 'implemented') stats.implemented++;
      else if (row.status === 'rejected') stats.rejected++;
      const category = row.category || 'Other';
      stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;
      if (row.created_at && new Date(row.created_at) > oneWeekAgo) stats.recentUpdatesCount++;
    });
    return stats;
  },
};
