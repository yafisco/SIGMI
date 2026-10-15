-- RLS Policies pour SIGMI
-- Ce fichier crée les policies de sécurité Row Level Security pour toutes les tables

-- Activer RLS sur toutes les tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE projets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Fonction pour vérifier si l'utilisateur est administrateur
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM collaborateurs
    WHERE id = user_id
    AND role IN ('direction', 'administrateur système')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer les pôles de l'utilisateur
CREATE OR REPLACE FUNCTION get_user_poles(user_id UUID)
RETURNS TEXT[] AS $$
BEGIN
  RETURN COALESCE(
    (SELECT poles FROM collaborateurs WHERE id = user_id),
    ARRAY[]::TEXT[]
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur a accès à un pôle
CREATE OR REPLACE FUNCTION has_pole_access(user_id UUID, pole TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_admin(user_id) OR pole = ANY(get_user_poles(user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CLIENTS
-- ============================================

-- Les administrateurs peuvent tout voir
CREATE POLICY "admins_can_view_all_clients"
ON clients FOR SELECT
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent voir les clients de leur pôle
CREATE POLICY "users_can_view_pole_clients"
ON clients FOR SELECT
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[] -- Si pas de pôle spécifié, tout le monde peut voir
);

-- Les administrateurs peuvent insérer
CREATE POLICY "admins_can_insert_clients"
ON clients FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Les membres de pôle peuvent insérer
CREATE POLICY "users_can_insert_clients"
ON clients FOR INSERT
WITH CHECK (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent tout modifier
CREATE POLICY "admins_can_update_all_clients"
ON clients FOR UPDATE
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent modifier les clients de leur pôle
CREATE POLICY "users_can_update_pole_clients"
ON clients FOR UPDATE
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent supprimer
CREATE POLICY "admins_can_delete_clients"
ON clients FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- OPPORTUNITIES
-- ============================================

-- Les administrateurs peuvent tout voir
CREATE POLICY "admins_can_view_all_opportunities"
ON opportunities FOR SELECT
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent voir les opportunités de leur pôle
CREATE POLICY "users_can_view_pole_opportunities"
ON opportunities FOR SELECT
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent insérer
CREATE POLICY "admins_can_insert_opportunities"
ON opportunities FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Les membres de pôle peuvent insérer
CREATE POLICY "users_can_insert_opportunities"
ON opportunities FOR INSERT
WITH CHECK (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent tout modifier
CREATE POLICY "admins_can_update_all_opportunities"
ON opportunities FOR UPDATE
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent modifier les opportunités de leur pôle
CREATE POLICY "users_can_update_pole_opportunities"
ON opportunities FOR UPDATE
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent supprimer
CREATE POLICY "admins_can_delete_opportunities"
ON opportunities FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- PROJETS
-- ============================================

-- Les administrateurs peuvent tout voir
CREATE POLICY "admins_can_view_all_projets"
ON projets FOR SELECT
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent voir les projets de leur pôle
CREATE POLICY "users_can_view_pole_projets"
ON projets FOR SELECT
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent insérer
CREATE POLICY "admins_can_insert_projets"
ON projets FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Les membres de pôle peuvent insérer
CREATE POLICY "users_can_insert_projets"
ON projets FOR INSERT
WITH CHECK (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent tout modifier
CREATE POLICY "admins_can_update_all_projets"
ON projets FOR UPDATE
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent modifier les projets de leur pôle
CREATE POLICY "users_can_update_pole_projets"
ON projets FOR UPDATE
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent supprimer
CREATE POLICY "admins_can_delete_projets"
ON projets FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- COLLABORATEURS
-- ============================================

-- Les administrateurs peuvent tout voir
CREATE POLICY "admins_can_view_all_collaborateurs"
ON collaborateurs FOR SELECT
USING (is_admin(auth.uid()));

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "users_can_view_own_profile"
ON collaborateurs FOR SELECT
USING (id = auth.uid());

-- Les membres de pôle peuvent voir les collaborateurs de leur pôle
CREATE POLICY "users_can_view_pole_collaborateurs"
ON collaborateurs FOR SELECT
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent insérer
CREATE POLICY "admins_can_insert_collaborateurs"
ON collaborateurs FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Les administrateurs peuvent tout modifier
CREATE POLICY "admins_can_update_all_collaborateurs"
ON collaborateurs FOR UPDATE
USING (is_admin(auth.uid()));

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "users_can_update_own_profile"
ON collaborateurs FOR UPDATE
USING (id = auth.uid());

-- Les administrateurs peuvent supprimer
CREATE POLICY "admins_can_delete_collaborateurs"
ON collaborateurs FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- CONTACTS
-- ============================================

-- Les administrateurs peuvent tout voir
CREATE POLICY "admins_can_view_all_contacts"
ON contacts FOR SELECT
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent voir les contacts des clients de leur pôle
CREATE POLICY "users_can_view_pole_contacts"
ON contacts FOR SELECT
USING (
  client_id IN (
    SELECT id FROM clients
    WHERE poles && get_user_poles(auth.uid())
    OR poles = ARRAY[]::TEXT[]
  )
);

-- Les administrateurs peuvent insérer
CREATE POLICY "admins_can_insert_contacts"
ON contacts FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Les membres de pôle peuvent insérer des contacts pour les clients de leur pôle
CREATE POLICY "users_can_insert_contacts"
ON contacts FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT id FROM clients
    WHERE poles && get_user_poles(auth.uid())
    OR poles = ARRAY[]::TEXT[]
  )
);

-- Les administrateurs peuvent tout modifier
CREATE POLICY "admins_can_update_all_contacts"
ON contacts FOR UPDATE
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent modifier les contacts des clients de leur pôle
CREATE POLICY "users_can_update_pole_contacts"
ON contacts FOR UPDATE
USING (
  client_id IN (
    SELECT id FROM clients
    WHERE poles && get_user_poles(auth.uid())
    OR poles = ARRAY[]::TEXT[]
  )
);

-- Les administrateurs peuvent supprimer
CREATE POLICY "admins_can_delete_contacts"
ON contacts FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- DOCUMENTS
-- ============================================

-- Les administrateurs peuvent tout voir
CREATE POLICY "admins_can_view_all_documents"
ON documents FOR SELECT
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent voir les documents de leur pôle
CREATE POLICY "users_can_view_pole_documents"
ON documents FOR SELECT
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent insérer
CREATE POLICY "admins_can_insert_documents"
ON documents FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Les membres de pôle peuvent insérer
CREATE POLICY "users_can_insert_documents"
ON documents FOR INSERT
WITH CHECK (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent tout modifier
CREATE POLICY "admins_can_update_all_documents"
ON documents FOR UPDATE
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent modifier les documents de leur pôle
CREATE POLICY "users_can_update_pole_documents"
ON documents FOR UPDATE
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent supprimer
CREATE POLICY "admins_can_delete_documents"
ON documents FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- TASKS
-- ============================================

-- Les administrateurs peuvent tout voir
CREATE POLICY "admins_can_view_all_tasks"
ON tasks FOR SELECT
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent voir les tâches de leur pôle
CREATE POLICY "users_can_view_pole_tasks"
ON tasks FOR SELECT
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les utilisateurs peuvent voir les tâches qui leur sont assignées
CREATE POLICY "users_can_view_assigned_tasks"
ON tasks FOR SELECT
USING (assigned_to = auth.uid());

-- Les administrateurs peuvent insérer
CREATE POLICY "admins_can_insert_tasks"
ON tasks FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Les membres de pôle peuvent insérer
CREATE POLICY "users_can_insert_tasks"
ON tasks FOR INSERT
WITH CHECK (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent tout modifier
CREATE POLICY "admins_can_update_all_tasks"
ON tasks FOR UPDATE
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent modifier les tâches de leur pôle
CREATE POLICY "users_can_update_pole_tasks"
ON tasks FOR UPDATE
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les utilisateurs peuvent modifier les tâches qui leur sont assignées
CREATE POLICY "users_can_update_assigned_tasks"
ON tasks FOR UPDATE
USING (assigned_to = auth.uid());

-- Les administrateurs peuvent supprimer
CREATE POLICY "admins_can_delete_tasks"
ON tasks FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- INTERACTIONS
-- ============================================

-- Les administrateurs peuvent tout voir
CREATE POLICY "admins_can_view_all_interactions"
ON interactions FOR SELECT
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent voir les interactions de leur pôle
CREATE POLICY "users_can_view_pole_interactions"
ON interactions FOR SELECT
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les utilisateurs peuvent voir leurs propres interactions
CREATE POLICY "users_can_view_own_interactions"
ON interactions FOR SELECT
USING (created_by = auth.uid());

-- Les administrateurs peuvent insérer
CREATE POLICY "admins_can_insert_interactions"
ON interactions FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Les membres de pôle peuvent insérer
CREATE POLICY "users_can_insert_interactions"
ON interactions FOR INSERT
WITH CHECK (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les administrateurs peuvent tout modifier
CREATE POLICY "admins_can_update_all_interactions"
ON interactions FOR UPDATE
USING (is_admin(auth.uid()));

-- Les membres de pôle peuvent modifier les interactions de leur pôle
CREATE POLICY "users_can_update_pole_interactions"
ON interactions FOR UPDATE
USING (
  poles && get_user_poles(auth.uid())
  OR poles = ARRAY[]::TEXT[]
);

-- Les utilisateurs peuvent modifier leurs propres interactions
CREATE POLICY "users_can_update_own_interactions"
ON interactions FOR UPDATE
USING (created_by = auth.uid());

-- Les administrateurs peuvent supprimer
CREATE POLICY "admins_can_delete_interactions"
ON interactions FOR DELETE
USING (is_admin(auth.uid()));

-- ============================================
-- INDEX POUR OPTIMISATION
-- ============================================

-- Index sur poles pour optimiser les filtres par pôle
CREATE INDEX IF NOT EXISTS idx_clients_poles ON clients USING GIN(poles);
CREATE INDEX IF NOT EXISTS idx_opportunities_poles ON opportunities USING GIN(poles);
CREATE INDEX IF NOT EXISTS idx_projets_poles ON projets USING GIN(poles);
CREATE INDEX IF NOT EXISTS idx_collaborateurs_poles ON collaborateurs USING GIN(poles);
CREATE INDEX IF NOT EXISTS idx_documents_poles ON documents USING GIN(poles);
CREATE INDEX IF NOT EXISTS idx_tasks_poles ON tasks USING GIN(poles);
CREATE INDEX IF NOT EXISTS idx_interactions_poles ON interactions USING GIN(poles);

-- Index sur created_by pour optimiser les filtres par utilisateur
CREATE INDEX IF NOT EXISTS idx_interactions_created_by ON interactions(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
