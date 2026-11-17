-- Mettre à jour tous les produits existants pour qu'ils soient actifs par défaut
UPDATE produits SET actif = true WHERE actif IS NULL OR actif = false;
