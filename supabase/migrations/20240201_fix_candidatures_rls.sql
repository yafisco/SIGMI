-- Correction des politiques RLS pour la table candidatures
-- Utilisation de la table profiles et de l'enum app_role

-- Activer RLS si pas déjà activé
ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "authenticated_can_view_candidatures" ON candidatures;
DROP POLICY IF EXISTS "authorized_can_insert_candidatures" ON candidatures;
DROP POLICY IF EXISTS "authorized_can_update_candidatures" ON candidatures;
DROP POLICY IF EXISTS "authorized_can_delete_candidatures" ON candidatures;

-- Politiques basées sur la table profiles et app_role

-- Tous les utilisateurs authentifiés peuvent lire les candidatures
CREATE POLICY "authenticated_can_view_candidatures"
ON candidatures FOR SELECT
TO authenticated
USING (true);

-- Les rôles autorisés peuvent insérer des candidatures
CREATE POLICY "authorized_can_insert_candidatures"
ON candidatures FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'admin')
  )
);

-- Les rôles autorisés peuvent modifier des candidatures
CREATE POLICY "authorized_can_update_candidatures"
ON candidatures FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'admin')
  )
);

-- Les rôles autorisés peuvent supprimer des candidatures
CREATE POLICY "authorized_can_delete_candidatures"
ON candidatures FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'admin')
  )
);
