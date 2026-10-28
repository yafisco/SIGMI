'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppRole, Pole, Profile } from '@/types';
import { errorMessage } from '@/lib/utils/errorHandler';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: AppRole;
  pole: Pole | null;
  // Compatibilité avec les pages qui filtrent sur une liste de pôles
  poles: Pole[];
  // Gestion des comptes et des rôles (/admin/utilisateurs)
  isAdmin: boolean;
  // Vue transverse sur tous les pôles (direction générale)
  canSeeAllPoles: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          setUser(null);
          return;
        }

        // Le compte est lié à une personne : table profiles (id = auth.users.id)
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        const profile = data as Profile | null;
        if (profileError || !profile || !profile.actif) {
          setUser(null);
          return;
        }

        setUser({
          id: profile.id,
          email: profile.email,
          nom: profile.nom,
          prenom: profile.prenom,
          role: profile.role,
          pole: profile.pole,
          poles: profile.pole ? [profile.pole] : [],
          isAdmin: profile.role === 'admin',
          canSeeAllPoles: profile.role === 'direction_generale',
        });
      } catch (err) {
        console.error('Erreur chargement utilisateur:', err);
        setError(errorMessage(err, 'Erreur lors du chargement de l\'utilisateur'));
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Écouter les changements de session
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, error, signOut };
}
