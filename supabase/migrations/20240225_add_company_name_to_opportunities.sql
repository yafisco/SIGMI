-- Ajouter le champ structure_concernee à la table opportunities
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS structure_concernee VARCHAR(255);
