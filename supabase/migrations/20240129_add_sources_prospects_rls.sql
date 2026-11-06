-- Activer RLS sur sources_prospects
ALTER TABLE sources_prospects ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir toutes les sources
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les sources" ON sources_prospects;
CREATE POLICY "Les utilisateurs peuvent voir les sources"
  ON sources_prospects FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Politique : Les utilisateurs peuvent créer des sources
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des sources" ON sources_prospects;
CREATE POLICY "Les utilisateurs peuvent créer des sources"
  ON sources_prospects FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Politique : Les utilisateurs peuvent modifier leurs propres sources
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs sources" ON sources_prospects;
CREATE POLICY "Les utilisateurs peuvent modifier leurs sources"
  ON sources_prospects FOR UPDATE
  USING (created_by = auth.uid());

-- Politique : Les utilisateurs peuvent supprimer leurs propres sources
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs sources" ON sources_prospects;
CREATE POLICY "Les utilisateurs peuvent supprimer leurs sources"
  ON sources_prospects FOR DELETE
  USING (created_by = auth.uid());

-- Politique : Les admins et DG peuvent modifier toutes les sources
DROP POLICY IF EXISTS "Les admins peuvent modifier toutes les sources" ON sources_prospects;
CREATE POLICY "Les admins peuvent modifier toutes les sources"
  ON sources_prospects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'direction_generale')
    )
  );
