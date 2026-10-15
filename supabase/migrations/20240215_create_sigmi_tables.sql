-- Migration SIGMI - Création des tables pour le système d'information GROUP MI
-- Version 2.0 - Basé sur le cahier des charges SIGMI

-- =====================================================
-- TABLE: collaborateurs
-- =====================================================
CREATE TABLE IF NOT EXISTS collaborateurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telephone VARCHAR(20),
  poste VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('commercial', 'responsable de pôle', 'direction', 'gestionnaire de projet', 'administrateur système')),
  poles TEXT[] NOT NULL, -- Array of poles
  date_embauche DATE NOT NULL,
  actif BOOLEAN DEFAULT true,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_collaborateurs_email ON collaborateurs(email);
CREATE INDEX IF NOT EXISTS idx_collaborateurs_role ON collaborateurs(role);
CREATE INDEX IF NOT EXISTS idx_collaborateurs_actif ON collaborateurs(actif);
CREATE INDEX IF NOT EXISTS idx_collaborateurs_poles ON collaborateurs USING GIN(poles);

-- =====================================================
-- TABLE: projets
-- =====================================================
CREATE TABLE IF NOT EXISTS projets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  poles TEXT[] NOT NULL, -- Array of poles
  responsable_id UUID NOT NULL REFERENCES collaborateurs(id) ON DELETE SET NULL,
  equipe UUID[] DEFAULT ARRAY[]::UUID[], -- Array of collaborateur IDs
  statut VARCHAR(20) NOT NULL DEFAULT 'planifié' CHECK (statut IN ('planifié', 'en cours', 'en pause', 'terminé', 'annulé')),
  priorite VARCHAR(20) NOT NULL DEFAULT 'moyenne' CHECK (priorite IN ('basse', 'moyenne', 'haute', 'critique')),
  date_debut DATE NOT NULL,
  date_fin_prevue DATE NOT NULL,
  date_fin_reelle DATE,
  budget_estime DECIMAL(15, 2),
  budget_consomme DECIMAL(15, 2) DEFAULT 0,
  progression INTEGER DEFAULT 0 CHECK (progression >= 0 AND progression <= 100),
  livrables TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_projets_responsable ON projets(responsable_id);
CREATE INDEX IF NOT EXISTS idx_projets_statut ON projets(statut);
CREATE INDEX IF NOT EXISTS idx_projets_priorite ON projets(priorite);
CREATE INDEX IF NOT EXISTS idx_projets_poles ON projets USING GIN(poles);
CREATE INDEX IF NOT EXISTS idx_projets_dates ON projets(date_debut, date_fin_prevue);

-- =====================================================
-- TABLE: documents
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('contrat', 'facture', 'rapport', 'plan', 'autre')),
  statut VARCHAR(20) NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'validé', 'archivé')),
  projet_id UUID REFERENCES projets(id) ON DELETE SET NULL,
  client_id UUID, -- Référence vers la table clients (à créer si nécessaire)
  fichier_url TEXT NOT NULL,
  fichier_nom VARCHAR(255) NOT NULL,
  fichier_taille BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES collaborateurs(id) ON DELETE SET NULL,
  date_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_statut ON documents(statut);
CREATE INDEX IF NOT EXISTS idx_documents_projet ON documents(projet_id);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(date_upload);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE collaborateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projets ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Politiques pour collaborateurs
-- Tout le monde peut voir les collaborateurs (annuaire interne)
CREATE POLICY "Collaborateurs: lecture publique"
  ON collaborateurs FOR SELECT
  USING (true);

-- Seuls les administrateurs et responsables de pôle peuvent modifier
CREATE POLICY "Collaborateurs: modification par admin"
  ON collaborateurs FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM collaborateurs
      WHERE role IN ('administrateur système', 'responsable de pôle', 'direction')
    )
  );

-- Politiques pour projets
-- Tout le monde peut voir les projets
CREATE POLICY "Projets: lecture publique"
  ON projets FOR SELECT
  USING (true);

-- Seuls les gestionnaires de projet, responsables et admin peuvent modifier
CREATE POLICY "Projets: modification par autorisés"
  ON projets FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM collaborateurs
      WHERE role IN ('administrateur système', 'responsable de pôle', 'direction', 'gestionnaire de projet')
    )
    OR responsable_id = auth.uid()
    OR auth.uid() = ANY(equipe)
  );

