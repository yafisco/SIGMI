import { supabase } from '@/lib/supabase';

export const produitsService = {
  // Récupérer tous les produits
  async getAll() {
    const { data, error } = await supabase
      .from('produits')
      .select('*, fournisseurs(raison_sociale)')
      .order('designation');
    
    if (error) throw error;
    return data || [];
  },

  // Récupérer un produit par ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('produits')
      .select('*, fournisseurs(raison_sociale)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Créer un produit
  async create(data: any) {
    const { data: produit, error } = await supabase
      .from('produits')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return produit;
  },

  // Mettre à jour un produit
  async update(id: string, data: any) {
    const { data: produit, error } = await supabase
      .from('produits')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return produit;
  },

  // Supprimer un produit
  async delete(id: string) {
    const { error } = await supabase
      .from('produits')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Récupérer les produits actifs
  async getActifs() {
    const { data, error } = await supabase
      .from('produits')
      .select('*')
      .eq('actif', true)
      .order('designation');
    
    if (error) throw error;
    return data || [];
  },

  // S'abonner aux changements Realtime
  subscribeToChanges(callback: () => void) {
    const subscription = supabase
      .channel('produits_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produits' }, callback)
      .subscribe();
    
    return subscription;
  },

  // Se désabonner
  unsubscribe() {
    supabase.channel('produits_changes').unsubscribe();
  },

  // Obtenir les statistiques
  async getStats() {
    const { count: total } = await supabase
      .from('produits')
      .select('*', { count: 'exact', head: true });
    
    const { count: actifs } = await supabase
      .from('produits')
      .select('*', { count: 'exact', head: true })
      .eq('actif', true);
    
    const { data: produits } = await supabase
      .from('produits')
      .select('prix_unitaire')
      .eq('actif', true);
    
    const valeurTotale = produits?.reduce((sum, p) => sum + (p.prix_unitaire || 0), 0) || 0;

    return {
      total: total || 0,
      actifs: actifs || 0,
      inactifs: (total || 0) - (actifs || 0),
      valeurTotale,
    };
  },
};
