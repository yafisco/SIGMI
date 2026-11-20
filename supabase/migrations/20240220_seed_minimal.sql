-- Seed minimal pour SIGMI - Environnement de test
-- Pôles, rôles et paramètres de base sans données réelles de client

-- Les rôles sont déjà définis par l'enum app_role dans le schéma
-- direction_generale, commercial, finance_comptabilite, responsable_pole, back_office, admin

-- Insertion des sources de prospects par défaut
INSERT INTO sources_prospects (nom, description, canal, qualite_leads, actif) VALUES
  ('Réseaux sociaux', 'Prospects issus des réseaux sociaux (LinkedIn, Facebook, etc.)', 'digital', 'moyenne', true),
  ('Salons professionnels', 'Prospects rencontrés lors de salons et événements', 'evenement', 'haute', true),
  ('Recommandation', 'Prospects recommandés par des clients existants', 'bouche_a_oreille', 'haute', true),
  ('Site web', 'Prospects ayant contacté via le formulaire du site web', 'digital', 'moyenne', true),
  ('Télémarketing', 'Prospects identifiés par démarchage téléphonique', 'telephone', 'faible', true),
  ('Partenaires', 'Prospects via partenaires commerciaux', 'partenariat', 'moyenne', true)
ON CONFLICT (nom) DO NOTHING;

-- Catégories de dépenses par défaut pour la trésorerie
INSERT INTO transactions (type, categorie, montant, description, date_transaction, statut) VALUES
  ('decaissement', 'divers', 0, 'Dépenses diverses', NOW(), 'en_attente'),
  ('encaissement', 'vente', 0, 'Ventes', NOW(), 'en_attente'),
  ('decaissement', 'salaire', 0, 'Salaires', NOW(), 'en_attente'),
  ('decaissement', 'frais', 0, 'Frais généraux', NOW(), 'en_attente')
ON CONFLICT DO NOTHING;

-- Types de campagnes marketing par défaut
INSERT INTO campagnes_marketing (nom, type, canal, statut, leads_generes, created_at) VALUES
  ('Campagne LinkedIn - Ingénierie', 'Lead Generation', 'LinkedIn', 'planifie', 0, NOW()),
  ('Campagne Email - BTP', 'Email Marketing', 'Email', 'planifie', 0, NOW()),
  ('Salon BTP Dakar', 'Événement', 'Salon', 'planifie', 0, NOW())
ON CONFLICT (nom) DO NOTHING;

-- Postes par défaut pour le recrutement
INSERT INTO postes (titre, description, departement, type_contrat, lieu, statut, date_publication) VALUES
  ('Ingénieur Informatique', 'Ingénieur développement et infrastructure', 'Ingénierie informatique', 'CDI', 'Thiès', 'ouvert', NOW()),
  ('Technicien BTP', 'Technicien travaux génie civil', 'Génie civil et BTP', 'CDI', 'Thiès', 'ouvert', NOW()),
  ('Chargé de projet énergie', 'Gestion de projets transition énergétique', 'Transition énergétique', 'CDI', 'Thiès', 'ouvert', NOW())
ON CONFLICT (titre) DO NOTHING;
