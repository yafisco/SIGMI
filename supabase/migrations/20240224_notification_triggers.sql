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
  JOIN profiles p ON u.id = p.id
  WHERE p.role IN ('direction_generale', 'commercial', 'responsable_pole', 'back_office');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour les nouvelles interactions
CREATE OR REPLACE FUNCTION notify_new_interaction()
RETURNS TRIGGER AS $$
DECLARE
  type_label TEXT;
BEGIN
  -- Déterminer le libellé du type en français
  CASE NEW.type
    WHEN 'email' THEN type_label := 'Email';
    WHEN 'call' THEN type_label := 'Appel';
    WHEN 'meeting' THEN type_label := 'Réunion';
    WHEN 'visit' THEN type_label := 'Visite';
    WHEN 'note' THEN type_label := 'Note';
    ELSE type_label := NEW.type;
  END CASE;

  PERFORM create_notification_for_role(
    'interaction',
    'Nouvelle ' || type_label,
    type_label || ' : ' || NEW.title ||
    CASE
      WHEN NEW.client_nom IS NOT NULL THEN ' - Client : ' || NEW.client_nom
      ELSE ''
    END,
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
    'Opportunité : ' || NEW.name ||
    CASE
      WHEN NEW.amount IS NOT NULL THEN ' - Montant : ' || NEW.amount::TEXT || ' FCFA'
      ELSE ''
    END ||
    CASE
      WHEN NEW.client_nom IS NOT NULL THEN ' - Client : ' || NEW.client_nom
      ELSE ''
    END,
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
  -- Si la date d'échéance est passée et la tâche n'est pas terminée
  IF NEW.due_date < NOW()::date AND NEW.status != 'done' AND NEW.status != 'cancelled' THEN
    -- Sur INSERT ou sur UPDATE si la date a changé
    IF TG_OP = 'INSERT' OR (OLD.due_date IS NULL OR OLD.due_date >= NOW()::date) THEN
      PERFORM create_notification_for_role(
        'task',
        'Tâche en retard',
        'La tâche "' || NEW.title || '" est en retard',
        NEW.id,
        'task'
      );
    END IF;
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

DROP TRIGGER IF EXISTS on_opportunity_insert ON opportunities;
CREATE TRIGGER on_opportunity_insert
AFTER INSERT ON opportunities
FOR EACH ROW
EXECUTE FUNCTION notify_new_opportunity();

DROP TRIGGER IF EXISTS on_task_insert ON tasks;
CREATE TRIGGER on_task_insert
AFTER INSERT ON tasks
FOR EACH ROW
EXECUTE FUNCTION notify_overdue_task();

DROP TRIGGER IF EXISTS on_task_update ON tasks;
CREATE TRIGGER on_task_update
AFTER UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION notify_overdue_task();
