-- Créer un utilisateur de test pour le développement
-- Email: test@groupmi.com
-- Mot de passe: Test123456
-- Rôle: commercial
-- Pôle: Madina Infotech

-- D'abord, créer l'utilisateur dans auth.users (via l'interface Supabase ou API)
-- Ensuite, créer l'enregistrement dans notre table users

-- Insérer l'utilisateur de test dans la table users
-- Note: Remplacez l'UUID par celui de l'utilisateur créé dans auth.users
INSERT INTO users (id, email, first_name, last_name, role, pole_id) 
VALUES (
    '00000000-0000-0000-0000-000000000001', -- Remplacez par l'UUID réel de l'utilisateur
    'test@groupmi.com',
    'Ibrahima',
    'Yafa',
    'commercial',
    (SELECT id FROM poles WHERE name = 'Madina Infotech')
);

-- Créer quelques données de test pour le dashboard
-- Clients de test
INSERT INTO clients (name, company, sector, email, phone, assigned_to) VALUES
('Client Test 1', 'Entreprise Test SA', 'IT', 'client1@test.com', '+221 77 123 45 67', '00000000-0000-0000-0000-000000000001'),
('Client Test 2', 'Construction Dakar', 'BTP', 'client2@test.com', '+221 78 234 56 78', '00000000-0000-0000-0000-000000000001'),
('Client Test 3', 'Agri Modern', 'Agriculture', 'client3@test.com', '+221 76 345 67 89', '00000000-0000-0000-0000-000000000001');

-- Opportunités de test
INSERT INTO opportunities (name, client_id, assigned_to, amount, probability, expected_close_date, stage, status) VALUES
('Projet IT Test', (SELECT id FROM clients WHERE name = 'Client Test 1'), '00000000-0000-0000-0000-000000000001', 500000, 75, '2026-10-15', 'negociation', 'active'),
('Construction BTP', (SELECT id FROM clients WHERE name = 'Client Test 2'), '00000000-0000-0000-0000-000000000001', 1200000, 60, '2026-11-01', 'proposition', 'active'),
('Système Agricole', (SELECT id FROM clients WHERE name = 'Client Test 3'), '00000000-0000-0000-0000-000000000001', 350000, 50, '2026-10-30', 'qualifie', 'active');

-- Tâches de test
INSERT INTO tasks (title, description, assigned_to, due_date, priority, status, client_id) VALUES
('Relancer Client Test 1', 'Suivi de l''opportunité Projet IT', '00000000-0000-0000-0000-000000000001', '2026-09-25', 'high', 'todo', (SELECT id FROM clients WHERE name = 'Client Test 1')),
('Préparer proposition', 'Pour Construction BTP', '00000000-0000-0000-0000-000000000001', '2026-09-26', 'medium', 'todo', (SELECT id FROM clients WHERE name = 'Client Test 2')),
('Réunion équipe', 'Réunion hebdomadaire équipe IT', '00000000-0000-0000-0000-000000000001', '2026-09-27', 'low', 'todo', NULL);