-- Fonction pour créer une notification pour tous les utilisateurs d'un rôle
CREATE OR REPLACE FUNCTION create_notification_for_role(
  p_type VARCHAR,
  p_title TEXT,
  p_message TEXT,
  p_related_id UUID DEFAULT NULL,
  p_related_type VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
  SELECT 
    u.id,
    p_type,
    p_title,
    p_message,
    p_related_id,
    p_related_type
  FROM auth.users u
  JOIN profiles p ON u.id = p.user_id
  WHERE p.role IN ('direction_generale', 'commercial', 'responsable_pole', 'back_office');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour les nouvelles interactions
CREATE OR REPLACE FUNCTION notify_new_interaction()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification_for_role(
    'interaction',
    'Nouvelle interaction',
    'Une nouvelle interaction a été enregistrée par ' || COALESCE(NEW.created_by::text, 'un collaborateur'),
    NEW.id,
    'interaction'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les nouvelles opportunités
CREATE OR REPLACE FUNCTION notify_new_opportunity()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification_for_role(
    'opportunity',
    'Nouvelle opportunité',
    'Une nouvelle opportunité a été créée pour ' || COALESCE(
      (SELECT raison_sociale FROM clients WHERE id = NEW.client_id),
      'un client'
    ),
    NEW.id,
    'opportunity'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les tâches en retard
CREATE OR REPLACE FUNCTION notify_overdue_task()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'en_retard' AND (OLD.statut IS NULL OR OLD.statut != 'en_retard') THEN
    PERFORM create_notification_for_role(
      'task',
      'Tâche en retard',
      'La tâche "' || NEW.titre || '" est en retard',
      NEW.id,
      'task'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers
DROP TRIGGER IF EXISTS on_interaction_insert ON interactions;
CREATE TRIGGER on_interaction_insert
AFTER INSERT ON interactions
FOR EACH ROW
EXECUTE FUNCTION notify_new_interaction();

DROP TRIGGER IF EXISTS on_opportunity_insert ON opportunites;
CREATE TRIGGER on_opportunity_insert
AFTER INSERT ON opportunites
FOR EACH ROW
EXECUTE FUNCTION notify_new_opportunity();

DROP TRIGGER IF EXISTS on_task_update ON taches;
CREATE TRIGGER on_task_update
AFTER UPDATE ON taches
FOR EACH ROW
EXECUTE FUNCTION notify_overdue_task();
