import { supabase } from '@/lib/supabase';

export const ventesService = {
  // Récupérer toutes les ventes
  async getAll() {
    const { data, error } = await supabase
      .from('ventes')
      .select('*, clients(nom)')
      .order('date_vente', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Récupérer une vente par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('ventes')
      .select('*, clients(nom), lignes_vente(*, produits(designation))')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Créer une vente
  async create(data: any, lignes: any[]) {
    const { data: vente, error: venteError } = await supabase
      .from('ventes')
      .insert(data)
      .select()
      .single();
    
    if (venteError) throw venteError;

    const lignesToInsert = lignes.map(ligne => ({
      vente_id: vente.id,
      produit_id: ligne.produit_id,
      quantite: ligne.quantite,
      prix_unitaire: ligne.prix_unitaire,
    }));

    const { error: lignesError } = await supabase.from('lignes_vente').insert(lignesToInsert);
    if (lignesError) throw lignesError;

    return await this.getById(vente.id);
  },

  // Mettre à jour une vente
  async update(id: string, data: any) {
    const { data: vente, error } = await supabase
      .from('ventes')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return vente;
  },

  // Supprimer une vente
  async delete(id: string) {
    const { error } = await supabase
      .from('ventes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // S'abonner aux changements Realtime
  subscribeToChanges(callback: () => void) {
    const subscription = supabase
      .channel('ventes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ventes' }, callback)
      .subscribe();
    
    return subscription;
  },

  // Se désabonner
  unsubscribe() {
    supabase.channel('ventes_changes').unsubscribe();
  },

  // Obtenir les statistiques
  async getStats() {
    const { count: total } = await supabase
      .from('ventes')
      .select('*', { count: 'exact', head: true });
    
    const { data: ventes } = await supabase
      .from('ventes')
      .select('total');
    
    const totalVentes = ventes?.reduce((sum, v) => sum + (v.total || 0), 0) || 0;

    return {
      total: total || 0,
      totalVentes,
      moyenne: total ? totalVentes / total : 0,
    };
  },
};
