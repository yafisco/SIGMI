-- Ajouter une colonne pour le logo de l'entreprise dans la table clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN clients.logo_url IS 'URL du logo de l''entreprise (stocké dans Supabase Storage)';
