-- Bucket privé pour les pièces jointes des demandes d'agrément
-- Les fichiers ne sont accessibles que par les personnes autorisées

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agrements_pieces_jointes',
  'agrements_pieces_jointes',
  false,
  104857600, -- 100 MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS pour le bucket
-- Seuls les rôles back_office, commercial et admin peuvent uploader
CREATE POLICY "back_office commercial admin can upload agreements attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'agrements_pieces_jointes'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('back_office', 'commercial', 'admin')
  )
);

-- Tout le monde peut lire les fichiers via URL signée
CREATE POLICY "Authenticated users can read agreements attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'agrements_pieces_jointes');

-- Seuls les rôles back_office et admin peuvent supprimer
CREATE POLICY "back_office and admin can delete agreements attachments"
ON storage.objects FOR DELETE
TO authenticated
WITH CHECK (
  bucket_id = 'agrements_pieces_jointes'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('back_office', 'admin')
  )
);
