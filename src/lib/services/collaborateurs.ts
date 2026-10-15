import { supabase } from '@/lib/supabase';
import { Collaborateur, CreateCollaborateurInput, UpdateCollaborateurInput } from '@/types';

export const collaborateursService = {
  // Récupérer tous les collaborateurs
  async getAll(): Promise<Collaborateur[]> {
    const { data, error } = await supabase
      .from('collaborateurs')
      .select('*')
      .order('nom', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Récupérer un collaborateur par ID
  async getById(id: string): Promise<Collaborateur | null> {
    const { data, error } = await supabase
      .from('collaborateurs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un nouveau collaborateur
  async create(input: CreateCollaborateurInput): Promise<Collaborateur> {
    const { data, error } = await supabase
      .from('collaborateurs')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un collaborateur
  async update(input: UpdateCollaborateurInput): Promise<Collaborateur> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('collaborateurs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un collaborateur (hard delete)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('collaborateurs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Rechercher des collaborateurs
  async search(query: string): Promise<Collaborateur[]> {
    const { data, error } = await supabase
      .from('collaborateurs')
      .select('*')
      .or(`nom.ilike.%${query}%,prenom.ilike.%${query}%,email.ilike.%${query}%,poste.ilike.%${query}%`)
      .order('nom', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par pôle
  async getByPole(pole: string): Promise<Collaborateur[]> {
    const { data, error } = await supabase
      .from('collaborateurs')
      .select('*')
      .contains('poles', [pole])
      .order('nom', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par rôle
  async getByRole(role: string): Promise<Collaborateur[]> {
    const { data, error } = await supabase
      .from('collaborateurs')
      .select('*')
      .eq('role', role)
      .order('nom', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les statistiques
  async getStats() {
    const [totalResult, actifsResult, parPoleResult] = await Promise.all([
      supabase.from('collaborateurs').select('id', { count: 'exact', head: true }),
      supabase.from('collaborateurs').select('id', { count: 'exact', head: true }).eq('actif', true),
      supabase.from('collaborateurs').select('poles'),
    ]);

    const total = totalResult.count || 0;
    const actifs = actifsResult.count || 0;

    // Compter par pôle
    const parPole: Record<string, number> = {};
    parPoleResult.data?.forEach((collab: { poles: string[] }) => {
      collab.poles.forEach((pole: string) => {
        parPole[pole] = (parPole[pole] || 0) + 1;
      });
    });

    return { total, actifs, parPole };
  },
};
