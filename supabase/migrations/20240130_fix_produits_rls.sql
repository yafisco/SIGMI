-- Corriger les politiques RLS pour utiliser profiles.role au lieu de auth.role()

-- Supprimer l'ancienne politique pour produits
DROP POLICY IF EXISTS "Les admin, back_office et commercial peuvent modifier les produits" ON produits;

-- Créer une nouvelle politique qui vérifie le rôle dans profiles
CREATE POLICY "Les admin, back_office et commercial peuvent modifier les produits"
  ON produits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.actif = true
      AND profiles.role IN ('admin', 'back_office', 'commercial', 'direction_generale', 'responsable_pole')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.actif = true
      AND profiles.role IN ('admin', 'back_office', 'commercial', 'direction_generale', 'responsable_pole')
    )
  );
