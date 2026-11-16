-- Correction des politiques RLS pour la table projets
-- Utilisation de la table profiles et de l'enum app_role au lieu de collaborateurs

-- Supprimer les anciennes politiques sur projets
DROP POLICY IF EXISTS "admins_can_view_all_projets" ON projets;
DROP POLICY IF EXISTS "users_can_view_pole_projets" ON projets;
DROP POLICY IF EXISTS "admins_can_insert_projets" ON projets;
DROP POLICY IF EXISTS "users_can_insert_projets" ON projets;
DROP POLICY IF EXISTS "admins_can_update_all_projets" ON projets;
DROP POLICY IF EXISTS "users_can_update_pole_projets" ON projets;
DROP POLICY IF EXISTS "admins_can_delete_projets" ON projets;

-- Politiques basées sur la table profiles et app_role

-- Tous les utilisateurs authentifiés peuvent lire les projets
CREATE POLICY "authenticated_can_view_projets"
ON projets FOR SELECT
TO authenticated
USING (true);

-- Les rôles autorisés peuvent insérer des projets
CREATE POLICY "authorized_can_insert_projets"
ON projets FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);

-- Les rôles autorisés peuvent modifier des projets
CREATE POLICY "authorized_can_update_projets"
ON projets FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);

-- Les rôles autorisés peuvent supprimer des projets
CREATE POLICY "authorized_can_delete_projets"
ON projets FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);
