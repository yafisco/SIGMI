-- Activer RLS sur email_templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : les utilisateurs authentifiés peuvent lire tous les templates
CREATE POLICY "email_templates_select_policy"
ON email_templates FOR SELECT
TO authenticated
USING (true);

-- Politique d'insertion : les utilisateurs authentifiés peuvent créer des templates
CREATE POLICY "email_templates_insert_policy"
ON email_templates FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
  OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'direction_generale', 'commercial')
);

-- Politique de mise à jour : les créateurs ou admins peuvent modifier
CREATE POLICY "email_templates_update_policy"
ON email_templates FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'direction_generale', 'commercial')
)
WITH CHECK (
  created_by = auth.uid()
  OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'direction_generale', 'commercial')
);

-- Politique de suppression : les créateurs ou admins peuvent supprimer
CREATE POLICY "email_templates_delete_policy"
ON email_templates FOR DELETE
TO authenticated
USING (
  created_by = auth.uid()
  OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'direction_generale', 'commercial')
);
