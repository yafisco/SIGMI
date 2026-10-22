import { useState, useEffect } from 'react';
import { Document } from '@/types';
import { documentsService } from '@/lib/services';
import { errorMessage } from '@/lib/utils/errorHandler';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true);
        const data = await documentsService.getAll();
        setDocuments(data);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement documents:', err);
        setError(errorMessage(err, 'Erreur lors du chargement des documents'));
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, []);

  return { documents, loading, error };
}

export function useDocumentStats() {
  const [stats, setStats] = useState({ total: 0, valides: 0, brouillons: 0, tailleTotale: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await documentsService.getStats();
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
