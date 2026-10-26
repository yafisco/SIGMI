import { createClient } from '@/lib/supabase/client';

export type EvenementType = 'réunion' | 'appel' | 'visite' | 'email' | 'autre';

export interface Evenement {
  id: string;
  titre: string;
  description?: string;
  type: EvenementType;
  date_debut: string;
  date_fin?: string;
  lieu?: string;
  client_id?: string;
  prospect_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const supabase = createClient();

export const evenementsService = {
  async getAll(): Promise<Evenement[]> {
    const { data, error } = await supabase
      .from('evenements')
      .select('*')
      .order('date_debut', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Evenement | null> {
    const { data, error } = await supabase
      .from('evenements')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(evenement: Omit<Evenement, 'id' | 'created_at' | 'updated_at'>): Promise<Evenement> {
    const { data, error } = await supabase
      .from('evenements')
      .insert(evenement)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, evenement: Partial<Omit<Evenement, 'id' | 'created_at' | 'updated_at'>>): Promise<Evenement> {
    const { data, error } = await supabase
      .from('evenements')
      .update(evenement)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('evenements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('evenements_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evenements' }, callback)
      .subscribe();
  },
};
