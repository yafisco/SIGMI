import { supabase } from '@/lib/supabase';
import { Projet, CreateProjetInput, UpdateProjetInput, Pole } from '@/types';

export const projetsService = {
  // Récupérer tous les projets avec détails
  async getAll(poleFilter?: Pole): Promise<Projet[]> {
    let query = supabase
      .from('projets')
      .select('*')
      .order('date_debut', { ascending: false });

    // Filtrer par pôle si spécifié
    if (poleFilter) {
      query = query.contains('poles', [poleFilter]);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Récupérer un projet par ID
  async getById(id: string): Promise<Projet | null> {
    const { data, error } = await supabase
      .from('projets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un nouveau projet
  async create(input: CreateProjetInput): Promise<Projet> {
    const { data, error } = await supabase
      .from('projets')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un projet
  async update(input: UpdateProjetInput): Promise<Projet> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('projets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un projet
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Rechercher des projets
  async search(query: string): Promise<Projet[]> {
    const { data, error } = await supabase
      .from('projets')
      .select('*')
      .or(`nom.ilike.%${query}%,description.ilike.%${query}%,responsable_nom.ilike.%${query}%`)
      .order('date_debut', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par pôle
  async getByPole(pole: string): Promise<Projet[]> {
    const { data, error } = await supabase
      .from('projets')
      .select('*')
      .contains('poles', [pole])
      .order('date_debut', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par statut
  async getByStatut(statut: string): Promise<Projet[]> {
    const { data, error } = await supabase
      .from('projets')
      .select('*')
      .eq('statut', statut)
      .order('date_debut', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par priorité
  async getByPriorite(priorite: string): Promise<Projet[]> {
    const { data, error } = await supabase
      .from('projets')
      .select('*')
      .eq('priorite', priorite)
      .order('date_debut', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les projets d'un client
  async getByClient(clientId: string): Promise<Projet[]> {
    const { data, error } = await supabase
      .from('projets')
      .select('*')
      .eq('client_id', clientId)
      .order('date_debut', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les projets d'un responsable
  async getByResponsable(responsableId: string): Promise<Projet[]> {
    const { data, error } = await supabase
      .from('projets')
      .select('*')
      .eq('responsable_id', responsableId)
      .order('date_debut', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les projets où un collaborateur est dans l'équipe
  async getByEquipeMember(collaborateurId: string): Promise<Projet[]> {
    const { data, error } = await supabase
      .from('projets')
      .select('*')
      .contains('equipe', [collaborateurId])
      .order('date_debut', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les statistiques
  async getStats() {
    const [totalResult, enCoursResult, terminesResult, budgetResult] = await Promise.all([
      supabase.from('projets').select('id', { count: 'exact', head: true }),
      supabase.from('projets').select('id', { count: 'exact', head: true }).eq('statut', 'en cours'),
      supabase.from('projets').select('id', { count: 'exact', head: true }).eq('statut', 'terminé'),
      supabase.from('projets').select('budget_estime, budget_consomme'),
    ]);

    const total = totalResult.count || 0;
    const enCours = enCoursResult.count || 0;
    const termines = terminesResult.count || 0;

    const budgetTotal = budgetResult.data?.reduce((acc: number, p: { budget_estime?: number | null }) => acc + (p.budget_estime || 0), 0) || 0;
    const budgetConsomme = budgetResult.data?.reduce((acc: number, p: { budget_consomme?: number | null }) => acc + (p.budget_consomme || 0), 0) || 0;

    return { total, enCours, termines, budgetTotal, budgetConsomme };
  },
};
