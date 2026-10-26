-- Migration pour créer la table transactions
DROP TABLE IF EXISTS transactions CASCADE;

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('encaissement', 'decaissement')),
  categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('vente', 'achat', 'salaire', 'frais', 'divers')),
  montant DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  reference VARCHAR(255),
  pole VARCHAR(100),
  projet_id UUID REFERENCES projets(id),
  facture_id UUID REFERENCES factures(id),
  date_transaction TIMESTAMP WITH TIME ZONE NOT NULL,
  statut VARCHAR(50) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'annule')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_categorie ON transactions(categorie);
CREATE INDEX idx_transactions_date ON transactions(date_transaction);
CREATE INDEX idx_transactions_pole ON transactions(pole);

-- Trigger pour updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
