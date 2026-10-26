'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentProfile } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { APP_ROLE_LABELS, POLE_OPTIONS } from '@/lib/constants';
import type { AppRole, Profile } from '@/types';

// Ces Server Actions sont des points d'entrée publics (POST) : chaque action revérifie
// que l'appelant est un admin actif avant d'utiliser la clé service_role.

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

const ROLES = Object.keys(APP_ROLE_LABELS) as [AppRole, ...AppRole[]];
const POLES = POLE_OPTIONS.filter((p) => p.value !== 'transversal').map((p) => p.value) as [string, ...string[]];

const roleEtPoleSchema = z
  .object({
    role: z.enum(ROLES),
    pole: z.enum(POLES).nullable(),
  })
  .refine((v) => v.role !== 'responsable_pole' || v.pole !== null, {
    message: 'Un responsable de pôle doit être rattaché à un pôle',
    path: ['pole'],
  });

const createUserSchema = z
  .object({
    nom: z.string().trim().min(1, 'Le nom est requis').max(100),
    prenom: z.string().trim().min(1, 'Le prénom est requis').max(100),
    email: z.string().trim().toLowerCase().email('E-mail invalide'),
    telephone: z.string().trim().max(20).optional(),
    fonction: z.string().trim().max(100).optional(),
    role: z.enum(ROLES),
    pole: z.enum(POLES).nullable(),
    password: z.string().min(12, 'Le mot de passe initial doit faire au moins 12 caractères'),
  })
  .refine((v) => v.role !== 'responsable_pole' || v.pole !== null, {
    message: 'Un responsable de pôle doit être rattaché à un pôle',
    path: ['pole'],
  });

async function requireAdmin(): Promise<Profile | null> {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin' ? profile : null;
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Données invalides';
}

export async function createUser(input: z.input<typeof createUserSchema>): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: 'Accès réservé aux administrateurs' };

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const data = parsed.data;

  const admin = createAdminClient();

  // 1. Compte Auth (e-mail confirmé, mot de passe initial communiqué par l'admin)
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: { nom: data.nom, prenom: data.prenom },
  });
  if (authError || !created.user) {
    return { ok: false, error: authError?.message ?? 'Création du compte impossible' };
  }
  const userId = created.user.id;

  // 2. Fiche collaborateur (annuaire RH) : réutilisée si l'e-mail existe déjà, sinon créée avec le même id
  //    (les tâches, documents et projets référencent collaborateurs.id)
  const { data: existing } = await admin.from('collaborateurs').select('id').eq('email', data.email).maybeSingle();
  let collaborateurId = existing?.id as string | undefined;
  if (!collaborateurId) {
    const { error: collabError } = await admin.from('collaborateurs').insert({
      id: userId,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      telephone: data.telephone || null,
      poste: data.fonction || null,
      role: data.role,
      poles: data.pole ? [data.pole] : [],
      actif: true,
    });
    if (collabError) {
      await admin.auth.admin.deleteUser(userId);
      return { ok: false, error: `Fiche collaborateur : ${collabError.message}` };
    }
    collaborateurId = userId;
  }

  // 3. Profil (rôle et pôle) ; en cas d'échec, on annule la création du compte
  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    nom: data.nom,
    prenom: data.prenom,
    email: data.email,
    telephone: data.telephone || null,
    fonction: data.fonction || null,
    role: data.role,
    pole: data.pole,
    actif: true,
    collaborateur_id: collaborateurId,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return { ok: false, error: `Profil : ${profileError.message}` };
  }

  revalidatePath('/admin/utilisateurs');
  return { ok: true, message: `Compte créé pour ${data.prenom} ${data.nom}` };
}

export async function updateRoleEtPole(
  profileId: string,
  input: z.input<typeof roleEtPoleSchema>
): Promise<ActionResult> {
  const me = await requireAdmin();
  if (!me) return { ok: false, error: 'Accès réservé aux administrateurs' };

  const parsed = roleEtPoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { role, pole } = parsed.data;

  if (profileId === me.id && role !== 'admin') {
    return { ok: false, error: 'Vous ne pouvez pas retirer votre propre rôle administrateur' };
  }

  const admin = createAdminClient();
  const { data: updated, error } = await admin
    .from('profiles')
    .update({ role, pole })
    .eq('id', profileId)
    .select('collaborateur_id')
    .single();
  if (error) return { ok: false, error: error.message };

  // Le pôle de la fiche collaborateur suit celui du profil (utilisé par certaines politiques RLS)
  if (updated?.collaborateur_id) {
    await admin.from('collaborateurs').update({ poles: pole ? [pole] : [] }).eq('id', updated.collaborateur_id);
  }

  revalidatePath('/admin/utilisateurs');
  return { ok: true, message: 'Rôle et pôle mis à jour' };
}

export async function setActif(profileId: string, actif: boolean): Promise<ActionResult> {
  const me = await requireAdmin();
  if (!me) return { ok: false, error: 'Accès réservé aux administrateurs' };
  if (profileId === me.id) return { ok: false, error: 'Vous ne pouvez pas désactiver votre propre compte' };

  const admin = createAdminClient();
  const { error } = await admin.from('profiles').update({ actif }).eq('id', profileId);
  if (error) return { ok: false, error: error.message };

  // Bloque aussi la connexion côté Auth (le RLS coupe déjà tout accès aux données)
  const { error: banError } = await admin.auth.admin.updateUserById(profileId, {
    ban_duration: actif ? 'none' : '876000h',
  });
  if (banError) return { ok: false, error: banError.message };

  revalidatePath('/admin/utilisateurs');
  return { ok: true, message: actif ? 'Compte réactivé' : 'Compte désactivé' };
}
