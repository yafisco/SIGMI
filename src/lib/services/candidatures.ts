import { supabase } from '@/lib/supabase';
import { Candidature, CreateCandidatureInput, UpdateCandidatureInput } from '@/types';

export const candidaturesService = {
  async getAll(): Promise<Candidature[]> {
    const { data, error } = await supabase
      .from('candidatures')
      .select('*')
      .order('date_candidature', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByStatut(statut: string): Promise<Candidature[]> {
    const { data, error } = await supabase
      .from('candidatures')
      .select('*')
      .eq('statut', statut)
      .order('date_candidature', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Candidature | null> {
    const { data, error } = await supabase
      .from('candidatures')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: CreateCandidatureInput): Promise<Candidature> {
    const { data, error } = await supabase
      .from('candidatures')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(input: UpdateCandidatureInput): Promise<Candidature> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('candidatures')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('candidatures')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStats() {
    const [total, enAttente, enRevision, entretien, accepte] = await Promise.all([
      supabase.from('candidatures').select('id', { count: 'exact', head: true }),
      supabase.from('candidatures').select('id', { count: 'exact', head: true }).eq('statut', 'en_attente'),
      supabase.from('candidatures').select('id', { count: 'exact', head: true }).eq('statut', 'en_revision'),
      supabase.from('candidatures').select('id', { count: 'exact', head: true }).eq('statut', 'entretien'),
      supabase.from('candidatures').select('id', { count: 'exact', head: true }).eq('statut', 'accepte'),
    ]);

    return {
      total: total.count || 0,
      enAttente: enAttente.count || 0,
      enRevision: enRevision.count || 0,
      entretien: entretien.count || 0,
      accepte: accepte.count || 0,
    };
  },
};
