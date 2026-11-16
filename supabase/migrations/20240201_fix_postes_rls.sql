-- Correction des politiques RLS pour la table postes
-- Utilisation de la table profiles et de l'enum app_role

-- Activer RLS si pas déjà activé
ALTER TABLE postes ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "authenticated_can_view_postes" ON postes;
DROP POLICY IF EXISTS "authorized_can_insert_postes" ON postes;
DROP POLICY IF EXISTS "authorized_can_update_postes" ON postes;
DROP POLICY IF EXISTS "authorized_can_delete_postes" ON postes;

-- Politiques basées sur la table profiles et app_role

-- Tous les utilisateurs authentifiés peuvent lire les postes
CREATE POLICY "authenticated_can_view_postes"
ON postes FOR SELECT
TO authenticated
USING (true);

-- Les rôles autorisés peuvent insérer des postes
CREATE POLICY "authorized_can_insert_postes"
ON postes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'admin')
  )
);

-- Les rôles autorisés peuvent modifier des postes
CREATE POLICY "authorized_can_update_postes"
ON postes FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'admin')
  )
);

-- Les rôles autorisés peuvent supprimer des postes
CREATE POLICY "authorized_can_delete_postes"
ON postes FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'admin')
  )
);
