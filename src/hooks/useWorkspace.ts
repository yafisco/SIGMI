import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

export function useWorkspace() {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<'dashboard' | 'commercial' | 'tresorerie' | 'pole'>('dashboard');
  const [pole, setPole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkspace() {
      if (!user) {
        setWorkspace('dashboard');
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('collaborateurs')
          .select('poste, role, poles')
          .eq('id', user.id)
          .single();

        if (data) {
          const poste = data.poste?.toLowerCase() || '';
          const role = data.role?.toLowerCase() || '';
          const userPole = data.poles && data.poles.length > 0 ? data.poles[0] : '';

          if (poste.includes('comptable') || role.includes('comptable')) {
            setWorkspace('tresorerie');
          } else if (poste.includes('commercial') || role.includes('commercial')) {
            setWorkspace('commercial');
          } else if (poste.includes('direction') || role.includes('direction')) {
            setWorkspace('dashboard');
          } else if (poste.includes('responsable') || role.includes('responsable')) {
            // Responsable de pôle
            setWorkspace('pole');
            setPole(userPole);
          } else if (userPole) {
            // Utilisateur avec un pôle assigné
            setWorkspace('pole');
            setPole(userPole);
          } else {
            setWorkspace('dashboard');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la détection de l\'espace de travail:', error);
        setWorkspace('dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchWorkspace();
  }, [user]);

  const getBackLink = () => {
    if (workspace === 'commercial') return '/commercial';
    if (workspace === 'tresorerie') return '/tresorerie';
    if (workspace === 'pole' && pole) {
      // Même format que la redirection du login : /poles/[pole] attend la valeur exacte du pôle
      return `/poles/${encodeURIComponent(pole)}`;
    }
    return '/dashboard';
  };

  return { workspace, pole, loading, getBackLink };
}
