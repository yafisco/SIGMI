import { useState, useEffect, useCallback } from 'react';
import { Collaborateur, Pole } from '@/types';
import { collaborateursService } from '@/lib/services';

export function useCollaborateurs(poleFilter?: Pole) {
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // setState uniquement dans les callbacks de la promesse (pas de rendu en cascade dans l'effet)
  const fetchCollaborateurs = useCallback(
    () =>
      collaborateursService
        .getAll()
        .then((data) => {
          // Filtrer par pôle si spécifié
          const filteredData = poleFilter
            ? data.filter(collab => collab.poles && collab.poles.includes(poleFilter))
            : data;

          setCollaborateurs(filteredData);
          setError(null);
        })
        .catch((err) => {
          setError('Erreur lors du chargement des collaborateurs');
          console.error(err);
        })
        .finally(() => setLoading(false)),
    [poleFilter]
  );

  useEffect(() => {
    fetchCollaborateurs();
  }, [fetchCollaborateurs]);

  return { collaborateurs, loading, error, refresh: fetchCollaborateurs };
}

export function useCollaborateurStats() {
  const [stats, setStats] = useState({ total: 0, actifs: 0, parPole: {} as Record<string, number> });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await collaborateursService.getStats();
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
