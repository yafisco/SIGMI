import { supabase } from '@/lib/supabase';
import { Opportunity, CreateOpportunityInput, UpdateOpportunityInput, OpportunityStage, Pole } from '@/types';

export const opportunitiesService = {
  // Récupérer toutes les opportunités avec détails
  async getAll(poleFilter?: Pole): Promise<Opportunity[]> {
    let query = supabase
      .from('v_opportunities_detail')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtrer par pôle si spécifié
    if (poleFilter) {
      query = query.contains('poles', [poleFilter]);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Récupérer une opportunité par ID
  async getById(id: string): Promise<Opportunity | null> {
    const { data, error } = await supabase
      .from('v_opportunities_detail')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une nouvelle opportunité
  async create(input: CreateOpportunityInput): Promise<Opportunity> {
    const { data, error } = await supabase
      .from('opportunities')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une opportunité
  async update(input: UpdateOpportunityInput): Promise<Opportunity> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('opportunities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une opportunité
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Rechercher des opportunités
  async search(query: string): Promise<Opportunity[]> {
    const { data, error } = await supabase
      .from('v_opportunities_detail')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,client_nom.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par stage
  async getByStage(stage: OpportunityStage): Promise<Opportunity[]> {
    const { data, error } = await supabase
      .from('v_opportunities_detail')
      .select('*')
      .eq('stage', stage)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par assigné
  async getByAssigned(assignedTo: string): Promise<Opportunity[]> {
    const { data, error } = await supabase
      .from('v_opportunities_detail')
      .select('*')
      .eq('assigned_to', assignedTo)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par client
  async getByClient(clientId: string): Promise<Opportunity[]> {
    const { data, error } = await supabase
      .from('v_opportunities_detail')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par pôle
  async getByPole(pole: string): Promise<Opportunity[]> {
    const { data, error } = await supabase
      .from('v_opportunities_detail')
      .select('*')
      .contains('poles', [pole])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les statistiques
  async getStats() {
    const [totalResult, pipelineResult, byStageResult] = await Promise.all([
      supabase.from('opportunities').select('id', { count: 'exact', head: true }),
      supabase.from('opportunities').select('amount, stage, probability'),
      supabase.from('opportunities').select('stage'),
    ]);

    const total = totalResult.count || 0;

    // Pipeline value (somme des montants * probabilité pour les opportunités non gagnées/perdues)
    const pipelineValue = pipelineResult.data
      ?.filter((o: { stage: string; amount?: number | null; probability?: number | null }) => !['gagné', 'perdu'].includes(o.stage))
      .reduce((acc: number, o: { amount?: number | null; probability?: number | null }) => acc + (o.amount || 0) * ((o.probability || 0) / 100), 0) || 0;

    // Par stage
    const byStage: Record<OpportunityStage, number> = {
      nouveau: 0,
      qualifié: 0,
      proposition: 0,
      négociation: 0,
      gagné: 0,
      perdu: 0,
    };

    byStageResult.data?.forEach((o: { stage: string }) => {
      if (o.stage in byStage) {
        byStage[o.stage as OpportunityStage]++;
      }
    });

    return { total, pipelineValue, byStage };
  },
};