import { createClient } from '@/lib/supabase/client';

export interface Rapport {
  id: string;
  titre: string;
  type: 'mensuel' | 'trimestriel' | 'annuel' | 'budget';
  periode: string;
  statut: 'disponible' | 'en_cours';
  data?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateRapportInput {
  titre: string;
  type: 'mensuel' | 'trimestriel' | 'annuel' | 'budget';
  periode: string;
  data?: any;
}

export interface UpdateRapportInput {
  id: string;
  titre?: string;
  statut?: 'disponible' | 'en_cours';
  data?: any;
}

export class RapportsService {
  private supabase = createClient();
  private subscription: any = null;

  // Récupérer tous les rapports
  async getAll(): Promise<Rapport[]> {
    const { data, error } = await this.supabase
      .from('rapports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Récupérer un rapport par ID
  async getById(id: string): Promise<Rapport | null> {
    const { data, error } = await this.supabase
      .from('rapports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Créer un nouveau rapport
  async create(input: CreateRapportInput): Promise<Rapport> {
    const { data, error } = await this.supabase
      .from('rapports')
      .insert([{
        ...input,
        statut: 'en_cours',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Mettre à jour un rapport
  async update(input: UpdateRapportInput): Promise<Rapport> {
    const { id, ...updateData } = input;

    const { data, error } = await this.supabase
      .from('rapports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Supprimer un rapport
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('rapports')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Générer les statistiques financières pour un rapport
  async generateStats(periode: string, type: 'mensuel' | 'trimestriel' | 'annuel' | 'budget') {
    // Calculer les dates de début et fin selon le type
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (type === 'mensuel') {
      const [year, month] = periode.split('-').map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else if (type === 'trimestriel') {
      const [year, quarter] = periode.split('-T').map(Number);
      const startMonth = (quarter - 1) * 3;
      startDate = new Date(year, startMonth, 1);
      endDate = new Date(year, startMonth + 3, 0);
    } else {
      const year = parseInt(periode);
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Récupérer les transactions de la période
    const { data: transactions, error: transError } = await this.supabase
      .from('transactions')
      .select('*')
      .gte('date_transaction', startDateStr)
      .lte('date_transaction', endDateStr);

    if (transError) throw transError;

    // Récupérer les budgets de la période
    const { data: budgets, error: budgetError } = await this.supabase
      .from('budgets')
      .select('*')
      .gte('annee', startDate.getFullYear())
      .lte('annee', endDate.getFullYear());

    if (budgetError) throw budgetError;

    // Calculer les statistiques
    const encaissements = transactions?.filter(t => t.type === 'encaissement') || [];
    const decaissements = transactions?.filter(t => t.type === 'decaissement') || [];

    const totalEncaissements = encaissements.reduce((sum, t) => sum + (t.montant || 0), 0);
    const totalDecaissements = decaissements.reduce((sum, t) => sum + (t.montant || 0), 0);
    const soldeNet = totalEncaissements - totalDecaissements;

    const totalBudget = budgets?.reduce((sum, b) => sum + (b.montant_budget || 0), 0) || 0;

    return {
      periode,
      type,
      startDate: startDateStr,
      endDate: endDateStr,
      totalEncaissements,
      totalDecaissements,
      soldeNet,
      totalBudget,
      budgetUtilise: totalBudget > 0 ? (totalDecaissements / totalBudget) * 100 : 0,
      nombreTransactions: transactions?.length || 0,
      nombreEncaissements: encaissements.length,
      nombreDecaissements: decaissements.length,
    };
  }

  // S'abonner aux changements Realtime
  subscribeToChanges(callback: () => void) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.supabase
      .channel('rapports-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rapports',
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

export const rapportsService = new RapportsService();
