-- Correction des politiques RLS pour la table sources_prospects
-- Utilisation de la table profiles et de l'enum app_role

-- Activer RLS si pas déjà activé
ALTER TABLE sources_prospects ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "authenticated_can_view_sources_prospects" ON sources_prospects;
DROP POLICY IF EXISTS "authorized_can_insert_sources_prospects" ON sources_prospects;
DROP POLICY IF EXISTS "authorized_can_update_sources_prospects" ON sources_prospects;
DROP POLICY IF EXISTS "authorized_can_delete_sources_prospects" ON sources_prospects;

-- Politiques basées sur la table profiles et app_role

-- Tous les utilisateurs authentifiés peuvent lire les sources de prospects
CREATE POLICY "authenticated_can_view_sources_prospects"
ON sources_prospects FOR SELECT
TO authenticated
USING (true);

-- Les rôles autorisés peuvent insérer des sources de prospects
CREATE POLICY "authorized_can_insert_sources_prospects"
ON sources_prospects FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'admin')
  )
);

-- Les rôles autorisés peuvent modifier des sources de prospects
CREATE POLICY "authorized_can_update_sources_prospects"
ON sources_prospects FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'admin')
  )
);

-- Les rôles autorisés peuvent supprimer des sources de prospects
CREATE POLICY "authorized_can_delete_sources_prospects"
ON sources_prospects FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'admin')
  )
);
