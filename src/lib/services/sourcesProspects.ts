import { supabase } from '@/lib/supabase';
import { SourceProspect, CreateSourceProspectInput, UpdateSourceProspectInput } from '@/types';

export const sourcesProspectsService = {
  async getAll(): Promise<SourceProspect[]> {
    const { data, error } = await supabase
      .from('sources_prospects')
      .select('*')
      .order('nom', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<SourceProspect | null> {
    const { data, error } = await supabase
      .from('sources_prospects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: CreateSourceProspectInput): Promise<SourceProspect> {
    const { data, error } = await supabase
      .from('sources_prospects')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(input: UpdateSourceProspectInput): Promise<SourceProspect> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('sources_prospects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sources_prospects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStats() {
    const [total, actif, inactif] = await Promise.all([
      supabase.from('sources_prospects').select('id', { count: 'exact', head: true }),
      supabase.from('sources_prospects').select('id', { count: 'exact', head: true }).eq('actif', true),
      supabase.from('sources_prospects').select('id', { count: 'exact', head: true }).eq('actif', false),
    ]);

    return {
      total: total.count || 0,
      actif: actif.count || 0,
      inactif: inactif.count || 0,
    };
  },
};
