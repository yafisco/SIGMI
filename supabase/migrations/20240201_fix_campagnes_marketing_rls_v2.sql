-- Correction des politiques RLS pour la table campagnes_marketing
-- Utilisation de la table profiles et de l'enum app_role

-- Activer RLS si pas déjà activé
ALTER TABLE campagnes_marketing ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "authenticated_can_view_campagnes_marketing" ON campagnes_marketing;
DROP POLICY IF EXISTS "authorized_can_insert_campagnes_marketing" ON campagnes_marketing;
DROP POLICY IF EXISTS "authorized_can_update_campagnes_marketing" ON campagnes_marketing;
DROP POLICY IF EXISTS "authorized_can_delete_campagnes_marketing" ON campagnes_marketing;

-- Politiques basées sur la table profiles et app_role

-- Tous les utilisateurs authentifiés peuvent lire les campagnes marketing
CREATE POLICY "authenticated_can_view_campagnes_marketing"
ON campagnes_marketing FOR SELECT
TO authenticated
USING (true);

-- Les rôles autorisés peuvent insérer des campagnes marketing
CREATE POLICY "authorized_can_insert_campagnes_marketing"
ON campagnes_marketing FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'admin')
  )
);

-- Les rôles autorisés peuvent modifier des campagnes marketing
CREATE POLICY "authorized_can_update_campagnes_marketing"
ON campagnes_marketing FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'admin')
  )
);

-- Les rôles autorisés peuvent supprimer des campagnes marketing
CREATE POLICY "authorized_can_delete_campagnes_marketing"
ON campagnes_marketing FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'admin')
  )
);
