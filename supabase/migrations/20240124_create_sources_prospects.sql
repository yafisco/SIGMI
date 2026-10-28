-- Migration pour créer la table sources_prospects
DROP TABLE IF EXISTS sources_prospects CASCADE;

CREATE TABLE sources_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  conversion_rate DECIMAL(5,2),
  qualite_leads VARCHAR(50) DEFAULT 'moyenne' CHECK (qualite_leads IN ('haute', 'moyenne', 'faible')),
  actif BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_sources_prospects_type ON sources_prospects(type);
CREATE INDEX idx_sources_prospects_actif ON sources_prospects(actif);

-- Trigger pour updated_at
CREATE TRIGGER update_sources_prospects_updated_at
  BEFORE UPDATE ON sources_prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sources_prospects;
