import { supabase } from '@/lib/supabase';
import { CampagneMarketing, CreateCampagneInput, UpdateCampagneInput } from '@/types';

export const campagnesMarketingService = {
  async getAll(): Promise<CampagneMarketing[]> {
    const { data, error } = await supabase
      .from('campagnes_marketing')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByStatut(statut: string): Promise<CampagneMarketing[]> {
    const { data, error } = await supabase
      .from('campagnes_marketing')
      .select('*')
      .eq('statut', statut)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<CampagneMarketing | null> {
    const { data, error } = await supabase
      .from('campagnes_marketing')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: CreateCampagneInput): Promise<CampagneMarketing> {
    const { data, error } = await supabase
      .from('campagnes_marketing')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(input: UpdateCampagneInput): Promise<CampagneMarketing> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('campagnes_marketing')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('campagnes_marketing')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStats() {
    const [total, enCours, termine, leadsTotal] = await Promise.all([
      supabase.from('campagnes_marketing').select('id', { count: 'exact', head: true }),
      supabase.from('campagnes_marketing').select('id', { count: 'exact', head: true }).eq('statut', 'en_cours'),
      supabase.from('campagnes_marketing').select('id', { count: 'exact', head: true }).eq('statut', 'termine'),
      supabase.from('campagnes_marketing').select('leads_generes'),
    ]);

    const totalLeads = leadsTotal.data?.reduce((sum, c) => sum + (c.leads_generes || 0), 0) || 0;

    return {
      total: total.count || 0,
      enCours: enCours.count || 0,
      termine: termine.count || 0,
      totalLeads,
    };
  },
};