-- Politiques pour documents
-- Tout le monde peut voir les documents validés
CREATE POLICY "Documents: lecture publique validés"
  ON documents FOR SELECT
  USING (statut = 'validé');

-- Seuls les collaborateurs du projet ou l'uploader peuvent voir les brouillons
CREATE POLICY "Documents: lecture brouillons par autorisés"
  ON documents FOR SELECT
  USING (
    statut != 'validé' AND (
      uploaded_by = auth.uid()
      OR auth.uid() IN (
        SELECT equipe FROM projets WHERE id = projet_id
      )
      OR auth.uid() IN (
        SELECT responsable_id FROM projets WHERE id = projet_id
      )
    )
  );

-- Seuls les administrateurs et l'uploader peuvent modifier
CREATE POLICY "Documents: modification par autorisés"
  ON documents FOR ALL
  USING (
    uploaded_by = auth.uid()
    OR auth.uid() IN (
      SELECT id FROM collaborateurs
      WHERE role IN ('administrateur système', 'responsable de pôle', 'direction')
    )
  );

-- =====================================================
-- TRIGGERS pour updated_at automatique
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour collaborateurs
CREATE TRIGGER update_collaborateurs_updated_at
  BEFORE UPDATE ON collaborateurs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour projets
CREATE TRIGGER update_projets_updated_at
  BEFORE UPDATE ON projets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour documents
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONNÉES DE DÉMO (optionnel - pour le développement)
-- =====================================================

-- NOTE: Pour créer un utilisateur test, vous devez d'abord créer l'utilisateur dans Supabase Auth
-- puis utiliser son UUID pour l'insérer dans la table collaborateurs.
-- 
-- Utilisateur test recommandé :
-- Email: test@sigmi.com
-- Mot de passe: Test1234
-- 
-- Après avoir créé l'utilisateur dans Supabase Auth, récupérez son UUID et exécutez :
-- INSERT INTO collaborateurs (id, nom, prenom, email, poste, role, poles, date_embauche, actif)
-- VALUES ('UUID_DE_LUTILISATEUR', 'TEST', 'Utilisateur', 'test@sigmi.com', 'Utilisateur Test', 'administrateur système', ARRAY['ingénierie informatique'], NOW(), true);

-- Insérer des collaborateurs de démonstration
INSERT INTO collaborateurs (nom, prenom, email, telephone, poste, role, poles, date_embauche, actif) VALUES
('DUPONT', 'Jean', 'jean.dupont@groupmi.com', '+221 77 123 45 67', 'Ingénieur Senior', 'gestionnaire de projet', ARRAY['ingénierie informatique'], '2023-01-15', true),
('DIOP', 'Fatou', 'fatou.diop@groupmi.com', '+221 77 234 56 78', 'Responsable Commercial', 'commercial', ARRAY['trading international', 'agrobusiness'], '2022-06-01', true),
('FALL', 'Moussa', 'moussa.fall@groupmi.com', NULL, 'Directeur Technique', 'responsable de pôle', ARRAY['ingénierie informatique', 'transition énergétique'], '2021-03-10', true),
('NDOYE', 'Aminata', 'aminata.ndoye@groupmi.com', '+221 77 345 67 89', 'Chef de Projet BTP', 'gestionnaire de projet', ARRAY['génie civil et BTP'], '2023-08-20', true)
ON CONFLICT (email) DO NOTHING;

-- Insérer des projets de démonstration
INSERT INTO projets (nom, description, poles, responsable_id, equipe, statut, priorite, date_debut, date_fin_prevue, budget_estime, budget_consomme, progression, livrables) VALUES
('Plateforme E-commerce Trading', 'Développement d''une plateforme de e-commerce pour le pôle trading international', ARRAY['ingénierie informatique', 'trading international'], (SELECT id FROM collaborateurs WHERE email = 'jean.dupont@groupmi.com'), ARRAY[(SELECT id FROM collaborateurs WHERE email = 'jean.dupont@groupmi.com'), (SELECT id FROM collaborateurs WHERE email = 'moussa.fall@groupmi.com')], 'en cours', 'haute', '2024-01-15', '2024-06-30', 150000, 45000, 30, ARRAY['Spécifications fonctionnelles', 'Maquettes UI/UX', 'Développement backend']),
('Construction Entrepôt Logistique', 'Construction d''un entrepôt de 5000m² pour le pôle agrobusiness', ARRAY['génie civil et BTP', 'agrobusiness'], (SELECT id FROM collaborateurs WHERE email = 'aminata.ndoye@groupmi.com'), ARRAY[(SELECT id FROM collaborateurs WHERE email = 'aminata.ndoye@groupmi.com')], 'en cours', 'critique', '2024-02-01', '2024-08-31', 500000, 120000, 24, ARRAY['Plans architecturaux', 'Fondations', 'Structure principale']),
('Système de Gestion Énergétique', 'Implémentation d''un système de monitoring et gestion de consommation énergétique', ARRAY['ingénierie informatique', 'transition énergétique'], (SELECT id FROM collaborateurs WHERE email = 'moussa.fall@groupmi.com'), ARRAY[(SELECT id FROM collaborateurs WHERE email = 'moussa.fall@groupmi.com'), (SELECT id FROM collaborateurs WHERE email = 'jean.dupont@groupmi.com')], 'planifié', 'moyenne', '2024-04-01', '2024-09-30', 80000, 0, 0, ARRAY[]::TEXT[])
ON CONFLICT DO NOTHING;

