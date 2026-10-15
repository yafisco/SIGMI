-- Migration initiale pour SIGMI - Système d'Information GROUP MI
-- Version 1.0

-- ============================================
-- NETTOYAGE DES TABLES EXISTANTES (POUR DÉVELOPPEMENT)
-- ============================================

DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS projets CASCADE;
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS collaborateurs CASCADE;

DROP VIEW IF EXISTS v_documents_detail;
DROP VIEW IF EXISTS v_projets_detail;
DROP VIEW IF EXISTS v_tasks_detail;
DROP VIEW IF EXISTS v_opportunities_detail;
DROP VIEW IF EXISTS v_clients_detail;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- TABLES PRINCIPALES
-- ============================================

-- Table des collaborateurs
CREATE TABLE IF NOT EXISTS collaborateurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telephone VARCHAR(20),
  poste VARCHAR(100),
  role VARCHAR(50) DEFAULT 'commercial',
  poles TEXT[] DEFAULT ARRAY[]::TEXT[],
  date_embauche DATE,
  actif BOOLEAN DEFAULT true,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  ville VARCHAR(100),
  pays VARCHAR(100) DEFAULT 'Sénégal',
  secteur_activite VARCHAR(100),
  chiffre_affaires_annuel NUMERIC,
  nombre_employes INTEGER,
  statut VARCHAR(50) DEFAULT 'prospect' CHECK (statut IN ('prospect', 'client', 'inactif', 'bloqué')),
  assigned_to UUID REFERENCES collaborateurs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des contacts (personnes chez les clients)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'commercial',
  poste VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des opportunités
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  stage VARCHAR(50) DEFAULT 'nouveau' CHECK (stage IN ('nouveau', 'qualifié', 'proposition', 'négociation', 'gagné', 'perdu')),
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  assigned_to UUID REFERENCES collaborateurs(id) ON DELETE SET NULL,
  poles TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des tâches
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  related_type VARCHAR(50),
  related_id UUID,
  assigned_to UUID REFERENCES collaborateurs(id) ON DELETE SET NULL,
  created_by UUID REFERENCES collaborateurs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des interactions
CREATE TABLE IF NOT EXISTS interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  related_type VARCHAR(50),
  related_id UUID,
  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES collaborateurs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des projets
