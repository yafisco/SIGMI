-- =====================================================================
-- SIGMI : politique de profils, rôles applicatifs et RLS par rôle
-- - Chaque compte Auth est lié à une personne (table profiles)
-- - Rôles typés (enum app_role) et pôle de rattachement
-- - Toutes les politiques RLS passent par public.current_role() / public.current_pole()
-- - Matrice des droits : docs/matrice-droits.md
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Types
-- ---------------------------------------------------------------------
create type public.app_role as enum (
  'direction_generale',
  'commercial',
  'finance_comptabilite',
  'responsable_pole',
  'back_office',
  'admin'
);

-- Les 6 pôles de GROUP MI (mêmes valeurs que POLE_OPTIONS côté code)
create domain public.pole_sigmi as text check (value in (
  'ingénierie informatique',
  'génie civil et BTP',
  'agrobusiness',
  'trading international',
  'transition énergétique',
  'centre d''incubation et d''impulsion des entreprises'
));

-- Fonction de trigger existante : search_path figé (advisor Supabase)
alter function public.update_updated_at_column() set search_path = '';

-- ---------------------------------------------------------------------
-- 2. Profils (un compte = une personne)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nom varchar(100) not null default '',
  prenom varchar(100) not null default '',
  email varchar(255) not null unique,
  telephone varchar(20),
  fonction varchar(100),
  pole public.pole_sigmi,
  role public.app_role not null,
  actif boolean not null default true,
  collaborateur_id uuid references public.collaborateurs (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_responsable_pole_a_un_pole check (role <> 'responsable_pole' or pole is not null)
);

create index idx_profiles_role on public.profiles (role);
create index idx_profiles_pole on public.profiles (pole);

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------
-- 3. Fonctions de contexte utilisées par toutes les politiques
--    NULL si pas de profil ou profil inactif : un compte désactivé n'a plus aucun droit.
--    Toujours appelées qualifiées (CURRENT_ROLE est aussi un mot-clé SQL).
-- ---------------------------------------------------------------------
create function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = (select auth.uid()) and p.actif
$$;

create function public.current_pole()
returns public.pole_sigmi
language sql
stable
security definer
set search_path = ''
as $$
  select p.pole from public.profiles p where p.id = (select auth.uid()) and p.actif
$$;

revoke execute on function public.current_role() from public, anon;
revoke execute on function public.current_pole() from public, anon;
grant execute on function public.current_role() to authenticated;
grant execute on function public.current_pole() to authenticated;

-- ---------------------------------------------------------------------
-- 4. Colonnes de pôle manquantes sur les tables existantes
-- ---------------------------------------------------------------------
alter table public.clients add column if not exists poles text[] not null default '{}';
alter table public.tasks add column if not exists pole public.pole_sigmi;

create index if not exists idx_clients_poles on public.clients using gin (poles);
create index if not exists idx_opportunities_poles on public.opportunities using gin (poles);
create index if not exists idx_projets_poles on public.projets using gin (poles);
create index if not exists idx_collaborateurs_poles on public.collaborateurs using gin (poles);
create index if not exists idx_tasks_pole on public.tasks (pole);

