import { supabase } from '@/lib/supabase';
import { Client, CreateClientInput, UpdateClientInput, ClientStatut } from '@/types';

export const clientsService = {
  // Récupérer tous les clients avec détails
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('v_clients_detail')
      .select('*')
      .order('nom', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Récupérer un client par ID
  async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('v_clients_detail')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un nouveau client
  async create(input: CreateClientInput): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un client
  async update(input: UpdateClientInput): Promise<Client> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un client (hard delete)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Rechercher des clients
  async search(query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('v_clients_detail')
      .select('*')
      .or(`nom.ilike.%${query}%,email.ilike.%${query}%,telephone.ilike.%${query}%,ville.ilike.%${query}%`)
      .order('nom', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par statut
  async getByStatut(statut: ClientStatut): Promise<Client[]> {
    const { data, error } = await supabase
      .from('v_clients_detail')
      .select('*')
      .eq('statut', statut)
      .order('nom', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par assigné
  async getByAssigned(assignedTo: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('v_clients_detail')
      .select('*')
      .eq('assigned_to', assignedTo)
      .order('nom', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les statistiques
  async getStats() {
    const [totalResult, prospectsResult, clientsResult, inactifsResult, caResult] = await Promise.all([
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('clients').select('id', { count: 'exact', head: true }).eq('statut', 'prospect'),
      supabase.from('clients').select('id', { count: 'exact', head: true }).eq('statut', 'client'),
      supabase.from('clients').select('id', { count: 'exact', head: true }).eq('statut', 'inactif'),
      supabase.from('clients').select('chiffre_affaires_annuel'),
    ]);

    const total = totalResult.count || 0;
    const prospects = prospectsResult.count || 0;
    const clientsActifs = clientsResult.count || 0;
    const inactifs = inactifsResult.count || 0;

    const caTotal = caResult.data?.reduce((acc: number, c: { chiffre_affaires_annuel?: number | null }) => acc + (c.chiffre_affaires_annuel || 0), 0) || 0;

    return { total, prospects, clientsActifs, inactifs, caTotal };
  },
};