-- Corriger la contrainte NOT NULL sur libelle pour permettre NULL
ALTER TABLE devis ALTER COLUMN libelle DROP NOT NULL;
-- Mettre à jour les valeurs NULL existantes
UPDATE devis SET libelle = 'Devis' WHERE libelle IS NULL;
