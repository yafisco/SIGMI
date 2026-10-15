# Guide d'Installation des RLS (Row Level Security)

Ce guide explique comment configurer les politiques de sécurité RLS Supabase pour SIGMI.

## 🎯 Qu'est-ce que le RLS ?

Le RLS (Row Level Security) est une fonctionnalité de PostgreSQL qui permet de restreindre l'accès aux données au niveau des lignes. Cela signifie que chaque utilisateur ne peut voir et modifier que les données auxquelles il a accès, selon son rôle et ses pôles.

## 🔒 Politiques implémentées

### Rôles et Permissions

**Administrateurs** (direction, administrateur système) :
- ✅ Lecture, création, modification, suppression de TOUTES les données
- ✅ Accès à tous les pôles
- ✅ Gestion complète des collaborateurs

**Membres de pôle** (responsable de pôle, commercial, gestionnaire de projet) :
- ✅ Lecture des données de leur pôle uniquement
- ✅ Création de données pour leur pôle
- ✅ Modification des données de leur pôle
- ❌ Accès interdit aux autres pôles
- ❌ Suppression limitée (réservée aux admins)

**Utilisateurs standards** :
- ✅ Lecture de leur propre profil
- ✅ Modification de leur propre profil
- ✅ Lecture des tâches qui leur sont assignées
- ✅ Lecture de leurs propres interactions

## 📋 Tables protégées

1. **clients** - Gestion des clients
2. **opportunities** - Opportunités commerciales
3. **projets** - Projets
4. **collaborateurs** - Collaborateurs
5. **contacts** - Contacts
6. **documents** - Documents
7. **tasks** - Tâches
8. **interactions** - Interactions

## 🚀 Installation

### Étape 1 : Accéder au Dashboard Supabase

1. Connectez-vous à [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet SIGMI

### Étape 2 : Appliquer la migration

Il y a deux méthodes pour appliquer les RLS :

#### Méthode A : Via l'interface Supabase (Recommandée)

1. Allez dans **SQL Editor** dans le menu de gauche
2. Cliquez sur **New Query**
3. Copiez le contenu du fichier `supabase/migrations/004_rls_policies.sql`
4. Collez-le dans l'éditeur
5. Cliquez sur **Run** (ou `Ctrl+Enter`)
6. Attendez que l'exécution se termine avec succès

#### Méthode B : Via CLI Supabase

Si vous avez installé le CLI Supabase :

```bash
# Assurez-vous d'être dans le dossier du projet
cd crm-group-mi

# Appliquer la migration
supabase db push
```

### Étape 3 : Vérifier l'installation

1. Allez dans **Database** → **Policies**
2. Vous devriez voir les politiques créées pour chaque table
3. Chaque table devrait avoir plusieurs politiques (admin, pole, etc.)

## ✅ Tester les RLS

### Test 1 : Créer un utilisateur de test

1. Créez un utilisateur avec le rôle "commercial" et assigné à un pôle
2. Connectez-vous avec cet utilisateur
3. Vérifiez que vous ne voyez que les données de votre pôle

### Test 2 : Tester avec un administrateur

1. Créez un utilisateur avec le rôle "administrateur système"
2. Connectez-vous avec cet utilisateur
3. Vérifiez que vous voyez TOUTES les données

### Test 3 : Tester les restrictions

1. Connectez-vous avec un utilisateur de pôle
2. Essayez d'accéder à une ressource d'un autre pôle
3. Vous devriez recevoir une erreur 403 ou ne rien voir

## 🔧 Personnalisation

Si vous devez modifier les politiques :

1. Ouvrez le fichier `supabase/migrations/004_rls_policies.sql`
2. Modifiez les politiques selon vos besoins
3. Réappliquez la migration via SQL Editor ou CLI

## 📝 Notes importantes

- Les RLS sont appliqués au niveau de la base de données, pas dans l'application
- Les politiques côté client sont pour l'UX, les RLS sont pour la sécurité
- Assurez-vous que les collaborateurs ont le bon rôle et les bons pôles
- Les utilisateurs sans pôle assigné peuvent voir les données sans pôle spécifié

## 🐗 Dépannage

### Problème : "Permission denied" sur une table

**Solution** : Vérifiez que la table a RLS activé et que des politiques existent.

### Problème : Un utilisateur ne voit pas les données de son pôle

**Solution** : Vérifiez que :
- L'utilisateur a le bon pôle dans la table `collaborateurs`
- Le pôle est correctement orthographié
- Les données ont le pôle dans leur tableau

### Problème : Les administrateurs ne peuvent pas tout voir

**Solution** : Vérifiez que :
- Le rôle est exactement "direction" ou "administrateur système"
- La fonction `is_admin()` fonctionne correctement

## 📚 Ressources

- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## ✅ Après l'installation

Une fois les RLS installés :

1. ✅ Mettez à jour le MVP_CHECKLIST.md (Permissions : 100%)
2. ✅ Testez toutes les fonctionnalités avec différents rôles
3. ✅ Déployez en production si tout fonctionne correctement

Le MVP SIGMI sera alors **100% complet** et sécurisé ! 🎉
