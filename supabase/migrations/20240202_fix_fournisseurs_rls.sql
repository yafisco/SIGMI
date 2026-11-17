-- Supprimer les anciennes politiques RLS sur fournisseurs
DROP POLICY IF EXISTS "fournisseurs_select_policy" ON fournisseurs;
DROP POLICY IF EXISTS "fournisseurs_insert_policy" ON fournisseurs;
DROP POLICY IF EXISTS "fournisseurs_update_policy" ON fournisseurs;
DROP POLICY IF EXISTS "fournisseurs_delete_policy" ON fournisseurs;

-- Créer de nouvelles politiques basées sur profiles et role
CREATE POLICY "fournisseurs_select_policy"
ON fournisseurs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "fournisseurs_insert_policy"
ON fournisseurs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);

CREATE POLICY "fournisseurs_update_policy"
ON fournisseurs
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);

CREATE POLICY "fournisseurs_delete_policy"
ON fournisseurs
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('direction_generale', 'commercial', 'responsable_pole', 'admin')
  )
);
