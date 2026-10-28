import { createClient } from '@/lib/supabase/client';

export interface Facture {
  id: string;
  numero: string;
  client_id: string;
  client_nom?: string;
  montant_ht: number;
  montant_ttc: number;
  tva: number;
  date_emission: string;
  date_echeance: string;
  statut: 'brouillon' | 'envoyée' | 'payée' | 'annulée';
  lignes?: FactureLigne[];
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FactureLigne {
  id?: string;
  description: string;
  quantite: number;
  prix_unitaire: number;
  montant_ht: number;
}

export interface CreateFactureInput {
  numero: string;
  client_id: string;
  montant_ht: number;
  montant_ttc: number;
  tva: number;
  date_emission: string;
  date_echeance: string | null;
  statut: 'brouillon' | 'envoyée' | 'payée' | 'annulée';
  lignes?: FactureLigne[];
  notes: string | null;
}

export interface UpdateFactureInput {
  id: string;
  statut?: 'brouillon' | 'envoyée' | 'payée' | 'annulée';
  notes?: string;
}

export class FacturesService {
  private supabase = createClient();
  private subscription: any = null;

  // Récupérer toutes les factures
  async getAll(): Promise<Facture[]> {
    const { data, error } = await this.supabase
      .from('factures')
      .select(`
        *,
        clients (nom)
      `)
      .order('date_emission', { ascending: false });

    if (error) throw error;
    return (data || []).map(f => ({
      ...f,
      client_nom: f.clients?.nom,
    })) as Facture[];
  }

  // Récupérer une facture par ID
  async getById(id: string): Promise<Facture | null> {
    const { data, error } = await this.supabase
      .from('factures')
      .select(`
        *,
        clients (nom, email, adresse, telephone)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Facture;
  }

  // Créer une nouvelle facture
  async create(input: CreateFactureInput): Promise<Facture> {
    const { data, error } = await this.supabase
      .from('factures')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Mettre à jour une facture
  async update(input: UpdateFactureInput): Promise<Facture> {
    const { id, ...updateData } = input;

    const { data, error } = await this.supabase
      .from('factures')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Supprimer une facture
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('factures')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Filtrer par statut
  async getByStatut(statut: string): Promise<Facture[]> {
    const { data, error } = await this.supabase
      .from('factures')
      .select(`
        *,
        clients (nom)
      `)
      .eq('statut', statut)
      .order('date_emission', { ascending: false });

    if (error) throw error;
    return (data || []).map(f => ({
      ...f,
      client_nom: f.clients?.nom,
    })) as Facture[];
  }

  // Filtrer par client
  async getByClient(clientId: string): Promise<Facture[]> {
    const { data, error } = await this.supabase
      .from('factures')
      .select(`
        *,
        clients (nom)
      `)
      .eq('client_id', clientId)
      .order('date_emission', { ascending: false });

    if (error) throw error;
    return (data || []).map(f => ({
      ...f,
      client_nom: f.clients?.nom,
    })) as Facture[];
  }

  // Récupérer les statistiques
  async getStats() {
    const [totalResult, payeesResult, enAttenteResult, totalMontantResult] = await Promise.all([
      this.supabase.from('factures').select('id', { count: 'exact', head: true }),
      this.supabase.from('factures').select('id', { count: 'exact', head: true }).eq('statut', 'payée'),
      this.supabase.from('factures').select('id', { count: 'exact', head: true }).eq('statut', 'envoyée'),
      this.supabase.from('factures').select('montant_ttc'),
    ]);

    const total = totalResult.count || 0;
    const payees = payeesResult.count || 0;
    const enAttente = enAttenteResult.count || 0;

    const totalMontant = totalMontantResult.data?.reduce((acc: number, f: { montant_ttc: number }) => acc + (f.montant_ttc || 0), 0) || 0;

    return { total, payees, enAttente, totalMontant };
  }

  // Générer le numéro de facture suivant
  async generateNumero(): Promise<string> {
    const year = new Date().getFullYear();
    const { data, error } = await this.supabase
      .from('factures')
      .select('numero')
      .like('numero', `FAC-${year}%`)
      .order('numero', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      const lastNumero = data[0].numero;
      const lastNum = parseInt(lastNumero.split('-')[2]) || 0;
      const newNum = lastNum + 1;
      return `FAC-${year}-${newNum.toString().padStart(3, '0')}`;
    }

    return `FAC-${year}-001`;
  }

  // S'abonner aux changements Realtime
  subscribeToChanges(callback: () => void) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.supabase
      .channel('factures-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'factures',
      }, callback)
      .subscribe();

    return this.subscription;
  }

  // Se désabonner
  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}

export const facturesService = new FacturesService();
