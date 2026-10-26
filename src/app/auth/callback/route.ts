import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Retour des liens e-mail Supabase (confirmation, réinitialisation) : échange du code contre une session.
// Aucun profil n'est créé ici : les comptes et leurs rôles sont gérés par l'administrateur.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirection limitée au même site (pas d'URL externe via un paramètre)
      const next = requestUrl.searchParams.get('next');
      const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : '/login?confirmed=true';
      return NextResponse.redirect(new URL(destination, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin));
}
