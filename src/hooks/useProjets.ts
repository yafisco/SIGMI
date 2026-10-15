import { useState, useEffect } from 'react';
import { Projet, Pole } from '@/types';
import { projetsService } from '@/lib/services';

export function useProjets(poleFilter?: Pole) {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjets() {
      try {
        setLoading(true);
        const data = await projetsService.getAll(poleFilter);
        setProjets(data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des projets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjets();
  }, [poleFilter]);

  return { projets, loading, error };
}

export function useProjetStats() {
  const [stats, setStats] = useState({ total: 0, enCours: 0, termines: 0, budgetTotal: 0, budgetConsomme: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await projetsService.getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}
