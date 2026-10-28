-- Ajouter une colonne image_url à la table produits
ALTER TABLE produits ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Commentaire sur la colonne
COMMENT ON COLUMN produits.image_url IS 'URL de l''image du produit stockée dans Supabase Storage';
