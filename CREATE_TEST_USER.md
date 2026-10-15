# Créer un utilisateur test pour SIGMI

## Utilisateur test recommandé

- **Email**: `test@sigmi.com`
- **Mot de passe**: `Test1234`
- **Rôle**: Administrateur système (accès complet)

## Méthode 1: Via le Dashboard Supabase (Recommandé)

### Étape 1: Créer l'utilisateur dans Supabase Auth

1. Allez sur votre dashboard Supabase: https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Authentication** > **Users**
4. Cliquez sur **Add user**
5. Remplissez le formulaire:
   - Email: `test@sigmi.com`
   - Password: `Test1234`
   - Auto Confirm User: ✅ (coché)
6. Cliquez sur **Create user**

### Étape 2: Récupérer l'UUID de l'utilisateur

1. Dans la liste des utilisateurs, cliquez sur l'utilisateur `test@sigmi.com`
2. Copiez l'UUID (il ressemble à: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Étape 3: Insérer l'utilisateur dans la table collaborateurs

1. Allez dans **SQL Editor**
2. Exécutez la requête suivante (remplacez `UUID_HERE` par l'UUID copié):

```sql
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
  'UUID_HERE',
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
```

### Étape 4: Vérifier

```sql
SELECT * FROM collaborateurs WHERE email = 'test@sigmi.com';
```

## Méthode 2: Via l'interface d'inscription

1. Allez sur http://localhost:3000/register
2. Remplissez le formulaire d'inscription avec:
   - Nom: Test
   - Prénom: Utilisateur
   - Email: test@sigmi.com
   - Mot de passe: Test1234
   - Confirmer: Test1234
3. Cliquez sur "Créer mon compte"
4. L'utilisateur sera automatiquement créé dans Supabase Auth et dans la table collaborateurs

## Tester la connexion

1. Allez sur http://localhost:3000/login
2. Entrez:
   - Email: `test@sigmi.com`
   - Mot de passe: `Test1234`
3. Cliquez sur "Se connecter"
4. Vous serez redirigé vers le dashboard

## Permissions de l'utilisateur test

- **Rôle**: Administrateur système
- **Accès**: Tous les modules (Collaborateurs, Projets, Documents, Dashboard)
- **Pôles**: Les 6 pôles d'activité
