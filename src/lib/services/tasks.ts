import { supabase } from '@/lib/supabase';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, TaskPriority, TaskRelatedType, Pole } from '@/types';

export const tasksService = {
  // Récupérer toutes les tâches avec détails
  async getAll(poleFilter?: Pole): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false });

    // Filtrer par pôle si spécifié (filtrer sur le champ pole si présent)
    if (poleFilter) {
      query = query.eq('pole', poleFilter);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Récupérer une tâche par ID
  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une nouvelle tâche
  async create(input: CreateTaskInput): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une tâche
  async update(input: UpdateTaskInput): Promise<Task> {
    const { id, ...updateData } = input;

    // Si status passe à done, définir completed_at
    if (updateData.status === 'done' && !updateData.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une tâche
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Rechercher des tâches
  async search(query: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par statut
  async getByStatus(status: TaskStatus): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', status)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par priorité
  async getByPriority(priority: TaskPriority): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('priority', priority)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par projet
  async getByProjet(projetId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('related_type', 'projet')
      .eq('related_id', projetId)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par assigné
  async getByAssigned(assignedTo: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', assignedTo)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par élément lié
  async getByRelated(relatedType: TaskRelatedType, relatedId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('related_type', relatedType)
      .eq('related_id', relatedId)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les tâches en retard
  async getOverdue(): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .lt('due_date', today)
      .neq('status', 'done')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les tâches à venir (7 jours)
  async getUpcoming(days: number = 7): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    const future = new Date();
    future.setDate(future.getDate() + days);
    const futureStr = future.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('due_date', today)
      .lte('due_date', futureStr)
      .neq('status', 'done')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les statistiques
  async getStats() {
    const [totalResult, byStatusResult, byPriorityResult, overdueResult] = await Promise.all([
      supabase.from('tasks').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('status'),
      supabase.from('tasks').select('priority'),
      supabase.from('tasks').select('id', { count: 'exact', head: true })
        .lt('due_date', new Date().toISOString().split('T')[0])
        .neq('status', 'done'),
    ]);

    const total = totalResult.count || 0;
    const overdue = overdueResult.count || 0;

    const byStatus: Record<TaskStatus, number> = {
      todo: 0,
      in_progress: 0,
      done: 0,
      cancelled: 0,
    };

    const byPriority: Record<TaskPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    byStatusResult.data?.forEach((t: { status: string }) => {
      if (t.status in byStatus) {
        byStatus[t.status as TaskStatus]++;
      }
    });

    byPriorityResult.data?.forEach((t: { priority: string }) => {
      if (t.priority in byPriority) {
        byPriority[t.priority as TaskPriority]++;
      }
    });

    return { total, overdue, byStatus, byPriority };
  },

  // Marquer automatiquement les tâches en retard comme terminées
  async markOverdueAsDone() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        status: 'done',
        completed_at: new Date().toISOString()
      })
      .lt('due_date', today)
      .neq('status', 'done')
      .select();

    if (error) throw error;
    return data;
  },
};