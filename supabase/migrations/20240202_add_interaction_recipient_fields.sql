-- Ajouter les colonnes du destinataire dans la table interactions
ALTER TABLE interactions
ADD COLUMN IF NOT EXISTS client_nom text,
ADD COLUMN IF NOT EXISTS client_email text,
ADD COLUMN IF NOT EXISTS client_telephone text,
ADD COLUMN IF NOT EXISTS client_ville text,
ADD COLUMN IF NOT EXISTS client_pays text,
ADD COLUMN IF NOT EXISTS client_secteur text;

-- Ajouter des commentaires pour documenter ces champs
COMMENT ON COLUMN interactions.client_nom IS 'Nom de l''entreprise ou du client';
COMMENT ON COLUMN interactions.client_email IS 'Email du destinataire';
COMMENT ON COLUMN interactions.client_telephone IS 'Numéro de téléphone du destinataire';
COMMENT ON COLUMN interactions.client_ville IS 'Ville du destinataire';
COMMENT ON COLUMN interactions.client_pays IS 'Pays du destinataire';
COMMENT ON COLUMN interactions.client_secteur IS 'Secteur d''activité du destinataire';
