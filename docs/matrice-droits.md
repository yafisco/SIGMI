# Matrice des droits SIGMI

Chaque compte de connexion est lié à **une personne** (table `profiles`, `id = auth.users.id`) et porte **un rôle** (`app_role`) et, si besoin, **un pôle**. Toute la sécurité des données est appliquée par le RLS de Supabase, via deux fonctions :

- `public.current_role()` : rôle de l'utilisateur connecté.
- `public.current_pole()` : pôle de l'utilisateur connecté.

Les deux sont `SECURITY DEFINER` avec `search_path` vide. Elles renvoient `NULL` si le profil est **désactivé** : un compte désactivé n'a plus aucun droit, même avec une session encore ouverte.

Migration de référence : `supabase/migrations/20261022130000_profils_roles_rls.sql`.

## Rôles

| Rôle (`app_role`) | Libellé | Espace d'arrivée |
|---|---|---|
| `direction_generale` | Direction générale | `/dashboard` |
| `commercial` | Commercial | `/commercial` |
| `finance_comptabilite` | Finance et comptabilité | `/finance` |
| `responsable_pole` | Responsable de pôle | `/poles/<pôle>` |
| `back_office` | Back office | `/dashboard` |
| `admin` | Administrateur | `/admin/utilisateurs` |

Un `responsable_pole` doit obligatoirement avoir un pôle (contrainte SQL).

## Matrice

L = lecture, C = création, M = modification, S = suppression. « pôle » = limité aux lignes du pôle de l'utilisateur. — = aucun accès.

| Données | Direction générale | Commercial | Finance / compta | Responsable de pôle | Back office | Admin |
|---|---|---|---|---|---|---|
| Comptes (`profiles`) | L | L (soi) | L (soi) | L (soi + son pôle) | L (soi) | L (écritures via le serveur) |
| Collaborateurs | L | L | L | L | L C M | L C M |
| Pôles (référentiel) | L | L | L | L | L | L |
| Clients, contacts | L | L C M S | L | L C M (pôle) | L C M | — |
| Opportunités, prospection, devis, ventes | L M | L C M S | — | L C M (pôle) | — | — |
| Demandes d'agrément | L M (décision) | L C M S | — | L C M (pôle) | — | — |
| Factures, paiements | L | — | L C M | — | — | — |
| Budgets | L | — | L C M | L (pôle) | — | — |
| Projets | L M | — | L | L C M (pôle) | L C M | — |
| Tâches | L | L C M (les siennes) | L C M (les siennes) | L C M (pôle + les siennes) | L C M (les siennes) | — |
| Interactions | L | L C M S | — | L (pôle) | — | — |
| Documents | L | L C (liés à un client) | L C (factures) | L C (projets du pôle) | L C | — |

Les documents sont modifiables par la personne qui les a déposés.

## Règles transverses

- **Direction générale** : lecture de tout ; écriture limitée à des `UPDATE` (validation d'opportunités, décisions d'agrément, statut des projets). Aucune création ni suppression.
- **Commercial** : aucun accès aux factures, paiements et budgets.
- **Back office** : saisie (création, modification) des clients, projets et collaborateurs, **sans suppression**.
- **Admin** : gestion des comptes et des rôles uniquement (moindre privilège). Il ne voit pas les données métier.
- **Pas de suppression** de factures, paiements ni projets : on les annule par leur statut (traçabilité).
- **Création des comptes** : uniquement par un admin depuis `/admin/utilisateurs`. Elle passe par des Server Actions qui utilisent la clé `service_role` côté serveur ; jamais côté client. Il n'y a plus d'inscription publique.
- **Désactivation** : `profiles.actif = false` (le RLS coupe l'accès) et blocage du compte Auth (`ban_duration`).

## Correspondance avec les anciens rôles

Appliquée une fois par la migration, pour les comptes existants :

| Ancien `collaborateurs.role` / `poste` (ou `users.role`) | Nouveau rôle |
|---|---|
| `direction`, `direction générale` | `direction_generale` |
| `administrateur système`, `admin` | `admin` |
| `commercial` | `commercial` |
| `comptable` | `finance_comptabilite` |
| `responsable de pôle` / `responsable` avec un pôle valide | `responsable_pole` |
| `gestionnaire de projet`, autres, `responsable` sans pôle | `back_office` |

## Pôles

Valeurs acceptées (domaine SQL `pole_sigmi`, identiques à `POLE_OPTIONS` dans `src/lib/constants`) :
`ingénierie informatique`, `génie civil et BTP`, `agrobusiness`, `trading international`, `transition énergétique`, `centre d'incubation et d'impulsion des entreprises`.

Les tables `clients`, `opportunities`, `projets` et `collaborateurs` portent un tableau `poles` ; les autres tables portent une colonne `pole`.

## Vérifier

```bash
node scripts/test-roles.mjs
```

Le script se connecte avec un compte fictif par rôle et compare, table par table, ce qui est réellement autorisé avec cette matrice.
