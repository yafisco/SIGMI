-- Corriger les politiques RLS sur ventes pour utiliser profiles.role
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les ventes" ON ventes;
DROP POLICY IF EXISTS "Les admin et back_office peuvent modifier les ventes" ON ventes;

CREATE POLICY "authenticated_can_view_ventes"
ON ventes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authorized_can_insert_ventes"
ON ventes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);

CREATE POLICY "authorized_can_update_ventes"
ON ventes FOR UPDATE
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

CREATE POLICY "authorized_can_delete_ventes"
ON ventes FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);
