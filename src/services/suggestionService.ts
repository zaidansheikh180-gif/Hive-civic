import {
  Suggestion,
  SuggestionCategory,
  SuggestionStatus,
  SuggestionStatusHistory,
  DashboardStats,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { uploadSuggestionPhoto } from './storageService';

// Generates a strictly formatted reference ID: DSB-YYYY-XXXXXX
export const generateReferenceId = (): string => {
  const year = new Date().getFullYear();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DSB-${year}-${randomPart}`;
};

export interface SchemaStatus {
  tablesExist: boolean;
  message?: string;
}

export interface CreateSuggestionInput {
  category: SuggestionCategory;
  title: string;
  description: string;
  location_text: string;
  photo_path?: string | null;
  photo_url?: string | null;
  photo_file?: File | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_anonymous?: boolean;
}

export const suggestionService = {
  /**
   * Check if the Supabase database schema has been created and is accessible
   */
  async checkSchemaStatus(): Promise<SchemaStatus> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        tablesExist: false,
        message: 'Supabase credentials are not configured.',
      };
    }

    try {
      const { error } = await supabase.from('suggestions').select('id').limit(1);
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          return {
            tablesExist: false,
            message:
              "The 'suggestions' table was not found. Please run the SQL schema in supabase/schema.sql in your Supabase project SQL Editor.",
          };
        }
        return {
          tablesExist: false,
          message: error.message,
        };
      }
      return { tablesExist: true };
    } catch (err: any) {
      return { tablesExist: false, message: err.message };
    }
  },

  /**
   * Create a new suggestion with authoritative PostgreSQL UUID:
   * 1. Generate unique citizen reference ID (DSB-YYYY-XXXXXX).
   * 2. Insert into Supabase 'suggestions' table.
   * 3. Obtain the actual inserted database row with real UUID.
   * 4. If photo file exists, upload to Supabase Storage under that real UUID.
   * 5. Record initial status history referencing the real database UUID.
   * 6. Return the real database record.
   */
  async createSuggestion(
    input: CreateSuggestionInput
  ): Promise<{ suggestion: Suggestion; referenceId: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error(
        'Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
    }

    // 1. Get current authenticated user session if present
    let currentUserId: string | null = null;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      currentUserId = session?.user?.id || null;
    } catch {
      // non-blocking
    }

    // 2. Generate unique reference ID
    const referenceId = generateReferenceId();

    // 3. Prepare insert payload
    const insertPayload = {
      reference_id: referenceId,
      category: input.category,
      title: input.title.trim(),
      description: input.description.trim(),
      location_text: input.location_text.trim(),
      photo_path: input.photo_path || null,
      photo_url: input.photo_url || null,
      contact_name: input.is_anonymous ? null : input.contact_name?.trim() || null,
      contact_email: input.is_anonymous ? null : input.contact_email?.trim() || null,
      contact_phone: input.is_anonymous ? null : input.contact_phone?.trim() || null,
      is_anonymous: Boolean(input.is_anonymous),
      user_id: currentUserId,
      status: 'submitted' as SuggestionStatus,
      support_count: 1,
    };

    // 4. Insert row into Supabase and receive authoritative row with real UUID
    const { data: insertedRow, error: insertErr } = await supabase
      .from('suggestions')
      .insert([insertPayload])
      .select()
      .single();

    if (insertErr || !insertedRow) {
      if (insertErr?.code === 'PGRST205' || insertErr?.message?.includes('schema cache')) {
        throw new Error(
          "Supabase tables not found. Please execute 'supabase/schema.sql' in your Supabase SQL Editor."
        );
      }
      throw new Error(insertErr?.message || 'Failed to persist suggestion in Supabase.');
    }

    const realUuid = insertedRow.id;
    let finalRow = insertedRow;

    // 5. If a photo file was supplied, upload it using the real database UUID
    if (input.photo_file) {
      const uploadRes = await uploadSuggestionPhoto(input.photo_file, realUuid);
      if (uploadRes.url) {
        const { data: updatedWithPhoto } = await supabase
          .from('suggestions')
          .update({
            photo_url: uploadRes.url,
            photo_path: uploadRes.path || null,
          })
          .eq('id', realUuid)
          .select()
          .single();

        if (updatedWithPhoto) {
          finalRow = updatedWithPhoto;
        }
      }
    }

    // 6. Insert initial status history in Supabase using the real UUID
    try {
      await supabase.from('suggestion_status_history').insert([
        {
          suggestion_id: realUuid,
          old_status: null,
          new_status: 'submitted',
          note: 'Civic suggestion registered in HIVE municipal ledger.',
          changed_by: input.is_anonymous ? 'Citizen (Anonymous)' : 'Citizen Intake System',
        },
      ]);
    } catch (histErr) {
      console.warn('Initial history logging note:', histErr);
    }

    return {
      suggestion: finalRow,
      referenceId: finalRow.reference_id,
    };
  },

  /**
   * Fetch suggestion and audit history by reference ID (DSB-YYYY-XXXXXX)
   */
  async getSuggestionByReference(
    referenceId: string
  ): Promise<{ suggestion: Suggestion; history: SuggestionStatusHistory[] } | null> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const cleanRef = referenceId.trim().toUpperCase();

    const { data: sugData, error: sugError } = await supabase
      .from('suggestions')
      .select('*')
      .eq('reference_id', cleanRef)
      .maybeSingle();

    if (sugError) {
      if (sugError.code === 'PGRST205') {
        throw new Error(
          "Supabase tables not found. Please execute 'supabase/schema.sql' in your Supabase SQL Editor."
        );
      }
      throw new Error(sugError.message);
    }

    if (!sugData) {
      return null;
    }

    // Fetch status history for this suggestion using the authoritative UUID
    const { data: histData } = await supabase
      .from('suggestion_status_history')
      .select('*')
      .eq('suggestion_id', sugData.id)
      .order('created_at', { ascending: true });

    // Protect submitter privacy if anonymous
    const displaySuggestion: Suggestion = {
      ...sugData,
      contact_name: sugData.is_anonymous ? null : sugData.contact_name,
      contact_email: sugData.is_anonymous ? null : sugData.contact_email,
      contact_phone: sugData.is_anonymous ? null : sugData.contact_phone,
    };

    return {
      suggestion: displaySuggestion,
      history: histData || [],
    };
  },

  /**
   * Fetch suggestion and audit history by internal database UUID
   */
  async getSuggestionById(
    id: string
  ): Promise<{ suggestion: Suggestion; history: SuggestionStatusHistory[] } | null> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const { data: sugData, error: sugError } = await supabase
      .from('suggestions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (sugError) {
      throw new Error(sugError.message);
    }

    if (!sugData) {
      return null;
    }

    const { data: histData } = await supabase
      .from('suggestion_status_history')
      .select('*')
      .eq('suggestion_id', id)
      .order('created_at', { ascending: false });

    return {
      suggestion: sugData,
      history: histData || [],
    };
  },

  /**
   * List suggestions for the currently authenticated citizen ("My Suggestions")
   */
  async getMySuggestions(userId: string): Promise<Suggestion[]> {
    if (!isSupabaseConfigured() || !supabase || !userId) {
      return [];
    }

    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn("Table 'suggestions' not found.");
      } else {
        console.error('Failed to fetch user suggestions from Supabase:', error.message);
      }
      return [];
    }

    return data || [];
  },

  /**
   * List suggestions with filters, search, and sorting from Supabase
   */
  async getSuggestions(filters?: {
    search?: string;
    category?: string;
    status?: string;
    sortBy?: 'newest' | 'oldest' | 'support';
  }): Promise<Suggestion[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return [];
    }

    let query = supabase.from('suggestions').select('*');

    if (filters?.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }

    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      const s = filters.search.trim();
      query = query.or(
        `title.ilike.%${s}%,description.ilike.%${s}%,location_text.ilike.%${s}%,reference_id.ilike.%${s}%`
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

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn("Table 'suggestions' not created yet in Supabase.");
      } else {
        console.error('Failed to fetch suggestions from Supabase:', error.message);
      }
      return [];
    }

    return data || [];
  },

  /**
   * Transition suggestion status with official resolution note and administrative author
   */
  async updateSuggestionStatus(
    id: string,
    newStatus: SuggestionStatus,
    adminNote?: string,
    changedBy: string = 'Municipal Administrator'
  ): Promise<{ updated: Suggestion; history: SuggestionStatusHistory[] }> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    // 1. Fetch current status
    const { data: current, error: fetchErr } = await supabase
      .from('suggestions')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchErr || !current) {
      throw new Error(fetchErr?.message || 'Suggestion not found');
    }

    const oldStatus = current.status;

    // 2. Update suggestion record
    const updatePayload: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (adminNote !== undefined) {
      updatePayload.admin_notes = adminNote;
    }

    const { data: updatedSug, error: updateErr } = await supabase
      .from('suggestions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr || !updatedSug) {
      throw new Error(updateErr?.message || 'Failed to update suggestion status');
    }

    // 3. Record audit log entry in suggestion_status_history using real UUID
    const noteText =
      adminNote?.trim() ||
      `Status transitioned from ${oldStatus.replace('_', ' ')} to ${newStatus.replace('_', ' ')}.`;

    await supabase.from('suggestion_status_history').insert([
      {
        suggestion_id: id,
        old_status: oldStatus,
        new_status: newStatus,
        note: noteText,
        changed_by: changedBy,
      },
    ]);

    // 4. Retrieve fresh history
    const { data: freshHistory } = await supabase
      .from('suggestion_status_history')
      .select('*')
      .eq('suggestion_id', id)
      .order('created_at', { ascending: false });

    return {
      updated: updatedSug,
      history: freshHistory || [],
    };
  },

  /**
   * Citizen endorsement: Increments community support count in Supabase
   */
  async incrementSupport(id: string): Promise<number> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase client is not configured.');
    }

    // Attempt atomic RPC procedure first (works under strict RLS)
    try {
      const { data: rpcCount, error: rpcErr } = await supabase.rpc('increment_support', {
        suggestion_id: id,
      });
      if (!rpcErr && typeof rpcCount === 'number') {
        return rpcCount;
      }
    } catch {
      // fallback to direct query
    }

    const { data: current } = await supabase
      .from('suggestions')
      .select('support_count')
      .eq('id', id)
      .single();

    const newCount = (current?.support_count || 0) + 1;

    const { error } = await supabase
      .from('suggestions')
      .update({ support_count: newCount })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return newCount;
  },

  /**
   * Citizen endorsement: Toggles community support count in Supabase and tracks client vote state
   */
  async toggleSupport(id: string): Promise<{ supportCount: number; isSupported: boolean }> {
    if (!isSupabaseConfigured() || !supabase) {
      return { supportCount: 1, isSupported: false };
    }

    const key = 'hive_client_supported_ids';
    let supported: string[] = [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) supported = JSON.parse(stored);
    } catch {
      supported = [];
    }

    const alreadySupported = supported.includes(id);
    let newCount = 1;

    // Attempt atomic RPC procedure
    try {
      const rpcName = alreadySupported ? 'decrement_support' : 'increment_support';
      const { data: rpcResult, error: rpcErr } = await supabase.rpc(rpcName, {
        suggestion_id: id,
      });

      if (!rpcErr && typeof rpcResult === 'number') {
        newCount = rpcResult;
      } else {
        // Fallback to direct update
        const { data: current } = await supabase
          .from('suggestions')
          .select('support_count')
          .eq('id', id)
          .single();

        const currentCount = current?.support_count || 1;
        newCount = alreadySupported ? Math.max(1, currentCount - 1) : currentCount + 1;

        await supabase
          .from('suggestions')
          .update({ support_count: newCount })
          .eq('id', id);
      }
    } catch {
      // Fallback
      const { data: current } = await supabase
        .from('suggestions')
        .select('support_count')
        .eq('id', id)
        .single();
      const currentCount = current?.support_count || 1;
      newCount = alreadySupported ? Math.max(1, currentCount - 1) : currentCount + 1;
      await supabase
        .from('suggestions')
        .update({ support_count: newCount })
        .eq('id', id);
    }

    if (alreadySupported) {
      supported = supported.filter((sId) => sId !== id);
    } else {
      supported.push(id);
    }
    localStorage.setItem(key, JSON.stringify(supported));

    return {
      supportCount: newCount,
      isSupported: !alreadySupported,
    };
  },

  /**
   * Computes aggregated analytics across status and municipal categories directly from Supabase
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const defaultStats: DashboardStats = {
      total: 0,
      submitted: 0,
      under_review: 0,
      accepted: 0,
      planned: 0,
      implemented: 0,
      rejected: 0,
      categoryCounts: {},
      recentUpdatesCount: 0,
    };

    if (!isSupabaseConfigured() || !supabase) {
      return defaultStats;
    }

    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('status, category, created_at');

      if (error || !data) {
        return defaultStats;
      }

      const stats: DashboardStats = {
        total: data.length,
        submitted: 0,
        under_review: 0,
        accepted: 0,
        planned: 0,
        implemented: 0,
        rejected: 0,
        categoryCounts: {},
        recentUpdatesCount: 0,
      };

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      data.forEach((row) => {
        const s = row.status as SuggestionStatus;
        if (s === 'submitted') stats.submitted++;
        else if (s === 'under_review') stats.under_review++;
        else if (s === 'accepted') stats.accepted++;
        else if (s === 'planned') stats.planned++;
        else if (s === 'implemented') stats.implemented++;
        else if (s === 'rejected') stats.rejected++;

        const cat = row.category || 'Other';
        stats.categoryCounts[cat] = (stats.categoryCounts[cat] || 0) + 1;

        if (row.created_at && new Date(row.created_at) > oneWeekAgo) {
          stats.recentUpdatesCount++;
        }
      });

      return stats;
    } catch {
      return defaultStats;
    }
  },
};
