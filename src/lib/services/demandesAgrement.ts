import { createClient } from '@/lib/supabase/client';
import type { DemandeAgrement, CreateDemandeAgrementInput, UpdateDemandeAgrementInput } from '@/types';

export const demandesAgrementService = {
  // Récupérer toutes les demandes
  async getAll(): Promise<DemandeAgrement[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('demandes_agrement')
      .select('*, clients!inner(nom)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer par statut
  async getByStatut(statut: string): Promise<DemandeAgrement[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('demandes_agrement')
      .select('*, clients!inner(nom)')
      .eq('statut', statut)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer une demande par ID
  async getById(id: string): Promise<DemandeAgrement> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('demandes_agrement')
      .select('*, clients!inner(nom)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une demande
  async create(input: CreateDemandeAgrementInput): Promise<DemandeAgrement> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('demandes_agrement')
      .insert(input)
      .select('*, clients!inner(nom)')
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une demande
  async update(input: UpdateDemandeAgrementInput): Promise<DemandeAgrement> {
    const supabase = createClient();
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('demandes_agrement')
      .update(updateData)
      .eq('id', id)
      .select('*, clients!inner(nom)')
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une demande
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('demandes_agrement')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Changer le statut
  async changerStatut(
    id: string,
    nouveauStatut: string,
    motifRefus?: string
  ): Promise<DemandeAgrement> {
    const supabase = createClient();
    const updateData: any = { statut: nouveauStatut };

    if (nouveauStatut === 'accepte') {
      updateData.date_acceptation = new Date().toISOString();
    } else if (nouveauStatut === 'refusee') {
      updateData.date_refus = new Date().toISOString();
      updateData.motif_refus = motifRefus;
    }

    const { data, error } = await supabase
      .from('demandes_agrement')
      .update(updateData)
      .eq('id', id)
      .select('*, clients!inner(nom)')
      .single();

    if (error) throw error;
    return data;
  },

  // Statistiques par statut
  async getStats(): Promise<{ [key: string]: number }> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('demandes_agrement')
      .select('statut');

    if (error) throw error;

    const stats: { [key: string]: number } = {
      soumise: 0,
      en_examen: 0,
      accepte: 0,
      refusee: 0,
    };

    (data || []).forEach((d) => {
      stats[d.statut] = (stats[d.statut] || 0) + 1;
    });

    return stats;
  },
};
