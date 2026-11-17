-- Corriger les politiques RLS sur lignes_devis pour utiliser profiles.role
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les lignes de devis" ON lignes_devis;
DROP POLICY IF EXISTS "Les admin et back_office peuvent modifier les lignes de devis" ON lignes_devis;

CREATE POLICY "authenticated_can_view_lignes_devis"
ON lignes_devis FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authorized_can_insert_lignes_devis"
ON lignes_devis FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);

CREATE POLICY "authorized_can_update_lignes_devis"
ON lignes_devis FOR UPDATE
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

CREATE POLICY "authorized_can_delete_lignes_devis"
ON lignes_devis FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);
