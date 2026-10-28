-- Table rapports
CREATE TABLE IF NOT EXISTS rapports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('mensuel', 'trimestriel', 'annuel', 'budget')),
  periode VARCHAR(50) NOT NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('disponible', 'en_cours')),
  data JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_rapports_type ON rapports(type);
CREATE INDEX IF NOT EXISTS idx_rapports_periode ON rapports(periode);
CREATE INDEX IF NOT EXISTS idx_rapports_statut ON rapports(statut);
CREATE INDEX IF NOT EXISTS idx_rapports_created_by ON rapports(created_by);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_rapports_updated_at ON rapports;
CREATE TRIGGER update_rapports_updated_at
  BEFORE UPDATE ON rapports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE rapports ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres rapports" ON rapports;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres rapports"
  ON rapports FOR SELECT
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Les admins peuvent voir tous les rapports" ON rapports;
CREATE POLICY "Les admins peuvent voir tous les rapports"
  ON rapports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'direction_generale', 'finance_comptabilite')
    )
  );

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres rapports" ON rapports;
CREATE POLICY "Les utilisateurs peuvent créer leurs propres rapports"
  ON rapports FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Les admins peuvent créer des rapports" ON rapports;
CREATE POLICY "Les admins peuvent créer des rapports"
  ON rapports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'direction_generale', 'finance_comptabilite')
    )
  );

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres rapports" ON rapports;
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres rapports"
  ON rapports FOR UPDATE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Les admins peuvent modifier tous les rapports" ON rapports;
CREATE POLICY "Les admins peuvent modifier tous les rapports"
  ON rapports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'direction_generale', 'finance_comptabilite')
    )
  );

DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres rapports" ON rapports;
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres rapports"
  ON rapports FOR DELETE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Les admins peuvent supprimer tous les rapports" ON rapports;
CREATE POLICY "Les admins peuvent supprimer tous les rapports"
  ON rapports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'direction_generale', 'finance_comptabilite')
    )
  );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE rapports;
