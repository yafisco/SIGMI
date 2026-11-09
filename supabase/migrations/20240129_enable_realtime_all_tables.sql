-- Activer Realtime pour toutes les tables du système
-- Cette migration permet la synchronisation en temps réel pour toute l'application
-- Les commandes utilisent une fonction PL/pgSQL pour ignorer les tables déjà activées

DO $$
DECLARE
  table_name text;
BEGIN
  -- Tables de base (noms en français)
  FOR table_name IN SELECT unnest(ARRAY['clients', 'contacts', 'opportunities', 'projets', 'documents', 'tasks', 'collaborateurs'])
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', table_name);
    EXCEPTION WHEN duplicate_object THEN
      -- Table déjà dans la publication, ignorer
      RAISE NOTICE 'Table % est déjà dans la publication', table_name;
    END;
  END LOOP;

  -- Commercial
  FOR table_name IN SELECT unnest(ARRAY['interactions', 'demandes_agrement', 'modeles_emails'])
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', table_name);
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Table % est déjà dans la publication', table_name;
    END;
  END LOOP;

  -- Finance
  FOR table_name IN SELECT unnest(ARRAY['budgets', 'encaissements_decaissements', 'rapports', 'factures'])
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', table_name);
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Table % est déjà dans la publication', table_name;
    END;
  END LOOP;

  -- Gestion commerciale
  FOR table_name IN SELECT unnest(ARRAY['produits', 'stocks', 'fournisseurs', 'ventes', 'devis'])
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', table_name);
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Table % est déjà dans la publication', table_name;
    END;
  END LOOP;

  -- Marketing
  FOR table_name IN SELECT unnest(ARRAY['campagnes_marketing', 'sources_prospects'])
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', table_name);
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Table % est déjà dans la publication', table_name;
    END;
  END LOOP;

  -- Recrutement
  FOR table_name IN SELECT unnest(ARRAY['postes', 'candidatures'])
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', table_name);
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Table % est déjà dans la publication', table_name;
    END;
  END LOOP;

  -- Calendrier
  FOR table_name IN SELECT unnest(ARRAY['evenements'])
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', table_name);
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Table % est déjà dans la publication', table_name;
    END;
  END LOOP;
END $$;
