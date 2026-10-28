import { redirect } from 'next/navigation';
import { createClient, getCurrentProfile } from '@/lib/supabase/server';
import { workspacePath } from '@/lib/workspace';
import type { Profile } from '@/types';
import UtilisateursClient from './UtilisateursClient';

// Gestion des comptes : réservée au rôle admin (vérifié ici et dans chaque Server Action)
export default async function AdminUtilisateursPage() {
  const me = await getCurrentProfile();
  if (!me) redirect('/login');
  if (me.role !== 'admin') redirect(workspacePath(me));

  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').order('nom', { ascending: true });

  return <UtilisateursClient profiles={(data ?? []) as Profile[]} currentUserId={me.id} />;
}
