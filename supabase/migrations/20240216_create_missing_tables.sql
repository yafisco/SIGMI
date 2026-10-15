-- Migration SIGMI - Tables manquantes pour Dashboard
-- Version 2.1 - Ajout tables clients, opportunities, tasks

-- =====================================================
-- TABLE: clients
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  ville VARCHAR(100),
  pays VARCHAR(100) DEFAULT 'Sénégal',
  secteur_activite VARCHAR(100),
  chiffre_affaires_annuel DECIMAL(15, 2),
  nombre_employes INTEGER,
  statut VARCHAR(20) NOT NULL DEFAULT 'prospect' CHECK (statut IN ('prospect', 'client', 'inactif', 'bloqué')),
  assigned_to UUID REFERENCES collaborateurs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_statut ON clients(statut);
CREATE INDEX IF NOT EXISTS idx_clients_assigned ON clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom);

-- =====================================================
-- TABLE: opportunities
-- =====================================================
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  stage VARCHAR(50) NOT NULL DEFAULT 'nouveau' CHECK (stage IN ('nouveau', 'qualifié', 'proposition', 'négociation', 'gagné', 'perdu')),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  assigned_to UUID REFERENCES collaborateurs(id) ON DELETE SET NULL,
  poles TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_opportunities_client ON opportunities(client_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned ON opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunities_date ON opportunities(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_poles ON opportunities USING GIN(poles);

-- =====================================================
-- TABLE: tasks
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  related_type VARCHAR(20) CHECK (related_type IN ('client', 'opportunity', 'projet', 'document', 'collaborateur')),
  related_id UUID,
  assigned_to UUID REFERENCES collaborateurs(id) ON DELETE SET NULL,
  created_by UUID REFERENCES collaborateurs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_related ON tasks(related_type, related_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Politiques pour clients
-- Tout le monde peut voir les clients
CREATE POLICY "Clients: lecture publique"
  ON clients FOR SELECT
  USING (true);

-- Seuls les commerciaux, responsables et admin peuvent modifier
CREATE POLICY "Clients: modification par autorisés"
  ON clients FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM collaborateurs
      WHERE role IN ('administrateur système', 'responsable de pôle', 'direction', 'commercial')
    )
    OR assigned_to = auth.uid()
  );

-- Politiques pour opportunities
-- Tout le monde peut voir les opportunités
CREATE POLICY "Opportunities: lecture publique"
  ON opportunities FOR SELECT
  USING (true);

-- Seuls les commerciaux, responsables, gestionnaires et admin peuvent modifier
CREATE POLICY "Opportunities: modification par autorisés"
  ON opportunities FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM collaborateurs
      WHERE role IN ('administrateur système', 'responsable de pôle', 'direction', 'commercial', 'gestionnaire de projet')
    )
    OR assigned_to = auth.uid()
  );

-- Politiques pour tasks
-- Tout le monde peut voir les tâches
CREATE POLICY "Tasks: lecture publique"
  ON tasks FOR SELECT
  USING (true);

-- Seuls l'assigné, le créateur, responsables et admin peuvent modifier
CREATE POLICY "Tasks: modification par autorisés"
  ON tasks FOR ALL
  USING (
    assigned_to = auth.uid()
    OR created_by = auth.uid()
    OR auth.uid() IN (
      SELECT id FROM collaborateurs
      WHERE role IN ('administrateur système', 'responsable de pôle', 'direction')
    )
  );

-- =====================================================
-- TRIGGERS pour updated_at automatique
-- =====================================================

-- Triggers pour clients
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour opportunities
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour tasks
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VUES pour faciliter les requêtes
-- =====================================================

-- Vue: opportunities avec noms du client et de l'assigné
CREATE OR REPLACE VIEW v_opportunities_detail AS
SELECT
  o.*,
  c.nom as client_nom,
  c.email as client_email,
  ca.nom || ' ' || ca.prenom as assigned_to_nom
FROM opportunities o
LEFT JOIN clients c ON o.client_id = c.id
LEFT JOIN collaborateurs ca ON o.assigned_to = ca.id;

-- Vue: tasks avec noms de l'assigné et créateur
CREATE OR REPLACE VIEW v_tasks_detail AS
SELECT
  t.*,
  ca.nom || ' ' || ca.prenom as assigned_to_nom,
  cc.nom || ' ' || cc.prenom as created_by_nom
FROM tasks t
LEFT JOIN collaborateurs ca ON t.assigned_to = ca.id
LEFT JOIN collaborateurs cc ON t.created_by = cc.id;

-- =====================================================
-- DONNÉES DE DÉMO
-- =====================================================

