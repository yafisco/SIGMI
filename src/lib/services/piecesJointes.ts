import { createClient } from '@/lib/supabase/client';
import type { PieceJointe, CreatePieceJointeInput } from '@/types';

export const piecesJointesService = {
  // Récupérer toutes les pièces jointes d'une demande
  async getByDemandeId(demandeId: string): Promise<PieceJointe[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pieces_jointes')
      .select('*')
      .eq('demande_id', demandeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Créer une pièce jointe
  async create(input: CreatePieceJointeInput): Promise<PieceJointe> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('pieces_jointes')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une pièce jointe
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('pieces_jointes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Uploader un fichier dans Supabase Storage
  async uploadFile(
    file: File,
    demandeId: string
  ): Promise<{ path: string; url: string }> {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${demandeId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('agrements_pieces_jointes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('agrements_pieces_jointes')
      .getPublicUrl(filePath);

    return { path: filePath, url: data.publicUrl };
  },

  // Supprimer un fichier de Supabase Storage
  async deleteFile(path: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from('agrements_pieces_jointes')
      .remove([path]);

    if (error) throw error;
  },
};
