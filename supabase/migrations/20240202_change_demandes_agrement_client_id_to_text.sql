-- Changer le type de client_id de UUID à TEXT pour permettre l'entrée manuelle du nom du client
-- Cela corrige l'erreur "invalid input syntax for type uuid"

-- Supprimer la contrainte de clé étrangère
ALTER TABLE demandes_agrement DROP CONSTRAINT IF EXISTS demandes_agrement_client_id_fkey;

-- Changer le type de client_id de UUID à TEXT
ALTER TABLE demandes_agrement ALTER COLUMN client_id TYPE TEXT;
