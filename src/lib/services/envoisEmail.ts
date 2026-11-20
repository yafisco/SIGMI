import { createClient } from '@/lib/supabase/client';
import type { EnvoiEmail, CreateEnvoiEmailInput, UpdateEnvoiEmailInput } from '@/types';

const supabase = createClient();

export const envoisEmailService = {
  // Récupérer tous les envois
  async getAll() {
    const { data, error } = await supabase
      .from('envois_email')
      .select(`
        *,
        contacts_email (nom_entreprise, email),
        email_templates (nom)
      `)
      .order('date_planifiee', { ascending: true });

    if (error) throw error;

    // Transformer les données pour inclure les noms
    return data.map((envoi: any) => ({
      ...envoi,
      contact_nom_entreprise: envoi.contacts_email?.nom_entreprise,
      contact_email: envoi.contacts_email?.email,
      modele_nom: envoi.email_templates?.nom,
    })) as EnvoiEmail[];
  },

  // Récupérer les envois planifiés (statut = 'planifie')
  async getPlanifies() {
    const { data, error } = await supabase
      .from('envois_email')
      .select(`
        *,
        contacts_email (nom_entreprise, email),
        email_templates (nom)
      `)
      .eq('statut', 'planifie')
      .order('date_planifiee', { ascending: true });

    if (error) throw error;

    return data.map((envoi: any) => ({
      ...envoi,
      contact_nom_entreprise: envoi.contacts_email?.nom_entreprise,
      contact_email: envoi.contacts_email?.email,
      modele_nom: envoi.email_templates?.nom,
    })) as EnvoiEmail[];
  },

  // Récupérer les envois envoyés (statut = 'envoye')
  async getEnvoyes() {
    const { data, error } = await supabase
      .from('envois_email')
      .select(`
        *,
        contacts_email (nom_entreprise, email),
        email_templates (nom)
      `)
      .eq('statut', 'envoye')
      .order('date_envoi_reelle', { ascending: false });

    if (error) throw error;

    return data.map((envoi: any) => ({
      ...envoi,
      contact_nom_entreprise: envoi.contacts_email?.nom_entreprise,
      contact_email: envoi.contacts_email?.email,
      modele_nom: envoi.email_templates?.nom,
    })) as EnvoiEmail[];
  },

  // Récupérer un envoi par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('envois_email')
      .select(`
        *,
        contacts_email (nom_entreprise, email),
        email_templates (nom)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    const envoi = data as any;
    return {
      ...envoi,
      contact_nom_entreprise: envoi.contacts_email?.nom_entreprise,
      contact_email: envoi.contacts_email?.email,
      modele_nom: envoi.email_templates?.nom,
    } as EnvoiEmail;
  },

  // Créer un envoi
  async create(input: CreateEnvoiEmailInput) {
    const { data, error } = await supabase
      .from('envois_email')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as EnvoiEmail;
  },

  // Mettre à jour un envoi
  async update(input: UpdateEnvoiEmailInput) {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from('envois_email')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as EnvoiEmail;
  },

  // Marquer comme envoyé
  async markAsEnvoye(id: string) {
    const { data, error } = await supabase
      .from('envois_email')
      .update({
        statut: 'envoye',
        date_envoi_reelle: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as EnvoiEmail;
  },

  // Annuler un envoi
  async cancel(id: string) {
    const { data, error } = await supabase
      .from('envois_email')
      .update({ statut: 'annule' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as EnvoiEmail;
  },

  // Supprimer un envoi
  async delete(id: string) {
    const { error } = await supabase
      .from('envois_email')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Vérifier si un envoi existe déjà pour un contact et un modèle
  async checkDuplicate(contactId: string, modeleId: string) {
    const { data, error } = await supabase
      .from('envois_email')
      .select('id')
      .eq('contact_id', contactId)
      .eq('modele_id', modeleId)
      .eq('statut', 'planifie')
      .maybeSingle();

    if (error) throw error;
    return data !== null;
  },
};
