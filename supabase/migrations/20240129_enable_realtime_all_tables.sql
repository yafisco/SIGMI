-- Activer Realtime pour toutes les tables du système
-- Cette migration permet la synchronisation en temps réel pour toute l'application

-- Tables de base
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE collaborators;

-- Commercial
ALTER PUBLICATION supabase_realtime ADD TABLE interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE demandes_agrement;
ALTER PUBLICATION supabase_realtime ADD TABLE modeles_emails;

-- Finance
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE encaissements_decaissements;
ALTER PUBLICATION supabase_realtime ADD TABLE rapports;
ALTER PUBLICATION supabase_realtime ADD TABLE factures;

-- Gestion commerciale
ALTER PUBLICATION supabase_realtime ADD TABLE produits;
ALTER PUBLICATION supabase_realtime ADD TABLE stocks;
ALTER PUBLICATION supabase_realtime ADD TABLE fournisseurs;
ALTER PUBLICATION supabase_realtime ADD TABLE ventes;
ALTER PUBLICATION supabase_realtime ADD TABLE devis;

-- Marketing
ALTER PUBLICATION supabase_realtime ADD TABLE campagnes_marketing;
ALTER PUBLICATION supabase_realtime ADD TABLE sources_prospects;

-- Recrutement
ALTER PUBLICATION supabase_realtime ADD TABLE postes;
ALTER PUBLICATION supabase_realtime ADD TABLE candidatures;

-- Calendrier
ALTER PUBLICATION supabase_realtime ADD TABLE evenements;
