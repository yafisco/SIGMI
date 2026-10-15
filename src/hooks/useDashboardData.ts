import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { opportunitiesService } from '@/lib/services/opportunities';
import { tasksService } from '@/lib/services/tasks';
import { clientsService } from '@/lib/services/clients';
import { Opportunity, Task, Client, DashboardStats } from '@/types';

export interface DashboardData {
  stats: DashboardStats;
  recentOpportunities: Opportunity[];
  upcomingTasks: Task[];
  loading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const [stats, setStats] = useState<DashboardStats>({
    total_opportunities: 0,
    pipeline_value: 0,
    total_tasks: 0,
    total_clients: 0,
    conversion_rate: 0,
    monthly_revenue: 0,
    opportunities_by_stage: {
      nouveau: 0,
      qualifié: 0,
      proposition: 0,
      négociation: 0,
      gagné: 0,
      perdu: 0,
    },
    tasks_by_status: {
      todo: 0,
      in_progress: 0,
      done: 0,
      cancelled: 0,
    },
    clients_by_statut: {
      prospect: 0,
      client: 0,
      inactif: 0,
      bloqué: 0,
    },
  });
  const [recentOpportunities, setRecentOpportunities] = useState<Opportunity[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Récupérer l'utilisateur actuel
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        // Récupérer toutes les stats en parallèle
        const [oppsStats, tasksStats, clientsStats, recentOpps, upcomingTasksData] = await Promise.all([
          opportunitiesService.getStats(),
          tasksService.getStats(),
          clientsService.getStats(),
          opportunitiesService.getAll(),
          tasksService.getUpcoming(7),
        ]);

        // Calculer le taux de conversion
        const totalOpps = oppsStats.byStage.gagné + oppsStats.byStage.perdu;
        const conversionRate = totalOpps > 0
          ? Math.round((oppsStats.byStage.gagné / totalOpps) * 100)
          : 0;

        setStats({
          total_opportunities: oppsStats.total,
          pipeline_value: oppsStats.pipelineValue,
          total_tasks: tasksStats.total,
          total_clients: clientsStats.total,
          conversion_rate: conversionRate,
          monthly_revenue: 0, // À calculer depuis les factures/documents
          opportunities_by_stage: oppsStats.byStage,
          tasks_by_status: tasksStats.byStatus,
          clients_by_statut: {
            prospect: clientsStats.prospects,
            client: clientsStats.clientsActifs,
            inactif: clientsStats.inactifs,
            bloqué: 0,
          },
        });

        // Opportunités récentes (5 dernières)
        setRecentOpportunities(recentOpps.slice(0, 5));

        // Tâches à venir
        setUpcomingTasks(upcomingTasksData.slice(0, 5));

      } catch (err) {
        console.error('Erreur lors de la récupération des données dashboard:', err);
        setError('Impossible de charger les données');
        
        // Fallback mock data
        setStats({
          total_opportunities: 12,
          pipeline_value: 2500000,
          total_tasks: 5,
          total_clients: 28,
          conversion_rate: 35,
          monthly_revenue: 850000,
          opportunities_by_stage: {
            nouveau: 2,
            qualifié: 3,
            proposition: 2,
            négociation: 2,
            gagné: 2,
            perdu: 1,
          },
          tasks_by_status: {
            todo: 3,
            in_progress: 1,
            done: 1,
            cancelled: 0,
          },
          clients_by_statut: {
            prospect: 10,
            client: 15,
            inactif: 3,
            bloqué: 0,
          },
        });

        setRecentOpportunities([
          { id: '1', name: 'Projet BTP Dakar', client_nom: 'Construction SA', amount: 500000000, stage: 'négociation', probability: 75, poles: ['génie civil et BTP'], created_at: '', updated_at: '' },
          { id: '2', name: 'Système IT Agri', client_nom: 'Ferme Modern', amount: 350000000, stage: 'proposition', probability: 50, poles: ['ingénierie informatique', 'agrobusiness'], created_at: '', updated_at: '' },
          { id: '3', name: 'Bornes solaires', client_nom: 'Taxi Express', amount: 1200000000, stage: 'qualifié', probability: 60, poles: ['transition énergétique'], created_at: '', updated_at: '' },
          { id: '4', name: 'Audit Conseil', client_nom: 'Ministère de l\'Énergie', amount: 200000000, stage: 'nouveau', probability: 30, poles: ['ingénierie informatique'], created_at: '', updated_at: '' },
        ]);

        setUpcomingTasks([
          { id: '1', title: 'Relancer client Construction SA', status: 'todo', priority: 'high', due_date: '2026-09-25', assigned_to_nom: 'Fatou Diop', created_at: '', updated_at: '' },
          { id: '2', title: 'Préparer proposition Ferme Modern', status: 'todo', priority: 'medium', due_date: '2026-09-26', assigned_to_nom: 'Jean Dupont', created_at: '', updated_at: '' },
          { id: '3', title: 'Réunion équipe pôle IT', status: 'todo', priority: 'low', due_date: '2026-09-27', assigned_to_nom: 'Moussa Fall', created_at: '', updated_at: '' },
          { id: '4', title: 'Finaliser devis Taxi Express', status: 'todo', priority: 'high', due_date: '2026-09-28', assigned_to_nom: 'Moussa Fall', created_at: '', updated_at: '' },
        ]);

      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return { stats, recentOpportunities, upcomingTasks, loading, error };
}