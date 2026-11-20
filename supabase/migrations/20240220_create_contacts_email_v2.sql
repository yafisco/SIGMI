-- Table contacts_email pour la base de contacts d'e-mails marketing
-- Supports l'import CSV et l'export Excel/CSV

CREATE TABLE IF NOT EXISTS contacts_email (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_entreprise TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  adresse TEXT,
  date DATE DEFAULT CURRENT_DATE,
  secteur TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche rapide
CREATE INDEX IF NOT EXISTS idx_contacts_email_email ON contacts_email(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_contacts_email_entreprise ON contacts_email(nom_entreprise);
CREATE INDEX IF NOT EXISTS idx_contacts_email_secteur ON contacts_email(secteur);

-- Index unique sur l'e-mail (insensible à la casse) pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_email_email_unique ON contacts_email(LOWER(email));

-- RLS activé
ALTER TABLE contacts_email ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour contacts_email
-- Tout utilisateur connecté peut lire les contacts
CREATE POLICY "Les utilisateurs connectés peuvent lire les contacts email"
ON contacts_email FOR SELECT
TO authenticated
USING (true);

-- Seuls les rôles back_office, commercial et admin peuvent créer des contacts
CREATE POLICY "back_office, commercial et admin peuvent créer des contacts email"
ON contacts_email FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('back_office', 'commercial', 'admin')
  )
);

-- Seuls les rôles back_office, commercial et admin peuvent modifier des contacts
CREATE POLICY "back_office, commercial et admin peuvent modifier des contacts email"
ON contacts_email FOR UPDATE
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

-- Seuls les rôles back_office et admin peuvent supprimer des contacts
CREATE POLICY "back_office et admin peuvent supprimer des contacts email"
ON contacts_email FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('back_office', 'admin')
  )
);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_contacts_email_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contacts_email_updated_at
BEFORE UPDATE ON contacts_email
FOR EACH ROW
EXECUTE FUNCTION update_contacts_email_updated_at();
