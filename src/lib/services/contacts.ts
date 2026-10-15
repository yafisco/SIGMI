import { createClient } from '@/lib/supabase/client';
import { Contact, ContactRole } from '@/types';

const supabase = createClient();

export const contactsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        clients:client_id(nom)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        clients:client_id(nom)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, contact: Partial<Contact>) {
    const { data, error } = await supabase
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        clients:client_id(nom)
      `)
      .or(`nom.ilike.%${query}%,prenom.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByRole(role: ContactRole) {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        clients:client_id(nom)
      `)
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        clients:client_id(nom)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