-- ---------------------------------------------------------------------
-- 5. Nouvelles tables métier (version minimale)
-- ---------------------------------------------------------------------
create table public.prospections (
  id uuid primary key default gen_random_uuid(),
  libelle varchar(255) not null,
  client_id uuid references public.clients (id) on delete set null,
  pole public.pole_sigmi,
  montant numeric(15, 2),
  statut varchar(20) not null default 'a_contacter'
    check (statut in ('a_contacter', 'contacte', 'qualifie', 'abandonne')),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.demandes_agrement (
  id uuid primary key default gen_random_uuid(),
  libelle varchar(255) not null,
  client_id uuid references public.clients (id) on delete set null,
  pole public.pole_sigmi,
  montant numeric(15, 2),
  statut varchar(20) not null default 'soumise'
    check (statut in ('soumise', 'en_examen', 'approuvee', 'refusee')),
  decision text,
  decide_par uuid references public.profiles (id) on delete set null,
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.devis (
  id uuid primary key default gen_random_uuid(),
  reference varchar(50) unique,
  libelle varchar(255) not null,
  client_id uuid references public.clients (id) on delete set null,
  opportunity_id uuid references public.opportunities (id) on delete set null,
  pole public.pole_sigmi,
  montant numeric(15, 2) not null default 0,
  statut varchar(20) not null default 'brouillon'
    check (statut in ('brouillon', 'envoye', 'accepte', 'refuse', 'expire')),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ventes (
  id uuid primary key default gen_random_uuid(),
  libelle varchar(255) not null,
  client_id uuid references public.clients (id) on delete set null,
  devis_id uuid references public.devis (id) on delete set null,
  pole public.pole_sigmi,
  montant numeric(15, 2) not null default 0,
  date_vente date not null default current_date,
  statut varchar(20) not null default 'en_cours'
    check (statut in ('en_cours', 'livree', 'annulee')),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reprend la structure prévue par 006_factures_table.sql (jamais appliquée) + pôle
create table public.factures (
  id uuid primary key default gen_random_uuid(),
  numero varchar(50) not null unique,
  client_id uuid references public.clients (id) on delete set null,
  pole public.pole_sigmi,
  montant numeric(15, 2) not null,
  date_emission date not null,
  date_echeance date,
  description text,
  statut varchar(20) not null default 'en_attente'
    check (statut in ('en_attente', 'payée', 'annulée')),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.paiements (
  id uuid primary key default gen_random_uuid(),
  facture_id uuid references public.factures (id) on delete restrict,
  pole public.pole_sigmi,
  montant numeric(15, 2) not null,
  date_paiement date not null default current_date,
  mode varchar(20) not null default 'virement'
    check (mode in ('virement', 'cheque', 'especes', 'mobile_money')),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  libelle varchar(255) not null,
  projet_id uuid references public.projets (id) on delete set null,
  pole public.pole_sigmi,
  exercice integer not null default extract(year from current_date)::integer,
  montant_prevu numeric(15, 2) not null default 0,
  montant_consomme numeric(15, 2) not null default 0,
  statut varchar(20) not null default 'ouvert' check (statut in ('ouvert', 'clos')),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_prospections_pole on public.prospections (pole);
create index idx_demandes_agrement_pole on public.demandes_agrement (pole);
create index idx_devis_pole on public.devis (pole);
create index idx_ventes_pole on public.ventes (pole);
create index idx_factures_client on public.factures (client_id);
create index idx_factures_statut on public.factures (statut);
create index idx_paiements_facture on public.paiements (facture_id);
create index idx_budgets_pole on public.budgets (pole);

create trigger update_prospections_updated_at before update on public.prospections
  for each row execute function public.update_updated_at_column();
create trigger update_demandes_agrement_updated_at before update on public.demandes_agrement
  for each row execute function public.update_updated_at_column();
create trigger update_devis_updated_at before update on public.devis
  for each row execute function public.update_updated_at_column();
create trigger update_ventes_updated_at before update on public.ventes
  for each row execute function public.update_updated_at_column();
create trigger update_factures_updated_at before update on public.factures
  for each row execute function public.update_updated_at_column();
create trigger update_paiements_updated_at before update on public.paiements
  for each row execute function public.update_updated_at_column();
create trigger update_budgets_updated_at before update on public.budgets
  for each row execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------
-- 6. Remise à zéro des politiques existantes (dont les USING (true))
-- ---------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles', 'users', 'poles', 'client_poles', 'opportunity_poles', 'collaborateurs',
        'clients', 'contacts', 'opportunities', 'tasks', 'interactions', 'projets', 'documents',
        'prospections', 'demandes_agrement', 'devis', 'ventes', 'factures', 'paiements', 'budgets'
      )
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- RLS partout ; les tables héritées (users, client_poles, opportunity_poles) restent sans politique, donc fermées
alter table public.profiles enable row level security;
alter table public.users enable row level security;
alter table public.poles enable row level security;
alter table public.client_poles enable row level security;
alter table public.opportunity_poles enable row level security;
alter table public.collaborateurs enable row level security;
alter table public.clients enable row level security;
alter table public.contacts enable row level security;
alter table public.opportunities enable row level security;
alter table public.tasks enable row level security;
alter table public.interactions enable row level security;
alter table public.projets enable row level security;
alter table public.documents enable row level security;
alter table public.prospections enable row level security;
alter table public.demandes_agrement enable row level security;
alter table public.devis enable row level security;
alter table public.ventes enable row level security;
alter table public.factures enable row level security;
alter table public.paiements enable row level security;
alter table public.budgets enable row level security;

-- Les vues respectent désormais le RLS de l'utilisateur qui les interroge
alter view public.v_clients_detail set (security_invoker = on);
alter view public.v_opportunities_detail set (security_invoker = on);
alter view public.v_tasks_detail set (security_invoker = on);
alter view public.v_projets_detail set (security_invoker = on);
alter view public.v_documents_detail set (security_invoker = on);

-- ---------------------------------------------------------------------
-- 7. Politiques par rôle
--    Notation : (select public.current_role()) est évalué une seule fois par requête.
-- ---------------------------------------------------------------------

-- profiles : lecture seulement ; toutes les écritures passent par le serveur (clé service_role)
create policy "profiles_lecture" on public.profiles for select to authenticated using (
  id = (select auth.uid())
  or (select public.current_role()) in ('direction_generale', 'admin')
  or ((select public.current_role()) = 'responsable_pole' and pole = (select public.current_pole()))
);

-- poles : référentiel lisible par tout compte actif
create policy "poles_lecture" on public.poles for select to authenticated using (
  (select public.current_role()) is not null
);

-- collaborateurs : annuaire interne
create policy "collaborateurs_lecture" on public.collaborateurs for select to authenticated using (
  (select public.current_role()) is not null
);
create policy "collaborateurs_creation" on public.collaborateurs for insert to authenticated with check (
  (select public.current_role()) in ('back_office', 'admin')
);
create policy "collaborateurs_modification" on public.collaborateurs for update to authenticated
  using ((select public.current_role()) in ('back_office', 'admin'))
  with check ((select public.current_role()) in ('back_office', 'admin'));

-- clients
create policy "clients_lecture" on public.clients for select to authenticated using (
  (select public.current_role()) in ('direction_generale', 'commercial', 'finance_comptabilite', 'back_office')
  or ((select public.current_role()) = 'responsable_pole' and (select public.current_pole()) = any (poles))
);
create policy "clients_creation" on public.clients for insert to authenticated with check (
  (select public.current_role()) in ('commercial', 'back_office')
  or ((select public.current_role()) = 'responsable_pole' and (select public.current_pole()) = any (poles))
);
create policy "clients_modification" on public.clients for update to authenticated
  using (
    (select public.current_role()) in ('commercial', 'back_office')
    or ((select public.current_role()) = 'responsable_pole' and (select public.current_pole()) = any (poles))
  )
  with check (
    (select public.current_role()) in ('commercial', 'back_office')
    or ((select public.current_role()) = 'responsable_pole' and (select public.current_pole()) = any (poles))
  );
create policy "clients_suppression" on public.clients for delete to authenticated using (
  (select public.current_role()) = 'commercial'
);

-- contacts : mêmes droits que le client rattaché
create policy "contacts_lecture" on public.contacts for select to authenticated using (
  (select public.current_role()) in ('direction_generale', 'commercial', 'finance_comptabilite', 'back_office')
  or ((select public.current_role()) = 'responsable_pole' and exists (
    select 1 from public.clients c where c.id = client_id and (select public.current_pole()) = any (c.poles)))
);
create policy "contacts_creation" on public.contacts for insert to authenticated with check (
  (select public.current_role()) in ('commercial', 'back_office')
  or ((select public.current_role()) = 'responsable_pole' and exists (
    select 1 from public.clients c where c.id = client_id and (select public.current_pole()) = any (c.poles)))
);
create policy "contacts_modification" on public.contacts for update to authenticated
  using (
    (select public.current_role()) in ('commercial', 'back_office')
    or ((select public.current_role()) = 'responsable_pole' and exists (
      select 1 from public.clients c where c.id = client_id and (select public.current_pole()) = any (c.poles)))
  )
  with check (
    (select public.current_role()) in ('commercial', 'back_office')
    or ((select public.current_role()) = 'responsable_pole' and exists (
      select 1 from public.clients c where c.id = client_id and (select public.current_pole()) = any (c.poles)))
  );
create policy "contacts_suppression" on public.contacts for delete to authenticated using (
  (select public.current_role()) = 'commercial'
);

-- opportunities (pôles en tableau)
create policy "opportunities_lecture" on public.opportunities for select to authenticated using (
  (select public.current_role()) in ('direction_generale', 'commercial')
  or ((select public.current_role()) = 'responsable_pole' and (select public.current_pole()) = any (poles))
);
create policy "opportunities_creation" on public.opportunities for insert to authenticated with check (
  (select public.current_role()) = 'commercial'
  or ((select public.current_role()) = 'responsable_pole' and (select public.current_pole()) = any (poles))
);
create policy "opportunities_modification" on public.opportunities for update to authenticated
  using (
    (select public.current_role()) in ('direction_generale', 'commercial')
    or ((select public.current_role()) = 'responsable_pole' and (select public.current_pole()) = any (poles))
  )
  with check (
    (select public.current_role()) in ('direction_generale', 'commercial')
    or ((select public.current_role()) = 'responsable_pole' and (select public.current_pole()) = any (poles))
  );
create policy "opportunities_suppression" on public.opportunities for delete to authenticated using (
  (select public.current_role()) = 'commercial'
);

-- prospections, demandes_agrement, devis, ventes : même règle, pôle simple
do $$
declare
  t text;
begin
  foreach t in array array['prospections', 'demandes_agrement', 'devis', 'ventes'] loop
    execute format($f$
      create policy "%1$s_lecture" on public.%1$I for select to authenticated using (
        (select public.current_role()) in ('direction_generale', 'commercial')
        or ((select public.current_role()) = 'responsable_pole' and pole = (select public.current_pole()))
      );
      create policy "%1$s_creation" on public.%1$I for insert to authenticated with check (
        (select public.current_role()) = 'commercial'
        or ((select public.current_role()) = 'responsable_pole' and pole = (select public.current_pole()))
      );
      create policy "%1$s_modification" on public.%1$I for update to authenticated
        using (
          (select public.current_role()) in ('direction_generale', 'commercial')
          or ((select public.current_role()) = 'responsable_pole' and pole = (select public.current_pole()))
        )
        with check (
          (select public.current_role()) in ('direction_generale', 'commercial')
          or ((select public.current_role()) = 'responsable_pole' and pole = (select public.current_pole()))
        );
      create policy "%1$s_suppression" on public.%1$I for delete to authenticated using (
        (select public.current_role()) = 'commercial'
      );
    $f$, t);
  end loop;
end $$;

-- factures, paiements : finance uniquement (+ lecture direction) ; pas de suppression, annulation par statut
do $$
declare
  t text;
begin
  foreach t in array array['factures', 'paiements'] loop
    execute format($f$
      create policy "%1$s_lecture" on public.%1$I for select to authenticated using (
        (select public.current_role()) in ('direction_generale', 'finance_comptabilite')
      );
      create policy "%1$s_creation" on public.%1$I for insert to authenticated with check (
        (select public.current_role()) = 'finance_comptabilite'
      );
      create policy "%1$s_modification" on public.%1$I for update to authenticated
        using ((select public.current_role()) = 'finance_comptabilite')
        with check ((select public.current_role()) = 'finance_comptabilite');
    $f$, t);
  end loop;
end $$;

-- budgets : finance (+ lecture direction et responsable de pôle sur son pôle)
create policy "budgets_lecture" on public.budgets for select to authenticated using (
  (select public.current_role()) in ('direction_generale', 'finance_comptabilite')
  or ((select public.current_role()) = 'responsable_pole' and pole = (select public.current_pole()))
);
create policy "budgets_creation" on public.budgets for insert to authenticated with check (
  (select public.current_role()) = 'finance_comptabilite'
);
create policy "budgets_modification" on public.budgets for update to authenticated
  using ((select public.current_role()) = 'finance_comptabilite')
  with check ((select public.current_role()) = 'finance_comptabilite');

-- projets (pôles en tableau) ; pas de suppression, annulation par statut
create policy "projets_lecture" on public.projets for select to authenticated using (
  (select public.current_role()) in ('direction_generale', 'finance_comptabilite', 'back_office')
  or ((select public.current_role()) = 'responsable_pole' and (select public.current_pole()) = any (poles))
);
create policy "projets_creation" on public.projets for insert to authenticated with check (
  (select public.current_role()) = 'back_office'
  or ((select public.current_role()) = 'responsable_pole' and (select public.current_pole()) = any (poles))
);
create policy "projets_modification" on public.projets for update to authenticated
  using (
    (select public.current_role()) in ('direction_generale', 'back_office')
    or ((select public.current_role()) = 'responsable_pole' and (select public.current_pole()) = any (poles))
  )
  with check (
    (select public.current_role()) in ('direction_generale', 'back_office')
    or ((select public.current_role()) = 'responsable_pole' and (select public.current_pole()) = any (poles))
  );

-- tasks : chacun ses tâches ; responsable de pôle sur son pôle ; direction en lecture
create policy "tasks_lecture" on public.tasks for select to authenticated using (
  (select public.current_role()) = 'direction_generale'
  or ((select public.current_role()) in ('commercial', 'finance_comptabilite', 'back_office', 'responsable_pole')
      and (created_by = (select auth.uid()) or assigned_to = (select auth.uid())))
  or ((select public.current_role()) = 'responsable_pole' and pole = (select public.current_pole()))
);
create policy "tasks_creation" on public.tasks for insert to authenticated with check (
  ((select public.current_role()) in ('commercial', 'finance_comptabilite', 'back_office')
    and created_by = (select auth.uid()))
  or ((select public.current_role()) = 'responsable_pole'
    and (created_by = (select auth.uid()) or pole = (select public.current_pole())))
);
create policy "tasks_modification" on public.tasks for update to authenticated
  using (
    ((select public.current_role()) in ('commercial', 'finance_comptabilite', 'back_office', 'responsable_pole')
      and (created_by = (select auth.uid()) or assigned_to = (select auth.uid())))
    or ((select public.current_role()) = 'responsable_pole' and pole = (select public.current_pole()))
  )
  with check (
    ((select public.current_role()) in ('commercial', 'finance_comptabilite', 'back_office', 'responsable_pole')
      and (created_by = (select auth.uid()) or assigned_to = (select auth.uid())))
    or ((select public.current_role()) = 'responsable_pole' and pole = (select public.current_pole()))
  );

-- interactions : suivi commercial
create policy "interactions_lecture" on public.interactions for select to authenticated using (
  (select public.current_role()) in ('direction_generale', 'commercial')
  or ((select public.current_role()) = 'responsable_pole' and exists (
    select 1 from public.collaborateurs c where c.id = created_by and (select public.current_pole()) = any (c.poles)))
);
create policy "interactions_creation" on public.interactions for insert to authenticated with check (
  (select public.current_role()) = 'commercial'
);
create policy "interactions_modification" on public.interactions for update to authenticated
  using ((select public.current_role()) = 'commercial')
  with check ((select public.current_role()) = 'commercial');
create policy "interactions_suppression" on public.interactions for delete to authenticated using (
  (select public.current_role()) = 'commercial'
);

-- documents : visibles selon leur rattachement ; chacun modifie les siens
create policy "documents_lecture" on public.documents for select to authenticated using (
  (select public.current_role()) in ('direction_generale', 'back_office')
  or ((select public.current_role()) is not null and uploaded_by = (select auth.uid()))
  or ((select public.current_role()) = 'commercial' and client_id is not null)
  or ((select public.current_role()) = 'finance_comptabilite' and type = 'facture')
  or ((select public.current_role()) = 'responsable_pole' and exists (
    select 1 from public.projets p where p.id = projet_id and (select public.current_pole()) = any (p.poles)))
);
create policy "documents_creation" on public.documents for insert to authenticated with check (
  uploaded_by = (select auth.uid())
  and (
    (select public.current_role()) = 'back_office'
    or ((select public.current_role()) = 'commercial' and client_id is not null)
    or ((select public.current_role()) = 'finance_comptabilite' and type = 'facture')
    or ((select public.current_role()) = 'responsable_pole' and exists (
      select 1 from public.projets p where p.id = projet_id and (select public.current_pole()) = any (p.poles)))
  )
);
create policy "documents_modification" on public.documents for update to authenticated
  using ((select public.current_role()) is not null and uploaded_by = (select auth.uid()))
  with check ((select public.current_role()) is not null and uploaded_by = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 8. Migration des comptes existants vers profiles
-- ---------------------------------------------------------------------
-- Depuis collaborateurs (fiches dont l'id est un compte Auth)
insert into public.profiles (id, nom, prenom, email, telephone, fonction, pole, role, actif, collaborateur_id)
select
  c.id,
  coalesce(c.nom, ''),
  coalesce(c.prenom, ''),
  a.email,
  c.telephone,
  c.poste,
  case when c.poles[1] in (
    'ingénierie informatique', 'génie civil et BTP', 'agrobusiness', 'trading international',
    'transition énergétique', 'centre d''incubation et d''impulsion des entreprises'
  ) then c.poles[1] end,
  case
    when lower(coalesce(c.role, '')) like 'direction%' or lower(coalesce(c.poste, '')) like 'direction%'
      then 'direction_generale'
    when lower(coalesce(c.role, '')) in ('administrateur système', 'admin') then 'admin'
    when lower(coalesce(c.role, '')) = 'comptable' or lower(coalesce(c.poste, '')) = 'comptable'
      then 'finance_comptabilite'
    when lower(coalesce(c.role, '')) = 'commercial' then 'commercial'
    when lower(coalesce(c.role, '')) like 'responsable%' and c.poles[1] in (
      'ingénierie informatique', 'génie civil et BTP', 'agrobusiness', 'trading international',
      'transition énergétique', 'centre d''incubation et d''impulsion des entreprises'
    ) then 'responsable_pole'
    else 'back_office'
  end::public.app_role,
  coalesce(c.actif, true),
  c.id
from public.collaborateurs c
join auth.users a on a.id = c.id
on conflict (id) do nothing;

-- Depuis l'ancienne table users (002) : son pôle (table poles) n'a pas d'équivalent dans les 6 valeurs,
-- donc un « responsable » y devient back_office
insert into public.profiles (id, nom, prenom, email, pole, role, actif, collaborateur_id)
select
  u.id,
  coalesce(u.last_name, ''),
  coalesce(u.first_name, ''),
  a.email,
  null,
  case u.role::text
    when 'direction' then 'direction_generale'
    when 'admin' then 'admin'
    when 'commercial' then 'commercial'
    else 'back_office'
  end::public.app_role,
  coalesce(u.is_active, true),
  (select c.id from public.collaborateurs c where c.id = u.id)
from public.users u
join auth.users a on a.id = u.id
on conflict (id) do nothing;
