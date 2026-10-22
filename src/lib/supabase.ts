// Client Supabase partagé pour le code navigateur.
// Il passe par @supabase/ssr (session stockée en cookies) pour que la session ouverte au login
// soit la même que celle lue par useAuth et par src/proxy.ts.
// Si NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manque, l'erreur est levée tout de suite
// (pas de faux client silencieux).
import { createClient } from '@/lib/supabase/client';

export const supabase = createClient();
