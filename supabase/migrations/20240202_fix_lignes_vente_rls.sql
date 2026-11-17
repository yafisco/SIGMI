-- Corriger les politiques RLS sur lignes_vente pour utiliser profiles.role
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les lignes de vente" ON lignes_vente;
DROP POLICY IF EXISTS "Les admin et back_office peuvent modifier les lignes de vente" ON lignes_vente;

CREATE POLICY "authenticated_can_view_lignes_vente"
ON lignes_vente FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authorized_can_insert_lignes_vente"
ON lignes_vente FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);

CREATE POLICY "authorized_can_update_lignes_vente"
ON lignes_vente FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);

CREATE POLICY "authorized_can_delete_lignes_vente"
ON lignes_vente FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);
