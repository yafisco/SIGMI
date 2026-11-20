import { createClient } from '@/lib/supabase/client';
import type { HistoriqueStatutAgrement } from '@/types';

export const historiqueAgrementsService = {
  // Récupérer l'historique d'une demande
  async getByDemandeId(demandeId: string): Promise<HistoriqueStatutAgrement[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('historique_statuts_agrements')
      .select('*')
      .eq('demande_id', demandeId)
      .order('date_changement', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer l'historique avec pagination
  async getByDemandeIdPaginated(
    demandeId: string,
    page = 1,
    pageSize = 20
  ): Promise<{ data: HistoriqueStatutAgrement[]; total: number }> {
    const supabase = createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('historique_statuts_agrements')
      .select('*', { count: 'exact' })
      .eq('demande_id', demandeId)
      .order('date_changement', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },
};
