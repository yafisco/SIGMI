// Hook personnalisé pour centraliser le chargement de données
// Réutilisable dans toutes les pages qui chargent des données depuis un service

import { useState, useEffect } from 'react';
import { handleError } from '@/lib/utils/errorHandler';

interface UseDataOptions<T> {
  fetchFn: () => Promise<T[]>;
  deps?: any[];
  initialData?: T[];
  onError?: (error: string) => void;
}

interface UseDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

/**
 * Hook pour charger et gérer des données avec gestion d'état automatique
 * @param options - Options de configuration
 * @returns État et fonctions de gestion des données
 */
export function useData<T>(options: UseDataOptions<T>): UseDataReturn<T> {
  const { fetchFn, deps = [], initialData = [], onError } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      const errorMessage = handleError(err, 'useData');
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, deps);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
}

/**
 * Hook pour charger une seule entité par ID
 */
interface UseSingleDataOptions<T> {
  fetchFn: (id: string) => Promise<T>;
  id: string;
  onError?: (error: string) => void;
}

interface UseSingleDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

export function useSingleData<T>(options: UseSingleDataOptions<T>): UseSingleDataReturn<T> {
  const { fetchFn, id, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await fetchFn(id);
      setData(result);
    } catch (err) {
      const errorMessage = handleError(err, 'useSingleData');
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
}
