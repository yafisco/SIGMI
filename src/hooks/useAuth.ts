'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Pole } from '@/types';
import { errorMessage } from '@/lib/utils/errorHandler';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  poles: Pole[];
  isAdmin: boolean;
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

        // Récupérer les données du collaborateur
        const { data: collab, error: collabError } = await supabase
          .from('collaborateurs')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (collabError || !collab) {
          setUser(null);
          return;
        }

        const isAdmin = collab.role === 'direction' || collab.role === 'administrateur système';

        setUser({
          id: collab.id,
          email: collab.email,
          nom: collab.nom,
          prenom: collab.prenom,
          role: collab.role,
          poles: collab.poles || [],
          isAdmin,
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
