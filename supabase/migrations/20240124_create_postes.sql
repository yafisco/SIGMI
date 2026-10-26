-- Migration pour créer la table postes
DROP TABLE IF EXISTS postes CASCADE;
DROP TRIGGER IF EXISTS update_postes_updated_at ON postes;

CREATE TABLE postes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  departement VARCHAR(100),
  type_contrat VARCHAR(50) CHECK (type_contrat IN ('CDI', 'CDD', 'Freelance', 'Stage')),
  lieu VARCHAR(255),
  salaire_min DECIMAL(15,2),
  salaire_max DECIMAL(15,2),
  statut VARCHAR(50) DEFAULT 'ouvert' CHECK (statut IN ('ouvert', 'ferme', 'pourvu')),
  competences_requises TEXT[],
  date_publication TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_limite DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_postes_statut ON postes(statut);
CREATE INDEX idx_postes_departement ON postes(departement);

-- Trigger pour updated_at
CREATE TRIGGER update_postes_updated_at
  BEFORE UPDATE ON postes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE postes;
