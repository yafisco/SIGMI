import { supabase } from '@/lib/supabase';
import { Poste, CreatePosteInput, UpdatePosteInput } from '@/types';

export const postesService = {
  async getAll(): Promise<Poste[]> {
    const { data, error } = await supabase
      .from('postes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByStatut(statut: string): Promise<Poste[]> {
    const { data, error } = await supabase
      .from('postes')
      .select('*')
      .eq('statut', statut)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Poste | null> {
    const { data, error } = await supabase
      .from('postes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: CreatePosteInput): Promise<Poste> {
    const { data, error } = await supabase
      .from('postes')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(input: UpdatePosteInput): Promise<Poste> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('postes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('postes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStats() {
    const [total, ouvert, ferme, pourvu] = await Promise.all([
      supabase.from('postes').select('id', { count: 'exact', head: true }),
      supabase.from('postes').select('id', { count: 'exact', head: true }).eq('statut', 'ouvert'),
      supabase.from('postes').select('id', { count: 'exact', head: true }).eq('statut', 'ferme'),
      supabase.from('postes').select('id', { count: 'exact', head: true }).eq('statut', 'pourvu'),
    ]);

    return {
      total: total.count || 0,
      ouvert: ouvert.count || 0,
      ferme: ferme.count || 0,
      pourvu: pourvu.count || 0,
    };
  },
};
