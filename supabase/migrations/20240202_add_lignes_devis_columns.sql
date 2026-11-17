-- Ajouter les colonnes manquantes à la table lignes_devis
ALTER TABLE lignes_devis ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE lignes_devis ADD COLUMN IF NOT EXISTS unite TEXT DEFAULT 'pièce';
ALTER TABLE lignes_devis ADD COLUMN IF NOT EXISTS remise DECIMAL(5, 2) DEFAULT 0;
