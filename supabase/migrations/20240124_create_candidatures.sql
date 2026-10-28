-- Migration pour créer la table candidatures
-- Note: La table postes doit exister avant (dépendance FK)
DROP TABLE IF EXISTS candidatures CASCADE;

CREATE TABLE candidatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_complet VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telephone VARCHAR(50),
  poste_id UUID REFERENCES postes(id),
  poste_nom VARCHAR(255),
  cv_url TEXT,
  lettre_motivation TEXT,
  experience_annees INTEGER,
  competences TEXT[],
  date_candidature TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  statut VARCHAR(50) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_revision', 'entretien', 'accepte', 'refuse')),
  note INTEGER,
  commentaires TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_candidatures_statut ON candidatures(statut);
CREATE INDEX idx_candidatures_poste ON candidatures(poste_id);
CREATE INDEX idx_candidatures_date ON candidatures(date_candidature);

-- Trigger pour updated_at
CREATE TRIGGER update_candidatures_updated_at
  BEFORE UPDATE ON candidatures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE candidatures;
