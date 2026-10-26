import { supabase } from '@/lib/supabase';
import { Budget, CreateBudgetInput, UpdateBudgetInput } from '@/types';

export const budgetsService = {
  async getAll(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('annee', { ascending: false })
      .order('mois', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByPole(pole: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('pole', pole)
      .order('annee', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByProjet(projetId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('projet_id', projetId)
      .order('annee', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: CreateBudgetInput): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(input: UpdateBudgetInput): Promise<Budget> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('budgets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateDepense(id: string, montant: number): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update({ montant_depense: montant })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStats() {
    const { data, error } = await supabase
      .from('budgets')
      .select('montant_budget, montant_depense');

    if (error) throw error;

    const totalBudget = data?.reduce((sum, b) => sum + Number(b.montant_budget), 0) || 0;
    const totalDepense = data?.reduce((sum, b) => sum + Number(b.montant_depense), 0) || 0;

    return {
      totalBudget,
      totalDepense,
      restant: totalBudget - totalDepense,
      pourcentageUtilise: totalBudget > 0 ? (totalDepense / totalBudget) * 100 : 0,
    };
  },
};
