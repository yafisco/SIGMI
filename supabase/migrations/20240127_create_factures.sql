-- Table factures
CREATE TABLE IF NOT EXISTS factures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(50) NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  montant_ht DECIMAL(15,2) NOT NULL DEFAULT 0,
  montant_ttc DECIMAL(15,2) NOT NULL DEFAULT 0,
  tva DECIMAL(5,2) NOT NULL DEFAULT 18,
  date_emission TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  date_echeance TIMESTAMP WITH TIME ZONE,
  statut VARCHAR(20) NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'envoyée', 'payée', 'annulée')),
  lignes JSONB,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_factures_numero ON factures(numero);
CREATE INDEX IF NOT EXISTS idx_factures_client_id ON factures(client_id);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_factures_date_emission ON factures(date_emission);
CREATE INDEX IF NOT EXISTS idx_factures_created_by ON factures(created_by);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_factures_updated_at ON factures;
CREATE TRIGGER update_factures_updated_at
  BEFORE UPDATE ON factures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres factures" ON factures;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres factures"
  ON factures FOR SELECT
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Les admins peuvent voir toutes les factures" ON factures;
CREATE POLICY "Les admins peuvent voir toutes les factures"
  ON factures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'direction_generale', 'finance_comptabilite')
    )
  );

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres factures" ON factures;
CREATE POLICY "Les utilisateurs peuvent créer leurs propres factures"
  ON factures FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Les admins peuvent créer des factures" ON factures;
CREATE POLICY "Les admins peuvent créer des factures"
  ON factures FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'direction_generale', 'finance_comptabilite')
    )
  );

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres factures" ON factures;
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres factures"
  ON factures FOR UPDATE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Les admins peuvent modifier toutes les factures" ON factures;
CREATE POLICY "Les admins peuvent modifier toutes les factures"
  ON factures FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'direction_generale', 'finance_comptabilite')
    )
  );

DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres factures" ON factures;
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres factures"
  ON factures FOR DELETE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Les admins peuvent supprimer toutes les factures" ON factures;
CREATE POLICY "Les admins peuvent supprimer toutes les factures"
  ON factures FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'direction_generale', 'finance_comptabilite')
    )
  );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE factures;
