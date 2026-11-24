-- Table des notifications pour le système en temps réel
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('interaction', 'opportunity', 'task', 'document', 'alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  related_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS activé
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour notifications
-- Un utilisateur ne peut voir que ses propres notifications
CREATE POLICY "Utilisateurs peuvent voir leurs notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Le système peut créer des notifications pour les utilisateurs
CREATE POLICY "Système peut créer des notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Les utilisateurs peuvent marquer leurs notifications comme lues
CREATE POLICY "Utilisateurs peuvent marquer leurs notifications comme lues"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs notifications
CREATE POLICY "Utilisateurs peuvent supprimer leurs notifications"
ON notifications FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Activer Realtime pour les notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
