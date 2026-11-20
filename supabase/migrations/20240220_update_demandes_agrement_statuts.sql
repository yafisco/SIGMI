-- Amélioration de la table demandes_agrement pour gérer les statuts et l'historique

-- Créer le type enum pour les statuts de demande d'agrément
CREATE TYPE agrement_statut AS ENUM ('soumise', 'en_examen', 'accepte', 'refusee');

-- Si la colonne statut existe déjà avec un autre type, l'adapter
DO $$
BEGIN
  -- Vérifier si la colonne statut existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demandes_agrement'
    AND column_name = 'statut'
  ) THEN
    -- Alter table pour utiliser le nouveau type
    ALTER TABLE demandes_agrement
    ALTER COLUMN statut TYPE agrement_statut
    USING statut::text::agrement_statut;
  ELSE
    -- Ajouter la colonne si elle n'existe pas
    ALTER TABLE demandes_agrement
    ADD COLUMN statut agrement_statut DEFAULT 'soumise';
  END IF;
END $$;

-- Ajouter les colonnes pour le statut et l'historique
ALTER TABLE demandes_agrement
ADD COLUMN IF NOT EXISTS statut agrement_statut DEFAULT 'soumise',
ADD COLUMN IF NOT EXISTS date_acceptation TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS date_refus TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS motif_refus TEXT;

-- Table pour l'historique des changements de statut
CREATE TABLE IF NOT EXISTS historique_statuts_agrements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demande_id UUID NOT NULL REFERENCES demandes_agrement(id) ON DELETE CASCADE,
  ancien_statut agrement_statut,
  nouveau_statut agrement_statut,
  change_par UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_par_nom TEXT,
  commentaire TEXT,
  date_changement TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour l'historique
CREATE INDEX IF NOT EXISTS idx_historique_demande ON historique_statuts_agrements(demande_id);
CREATE INDEX IF NOT EXISTS idx_historique_date ON historique_statuts_agrements(date_changement);

-- RLS activé sur l'historique
ALTER TABLE historique_statuts_agrements ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour l'historique
CREATE POLICY "Les utilisateurs connectés peuvent lire l'historique"
ON historique_statuts_agrements FOR SELECT
TO authenticated
USING (true);

-- Seuls les rôles back_office, commercial et admin peuvent créer des entrées d'historique
CREATE POLICY "back_office commercial et admin peuvent créer l'historique"
ON historique_statuts_agrements FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('back_office', 'commercial', 'admin')
  )
);

-- RLS pour la table demandes_agrement (mettre à jour si nécessaire)
ALTER TABLE demandes_agrement ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous
CREATE POLICY IF NOT EXISTS "Les utilisateurs connectés peuvent lire les demandes agrement"
ON demandes_agrement FOR SELECT
TO authenticated
USING (true);

-- Politique pour permettre l'écriture aux rôles appropriés
CREATE POLICY IF NOT EXISTS "back_office commercial et admin peuvent modifier les demandes agrement"
ON demandes_agrement FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('back_office', 'commercial', 'admin')
  )
);

-- Trigger pour enregistrer les changements de statut dans l'historique
CREATE OR REPLACE FUNCTION log_agrement_statut_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut IS DISTINCT FROM OLD.statut THEN
    INSERT INTO historique_statuts_agrements (
      demande_id,
      ancien_statut,
      nouveau_statut,
      change_par,
      change_par_nom,
      commentaire
    )
    VALUES (
      NEW.id,
      OLD.statut,
      NEW.statut,
      auth.uid(),
      (SELECT prenom || ' ' || nom FROM profiles WHERE id = auth.uid()),
      CASE
        WHEN NEW.statut = 'accepte' THEN 'Demande acceptée'
        WHEN NEW.statut = 'refusee' THEN COALESCE(NEW.motif_refus, 'Demande refusée')
        ELSE 'Changement de statut'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_agrement_statut_change
BEFORE UPDATE OF statut ON demandes_agrement
FOR EACH ROW
EXECUTE FUNCTION log_agrement_statut_change();
