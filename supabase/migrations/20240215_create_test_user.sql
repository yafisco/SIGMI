-- Script pour créer un utilisateur test pour SIGMI
-- Email: test@sigmi.com
-- Mot de passe: Test1234

-- NOTE: Ce script doit être exécuté manuellement dans le dashboard Supabase
-- car la création d'utilisateurs Auth nécessite le contexte d'authentification

-- ÉTAPE 1: Créer l'utilisateur dans Supabase Auth (via le dashboard ou API)
-- Allez dans Authentication > Users > Add user
-- Email: test@sigmi.com
-- Password: Test1234
-- Auto confirm user: Oui

-- ÉTAPE 2: Une fois l'utilisateur créé, récupérez son UUID et exécutez cette requête
-- Remplacez 'UUID_HERE' par l'UUID réel de l'utilisateur créé

-- Insérer l'utilisateur test dans la table collaborateurs
INSERT INTO collaborateurs (
  id,
  nom,
  prenom,
  email,
  telephone,
  poste,
  role,
  poles,
  date_embauche,
  actif
) VALUES (
  'UUID_HERE', -- Remplacez par l'UUID de l'utilisateur Supabase Auth
  'TEST',
  'Utilisateur',
  'test@sigmi.com',
  '+221 77 000 00 00',
  'Utilisateur Test',
  'administrateur système',
  ARRAY['ingénierie informatique', 'génie civil et BTP', 'agrobusiness', 'trading international', 'transition énergétique', 'centre d\'incubation et d\'impulsion des entreprises'],
  CURRENT_DATE,
  true
) ON CONFLICT (email) DO NOTHING;

-- Vérification: Afficher l'utilisateur créé
SELECT * FROM collaborateurs WHERE email = 'test@sigmi.com';
