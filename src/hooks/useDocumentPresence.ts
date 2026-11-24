'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface DocumentPresence {
  user_id: string;
  user_name: string;
  document_id: string;
  last_seen: string;
}

export function useDocumentPresence(documentId: string) {
  const { user } = useAuth();
  const [presence, setPresence] = useState<DocumentPresence[]>([]);
  const [isPresent, setIsPresent] = useState(false);

  useEffect(() => {
    if (!user || !documentId) return;

    // S'abonner aux changements de présence sur ce document
    const channel = supabase
      .channel(`document_presence_${documentId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as unknown as DocumentPresence[];
        setPresence(users.filter((u) => u.document_id === documentId && u.user_id !== user.id));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Signaler sa présence
          await channel.track({
            user_id: user.id,
            user_name: user.email?.split('@')[0] || 'Utilisateur',
            document_id: documentId,
            last_seen: new Date().toISOString(),
          });
          setIsPresent(true);
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
      setIsPresent(false);
    };
  }, [user, documentId]);

  return { presence, isPresent };
}
