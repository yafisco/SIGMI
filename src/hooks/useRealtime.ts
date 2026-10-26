import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook pour synchroniser les données en temps réel avec Supabase
 * @param tables - Liste des tables à écouter pour les changements
 * @param onDataChange - Callback appelé quand un changement est détecté
 */
export function useRealtime(tables: string[], onDataChange: () => void) {
  const channels = tables.map(table =>
    supabase
      .channel(`${table}_realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, onDataChange)
      .subscribe()
  );

  // Cleanup function
  return () => {
    channels.forEach(channel => supabase.removeChannel(channel));
  };
}
