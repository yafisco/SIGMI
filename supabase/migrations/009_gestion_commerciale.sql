-- Migration pour le module Gestion commerciale
-- Cahier des charges SIGMI V3 - 22/10/2026

-- 1. Table Fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raison_sociale TEXT NOT NULL,
  contact_principal TEXT,
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  secteur_activite TEXT,
  conditions_paiement TEXT,
  notes TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table Produits (Catalogue)
CREATE TABLE IF NOT EXISTS produits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  designation TEXT NOT NULL,
  description TEXT,
  prix_unitaire DECIMAL(15, 2) NOT NULL,
  unite_mesure TEXT DEFAULT 'unité',
  fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE SET NULL,
  pole TEXT,
  stock_minimum INTEGER DEFAULT 0,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table Mouvements de Stock
CREATE TABLE IF NOT EXISTS mouvements_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entree', 'sortie', 'ajustement')),
  quantite INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT CHECK (source IN ('achat', 'vente', 'ajustement')),
  responsable_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table Devis
CREATE TABLE IF NOT EXISTS devis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  date_validite DATE,
  statut TEXT NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'envoyé', 'accepté', 'refusé')),
  total_ht DECIMAL(15, 2) DEFAULT 0,
  total_ttc DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table Lignes de Devis
CREATE TABLE IF NOT EXISTS lignes_devis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id UUID NOT NULL REFERENCES devis(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES produits(id) ON DELETE SET NULL,
  designation TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(15, 2) NOT NULL,
  sous_total DECIMAL(15, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table Ventes
DROP TABLE IF EXISTS ventes CASCADE;
CREATE TABLE ventes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total DECIMAL(15, 2) NOT NULL,
  mode_paiement TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  bon_livraison_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table Lignes de Vente
CREATE TABLE IF NOT EXISTS lignes_vente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vente_id UUID NOT NULL REFERENCES ventes(id) ON DELETE CASCADE,
  produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE RESTRICT,
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(15, 2) NOT NULL,
  sous_total DECIMAL(15, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Table Bons de Livraison
CREATE TABLE IF NOT EXISTS bons_livraison (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL,
  vente_id UUID REFERENCES ventes(id) ON DELETE SET NULL,
  facture_id UUID REFERENCES factures(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  destinataire TEXT,
  statut TEXT NOT NULL DEFAULT 'émis' CHECK (statut IN ('émis', 'annulé')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Table Achats Fournisseurs
CREATE TABLE IF NOT EXISTS achats_fournisseurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT UNIQUE NOT NULL,
  fournisseur_id UUID NOT NULL REFERENCES fournisseurs(id) ON DELETE RESTRICT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prix_total DECIMAL(15, 2) NOT NULL,
  statut TEXT NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'reçu', 'annulé')),
  mode_paiement TEXT,
  valide_par UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Table Lignes d'Achat
CREATE TABLE IF NOT EXISTS lignes_achat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achat_id UUID NOT NULL REFERENCES achats_fournisseurs(id) ON DELETE CASCADE,
  produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE RESTRICT,
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(15, 2) NOT NULL,
  sous_total DECIMAL(15, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_produits_reference ON produits(reference);
CREATE INDEX IF NOT EXISTS idx_produits_fournisseur ON produits(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_stock_produit ON mouvements_stock(produit_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_stock_date ON mouvements_stock(date);
CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(client_id);
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut);
CREATE INDEX IF NOT EXISTS idx_ventes_client ON ventes(client_id);
CREATE INDEX IF NOT EXISTS idx_ventes_created_by ON ventes(created_by);
CREATE INDEX IF NOT EXISTS idx_achats_fournisseur ON achats_fournisseurs(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_achats_statut ON achats_fournisseurs(statut);

-- RLS (Row Level Security) policies
ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE mouvements_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE bons_livraison ENABLE ROW LEVEL SECURITY;
ALTER TABLE achats_fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_achat ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (à adapter selon la matrice des droits)
-- Pour l'instant, tous les utilisateurs authentifiés peuvent lire
-- Les admin, back_office et commercial peuvent tout modifier

DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les fournisseurs" ON fournisseurs;
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les fournisseurs"
  ON fournisseurs FOR SELECT USING (auth.role() IS NOT NULL);

DROP POLICY IF EXISTS "Les admin, back_office et commercial peuvent modifier les fournisseurs" ON fournisseurs;
CREATE POLICY "Les admin, back_office et commercial peuvent modifier les fournisseurs"
  ON fournisseurs FOR ALL USING (
    auth.role() IN ('admin', 'back_office', 'commercial', 'direction_generale', 'responsable_pole')
  );

DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les produits" ON produits;
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les produits"
  ON produits FOR SELECT USING (auth.role() IS NOT NULL);

DROP POLICY IF EXISTS "Les admin, back_office et commercial peuvent modifier les produits" ON produits;
CREATE POLICY "Les admin, back_office et commercial peuvent modifier les produits"
  ON produits FOR ALL USING (
    auth.role() IN ('admin', 'back_office', 'commercial', 'direction_generale', 'responsable_pole')
  );

DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les mouvements de stock" ON mouvements_stock;
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les mouvements de stock"
  ON mouvements_stock FOR SELECT USING (auth.role() IS NOT NULL);

DROP POLICY IF EXISTS "Les admin, back_office et commercial peuvent modifier les mouvements de stock" ON mouvements_stock;
CREATE POLICY "Les admin, back_office et commercial peuvent modifier les mouvements de stock"
  ON mouvements_stock FOR ALL USING (
    auth.role() IN ('admin', 'back_office', 'commercial', 'direction_generale', 'responsable_pole')
  );

DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les devis" ON devis;
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les devis"
  ON devis FOR SELECT USING (auth.role() IS NOT NULL);

DROP POLICY IF EXISTS "Les admin et back_office peuvent modifier les devis" ON devis;
CREATE POLICY "Les admin et back_office peuvent modifier les devis"
  ON devis FOR ALL USING (
    auth.role() IN ('admin', 'back_office')
  );

DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les ventes" ON ventes;
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les ventes"
  ON ventes FOR SELECT USING (auth.role() IS NOT NULL);

DROP POLICY IF EXISTS "Les admin et back_office peuvent modifier les ventes" ON ventes;
CREATE POLICY "Les admin et back_office peuvent modifier les ventes"
  ON ventes FOR ALL USING (
    auth.role() IN ('admin', 'back_office')
  );

DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les bons de livraison" ON bons_livraison;
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les bons de livraison"
  ON bons_livraison FOR SELECT USING (auth.role() IS NOT NULL);

DROP POLICY IF EXISTS "Les admin et back_office peuvent modifier les bons de livraison" ON bons_livraison;
CREATE POLICY "Les admin et back_office peuvent modifier les bons de livraison"
  ON bons_livraison FOR ALL USING (
    auth.role() IN ('admin', 'back_office')
  );

DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les achats" ON achats_fournisseurs;
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les achats"
  ON achats_fournisseurs FOR SELECT USING (auth.role() IS NOT NULL);

DROP POLICY IF EXISTS "Les admin et back_office peuvent modifier les achats" ON achats_fournisseurs;
CREATE POLICY "Les admin et back_office peuvent modifier les achats"
  ON achats_fournisseurs FOR ALL USING (
    auth.role() IN ('admin', 'back_office')
  );

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_fournisseurs_updated_at ON fournisseurs;
CREATE TRIGGER update_fournisseurs_updated_at BEFORE UPDATE ON fournisseurs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_produits_updated_at ON produits;
CREATE TRIGGER update_produits_updated_at BEFORE UPDATE ON produits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_devis_updated_at ON devis;
CREATE TRIGGER update_devis_updated_at BEFORE UPDATE ON devis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