-- Insérer des documents de démonstration
INSERT INTO documents (nom, description, type, statut, projet_id, fichier_url, fichier_nom, fichier_taille, uploaded_by, tags) VALUES
('Contrat Client - Trading SA', 'Contrat de prestation pour le projet plateforme e-commerce', 'contrat', 'validé', (SELECT id FROM projets WHERE nom = 'Plateforme E-commerce Trading'), '/documents/contrat-trading-sa.pdf', 'contrat-trading-sa.pdf', 2457600, (SELECT id FROM collaborateurs WHERE email = 'jean.dupont@groupmi.com'), ARRAY['contractuel', 'signé', 'trading']),
('Facture #F-2024-045', 'Facture mensuelle pour services de consulting', 'facture', 'validé', NULL, '/documents/facture-2024-045.pdf', 'facture-2024-045.pdf', 512000, (SELECT id FROM collaborateurs WHERE email = 'fatou.diop@groupmi.com'), ARRAY['facturation', '2024']),
('Rapport Avancement Projet BTP', 'Rapport mensuel d''avancement du projet entrepôt', 'rapport', 'validé', (SELECT id FROM projets WHERE nom = 'Construction Entrepôt Logistique'), '/documents/rapport-avancement-btp.pdf', 'rapport-avancement-btp.pdf', 1048576, (SELECT id FROM collaborateurs WHERE email = 'aminata.ndoye@groupmi.com'), ARRAY['btp', 'avancement', 'mensuel']),
('Plans Architecturaux V2', 'Plans révisés de l''entrepôt logistique', 'plan', 'brouillon', (SELECT id FROM projets WHERE nom = 'Construction Entrepôt Logistique'), '/documents/plans-architecturaux-v2.dwg', 'plans-architecturaux-v2.dwg', 15728640, (SELECT id FROM collaborateurs WHERE email = 'aminata.ndoye@groupmi.com'), ARRAY['architecture', 'btp', 'plans']),
('Specs Techniques Énergétique', 'Spécifications techniques du système de gestion énergétique', 'rapport', 'validé', (SELECT id FROM projets WHERE nom = 'Système de Gestion Énergétique'), '/documents/specs-techniques-energetique.pdf', 'specs-techniques-energetique.pdf', 3145728, (SELECT id FROM collaborateurs WHERE email = 'moussa.fall@groupmi.com'), ARRAY['technique', 'énergie', 'spécifications'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- VUES pour faciliter les requêtes
-- =====================================================

-- Vue: projets avec noms du responsable et de l'équipe
CREATE OR REPLACE VIEW v_projets_detail AS
SELECT
  p.*,
  c.nom || ' ' || c.prenom as responsable_nom,
  ARRAY(
    SELECT nom || ' ' || prenom
    FROM collaborateurs
    WHERE id = ANY(p.equipe)
  ) as equipe_noms
FROM projets p
LEFT JOIN collaborateurs c ON p.responsable_id = c.id;

-- Vue: documents avec noms du projet et du client
CREATE OR REPLACE VIEW v_documents_detail AS
SELECT
  d.*,
  p.nom as projet_nom,
  c_uploader.nom || ' ' || c_uploader.prenom as uploaded_by_nom
FROM documents d
LEFT JOIN projets p ON d.projet_id = p.id
LEFT JOIN collaborateurs c_uploader ON d.uploaded_by = c_uploader.id;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
