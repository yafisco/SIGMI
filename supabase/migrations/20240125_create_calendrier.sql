-- Table calendrier/événements
DROP TABLE IF EXISTS evenements CASCADE;

CREATE TABLE evenements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('réunion', 'appel', 'visite', 'email', 'autre')),
  date_debut TIMESTAMP WITH TIME ZONE NOT NULL,
  date_fin TIMESTAMP WITH TIME ZONE,
  lieu VARCHAR(255),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  prospect_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_evenements_date_debut ON evenements(date_debut);
CREATE INDEX idx_evenements_type ON evenements(type);
CREATE INDEX idx_evenements_created_by ON evenements(created_by);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_evenements_updated_at ON evenements;
CREATE TRIGGER update_evenements_updated_at
  BEFORE UPDATE ON evenements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS
ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres événements" ON evenements;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres événements"
  ON evenements FOR SELECT
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres événements" ON evenements;
CREATE POLICY "Les utilisateurs peuvent créer leurs propres événements"
  ON evenements FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres événements" ON evenements;
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres événements"
  ON evenements FOR UPDATE
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres événements" ON evenements;
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres événements"
  ON evenements FOR DELETE
  USING (created_by = auth.uid());

-- Politiques pour les rôles admin et direction
DROP POLICY IF EXISTS "Les admins peuvent voir tous les événements" ON evenements;
CREATE POLICY "Les admins peuvent voir tous les événements"
  ON evenements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'direction_generale')
    )
  );

DROP POLICY IF EXISTS "Les admins peuvent modifier tous les événements" ON evenements;
CREATE POLICY "Les admins peuvent modifier tous les événements"
  ON evenements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'direction_generale')
    )
  );

-- Activer Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE evenements;
