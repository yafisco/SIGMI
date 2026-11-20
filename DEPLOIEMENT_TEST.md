# Guide de déploiement SIGMI - Environnement de test

## Étapes à effectuer manuellement

### 1. Création du projet Supabase de test

1. Connectez-vous à [https://supabase.com](https://supabase.com)
2. Cliquez sur "New Project"
3. Remplissez les informations :
   - **Name** : `sigmi-test`
   - **Database Password** : choisissez un mot de passe fort (notez-le)
   - **Region** : `West Africa` (Lagos) ou la région la plus proche du Sénégal
   - **Pricing Plan** : Free ou Pro selon vos besoins
4. Cliquez sur "Create new project"
5. Attendez que le projet soit provisionné (2-3 minutes)

Une fois le projet créé, récupérez depuis le dashboard Supabase :
- **Project URL** (Settings → API)
- **anon public key** (Settings → API)
- **service_role key** (Settings → API - à garder confidentiel)

### 2. Connexion du dépôt GitHub à Vercel

1. Connectez-vous à [https://vercel.com](https://vercel.com)
2. Cliquez sur "Add New..." → "Project"
3. Importez le dépôt GitHub `yafisco/SIGMI`
4. Configurez le projet :
   - **Framework Preset** : Next.js
   - **Root Directory** : `crm-group-mi`
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`
5. Cliquez sur "Deploy"

### 3. Configuration des variables d'environnement dans Vercel

Une fois le projet Vercel créé, allez dans Settings → Environment Variables et ajoutez :

| Nom | Valeur | Environnement |
|-----|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (depuis le dashboard) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon du projet Supabase | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role du projet Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | URL de votre domaine Vercel (ex: `https://sigmi-test.vercel.app`) | Production, Preview, Development |

Sauvegardez et redéployez le projet.

### 4. Application des migrations Supabase

Une fois le projet Supabase créé, appliquez toutes les migrations :

**Option A : Via Supabase CLI (recommandé)**
```bash
# Installer Supabase CLI si non installé
npm install -g supabase

# Se connecter à votre compte
supabase login

# Lier le projet local au projet de test
cd Y:\LEARNING 2026\MES PROJETS\CRM MI\crm-group-mi
supabase link --project-ref <votre-project-ref>

# Pousser les migrations
supabase db push
```

**Option B : Manuellement via le dashboard**
1. Allez dans Supabase Dashboard → SQL Editor
2. Exécutez chaque fichier de migration du dossier `supabase/migrations/` dans l'ordre chronologique
3. Commencez par les plus anciennes (vérifiez les dates dans les noms de fichiers)

### 5. Configuration des URL de redirection Supabase Auth

1. Allez dans Supabase Dashboard → Authentication → URL Configuration
2. Ajoutez les URL suivantes dans "Site URL" et "Redirect URLs" :

```
https://sigmi-test.vercel.app
https://sigmi-test.vercel.app/**
http://localhost:3000
http://localhost:3000/**
```

3. Sauvegardez les modifications

### 6. Création du premier compte admin

Après déploiement, vous devrez créer le premier compte admin manuellement via le Supabase Dashboard ou via un script que je préparerai.

## À faire par le développeur (Devin)

- [x] Corriger les erreurs de build
- [x] Vérifier .gitignore et créer .env.example
- [x] Vérifier que service_role n'est pas utilisé côté client
- [ ] Créer un seed minimal (pôles, rôles, paramètres)
- [ ] Rédiger la procédure de déploiement dans le README
- [ ] Script de création du premier compte admin
