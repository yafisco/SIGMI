# Configuration de Supabase Storage pour SIGMI

Ce guide explique comment configurer Supabase Storage pour permettre l'upload de fichiers dans SIGMI.

## Étape 1 : Créer un bucket de stockage

1. Allez sur le dashboard Supabase : https://supabase.com/dashboard/project/xhgspkunwikvufrireqw
2. Cliquez sur **Storage** dans le menu de gauche
3. Cliquez sur **New bucket**
4. Nommez le bucket : `documents`
5. Choisissez **Public bucket** (pour l'instant, pour le développement)
6. Cliquez sur **Create bucket**

## Étape 2 : Configurer les politiques RLS du bucket

Une fois le bucket créé, configurez les politiques RLS :

1. Dans le bucket `documents`, cliquez sur **Policies**
2. Créez une nouvelle politique **New policy**
3. Nom : `documents-upload-policy`
4. Allowed operations : SELECT, INSERT, UPDATE, DELETE
5. Target roles : authenticated
6. Policy definition (using builder) :

```sql
CREATE POLICY "authenticated_users_can_all"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
```

Ou utilisez le SQL Editor :

```sql
-- Activer RLS sur le bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
```

## Étape 3 : Vérifier la configuration

1. Dans Storage → documents, vous devriez voir votre bucket
2. Essayez d'uploader un fichier manuellement pour tester
3. Vérifiez que le fichier apparaît dans la liste

## Étape 4 : Types de fichiers autorisés

Pour des raisons de sécurité, vous pouvez limiter les types de fichiers autorisés. Ajoutez cette règle dans la politique INSERT :

```sql
CREATE POLICY "Only allow document files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (name LIKE '%.pdf' OR
   name LIKE '%.doc' OR
   name LIKE '%.docx' OR
   name LIKE '%.xls' OR
   name LIKE '%.xlsx' OR
   name LIKE '%.ppt' OR
   name LIKE '%.pptx' OR
   name LIKE '%.jpg' OR
   name LIKE '%.jpeg' OR
   name LIKE '%.png')
);
```

## Étape 5 : Limite de taille des fichiers

Par défaut, Supabase permet des fichiers jusqu'à 50MB. Pour augmenter cette limite :

1. Allez dans **Settings** → **General**
2. Cherchez **File size limit**
3. Modifiez la limite si nécessaire (par exemple 100MB)

## Dépannage

### Erreur "Bucket not found"
- Vérifiez que le bucket `documents` existe bien
- Vérifiez l'orthographe exacte du nom du bucket

### Erreur "Permission denied"
- Vérifiez que les politiques RLS sont activées
- Vérifiez que vous êtes connecté (utilisateur authentifié)
- Vérifiez que les politiques incluent le rôle `authenticated`

### Erreur "File too large"
- Vérifiez la limite de taille des fichiers dans les paramètres Supabase
- Réduisez la taille du fichier ou augmentez la limite

## Notes importantes

- Pour la production, utilisez un bucket **Private** et générez des URLs signées temporaires
- Les fichiers uploadés sont stockés dans le cloud Supabase
- L'URL du fichier sera : `https://xhgspkunwikvufrireqw.supabase.co/storage/v1/object/public/documents/filename.ext`