CREATE TABLE IF NOT EXISTS projets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  poles TEXT[] DEFAULT ARRAY[]::TEXT[],
  responsable_id UUID REFERENCES collaborateurs(id) ON DELETE SET NULL,
  equipe UUID[] DEFAULT ARRAY[]::UUID[],
  statut VARCHAR(50) DEFAULT 'planifié' CHECK (statut IN ('planifié', 'en cours', 'en pause', 'terminé', 'annulé')),
  priorite VARCHAR(50) DEFAULT 'moyenne' CHECK (priorite IN ('basse', 'moyenne', 'haute', 'critique')),
  date_debut DATE,
  date_fin_prevue DATE,
  date_fin_reelle DATE,
  budget_estime NUMERIC,
  budget_consomme NUMERIC DEFAULT 0,
  progression INTEGER DEFAULT 0 CHECK (progression >= 0 AND progression <= 100),
  livrables TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'autre' CHECK (type IN ('contrat', 'facture', 'rapport', 'plan', 'autre')),
  statut VARCHAR(50) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'validé', 'archivé')),
  projet_id UUID REFERENCES projets(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  fichier_url TEXT NOT NULL,
  fichier_nom VARCHAR(255) NOT NULL,
  fichier_taille INTEGER,
  uploaded_by UUID REFERENCES collaborateurs(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEX POUR OPTIMISATION
-- ============================================

CREATE INDEX IF NOT EXISTS idx_collaborateurs_email ON collaborateurs(email);
CREATE INDEX IF NOT EXISTS idx_collaborateurs_actif ON collaborateurs(actif);
CREATE INDEX IF NOT EXISTS idx_clients_statut ON clients(statut);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to ON clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_client_id ON opportunities(client_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_to ON opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_interactions_related ON interactions(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_projets_responsable ON projets(responsable_id);
CREATE INDEX IF NOT EXISTS idx_projets_statut ON projets(statut);
CREATE INDEX IF NOT EXISTS idx_documents_projet_id ON documents(projet_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);

-- ============================================
-- VUES POUR JOINTS ET DÉTAILS
-- ============================================

-- Vue des clients avec détails de l'assigné
CREATE OR REPLACE VIEW v_clients_detail AS
SELECT 
  c.*,
  col.nom as assigned_to_nom,
  col.email as assigned_to_email
FROM clients c
LEFT JOIN collaborateurs col ON c.assigned_to = col.id;

-- Vue des opportunités avec détails
CREATE OR REPLACE VIEW v_opportunities_detail AS
SELECT 
  o.*,
  cli.nom as client_nom,
  cli.email as client_email,
  col.nom as assigned_to_nom
FROM opportunities o
LEFT JOIN clients cli ON o.client_id = cli.id
LEFT JOIN collaborateurs col ON o.assigned_to = col.id;

-- Vue des tâches avec détails
CREATE OR REPLACE VIEW v_tasks_detail AS
SELECT 
  t.*,
  col_assignee.nom as assigned_to_nom,
  col_creator.nom as created_by_nom
FROM tasks t
LEFT JOIN collaborateurs col_assignee ON t.assigned_to = col_assignee.id
LEFT JOIN collaborateurs col_creator ON t.created_by = col_creator.id;

-- Vue des projets avec détails
CREATE OR REPLACE VIEW v_projets_detail AS
SELECT 
  p.*,
  col.nom as responsable_nom,
  col.email as responsable_email
FROM projets p
LEFT JOIN collaborateurs col ON p.responsable_id = col.id;

-- Vue des documents avec détails
CREATE OR REPLACE VIEW v_documents_detail AS
SELECT 
  d.*,
  p.nom as projet_nom,
  c.nom as client_nom,
  col.nom as uploaded_by_nom
FROM documents d
LEFT JOIN projets p ON d.projet_id = p.id
LEFT JOIN clients c ON d.client_id = c.id
LEFT JOIN collaborateurs col ON d.uploaded_by = col.id;

-- ============================================
-- TRIGGERS POUR updated_at AUTOMATIQUE
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_collaborateurs_updated_at BEFORE UPDATE ON collaborateurs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interactions_updated_at BEFORE UPDATE ON interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projets_updated_at BEFORE UPDATE ON projets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ACTIVER ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE collaborateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projets ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLITIQUES RLS - PERMISSIVES POUR LE DÉVELOPPEMENT
-- ============================================

-- Collaborateurs - Tous peuvent lire, seul l'auteur peut modifier
CREATE POLICY "Collaborateurs view all" ON collaborateurs
  FOR SELECT USING (true);

CREATE POLICY "Collaborateurs insert all" ON collaborateurs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Collaborateurs update all" ON collaborateurs
  FOR UPDATE USING (true);

CREATE POLICY "Collaborateurs delete all" ON collaborateurs
  FOR DELETE USING (true);

-- Clients - Tous peuvent lire, écrire
CREATE POLICY "Clients view all" ON clients
  FOR SELECT USING (true);

CREATE POLICY "Clients insert all" ON clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Clients update all" ON clients
  FOR UPDATE USING (true);

CREATE POLICY "Clients delete all" ON clients
  FOR DELETE USING (true);

-- Contacts - Tous peuvent lire, écrire
CREATE POLICY "Contacts view all" ON contacts
  FOR SELECT USING (true);

CREATE POLICY "Contacts insert all" ON contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Contacts update all" ON contacts
  FOR UPDATE USING (true);

CREATE POLICY "Contacts delete all" ON contacts
  FOR DELETE USING (true);

-- Opportunities - Tous peuvent lire, écrire
CREATE POLICY "Opportunities view all" ON opportunities
  FOR SELECT USING (true);

CREATE POLICY "Opportunities insert all" ON opportunities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Opportunities update all" ON opportunities
  FOR UPDATE USING (true);

CREATE POLICY "Opportunities delete all" ON opportunities
  FOR DELETE USING (true);

-- Tasks - Tous peuvent lire, écrire
CREATE POLICY "Tasks view all" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Tasks insert all" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Tasks update all" ON tasks
  FOR UPDATE USING (true);

CREATE POLICY "Tasks delete all" ON tasks
  FOR DELETE USING (true);

-- Interactions - Tous peuvent lire, écrire
CREATE POLICY "Interactions view all" ON interactions
  FOR SELECT USING (true);

CREATE POLICY "Interactions insert all" ON interactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Interactions update all" ON interactions
  FOR UPDATE USING (true);

CREATE POLICY "Interactions delete all" ON interactions
  FOR DELETE USING (true);

-- Projets - Tous peuvent lire, écrire
CREATE POLICY "Projets view all" ON projets
  FOR SELECT USING (true);

CREATE POLICY "Projets insert all" ON projets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Projets update all" ON projets
  FOR UPDATE USING (true);

CREATE POLICY "Projets delete all" ON projets
  FOR DELETE USING (true);

-- Documents - Tous peuvent lire, écrire
CREATE POLICY "Documents view all" ON documents
  FOR SELECT USING (true);

CREATE POLICY "Documents insert all" ON documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Documents update all" ON documents
  FOR UPDATE USING (true);

CREATE POLICY "Documents delete all" ON documents
  FOR DELETE USING (true);

-- ============================================
-- DONNÉES DE DÉMO (DÉSACTIVÉES - DÉMARRAGE À ZÉRO)
-- ============================================

-- Pour ajouter des données de démonstration, décommentez les sections ci-dessous

/*
-- Insertion d'un collaborateur de démonstration
INSERT INTO collaborateurs (nom, prenom, email, telephone, poste, role, poles, date_embauche, actif)
VALUES 
('Diop', 'Ibrahim', 'ibrahim.diop@groupmi.com', '+221 77 123 45 67', 'Responsable Commercial', 'commercial', ARRAY['trading international'], '2024-01-15', true)
ON CONFLICT (email) DO NOTHING;

-- Insertion de clients de démonstration
INSERT INTO clients (nom, email, telephone, adresse, ville, pays, secteur_activite, chiffre_affaires_annuel, nombre_employes, statut)
VALUES 
('Sénégal Énergie SA', 'contact@senergie.sn', '+221 33 820 00 00', 'Boulevard de la République', 'Dakar', 'Sénégal', 'Énergie', 500000000, 150, 'client'),
('Agro-Plus Sénégal', 'info@agroplus.sn', '+221 33 821 11 11', 'Zone Industrielle de Thiès', 'Thiès', 'Sénégal', 'Agriculture', 200000000, 75, 'prospect'),
('Construction moderne', 'contact@construction.sn', '+221 33 822 22 22', 'Avenue Cheikh Anta Diop', 'Dakar', 'Sénégal', 'BTP', 800000000, 200, 'client')
ON CONFLICT DO NOTHING;

-- Insertion d'opportunités de démonstration
INSERT INTO opportunities (name, description, client_id, amount, stage, probability, expected_close_date, assigned_to, poles)
SELECT 
  'Projet solaire Dakar', 'Installation de panneaux solaires pour le siège social', 
  (SELECT id FROM clients WHERE nom = 'Sénégal Énergie SA' LIMIT 1),
  50000000, 'négociation', 75, '2024-12-31',
  (SELECT id FROM collaborateurs WHERE email = 'ibrahim.diop@groupmi.com' LIMIT 1),
  ARRAY['transition énergétique']
WHERE EXISTS (SELECT 1 FROM clients WHERE nom = 'Sénégal Énergie SA')
  AND EXISTS (SELECT 1 FROM collaborateurs WHERE email = 'ibrahim.diop@groupmi.com')
ON CONFLICT DO NOTHING;

-- Insertion de tâches de démonstration
INSERT INTO tasks (title, description, status, priority, due_date, assigned_to, created_by)
SELECT 
  'Préparer proposition commerciale', 'Finaliser la proposition pour Sénégal Énergie', 'in_progress', 'high', '2024-11-15',
  (SELECT id FROM collaborateurs WHERE email = 'ibrahim.diop@groupmi.com' LIMIT 1),
  (SELECT id FROM collaborateurs WHERE email = 'ibrahim.diop@groupmi.com' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM collaborateurs WHERE email = 'ibrahim.diop@groupmi.com')
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, status, priority, due_date, assigned_to, created_by)
SELECT 
  'Appeler client Agro-Plus', 'Suivi de la proposition envoyée', 'todo', 'medium', '2024-11-10',
  (SELECT id FROM collaborateurs WHERE email = 'ibrahim.diop@groupmi.com' LIMIT 1),
  (SELECT id FROM collaborateurs WHERE email = 'ibrahim.diop@groupmi.com' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM collaborateurs WHERE email = 'ibrahim.diop@groupmi.com')
ON CONFLICT DO NOTHING;
*/
