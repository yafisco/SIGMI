'use client';

import { useAuth } from './useAuth';
import { Pole } from '@/types';

export function usePoleFilter() {
  const { user, loading: authLoading } = useAuth();

  // Si l'utilisateur est admin, il voit tout
  if (user?.isAdmin) {
    return {
      pole: null, // null = pas de filtre (voir tout)
      shouldFilter: false,
      loading: authLoading,
      user,
    };
  }

  // Si l'utilisateur a des pôles assignés, on filtre par le premier pôle
  // (Pour simplifier, on suppose qu'un utilisateur appartient à un seul pôle principal)
  if (user?.poles && user.poles.length > 0) {
    return {
      pole: user.poles[0],
      shouldFilter: true,
      loading: authLoading,
      user,
    };
  }

  // Si l'utilisateur n'a pas de pôle assigné, il ne voit rien
  return {
    pole: null,
    shouldFilter: true,
    loading: authLoading,
    user,
  };
}
