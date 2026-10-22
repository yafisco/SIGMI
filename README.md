# SIGMI, Système d'Information de GROUP MI

SIGMI centralise les clients, opportunités, projets, collaborateurs, documents et factures des 6 pôles de GROUP MI (Ingénierie informatique, Génie civil et BTP, Agrobusiness, Trading international, Transition énergétique, Centre d'incubation et d'impulsion des entreprises), avec un espace de travail par profil (direction, commercial, trésorerie, pôle).

Stack : Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4, Supabase (PostgreSQL, Auth, Storage, RLS).

> Dépôt privé, propriété de GROUP MI. Ne jamais y committer de données réelles de clients ni de clés secrètes.

## Prérequis

- Node.js 20.9 ou plus récent (exigé par Next.js 16)
- npm
- Un projet Supabase (un projet distinct par environnement : développement, préproduction, production)
- Pour appliquer les migrations : le [CLI Supabase](https://supabase.com/docs/guides/local-development/cli/getting-started) (`npx supabase ...` suffit)

## Installation

```bash
git clone <url-du-depot> sigmi
cd sigmi
npm install
cp .env.example .env.local
```

Renseigner ensuite `.env.local` (voir ci-dessous).

## Variables d'environnement

| Variable | Obligatoire | Où la trouver | Exposée au navigateur |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | oui | Dashboard Supabase > Project Settings > API | oui |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | oui | Même page : clé **publishable** (`sb_publishable_...`) ou ancienne clé `anon` | oui |

Règles :

- Tout ce qui commence par `NEXT_PUBLIC_` est inclus dans le JavaScript envoyé au navigateur. Seule la clé publique y a sa place : la sécurité des données repose entièrement sur les politiques RLS.
- La clé **secrète / `service_role`** contourne le RLS. Elle ne doit jamais apparaître dans `.env.local` sous un nom `NEXT_PUBLIC_*`, ni dans le code client, ni dans le dépôt. L'application n'en a pas besoin aujourd'hui.
- `.env.local` est ignoré par git (`.gitignore` exclut `.env*` sauf `.env.example`).
- Les variables sont lues **au moment du build** : elles doivent être définies sur la plateforme de déploiement avant de lancer `npm run build`, sinon le build échoue.

## Base de données et migrations

Le schéma vit dans `supabase/migrations/`. Règle du projet : tout changement de schéma passe par un nouveau fichier de migration, jamais par une modification directe en production ni dans le SQL Editor.

### Appliquer les migrations sur un projet Supabase

```bash
npx supabase login
npx supabase link --project-ref <ref-du-projet>
npx supabase db push
```

`db push` applique, dans l'ordre des noms de fichiers, les migrations pas encore enregistrées dans le projet distant.

### État actuel (à lire avant un premier déploiement)

L'historique actuel **n'est pas rejouable tel quel** sur une base vide ; `db push` échouera :

- `001_initial_schema.sql` commence par des `DROP TABLE ... CASCADE` (destructif si rejoué sur une base contenant des données).
- `002` et `003` visent des tables qui n'existent pas (`users`, `poles`, `client_poles`).
- `004` crée des politiques sur une colonne `poles` absente de `clients`, `contacts`, `documents`, `tasks`, `interactions`.
- Deux fichiers portent la même version `20240215_*` (conflit pour le CLI) et deux fichiers contiennent des `\'`, invalides en SQL.
- Les politiques permissives (`USING (true)`) des premières migrations ne sont jamais supprimées, donc le RLS reste ouvert.

Avant la préproduction, il faut consolider ces fichiers en une migration de référence propre (schéma actuel + RLS par rôle), puis repartir de là. Les données de démonstration doivent aller dans `supabase/seed.sql`, avec des données fictives uniquement.

### Storage

Le bucket `documents` est créé par `005_storage_bucket.sql`. Il est actuellement public ; pour la préproduction il doit passer en privé avec des URL signées.

## Lancement

```bash
npm run dev     # serveur de développement sur http://localhost:3000
npm run lint    # ESLint
npm run build   # build de production (vérifie aussi les types)
npm run start   # sert le build de production
```

## Déploiement (préproduction)

Recommandé : Vercel, avec un projet Supabase dédié à la préproduction.

1. Importer le dépôt GitHub dans Vercel.
2. Définir `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` du projet Supabase de préproduction (environnements Preview et Production selon le besoin).
3. Brancher la branche `dev` sur l'environnement de préproduction, `main` sur la production.
4. Dans Supabase > Authentication > URL Configuration, ajouter l'URL de préproduction aux Redirect URLs (callback `/auth/callback`).

## Organisation du code

```
src/
  app/            Routes (App Router) : /clients, /opportunites, /projets, /taches,
                  /collaborateurs, /documents, /contacts, /interactions, /pipeline,
                  /poles/[pole], /commercial, /tresorerie, /dashboard, /login, /register
  components/     Composants partagés (ui/ = composants de base style shadcn)
  hooks/          useAuth, useWorkspace, useData, ...
  lib/services/   Accès aux données Supabase, un service par entité
  lib/supabase/   Client Supabase navigateur (@supabase/ssr)
  proxy.ts        Rafraîchissement de la session Supabase (équivalent du middleware)
  types/          Types TypeScript partagés
supabase/migrations/  Migrations SQL
```

Les pages sont des Client Components qui interrogent Supabase directement depuis le navigateur : le RLS est la seule barrière de sécurité côté données.

## Branches

- `main` : code stable, déployé en production.
- `dev` : intégration et préproduction. Les fonctionnalités partent de `dev` et y reviennent par pull request.

## Documentation complémentaire

- [MVP_CHECKLIST.md](./MVP_CHECKLIST.md), [PLAN_DE_TESTS.md](./PLAN_DE_TESTS.md)
- Guides de configuration Supabase : [SETUP_DATABASE.md](./SETUP_DATABASE.md), [SETUP_RLS.md](./SETUP_RLS.md), [SETUP_STORAGE.md](./SETUP_STORAGE.md), [SETUP_EMAIL_CONFIRMATION.md](./SETUP_EMAIL_CONFIRMATION.md)

## Licence

Propriétaire, tous droits réservés GROUP MI.
