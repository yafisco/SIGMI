-- Bucket public pour les documents et pièces jointes
-- Accessible pour tous les utilisateurs connectés

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'documents',
  'documents',
  true,
  104857600 -- 100 MB
)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS pour le bucket
-- Tout le monde peut uploader
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Tout le monde peut lire les fichiers
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Tout le monde peut supprimer ses propres fichiers
CREATE POLICY "Authenticated users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (metadata->>'owner')::text = auth.uid()::text
  OR metadata->>'owner' IS NULL
);
