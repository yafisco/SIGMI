# Instructions pour connecter SIGMI à la base de données réelle

## 📋 Résumé

J'ai créé le schéma de base de données Supabase complet pour SIGMI. Voici les étapes pour utiliser des données réelles.

## 🔧 Étape 1 : Appliquer la migration SQL

1. Allez sur : https://supabase.com/dashboard/project/xhgspkunwikvufrireqw/sql/new
2. Copiez le contenu du fichier : `supabase/migrations/001_initial_schema.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **Run**

Cela créera :
- ✅ 8 tables (collaborateurs, clients, contacts, opportunities, tasks, interactions, projets, documents)
- ✅ Index pour optimisation
- ✅ Vues pour simplifier les jointures
- ✅ Triggers pour updated_at automatique
- ✅ Politiques RLS permissives
- ✅ Données de démonstration

## 🔐 Étape 2 : Vérifier les variables d'environnement

Ouvrez `.env.local` et vérifiez :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xhgspkunwikvufrireqw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anonyme
```

Pour obtenir la clé anonyme :
1. Allez sur : https://supabase.com/dashboard/project/xhgspkunwikvufrireqw/settings/api
2. Copiez la valeur de **anon public**

## ✅ Étape 3 : Pages déjà connectées

J'ai déjà connecté la page de création de client :
- ✅ `/clients/create` - Utilise `clientsService.create()`

## 🚧 Étape 4 : Pages à connecter (à faire)

Les pages suivantes doivent être connectées aux services Supabase :

### Tâches
Dans `src/app/taches/create/page.tsx` :
```typescript
import { tasksService } from '@/lib/services/tasks';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    await tasksService.create({
      title: formData.title,
      description: formData.description,
      status: 'todo',
      priority: formData.priority,
      due_date: formData.due_date || undefined,
      assigned_to: formData.assigned_to || undefined,
      created_by: 'user-id', // Remplacer par l'ID réel de l'utilisateur connecté
    });
    
    router.push('/taches');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Opportunités
Dans `src/app/opportunites/create/page.tsx` :
```typescript
import { opportunitiesService } from '@/lib/services/opportunities';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    await opportunitiesService.create({
      name: formData.title,
      description: formData.description,
      client_id: formData.client_id || undefined,
      amount: parseFloat(formData.amount) || 0,
      stage: formData.stage,
      probability: formData.probability,
      expected_close_date: formData.expected_close_date || undefined,
      assigned_to: 'user-id', // Remplacer par l'ID réel
    });
    
    router.push('/opportunites');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Contacts
Dans `src/app/contacts/create/page.tsx` :
Créer d'abord le service `contacts.ts` dans `src/lib/services/` puis connecter la page.

### Projets
Dans `src/app/projets/create/page.tsx` :
```typescript
import { projetsService } from '@/lib/services/projets';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    await projetsService.create({
      nom: formData.nom,
      description: formData.description,
      poles: formData.poles[0] ? [formData.poles[0] as Pole] : [],
      responsable_id: formData.responsable_id || undefined,
      equipe: [],
      statut: formData.statut,
      priorite: formData.priorite,
      date_debut: formData.date_debut || undefined,
      date_fin_prevue: formData.date_fin_prevue || undefined,
      budget_estime: formData.budget ? parseFloat(formData.budget) : undefined,
      livrables: [],
    });
    
    router.push('/projets');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Collaborateurs
Dans `src/app/collaborateurs/create/page.tsx` :
```typescript
import { collaborateursService } from '@/lib/services/collaborateurs';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    await collaborateursService.create({
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone || undefined,
      poste: formData.poste,
      role: formData.role,
      poles: formData.poles[0] ? [formData.poles[0] as Pole] : [],
      date_embauche: formData.date_embauche || undefined,
    });
    
    router.push('/collaborateurs');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Documents
Dans `src/app/documents/create/page.tsx` :
```typescript
import { documentsService } from '@/lib/services/documents';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    // Upload du fichier vers Supabase Storage
    // Puis création du document
    await documentsService.create({
      nom: formData.nom,
      description: formData.description,
      type: formData.type,
      statut: formData.statut,
      fichier_url: 'url-du-fichier',
      fichier_nom: formData.file?.name || '',
      fichier_taille: formData.file?.size || 0,
      uploaded_by: 'user-id',
      tags: formData.tags.split(',').map(t => t.trim()),
    });
    
    router.push('/documents');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## 📊 Étape 5 : Connecter les pages de liste

Les pages de liste utilisent des données mockées. Pour utiliser des données réelles :

### Clients
Dans `src/app/clients/page.tsx` :
```typescript
import { clientsService } from '@/lib/services/clients';

// Dans le composant
const [clients, setClients] = useState<Client[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadClients = async () => {
    try {
      const data = await clientsService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };
  
  loadClients();
}, []);
```

Faire de même pour les autres pages : tâches, opportunités, interactions, projets, collaborateurs, documents.

## 🧪 Étape 6 : Tester

1. Redémarrez le serveur : `npm run dev`
2. Allez sur http://localhost:3000
3. Testez la création d'un client
4. Vérifiez que le client apparaît dans la liste
5. Vérifiez dans Supabase Dashboard que la donnée est bien créée

## 📚 Documentation complète

Voir `SETUP_DATABASE.md` pour plus de détails sur la configuration.
