# Configuration de l'envoi d'emails avec Resend

## Configuration actuelle (site non hébergé)

Pour l'instant, le site utilise l'adresse par défaut de Resend : `onboarding@resend.dev`
- **Avantage** : Fonctionne immédiatement sans configuration DNS
- **Inconvénient** : L'expéditeur sera `onboarding@resend.dev` au lieu de `service.commercial@madinainfotech.com`

Quand le site sera hébergé, vous pourrez configurer votre propre domaine pour utiliser `service.commercial@madinainfotech.com`.

---

## Étape 1 : Créer un compte Resend

1. Allez sur https://resend.com
2. Cliquez sur "Sign Up" ou "Get Started"
3. Créez un compte avec votre email
4. Vérifiez votre email

## Étape 2 : Obtenir la clé API

1. Dans Resend, allez dans "API Keys"
2. Cliquez sur "Create API Key"
3. Donnez un nom (ex: "SIGMI Production")
4. Copiez la clé API (elle commence par `re_...`)

## Étape 3 : Configurer les secrets Supabase

Ouvrez un terminal dans le dossier du projet et exécutez :

```bash
cd "Y:\LEARNING 2026\MES PROJETS\CRM MI\crm-group-mi"
supabase secrets set RESEND_API_KEY=votre_clé_api_ici
```

Remplacez `votre_clé_api_ici` par votre clé API Resend réelle.

## Étape 4 : Déployer l'Edge Function

```bash
supabase functions deploy send-email
```

## Étape 5 : Tester

1. Redémarrez le serveur de développement : `npm run dev`
2. Allez dans `/commercial/interactions`
3. Créez une interaction de type "email"
4. Cliquez sur l'icône enveloppe
5. Sélectionnez un modèle d'email
6. Cliquez sur "Envoyer"
7. Vérifiez que l'email est bien reçu (expéditeur : onboarding@resend.dev)

---

## Configuration future (quand le site sera hébergé)

Pour utiliser `service.commercial@madinainfotech.com` comme expéditeur :

### 1. Configurer le domaine email

1. Dans Resend, allez dans "Domains"
2. Cliquez sur "Add Domain"
3. Entrez : `madinainfotech.com`
4. Resend va vous donner des enregistrements DNS à ajouter :
   - **Enregistrement TXT** pour la vérification du domaine
   - **Enregistrement TXT** pour SPF
   - **Enregistrement CNAME** pour DKIM

5. Ajoutez ces enregistrements DNS chez votre hébergeur de domaine
6. Attendez que Resend confirme que le domaine est vérifié

### 2. Modifier l'Edge Function

Dans `supabase/functions/send-email/index.ts`, changez :

```typescript
from: 'GROUP MI - Service Commercial <onboarding@resend.dev>',
```

en :

```typescript
from: 'GROUP MI - Service Commercial <service.commercial@madinainfotech.com>',
```

### 3. Redéployer

```bash
supabase functions deploy send-email
```

---

## Résolution de problèmes

### Erreur "Service d'email non configuré"
- Vérifiez que la clé API est bien configurée : `supabase secrets list`
- Si elle n'est pas là, relancez : `supabase secrets set RESEND_API_KEY=votre_clé`

### Email non reçu
- Vérifiez le dossier spam
- Vérifiez les logs dans Resend Dashboard
- Avec l'adresse par défaut, vérifiez que vous avez bien reçu l'email de vérification Resend

---

## Coût

Resend offre :
- **Gratuit** : 3000 emails par mois
- **Payant** : $20 pour 50 000 emails par mois

Pour SIGMI, le plan gratuit devrait suffire au début.
