-- Ajouter les nouveaux champs pour les clients selon les spécifications du commercial
-- Structure (nom de l'entreprise), secteur d'activité, interlocuteur, fonction

-- Ajouter les nouveaux champs à la table clients
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS structure TEXT,
ADD COLUMN IF NOT EXISTS interlocuteur TEXT,
ADD COLUMN IF NOT EXISTS fonction TEXT;

-- Ajouter des commentaires pour documentation
COMMENT ON COLUMN clients.structure IS 'Nom de l''entreprise / Structure';
COMMENT ON COLUMN clients.interlocuteur IS 'Nom du contact principal chez le client';
COMMENT ON COLUMN clients.fonction IS 'Fonction du contact principal (Directeur, Responsable achats, etc.)';
