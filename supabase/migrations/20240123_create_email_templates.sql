-- Migration pour créer la table email_templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('prospection', 'agrement', 'relance', 'rendez-vous', 'devis', 'livraison', 'contrat', 'autre')),
  sujet TEXT NOT NULL,
  corps TEXT NOT NULL,
  variables TEXT[],
  actif BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_by_nom VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour la recherche
CREATE INDEX IF NOT EXISTS idx_email_templates_categorie ON email_templates(categorie);
CREATE INDEX IF NOT EXISTS idx_email_templates_actif ON email_templates(actif);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE email_templates;
