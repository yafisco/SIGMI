-- Migration pour créer la table campagnes_marketing
DROP TABLE IF EXISTS campagnes_marketing CASCADE;

CREATE TABLE campagnes_marketing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL,
  canal VARCHAR(100) NOT NULL,
  budget DECIMAL(15,2),
  date_debut DATE,
  date_fin DATE,
  statut VARCHAR(50) DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_cours', 'termine', 'annule')),
  leads_generes INTEGER DEFAULT 0,
  taux_conversion DECIMAL(5,2),
  objectif TEXT,
  pole VARCHAR(100),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_campagnes_statut ON campagnes_marketing(statut);
CREATE INDEX idx_campagnes_canal ON campagnes_marketing(canal);
CREATE INDEX idx_campagnes_dates ON campagnes_marketing(date_debut, date_fin);

-- Trigger pour updated_at
CREATE TRIGGER update_campagnes_marketing_updated_at
  BEFORE UPDATE ON campagnes_marketing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE campagnes_marketing;
