import { supabase } from '@/lib/supabase';

export type Evenement = {
  id: string;
  titre: string;
  description?: string;
  type: 'réunion' | 'appel' | 'visite' | 'email' | 'autre';
  date_debut: string;
  date_fin?: string;
  lieu?: string;
  client_id?: string;
  prospect_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export const evenementsService = {
  // Récupérer tous les événements
  async getAll(): Promise<Evenement[]> {
    const { data, error } = await supabase
      .from('evenements')
      .select('*')
      .order('date_debut', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Récupérer les événements d'une période
  async getByDateRange(startDate: string, endDate: string): Promise<Evenement[]> {
    const { data, error } = await supabase
      .from('evenements')
      .select('*')
      .gte('date_debut', startDate)
      .lte('date_debut', endDate)
      .order('date_debut', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Récupérer un événement par ID
  async getById(id: string): Promise<Evenement | null> {
    const { data, error } = await supabase
      .from('evenements')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Créer un événement
  async create(evenement: Omit<Evenement, 'id' | 'created_at' | 'updated_at'>): Promise<Evenement> {
    const { data, error } = await supabase
      .from('evenements')
      .insert({
        ...evenement,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mettre à jour un événement
  async update(id: string, evenement: Partial<Omit<Evenement, 'id' | 'created_at'>>): Promise<Evenement> {
    const { data, error } = await supabase
      .from('evenements')
      .update({
        ...evenement,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Supprimer un événement
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('evenements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // S'abonner aux changements Realtime
  subscribeToChanges(callback: (payload: any) => void) {
    const channel = supabase
      .channel('evenements_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evenements' }, callback)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Récupérer les événements du mois courant
  async getForMonth(year: number, month: number): Promise<Evenement[]> {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    return this.getByDateRange(startDate, endDate);
  },

  // Récupérer les événements à venir (7 prochains jours)
  async getUpcoming(days: number = 7): Promise<Evenement[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    futureDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('evenements')
      .select('*')
      .gte('date_debut', now.toISOString())
      .lte('date_debut', futureDate.toISOString())
      .order('date_debut', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Récupérer les statistiques par type
  async getStats(year: number, month: number): Promise<{
    total: number;
    reunions: number;
    appels: number;
    visites: number;
    emails: number;
    autres: number;
  }> {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from('evenements')
      .select('type')
      .gte('date_debut', startDate)
      .lte('date_debut', endDate);

    if (error) throw error;

    const events = data || [];
    return {
      total: events.length,
      reunions: events.filter(e => e.type === 'réunion').length,
      appels: events.filter(e => e.type === 'appel').length,
      visites: events.filter(e => e.type === 'visite').length,
      emails: events.filter(e => e.type === 'email').length,
      autres: events.filter(e => e.type === 'autre').length,
    };
  },
};
