import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface PhotoUploadResult {
  path?: string;
  url?: string;
  error?: string;
}

export const uploadSuggestionPhoto = async (
  file: File,
  suggestionRefId: string
): Promise<PhotoUploadResult> => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    return { error: 'Invalid file format. Please upload JPG, PNG, or WEBP images.' };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File size exceeds 5MB limit. Please select a smaller photo.' };
  }

  // Clean filename
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${suggestionRefId}/${Date.now()}_${cleanName}`;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('suggestion-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.warn('Supabase storage upload error, falling back to local representation:', error.message);
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('suggestion-photos')
          .getPublicUrl(data.path);

        return {
          path: data.path,
          url: publicUrlData.publicUrl,
        };
      }
    } catch (err: any) {
      console.warn('Storage upload exception:', err.message);
    }
  }

  // Local browser data URL fallback
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        path: `local://${filePath}`,
        url: reader.result as string,
      });
    };
    reader.onerror = () => {
      resolve({ error: 'Failed to read image file locally.' });
    };
    reader.readAsDataURL(file);
  });
};
