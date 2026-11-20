-- Table envois_email pour le suivi des envois d'e-mails marketing
-- Gère la planification, l'historique et le statut des envois

CREATE TYPE envoi_statut AS ENUM ('planifie', 'envoye', 'annule');

CREATE TABLE IF NOT EXISTS envois_email (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts_email(id) ON DELETE CASCADE,
  modele_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  objet TEXT NOT NULL,
  corps TEXT NOT NULL,
  date_planifiee DATE NOT NULL,
  statut envoi_statut DEFAULT 'planifie',
  date_envoi_reelle TIMESTAMPTZ,
  auteur UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_envois_email_contact ON envois_email(contact_id);
CREATE INDEX IF NOT EXISTS idx_envois_email_modele ON envois_email(modele_id);
CREATE INDEX IF NOT EXISTS idx_envois_email_statut ON envois_email(statut);
CREATE INDEX IF NOT EXISTS idx_envois_email_date_planifiee ON envois_email(date_planifiee);
CREATE INDEX IF NOT EXISTS idx_envois_email_auteur ON envois_email(auteur);

-- Contrainte pour empêcher de planifier deux fois le même envoi
-- (même contact + même modèle déjà planifié et non annulé)
CREATE UNIQUE INDEX IF NOT EXISTS idx_envois_email_unique_planifie
ON envois_email(contact_id, modele_id)
WHERE statut = 'planifie';

-- RLS activé
ALTER TABLE envois_email ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour envois_email
-- Tout utilisateur connecté peut lire les envois
CREATE POLICY "Les utilisateurs connectés peuvent lire les envois email"
ON envois_email FOR SELECT
TO authenticated
USING (true);

-- Seuls les rôles back_office, commercial et admin peuvent créer des envois
CREATE POLICY "back_office, commercial et admin peuvent créer des envois email"
ON envois_email FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('back_office', 'commercial', 'admin')
  )
);

-- Seuls les rôles back_office, commercial et admin peuvent modifier des envois
CREATE POLICY "back_office, commercial et admin peuvent modifier des envois email"
ON envois_email FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('back_office', 'commercial', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('back_office', 'commercial', 'admin')
  )
);

-- Seuls les rôles back_office et admin peuvent supprimer des envois
CREATE POLICY "back_office et admin peuvent supprimer des envois email"
ON envois_email FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('back_office', 'admin')
  )
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_envois_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_envois_email_updated_at
BEFORE UPDATE ON envois_email
FOR EACH ROW
EXECUTE FUNCTION update_envois_email_updated_at();