-- Clients de démo
INSERT INTO clients (nom, email, telephone, adresse, ville, secteur_activite, chiffre_affaires_annuel, nombre_employes, statut, assigned_to) VALUES
('Construction SA', 'contact@construction-sa.com', '+221 33 820 12 34', 'Zone Industrielle, Route de Rufisque', 'Dakar', 'BTP', 2500000000, 150, 'client', (SELECT id FROM collaborateurs WHERE email = 'fatou.diop@groupmi.com')),
('Ferme Modern', 'direction@fermemodern.sn', '+221 33 860 56 78', 'Km 15 Route de Thiès', 'Thiès', 'Agrobusiness', 800000000, 45, 'client', (SELECT id FROM collaborateurs WHERE email = 'fatou.diop@groupmi.com')),
('Taxi Express', 'admin@taxi-express.sn', '+221 33 889 12 34', 'Almadies, Dakar', 'Dakar', 'Transport', 1200000000, 80, 'prospect', (SELECT id FROM collaborateurs WHERE email = 'jean.dupont@groupmi.com')),
('Ministère de l\'Énergie', 'energie@gouvernement.sn', '+221 33 889 99 99', 'Plateau, Dakar', 'Dakar', 'Administration', 0, 500, 'prospect', (SELECT id FROM collaborateurs WHERE email = 'moussa.fall@groupmi.com'))
ON CONFLICT DO NOTHING;

-- Opportunités de démo
INSERT INTO opportunities (name, description, client_id, amount, stage, probability, expected_close_date, assigned_to, poles) VALUES
('Projet BTP Dakar', 'Construction d\'un complexe immobilier', (SELECT id FROM clients WHERE nom = 'Construction SA'), 500000000, 'négociation', 75, '2024-12-31', (SELECT id FROM collaborateurs WHERE email = 'fatou.diop@groupmi.com'), ARRAY['génie civil et BTP']),
('Système IT Agri', 'Développement plateforme gestion agricole', (SELECT id FROM clients WHERE nom = 'Ferme Modern'), 350000000, 'proposition', 50, '2025-01-31', (SELECT id FROM collaborateurs WHERE email = 'jean.dupont@groupmi.com'), ARRAY['ingénierie informatique', 'agrobusiness']),
('Bornes solaires', 'Installation bornes de recharge solaire', (SELECT id FROM clients WHERE nom = 'Taxi Express'), 1200000000, 'qualifié', 60, '2025-03-31', (SELECT id FROM collaborateurs WHERE email = 'moussa.fall@groupmi.com'), ARRAY['transition énergétique']),
('Audit Conseil', 'Mission audit et conseil stratégique', (SELECT id FROM clients WHERE nom = 'Ministère de l\'Énergie'), 200000000, 'contacté', 30, '2025-02-28', (SELECT id FROM collaborateurs WHERE email = 'moussa.fall@groupmi.com'), ARRAY['ingénierie informatique'])
ON CONFLICT DO NOTHING;

-- Tâches de démo
INSERT INTO tasks (title, description, status, priority, due_date, related_type, related_id, assigned_to, created_by) VALUES
('Relancer client Construction SA', 'Appel de suivi pour signature contrat', 'todo', 'high', '2026-09-25', 'client', (SELECT id FROM clients WHERE nom = 'Construction SA'), (SELECT id FROM collaborateurs WHERE email = 'fatou.diop@groupmi.com'), (SELECT id FROM collaborateurs WHERE email = 'fatou.diop@groupmi.com')),
('Préparer proposition Ferme Modern', 'Finaliser devis technique et commercial', 'todo', 'medium', '2026-09-26', 'opportunity', (SELECT id FROM opportunities WHERE name = 'Système IT Agri'), (SELECT id FROM collaborateurs WHERE email = 'jean.dupont@groupmi.com'), (SELECT id FROM collaborateurs WHERE email = 'jean.dupont@groupmi.com')),
('Réunion équipe pôle IT', 'Point hebdomadaire avancement projets', 'todo', 'low', '2026-09-27', 'projet', (SELECT id FROM projets WHERE nom = 'Plateforme E-commerce Trading'), (SELECT id FROM collaborateurs WHERE email = 'moussa.fall@groupmi.com'), (SELECT id FROM collaborateurs WHERE email = 'moussa.fall@groupmi.com')),
('Finaliser devis Taxi Express', 'Calcul ROI et proposition commerciale', 'todo', 'high', '2026-09-28', 'opportunity', (SELECT id FROM opportunities WHERE name = 'Bornes solaires'), (SELECT id FROM collaborateurs WHERE email = 'moussa.fall@groupmi.com'), (SELECT id FROM collaborateurs WHERE email = 'moussa.fall@groupmi.com'))
ON CONFLICT DO NOTHING;

-- =====================================================
-- CORRECTION RLS POLICY DOCUMENTS (bug array comparison)
-- =====================================================

-- Supprimer l'ancienne policy défaillante
DROP POLICY IF EXISTS "Documents: lecture brouillons par autorisés" ON documents;

-- Recréer avec jointure correcte
CREATE POLICY "Documents: lecture brouillons par autorisés"
  ON documents FOR SELECT
  USING (
    statut != 'validé' AND (
      uploaded_by = auth.uid()
      OR auth.uid() IN (
        SELECT unnest(equipe) FROM projets WHERE id = projet_id
      )
      OR auth.uid() IN (
        SELECT responsable_id FROM projets WHERE id = projet_id
      )
    )
  );