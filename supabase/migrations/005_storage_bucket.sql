-- Configuration du bucket Storage pour les documents
-- Cette migration crée le bucket et configure les politiques RLS

-- Insertion du bucket "documents" dans storage.buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Activer RLS sur storage.objects (si pas déjà activé)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'upload de documents aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Politique pour permettre le téléchargement de documents aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Politique pour permettre la modification de documents aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');

-- Politique pour permettre la suppression de documents aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- Note: Pour la production, il est recommandé de:
-- 1. Changer le bucket en "private" (public = false)
-- 2. Utiliser des URLs signées temporaires
-- 3. Restreindre les types de fichiers autorisés
-- 4. Limiter la taille des fichiers
