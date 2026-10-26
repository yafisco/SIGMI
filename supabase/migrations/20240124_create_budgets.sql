-- Migration pour créer la table budgets
-- Supprimer la table si elle existe pour éviter les conflits
DROP TABLE IF EXISTS budgets CASCADE;

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  montant_budget DECIMAL(15,2) NOT NULL,
  montant_depense DECIMAL(15,2) DEFAULT 0,
  pole VARCHAR(100),
  projet_id UUID REFERENCES projets(id),
  annee INTEGER NOT NULL,
  mois INTEGER,
  statut VARCHAR(50) DEFAULT 'actif' CHECK (statut IN ('actif', 'archive', 'depasse')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_budgets_pole ON budgets(pole);
CREATE INDEX idx_budgets_annee ON budgets(annee);
CREATE INDEX idx_budgets_projet ON budgets(projet_id);

-- Trigger pour updated_at
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
