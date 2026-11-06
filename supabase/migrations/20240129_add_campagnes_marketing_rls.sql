-- Activer RLS sur campagnes_marketing
ALTER TABLE campagnes_marketing ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir toutes les campagnes
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les campagnes" ON campagnes_marketing;
CREATE POLICY "Les utilisateurs peuvent voir les campagnes"
  ON campagnes_marketing FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Politique : Les utilisateurs peuvent créer des campagnes
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des campagnes" ON campagnes_marketing;
CREATE POLICY "Les utilisateurs peuvent créer des campagnes"
  ON campagnes_marketing FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Politique : Les utilisateurs peuvent modifier leurs propres campagnes
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs campagnes" ON campagnes_marketing;
CREATE POLICY "Les utilisateurs peuvent modifier leurs campagnes"
  ON campagnes_marketing FOR UPDATE
  USING (created_by = auth.uid());

-- Politique : Les utilisateurs peuvent supprimer leurs propres campagnes
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs campagnes" ON campagnes_marketing;
CREATE POLICY "Les utilisateurs peuvent supprimer leurs campagnes"
  ON campagnes_marketing FOR DELETE
  USING (created_by = auth.uid());

-- Politique : Les admins et DG peuvent modifier toutes les campagnes
DROP POLICY IF EXISTS "Les admins peuvent modifier toutes les campagnes" ON campagnes_marketing;
CREATE POLICY "Les admins peuvent modifier toutes les campagnes"
  ON campagnes_marketing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'direction_generale')
    )
  );
