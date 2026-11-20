-- Table pieces_jointes pour stocker les fichiers attachés aux demandes d'agrément

CREATE TABLE IF NOT EXISTS pieces_jointes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id UUID NOT NULL REFERENCES demandes_agrement(id) ON DELETE CASCADE,
  nom_fichier TEXT NOT NULL,
  type_mime TEXT NOT NULL,
  taille_octets INTEGER NOT NULL,
  chemin_stockage TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche
CREATE INDEX IF NOT EXISTS idx_pieces_jointes_demande ON pieces_jointes(demande_id);
CREATE INDEX IF NOT EXISTS idx_pieces_jointes_nom ON pieces_jointes(nom_fichier);

-- RLS activé
ALTER TABLE pieces_jointes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Les utilisateurs connectés peuvent lire les pieces jointes"
ON pieces_jointes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "back_office commercial et admin peuvent créer des pieces jointes"
ON pieces_jointes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('back_office', 'commercial', 'admin')
  )
);

CREATE POLICY "back_office et admin peuvent supprimer des pieces jointes"
ON pieces_jointes FOR DELETE
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('back_office', 'admin')
  )
);
