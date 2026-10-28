import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Client Supabase avec la clé service_role : il contourne le RLS.
// Réservé au serveur (import 'server-only' fait échouer le build s'il est importé côté client).
// À n'utiliser qu'après avoir vérifié que l'appelant est admin.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante (voir .env.example)');
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
