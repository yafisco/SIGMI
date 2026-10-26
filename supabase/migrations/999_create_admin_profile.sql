-- Créer le profil admin pour cheikh.diop@madinainfotech.com
INSERT INTO profiles (id, email, nom, prenom, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'cheikh.diop@madinainfotech.com'),
  'cheikh.diop@madinainfotech.com',
  'Diop',
  'Cheikh',
  'admin'
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  nom = 'Diop',
  prenom = 'Cheikh';
