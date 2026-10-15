'use client';

import { useState, useEffect } from 'react';
import { poleStatsService, PoleStats } from '@/lib/services/poleStats';
import { Pole } from '@/types';

export function usePoleStats(pole?: Pole) {
  const [stats, setStats] = useState<PoleStats | null>(null);
  const [allStats, setAllStats] = useState<PoleStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        if (pole) {
          const data = await poleStatsService.getByPole(pole);
          setStats(data);
        } else {
          const data = await poleStatsService.getAll();
          setAllStats(data);
        }
      } catch (err: any) {
        console.error('Erreur chargement stats pôle:', err);
        setError(err.message || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [pole]);

  return { stats, allStats, loading, error };
}
