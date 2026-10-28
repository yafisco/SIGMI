import { createClient } from '@/lib/supabase/client';
import { Pole } from '@/types';

export interface PoleStats {
  pole: Pole;
  totalOpportunities: number;
  totalProjects: number;
  totalValue: number;
  weightedValue: number;
  inPipeline: number;
  won: number;
  lost: number;
  conversionRate: number;
  projects?: number;
  tasks?: number;
  collaborators?: number;
}

export class PoleStatsService {
  // Obtenir les statistiques pour un pôle spécifique
  async getByPole(pole: Pole): Promise<PoleStats> {
    const supabase = createClient();
    const [oppResult, projResult] = await Promise.all([
      supabase
        .from('opportunities')
        .select('amount, stage, probability')
        .contains('poles', [pole]),
      supabase
        .from('projets')
        .select('id, budget_total')
        .contains('poles', [pole]),
    ]);

    const opportunities = oppResult.data || [];
    const projects = projResult.data || [];

    const totalOpportunities = opportunities.length;
    const totalProjects = projects.length;
    const totalValue = opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
    const weightedValue = opportunities.reduce(
      (sum, opp) => sum + (opp.amount || 0) * ((opp.probability || 0) / 100),
      0
    );
    const inPipeline = opportunities.filter((o) => !['gagné', 'perdu'].includes(o.stage || '')).length;
    const won = opportunities.filter((o) => o.stage === 'gagné').length;
    const lost = opportunities.filter((o) => o.stage === 'perdu').length;
    const conversionRate = totalOpportunities > 0 ? (won / totalOpportunities) * 100 : 0;

    return {
      pole,
      totalOpportunities,
      totalProjects,
      totalValue,
      weightedValue,
      inPipeline,
      won,
      lost,
      conversionRate,
    };
  }

  // Obtenir les statistiques pour tous les pôles
  async getAll(): Promise<PoleStats[]> {
    const poles: Pole[] = [
      'ingénierie informatique',
      'génie civil et BTP',
      'agrobusiness',
      'trading international',
      'transition énergétique',
      "centre d'incubation et d'impulsion des entreprises",
    ];

    const stats = await Promise.all(poles.map((pole) => this.getByPole(pole)));
    return stats;
  }

  // Comparaison entre pôles
  async getComparison() {
    const allStats = await this.getAll();

    return {
      bestPerforming: allStats.reduce((best, current) =>
        current.conversionRate > best.conversionRate ? current : best
      ),
      highestValue: allStats.reduce((best, current) =>
        current.totalValue > best.totalValue ? current : best
      ),
      mostActive: allStats.reduce((best, current) =>
        current.totalOpportunities > best.totalOpportunities ? current : best
      ),
    };
  }
}

export const poleStatsService = new PoleStatsService();
