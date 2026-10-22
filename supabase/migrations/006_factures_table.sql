-- Table des factures pour la trésorerie
CREATE TABLE IF NOT EXISTS factures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero VARCHAR(50) NOT NULL UNIQUE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  montant DECIMAL(15, 2) NOT NULL,
  date_emission DATE NOT NULL,
  date_echeance DATE,
  description TEXT,
  statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'payée', 'annulée')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES collaborateurs(id)
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_factures_client_id ON factures(client_id);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_factures_date_emission ON factures(date_emission);

-- Activer RLS
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les factures
CREATE POLICY "Authenticated users can view all factures"
ON factures FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert factures"
ON factures FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update factures"
ON factures FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete factures"
ON factures FOR DELETE
TO authenticated
USING (true);
