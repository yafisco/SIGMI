'use client';

import { useAuth } from './useAuth';

// Filtre d'affichage par pôle. La sécurité est assurée par le RLS (current_pole()) ;
// ce filtre ne fait que restreindre les listes d'un responsable de pôle à son pôle.
export function usePoleFilter() {
  const { user, loading: authLoading } = useAuth();

  if (user?.role === 'responsable_pole' && user.pole) {
    return {
      pole: user.pole,
      shouldFilter: true,
      loading: authLoading,
      user,
    };
  }

  return {
    pole: null, // null = pas de filtre côté interface
    shouldFilter: false,
    loading: authLoading,
    user,
  };
}
