-- Correction des politiques RLS pour la table ventes
-- Utilisation de la table profiles et de l'enum app_role

-- Activer RLS si pas déjà activé
ALTER TABLE ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_vente ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "authenticated_can_view_ventes" ON ventes;
DROP POLICY IF EXISTS "authorized_can_insert_ventes" ON ventes;
DROP POLICY IF EXISTS "authorized_can_update_ventes" ON ventes;
DROP POLICY IF EXISTS "authorized_can_delete_ventes" ON ventes;

DROP POLICY IF EXISTS "authenticated_can_view_lignes_vente" ON lignes_vente;
DROP POLICY IF EXISTS "authorized_can_insert_lignes_vente" ON lignes_vente;
DROP POLICY IF EXISTS "authorized_can_update_lignes_vente" ON lignes_vente;
DROP POLICY IF EXISTS "authorized_can_delete_lignes_vente" ON lignes_vente;

-- Politiques pour ventes

-- Tous les utilisateurs authentifiés peuvent lire les ventes
CREATE POLICY "authenticated_can_view_ventes"
ON ventes FOR SELECT
TO authenticated
USING (true);

-- Les rôles autorisés peuvent insérer des ventes
CREATE POLICY "authorized_can_insert_ventes"
ON ventes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'admin')
  )
);

-- Les rôles autorisés peuvent modifier des ventes
CREATE POLICY "authorized_can_update_ventes"
ON ventes FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'admin')
  )
);

-- Les rôles autorisés peuvent supprimer des ventes
CREATE POLICY "authorized_can_delete_ventes"
ON ventes FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'admin')
  )
);

-- Politiques pour lignes_vente

-- Tous les utilisateurs authentifiés peuvent lire les lignes de vente
CREATE POLICY "authenticated_can_view_lignes_vente"
ON lignes_vente FOR SELECT
TO authenticated
USING (true);

-- Les rôles autorisés peuvent insérer des lignes de vente
CREATE POLICY "authorized_can_insert_lignes_vente"
ON lignes_vente FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'admin')
  )
);

-- Les rôles autorisés peuvent modifier des lignes de vente
CREATE POLICY "authorized_can_update_lignes_vente"
ON lignes_vente FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'admin')
  )
);

-- Les rôles autorisés peuvent supprimer des lignes de vente
CREATE POLICY "authorized_can_delete_lignes_vente"
ON lignes_vente FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'admin')
  )
);
