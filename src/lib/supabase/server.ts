import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Profile } from '@/types';

// Client Supabase côté serveur (Server Components, Server Actions, Route Handlers).
// Il agit avec la session de l'utilisateur (cookies) : le RLS s'applique.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Appel depuis un Server Component : écriture impossible, le proxy rafraîchit la session.
          }
        },
      },
    }
  );
}

// Profil actif de l'utilisateur connecté, ou null (non connecté, sans profil ou désactivé)
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (!data || !data.actif) return null;
  return data as Profile;
}
