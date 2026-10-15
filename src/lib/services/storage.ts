import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const BUCKET_NAME = 'documents';

export const storageService = {
  async uploadFile(file: File, path?: string): Promise<{ path: string; url: string }> {
    const fileName = `${path || ''}${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(fileName, file);

    if (error) throw error;

    // Récupérer l'URL publique du fichier
    const { data: urlData } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  },

  async deleteFile(path: string): Promise<void> {
    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) throw error;
  },

  getPublicUrl(path: string): string {
    const { data } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return data.publicUrl;
  },
};
