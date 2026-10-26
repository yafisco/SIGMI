# Configuration de la synchronisation en temps réel (Realtime)

## Qu'est-ce que c'est ?

La synchronisation en temps réel permet au CRM de se mettre à jour automatiquement dès que de nouvelles données sont ajoutées, modifiées ou supprimées dans la base de données, sans avoir à rafraîchir la page.

## Étapes d'activation sur Supabase

### 1. Activer Realtime sur votre projet Supabase

1. Connectez-vous à votre dashboard Supabase
2. Allez dans **Settings** → **API**
3. Cherchez la section **Realtime**
4. Cliquez sur **Enable Realtime**
5. Ajoutez les tables que vous voulez synchroniser :
   - `clients`
   - `opportunites`
   - `interactions`
   - `demandes_agrement`
   - `projets`
   - `taches`
   - `documents`
   - `produits`
   - `ventes`
   - `devis`
   - `mouvements_stock`

### 2. Configurer la replication (Automatic Realtime)

1. Allez dans **Database** → **Replication**
2. Activez la replication pour chaque table :
   - Sélectionnez la table
   - Cochez **Enable Realtime**
   - Sélectionnez les opérations : `INSERT`, `UPDATE`, `DELETE`

## Utilisation dans le code

Le hook `useRealtime` est déjà créé dans `src/hooks/useRealtime.ts` et peut être utilisé sur n'importe quelle page.

### Exemple d'utilisation :

```typescript
import { useRealtime } from '@/hooks/useRealtime';

function MaPage() {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    // Votre logique de chargement des données
    const { data } = await supabase.from('clients').select('*');
    setData(data);
  };

  // Charger les données au montage
  useEffect(() => {
    fetchData();
  }, []);

  // Synchroniser en temps réel
  useRealtime(['clients', 'opportunites'], fetchData);

  return (
    // Votre JSX
  );
}
```

## Pages déjà configurées

Les pages suivantes utilisent déjà la synchronisation en temps réel :

1. **Page Prospection** (`/commercial/prospection`)
   - Tables : `clients`, `interactions`, `demandes_agrement`, `opportunites`

2. **Page Commercial** (`/commercial`)
   - Tables : `opportunites`, `clients`

## Pour les autres pages

Pour ajouter la synchronisation sur d'autres pages :

1. Importez le hook :
```typescript
import { useRealtime } from '@/hooks/useRealtime';
```

2. Ajoutez l'appel après votre `useEffect` de chargement :
```typescript
useRealtime(['nom_table'], fetchData);
```

## Avantages

- ✅ Mise à jour automatique sans rafraîchissement
- ✅ Collaboration en temps réel entre utilisateurs
- ✅ Meilleure expérience utilisateur
- ✅ Notifications instantanées des changements

## Notes importantes

- La synchronisation ne fonctionne que si Realtime est activé sur Supabase
- Assurez-vous que les tables sont activées dans les settings
- Le hook se désabonne automatiquement lors du démontage du composant
