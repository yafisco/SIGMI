// Hook personnalisé pour centraliser le chargement de données
// Réutilisable dans toutes les pages qui chargent des données depuis un service

import { useState, useEffect, type DependencyList } from 'react';
import { handleError } from '@/lib/utils/errorHandler';

interface UseDataOptions<T> {
  fetchFn: () => Promise<T[]>;
  deps?: DependencyList;
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

  // Les setState ne sont appelés que dans les callbacks de la promesse :
  // l'effet ne déclenche pas de rendu en cascade, et une réponse arrivée après démontage est ignorée.
  const load = (isActive: () => boolean = () => true) =>
    fetchFn()
      .then((result) => {
        if (!isActive()) return;
        setData(result);
        setError('');
      })
      .catch((err) => {
        if (!isActive()) return;
        const errorMessage = handleError(err, { context: 'useData' });
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      })
      .finally(() => {
        if (isActive()) setLoading(false);
      });

  const refresh = async () => {
    setLoading(true);
    await load();
  };

  useEffect(() => {
    let active = true;
    load(() => active);
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook pour charger une seule entité par ID
 */
interface UseSingleDataOptions<T> {
  fetchFn: (id: string) => Promise<T | null>;
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
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');

  const load = (isActive: () => boolean = () => true) =>
    fetchFn(id)
      .then((result) => {
        if (!isActive()) return;
        setData(result);
        setError('');
      })
      .catch((err) => {
        if (!isActive()) return;
        const errorMessage = handleError(err, { context: 'useSingleData' });
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      })
      .finally(() => {
        if (isActive()) setLoading(false);
      });

  const refresh = async () => {
    if (!id) return;
    setLoading(true);
    await load();
  };

  useEffect(() => {
    if (!id) return;
    let active = true;
    load(() => active);
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}
