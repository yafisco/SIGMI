import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook pour synchroniser automatiquement des données en temps réel
 * @param tables - Liste des tables à écouter
 * @param callback - Fonction à appeler quand une table change
 */
export function useRealtimeSync(tables: string[], callback: () => void) {
  useEffect(() => {
    const channels = tables.map(table =>
      supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
        .subscribe()
    );

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [tables, callback]);
}
