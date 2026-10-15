# Configuration de la confirmation par email pour SIGMI

## Étape 1 : Activer la confirmation email dans Supabase

1. Allez sur le dashboard Supabase : https://supabase.com/dashboard/project/xhgspkunwikvufrireqw
2. Cliquez sur **Authentication** dans le menu de gauche
3. Cliquez sur **Providers**
4. Cliquez sur **Email**
5. Activez l'option **Confirm email**
6. (Optionnel) Personnalisez le template d'email avec le branding GROUP MI

## Étape 2 : Configurer les emails SMTP (recommandé)

Pour que les emails soient envoyés de manière fiable, configurez un service SMTP :

1. Dans **Authentication** → **Email Templates**, cliquez sur **SMTP Settings**
2. Configurez avec un provider (ex: SendGrid, Mailgun, Resend)
3. Ou utilisez le service email par défaut de Supabase (limite aux emails de test)

## Étape 3 : Tester le flux

1. Allez sur http://localhost:3000/register
2. Créez un compte avec un email valide
3. Vérifiez votre boîte mail (et le dossier spam)
4. Cliquez sur le lien de confirmation
5. Vous serez redirigé vers `/dashboard`

## Fonctionnement technique

### Page d'inscription (`/register`)
- L'utilisateur crée un compte avec email et mot de passe
- Supabase envoie un email de confirmation
- Le collaborateur est créé dans la table `collaborateurs` (même si email non confirmé pour l'instant)
- Un message informe l'utilisateur de vérifier sa boîte mail

### Page de callback (`/auth/callback`)
- Quand l'utilisateur clique sur le lien d'email
- Supabase valide le code de confirmation
- L'utilisateur est connecté automatiquement
- Redirection vers `/dashboard`

### Page de login (`/login`)
- L'utilisateur ne peut se connecter que si son email est confirmé
- Message d'erreur clair si email non confirmé

## Dépannage

### Email non reçu
- Vérifiez le dossier spam
- Vérifiez que l'option "Confirm email" est activée dans Supabase
- Vérifiez les logs Supabase pour les erreurs d'envoi

### Erreur "Email not confirmed"
- C'est normal : l'utilisateur doit d'abord confirmer son email
- Il peut renvoyer l'email de confirmation via Supabase

### Collaborateur non créé
- Vérifiez que la table `collaborateurs` existe
- Vérifiez les politiques RLS
- Vérifiez les logs dans la console du navigateur
