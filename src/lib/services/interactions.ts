import { createClient } from '@/lib/supabase/client';
import { Interaction, InteractionType } from '@/types';

const supabase = createClient();

export const interactionsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('interactions')
      .select(`
        *,
        collaborateurs:created_by(nom, prenom)
      `)
      .order('interaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('interactions')
      .select(`
        *,
        collaborateurs:created_by(nom, prenom)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(interaction: Pick<Interaction, 'title' | 'type'> & Partial<Omit<Interaction, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('interactions')
      .insert(interaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, interaction: Partial<Interaction>) {
    const { data, error } = await supabase
      .from('interactions')
      .update(interaction)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('interactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from('interactions')
      .select(`
        *,
        collaborateurs:created_by(nom, prenom)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('interaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByType(type: InteractionType) {
    const { data, error } = await supabase
      .from('interactions')
      .select(`
        *,
        collaborateurs:created_by(nom, prenom)
      `)
      .eq('type', type)
      .order('interaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from('interactions')
      .select(`
        *,
        collaborateurs:created_by(nom, prenom)
      `)
      .eq('related_type', 'client')
      .eq('related_id', clientId)
      .order('interaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByRelated(relatedType: string, relatedId: string) {
    const { data, error } = await supabase
      .from('interactions')
      .select(`
        *,
        collaborateurs:created_by(nom, prenom)
      `)
      .eq('related_type', relatedType)
      .eq('related_id', relatedId)
      .order('interaction_date', { ascending: false });

    if (error) throw error;
    return data;
  },
};
