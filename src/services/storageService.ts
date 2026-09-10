import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface PhotoUploadResult {
  path?: string;
  url?: string;
  error?: string;
}

/**
 * Uploads suggestion photo directly to Supabase Storage bucket 'suggestion-photos'
 * associated with the authoritative suggestion UUID.
 */
export const uploadSuggestionPhoto = async (
  file: File,
  suggestionUuid: string
): Promise<PhotoUploadResult> => {
  // Validate file format
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    return { error: 'Invalid file format. Please upload JPG, PNG, or WEBP images.' };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File size exceeds 5MB limit. Please select a smaller photo.' };
  }

  // Clean filename and structure under suggestion UUID directory
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `suggestions/${suggestionUuid}/${Date.now()}_${cleanName}`;

  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase storage is not configured.' };
  }

  try {
    const { data, error } = await supabase.storage
      .from('suggestion-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      return { error: error.message };
    }

    if (data) {
      const { data: publicUrlData } = supabase.storage
        .from('suggestion-photos')
        .getPublicUrl(data.path);

      return {
        path: data.path,
        url: publicUrlData.publicUrl,
      };
    }

    return { error: 'Failed to retrieve uploaded image path.' };
  } catch (err: any) {
    console.warn('Storage upload exception:', err.message);
    return { error: err.message || 'Photo upload failed.' };
  }
};
