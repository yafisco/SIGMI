# Guide de configuration de la base de données Supabase pour SIGMI

Ce guide explique comment configurer Supabase pour utiliser des données réelles dans SIGMI.

## 📋 Prérequis

- Un compte Supabase actif
- Le projet Supabase : `https://supabase.com/dashboard/project/xhgspkunwikvufrireqw`

## 🔧 Étape 1 : Appliquer la migration SQL

1. Connectez-vous au dashboard Supabase : https://supabase.com/dashboard/project/xhgspkunwikvufrireqw
2. Allez dans **SQL Editor** dans le menu de gauche
3. Cliquez sur **New Query**
4. Copiez le contenu du fichier `supabase/migrations/001_initial_schema.sql`
5. Collez-le dans l'éditeur SQL
6. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)

Cela va créer :
- ✅ 8 tables principales (collaborateurs, clients, contacts, opportunities, tasks, interactions, projets, documents)
- ✅ Des index pour optimiser les requêtes
- ✅ Des vues pour simplifier les jointures
- ✅ Des triggers pour la mise à jour automatique de `updated_at`
- ✅ Des politiques RLS (Row Level Security) permissives pour le développement
- ✅ Des données de démonstration

## 🔐 Étape 2 : Configurer les variables d'environnement

1. Ouvrez le fichier `.env.local` à la racine du projet
2. Vérifiez que les variables suivantes sont configurées :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xhgspkunwikvufrireqw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anonyme
```

3. Pour obtenir votre clé anonyme :
   - Allez sur https://supabase.com/dashboard/project/xhgspkunwikvufrireqw/settings/api
   - Copiez la valeur de **anon public** (Project URL keys)
   - Collez-la dans `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🧪 Étape 3 : Vérifier la connexion

Après avoir appliqué la migration et configuré les variables d'environnement :

1. Redémarrez le serveur de développement :
   ```bash
   npm run dev
   ```

2. Ouvrez l'application : http://localhost:3000

3. Testez les pages suivantes pour vérifier que les données réelles s'affichent :
   - `/clients` - Devrait afficher les clients de démonstration
   - `/collaborateurs` - Devrait afficher le collaborateur de démonstration
   - `/opportunites` - Devrait afficher l'opportunité de démonstration
   - `/taches` - Devrait afficher les tâches de démonstration

## 📊 Données de démonstration incluses

La migration inclut automatiquement des données de démonstration :

### Collaborateur
- **Ibrahim Diop** - Responsable Commercial (Trading International)

### Clients
- **Sénégal Énergie SA** - Client (Énergie, 500M FCFA)
- **Agro-Plus Sénégal** - Prospect (Agriculture, 200M FCFA)
- **Construction moderne** - Client (BTP, 800M FCFA)

### Opportunités
- **Projet solaire Dakar** - 50M FCFA, en négociation (75%)

### Tâches
- **Préparer proposition commerciale** - En cours, haute priorité
- **Appeler client Agro-Plus** - À faire, priorité moyenne

## 🚀 Étape 4 : Connecter les pages de création

Les pages de création (`/clients/create`, `/taches/create`, etc.) doivent maintenant être connectées aux services Supabase.

Les services sont déjà créés dans `src/lib/services/` :
- `clients.ts` - Service pour les clients
- `tasks.ts` - Service pour les tâches
- `opportunities.ts` - Service pour les opportunités
- `projets.ts` - Service pour les projets
- `collaborateurs.ts` - Service pour les collaborateurs
- `documents.ts` - Service pour les documents

Pour connecter une page de création, remplacez le `console.log` par un appel au service correspondant.

Exemple pour la page de création de client :

```typescript
// Dans src/app/clients/create/page.tsx
import { clientsService } from '@/lib/services/clients';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    await clientsService.create({
      nom: formData.nom,
      email: formData.email,
      telephone: formData.telephone,
      adresse: formData.adresse,
      ville: formData.ville,
      pays: formData.pays,
      secteur_activite: formData.secteur_activite,
      chiffre_affaires_annuel: formData.chiffre_affaires_annuel ? parseFloat(formData.chiffre_affaires_annuel) : undefined,
      nombre_employes: formData.nombre_employes ? parseInt(formData.nombre_employes) : undefined,
      statut: 'prospect',
    });
    
    router.push('/clients');
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    // Ajouter un message d'erreur à l'utilisateur
  }
};
```

## 🔍 Étape 5 : Connecter les pages de liste

Les pages de liste (`/clients`, `/taches`, etc.) utilisent déjà des hooks qui peuvent être connectés aux services.

Les hooks existants dans `src/hooks/` :
- `useCollaborateurs.ts` - Hook pour les collaborateurs
- `useProjets.ts` - Hook pour les projets
- `useDocuments.ts` - Hook pour les documents
- `useDashboardData.ts` - Hook pour les données du dashboard

Ces hooks doivent être mis à jour pour utiliser les services Supabase au lieu des données mockées.

## ⚠️ Notes importantes

### Sécurité RLS
Les politiques RLS actuelles sont permissives pour faciliter le développement. Pour la production, vous devez les restreindre :

```sql
-- Exemple : Seul l'utilisateur connecté peut modifier ses propres données
CREATE POLICY "Users can update own profile" ON collaborateurs
  FOR UPDATE USING (auth.uid() = id);
```

### Storage (Fichiers)
Pour l'upload de fichiers (documents), vous devez configurer le Storage Supabase :
1. Allez dans **Storage** dans le dashboard
2. Créez un bucket nommé `documents`
3. Configurez les politiques RLS pour le bucket

### Email
L'envoi d'emails (confirmation d'inscription) nécessite la configuration SMTP :
1. Allez dans **Authentication** → **Email Templates** → **SMTP Settings**
2. Configurez avec un provider (SendGrid, Mailgun, Resend)
3. Ou utilisez le service par défaut de Supabase

## 🐛 Dépannage

### Erreur "relation does not exist"
Cela signifie que la vue n'existe pas. Vérifiez que la migration a été correctement appliquée.

### Erreur "permission denied"
Cela signifie que les politiques RLS bloquent l'accès. Vérifiez que les politiques sont configurées correctement.

### Données ne s'affichent pas
1. Vérifiez que les variables d'environnement sont correctes
2. Vérifiez que la migration a été appliquée
3. Regardez la console du navigateur pour les erreurs
4. Regardez les logs Supabase pour les erreurs

## 📚 Ressources

- Documentation Supabase : https://supabase.com/docs
- Dashboard Supabase : https://supabase.com/dashboard/project/xhgspkunwikvufrireqw
- SQL Editor : https://supabase.com/dashboard/project/xhgspkunwikvufrireqw/sql/new
