import { supabase } from '@/lib/supabase/client';
import type { ContactEmail, CreateContactEmailInput, UpdateContactEmailInput } from '@/types';

export const contactsEmailService = {
  // Récupérer tous les contacts
  async getAll() {
    const { data, error } = await supabase
      .from('contacts_email')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ContactEmail[];
  },

  // Récupérer un contact par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('contacts_email')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ContactEmail;
  },

  // Créer un contact
  async create(input: CreateContactEmailInput) {
    const { data, error } = await supabase
      .from('contacts_email')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as ContactEmail;
  },

  // Mettre à jour un contact
  async update(input: UpdateContactEmailInput) {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from('contacts_email')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ContactEmail;
  },

  // Supprimer un contact
  async delete(id: string) {
    const { error } = await supabase
      .from('contacts_email')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Importer des contacts depuis un tableau
  async importMany(contacts: CreateContactEmailInput[]) {
    const { data, error } = await supabase
      .from('contacts_email')
      .insert(contacts)
      .select();

    if (error) throw error;
    return data as ContactEmail[];
  },

  // Rechercher des contacts
  async search(query: string) {
    const { data, error } = await supabase
      .from('contacts_email')
      .select('*')
      .or(`nom_entreprise.ilike.%${query}%,email.ilike.%${query}%,secteur.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ContactEmail[];
  },
};
