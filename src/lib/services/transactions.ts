import { supabase } from '@/lib/supabase';
import { Transaction, CreateTransactionInput, UpdateTransactionInput, TransactionType } from '@/types';

export const transactionsService = {
  async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date_transaction', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByType(type: TransactionType): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', type)
      .order('date_transaction', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByPole(pole: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('pole', pole)
      .order('date_transaction', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(input: UpdateTransactionInput): Promise<Transaction> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStats() {
    const [encaissements, decaissements] = await Promise.all([
      supabase.from('transactions').select('montant').eq('type', 'encaissement').eq('statut', 'valide'),
      supabase.from('transactions').select('montant').eq('type', 'decaissement').eq('statut', 'valide'),
    ]);

    const totalEncaissements = encaissements.data?.reduce((sum, t) => sum + Number(t.montant), 0) || 0;
    const totalDecaissements = decaissements.data?.reduce((sum, t) => sum + Number(t.montant), 0) || 0;

    return {
      totalEncaissements,
      totalDecaissements,
      solde: totalEncaissements - totalDecaissements,
    };
  },
};
