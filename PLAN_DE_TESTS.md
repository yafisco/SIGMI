# Plan de Tests - SIGMI

Ce document détaille les tests à effectuer pour valider les fonctionnalités actuellement implémentées de SIGMI.

---

## Pré-requis

### 1. Configuration Supabase
- [ ] Vérifier que le projet Supabase est accessible : https://supabase.com/dashboard/project/xhgspkunwikvufrireqw
- [ ] Vérifier que les tables existent dans SQL Editor :
  - `collaborateurs`
  - `clients`
  - `contacts`
  - `opportunities`
  - `tasks`
  - `interactions`
  - `projets`
  - `documents`
- [ ] Vérifier que `.env.local` contient les bonnes clés Supabase
- [ ] Exécuter la migration si nécessaire : `supabase/migrations/001_initial_schema.sql`

### 2. Démarrage de l'application
```bash
cd "Y:\LEARNING 2026\MES PROJETS\CRM MI\crm-group-mi"
npm run dev
```
- [ ] Vérifier que le serveur démarre sans erreur
- [ ] Accéder à http://localhost:3000

---

## Tests d'Authentification

### Test 1.1 - Inscription
**Objectif :** Créer un nouveau compte utilisateur

1. Allez sur la page d'inscription (`/register`)
2. Remplissez le formulaire :
   - Email : `test@groupmi.com`
   - Mot de passe : `Test123456`
   - Prénom : `Test`
   - Nom : `User`
3. Cliquez sur "S'inscrire"
4. **Résultat attendu :**
   - Message de succès
   - Création automatique d'un profil collaborateur
   - Redirection vers le login ou le dashboard

### Test 1.2 - Connexion
**Objectif :** Se connecter avec un compte existant

1. Allez sur la page de login (`/login`)
2. Entrez les identifiants :
   - Email : `test@groupmi.com`
   - Mot de passe : `Test123456`
3. Cliquez sur "Se connecter"
4. **Résultat attendu :**
   - Connexion réussie
   - Redirection vers le dashboard
   - Nom de l'utilisateur affiché dans le header

### Test 1.3 - Déconnexion
**Objectif :** Se déconnecter proprement

1. Cliquez sur le bouton de déconnexion dans le header
2. **Résultat attendu :**
   - Déconnexion réussie
   - Redirection vers la page de login
   - Impossible d'accéder aux pages protégées sans se reconnecter

---

## Tests du Dashboard

### Test 2.1 - Dashboard avec base vide
**Objectif :** Vérifier l'affichage du dashboard sans données

1. Connectez-vous avec un compte neuf
2. Allez sur le dashboard (`/dashboard`)
3. **Résultat attendu :**
   - Tous les compteurs affichent 0
   - Aucune erreur d'affichage
   - Message "Aucune tâche urgente" affiché
   - Pipeline avec tous les étapes à 0

### Test 2.2 - Dashboard avec données
**Objectif :** Vérifier le calcul des statistiques

1. Créez quelques clients, tâches, projets
2. Actualisez le dashboard
3. **Résultat attendu :**
   - Compteurs mis à jour correctement
   - Pipeline affiche les montants et étapes corrects
   - Tâches urgentes affichées si présentes
   - Nom de l'utilisateur affiché

---

## Tests de Gestion des Clients

### Test 3.1 - Création d'un client
**Objectif :** Créer un nouveau client

1. Allez sur `/clients/create`
2. Remplissez le formulaire :
   - Nom : `Client Test`
   - Entreprise : `Entreprise Test`
   - Email : `contact@clienttest.com`
   - Téléphone : `+221 33 123 45 67`
   - Adresse : `Dakar, Sénégal`
   - Secteur : `Technologie`
3. Cliquez sur "Créer le client"
4. **Résultat attendu :**
   - Message de succès
   - Redirection vers la liste des clients
   - Client visible dans la liste

### Test 3.2 - Liste des clients
**Objectif :** Afficher la liste des clients

1. Allez sur `/clients`
2. **Résultat attendu :**
   - Liste des clients affichée
   - Informations : nom, entreprise, email, téléphone, responsable
   - Badges de statut (actif/inactif)
   - État vide si aucun client

### Test 3.3 - Recherche de clients
**Objectif :** Rechercher un client

1. Dans la liste des clients, tapez dans la barre de recherche : "Test"
2. **Résultat attendu :**
   - Filtrage en temps réel
   - Seuls les clients correspondants affichés

### Test 3.4 - Filtres de clients
**Objectif :** Filtrer les clients par statut/pôle

1. Utilisez les filtres par statut ou pôle
2. **Résultat attendu :**
   - Liste filtrée correctement
   - Réinitialisation possible

---

## Tests de Gestion des Contacts

### Test 4.1 - Création d'un contact
**Objectif :** Créer un contact lié à un client

1. Allez sur `/contacts/create`
2. Remplissez le formulaire :
   - Sélectionnez un client existant
   - Nom : `Diallo`
   - Prénom : `Amadou`
   - Poste : `Directeur`
   - Email : `amadou@clienttest.com`
   - Téléphone : `+221 77 123 45 67`
3. Cliquez sur "Créer le contact"
4. **Résultat attendu :**
   - Message de succès
   - Redirection vers la liste
   - Contact visible avec le nom du client associé

### Test 4.2 - Liste des contacts
**Objectif :** Afficher la liste des contacts

1. Allez sur `/contacts`
2. **Résultat attendu :**
   - Liste des contacts affichée
   - Nom du client associé affiché
   - Informations : nom, prénom, poste, email, téléphone

---

## Tests de Gestion des Opportunités

### Test 5.1 - Création d'une opportunité
**Objectif :** Créer une opportunité commerciale

1. Allez sur `/opportunites/create`
2. Remplissez le formulaire :
   - Nom : `Projet SI Client Test`
   - Client : Sélectionnez un client existant
   - Montant estimé : `5000000`
   - Probabilité : `50`
   - Date de clôture : Sélectionnez une date future
   - Étape : `prospect`
   - Description : `Opportunité de test`
3. Cliquez sur "Créer l'opportunité"
4. **Résultat attendu :**
   - Message de succès
   - Redirection vers la liste
   - Opportunité visible avec les bonnes informations

### Test 5.2 - Liste des opportunités
**Objectif :** Afficher la liste des opportunités

1. Allez sur `/opportunites`
2. **Résultat attendu :**
   - Liste des opportunités affichée
   - Informations : nom, client, montant, probabilité, étape, date de clôture
   - Badges de couleur pour les étapes
   - Badges de statut (actif/gagné/perdu)

### Test 5.3 - Filtres d'opportunités
**Objectif :** Filtrer par étape, statut, pôle

1. Utilisez les filtres disponibles
2. **Résultat attendu :**
   - Filtrage correct
   - Réinitialisation possible

---

## Tests de Gestion des Interactions

### Test 6.1 - Création d'une interaction
**Objectif :** Enregistrer une interaction avec un client

1. Allez sur `/interactions/create`
2. Remplissez le formulaire :
   - Type : `Appel`
   - Date : Date du jour
   - Client : Sélectionnez un client
   - Opportunité : Sélectionnez une opportunité (optionnel)
   - Notes : `Discussion sur le projet`
   - Résultat : `Intéressé`
3. Cliquez sur "Créer l'interaction"
4. **Résultat attendu :**
   - Message de succès
   - Redirection vers la liste
   - Interaction visible avec les bonnes informations

### Test 6.2 - Liste des interactions
**Objectif :** Afficher l'historique des interactions

1. Allez sur `/interactions`
2. **Résultat attendu :**
   - Liste chronologique des interactions
   - Informations : type, date, client, opportunité, notes
   - Badges de couleur pour les types d'interaction

---

## Tests de Gestion des Tâches

### Test 7.1 - Création d'une tâche
**Objectif :** Créer une tâche assignée

1. Allez sur `/taches/create`
2. Remplissez le formulaire :
   - Titre : `Relancer Client Test`
   - Description : `Appeler pour discuter de l'opportunité`
   - Assigné à : Sélectionnez un collaborateur
   - Date d'échéance : Sélectionnez une date future
   - Priorité : `Haute`
   - Statut : `À faire`
3. Cliquez sur "Créer la tâche"
4. **Résultat attendu :**
   - Message de succès
   - Redirection vers la liste
   - Tâche visible avec les bonnes informations

### Test 7.2 - Liste des tâches
**Objectif :** Afficher la liste des tâches

1. Allez sur `/taches`
2. **Résultat attendu :**
   - Liste des tâches affichée
   - Statistiques en haut (total, à faire, en cours, terminées, urgentes)
   - Informations : titre, statut, priorité, échéance, assigné
   - Indicateur visuel pour les tâches en retard
   - Barre de recherche et filtres

### Test 7.3 - Tâches en retard
**Objectif :** Vérifier l'affichage des tâches dépassées

1. Créez une tâche avec une date d'échéance passée
2. Allez sur la liste des tâches
3. **Résultat attendu :**
   - La tâche est marquée en rouge
   - Icône d'alerte affichée

---

## Tests de Gestion des Projets

### Test 8.1 - Création d'un projet
**Objectif :** Créer un nouveau projet

1. Allez sur `/projets/create`
2. Remplissez le formulaire :
   - Nom : `Projet SI Client Test`
   - Client : Sélectionnez un client
   - Opportunité : Sélectionnez une opportunité (optionnel)
   - Responsable : Sélectionnez un collaborateur
   - Date de début : Date du jour
   - Date de fin : Date future
   - Statut : `En cours`
   - Avancement : `25`
   - Budget : `10000000`
3. Cliquez sur "Créer le projet"
4. **Résultat attendu :**
   - Message de succès
   - Redirection vers la liste
   - Projet visible avec les bonnes informations

### Test 8.2 - Liste des projets
**Objectif :** Afficher la liste des projets

1. Allez sur `/projets`
2. **Résultat attendu :**
   - Liste des projets affichée
   - Informations : nom, client, responsable, dates, statut, avancement
   - Barre de progression visuelle pour l'avancement
   - Badges de statut

---

## Tests de Gestion des Collaborateurs

### Test 9.1 - Création d'un collaborateur
**Objectif :** Ajouter un collaborateur à l'annuaire

1. Allez sur `/collaborateurs/create`
2. Remplissez le formulaire :
   - Prénom : `Fatou`
   - Nom : `Ndiaye`
   - Email : `fatou@groupmi.com`
   - Téléphone : `+221 77 987 65 43`
   - Poste : `Ingénieur`
   - Rôle : `Technique`
   - Pôle : `Ingénierie informatique`
   - Date d'embauche : Date passée
3. Cliquez sur "Créer le collaborateur"
4. **Résultat attendu :**
   - Message de succès
   - Redirection vers la liste
   - Collaborateur visible

### Test 9.2 - Liste des collaborateurs
**Objectif :** Afficher l'annuaire interne

1. Allez sur `/collaborateurs`
2. **Résultat attendu :**
   - Liste des collaborateurs affichée
   - Informations : nom, email, poste, rôle, pôle
   - Filtres par pôle et rôle

---

## Tests de Gestion des Documents

### Test 10.1 - Configuration Storage (Pré-requis)
**Objectif :** Configurer Supabase Storage pour l'upload

1. Allez sur https://supabase.com/dashboard/project/xhgspkunwikvufrireqw
2. Cliquez sur **Storage**
3. Cliquez sur **New bucket**
4. Nom : `documents`
5. Type : **Public bucket**
6. Cliquez sur **Create bucket**
7. Allez dans **Policies** du bucket
8. Créez une politique pour `authenticated` avec SELECT, INSERT, UPDATE, DELETE
9. **Résultat attendu :**
   - Bucket créé
   - Politiques RLS configurées

### Test 10.2 - Création d'un document sans fichier
**Objectif :** Créer une fiche document sans upload

1. Allez sur `/documents/create`
2. Remplissez le formulaire :
   - Nom : `Document Test`
   - Description : `Document de test`
   - Type : `pdf`
   - Statut : `brouillon`
   - Tags : `test, demo`
3. Cliquez sur "Créer le document"
4. **Résultat attendu :**
   - Message de succès
   - Redirection vers la liste
   - Document visible

### Test 10.3 - Upload d'un fichier
**Objectif :** Uploader un fichier réel

1. Allez sur `/documents/create`
2. Remplissez le formulaire avec les informations
3. Sélectionnez un fichier (PDF, Word, Excel, Image)
4. Cliquez sur "Créer le document"
5. **Résultat attendu :**
   - Indicateur "Upload..." pendant l'upload
   - Message de succès après l'upload
   - Lien de téléchargement visible dans la liste
   - Le fichier est accessible via le lien

### Test 10.4 - Liste des documents
**Objectif :** Afficher la liste des documents

1. Allez sur `/documents`
2. **Résultat attendu :**
   - Liste des documents affichée
   - Informations : nom, type, statut, taille, date d'upload
   - Lien de téléchargement si fichier uploadé
   - Tags affichés
   - Filtres par type et statut

---

## Tests de Navigation et UX

### Test 11.1 - Navigation header
**Objectif :** Vérifier la navigation dans le header

1. Cliquez sur chaque lien du header (Dashboard, Clients, Tâches, etc.)
2. **Résultat attendu :**
   - Navigation fluide
   - Page correcte affichée
   - Active state sur le lien courant

### Test 11.2 - Boutons "Nouveau..."
**Objectif :** Vérifier les boutons de création

1. Sur chaque page de liste, cliquez sur "Nouveau X"
2. **Résultat attendu :**
   - Redirection vers la page de création correspondante
   - Formulaire affiché

### Test 11.3 - Bouton "Annuler"
**Objectif :** Vérifier l'annulation de création

1. Sur une page de création, cliquez sur "Annuler"
2. **Résultat attendu :**
   - Redirection vers la liste
   - Aucune donnée créée

### Test 11.4 - Footer
**Objectif :** Vérifier l'affichage du footer

1. Défilez jusqu'en bas de n'importe quelle page
2. **Résultat attendu :**
   - Footer affiché avec les informations GROUP MI
   - Copyright 2026

---

## Tests de Responsivité

### Test 12.1 - Desktop (1920x1080)
**Objectif :** Vérifier l'affichage sur grand écran

1. Redimensionnez le navigateur à 1920x1080
2. Naviguez sur les différentes pages
3. **Résultat attendu :**
   - Mise en page correcte
   - Pas de débordement horizontal
   - Utilisation efficace de l'espace

### Test 12.2 - Tablet (768x1024)
**Objectif :** Vérifier l'affichage sur tablette

1. Redimensionnez le navigateur à 768x1024
2. Naviguez sur les différentes pages
3. **Résultat attendu :**
   - Mise en page adaptée
   - Menus et filtres accessibles
   - Pas de débordement

### Test 12.3 - Mobile (375x667)
**ObjectObjectif :** Vérifier l'affichage sur mobile

1. Redimensionnez le navigateur à 375x667
2. Naviguez sur les différentes pages
3. **Résultat attendu :**
   - Mise en page adaptée
   - Header responsive
   - Tableaux avec scroll horizontal si nécessaire
   - Boutons accessibles

---

## Tests de Design et Branding

### Test 13.1 - Couleurs GROUP MI
**Objectif :** Vérifier l'utilisation des couleurs de marque

1. Inspectez les éléments clés (header, boutons, badges)
2. **Résultat attendu :**
   - Bleu GROUP MI (#2563EB, #1D4ED8) utilisé correctement
   - Or (#D4AF37, #B89B2E) utilisé pour les actions principales
   - Fond clair (#F8FAFC) pour le fond de page

### Test 13.2 - Typographie
**Objectif :** Vérifier la lisibilité du texte

1. Vérifiez les titres, sous-titres, corps de texte
2. **Résultat attendu :**
   - Hiérarchie visuelle claire
   - Texte lisible (contraste suffisant)
   - Pas de texte noir sur fond noir

### Test 13.3 - Icônes
**Objectif :** Vérifier l'affichage des icônes

1. Vérifiez les icônes Lucide React
2. **Résultat attendu :**
   - Icônes affichées correctement
   - Tailles cohérentes
   - Couleurs appropriées

---

## Tests d'Erreurs et Cas Limites

### Test 14.1 - Formulaire vide
**Objectif :** Vérifier la validation des champs obligatoires

1. Essayez de soumettre un formulaire vide
2. **Résultat attendu :**
   - Validation HTML5 (required)
   - Impossible de soumettre sans les champs obligatoires

### Test 14.2 - Email invalide
**Objectif :** Vérifier la validation de l'email

1. Entrez un email invalide dans un champ email
2. **Résultat attendu :**
   - Validation HTML5
   - Message d'erreur du navigateur

### Test 14.3 - Date invalide
**Objectif :** Vérifier la validation des dates

1. Entrez une date incohérente
2. **Résultat attendu :**
   - Validation HTML5
   - Date future pour les échéances (si applicable)

### Test 14.4 - Erreur de chargement
**Objectif :** Simuler une erreur de chargement

1. Arrêtez le serveur Supabase (déconnectez internet ou modifiez .env.local)
2. Essayez de charger une page
3. **Résultat attendu :**
   - Message d'erreur affiché
   - Pas de crash de l'application

---

## Tests de Performance

### Test 15.1 - Temps de chargement initial
**Objectif :** Mesurer le temps de chargement

1. Ouvrez les DevTools (Network)
2. Rechargez la page
3. **Résultat attendu :**
   - Chargement < 3 secondes sur connexion standard
   - Pas de requêtes bloquantes

### Test 15.2 - Navigation entre pages
**Objectif :** Vérifier la rapidité de navigation

1. Naviguez entre les pages
2. **Résultat attendu :**
   - Navigation instantanée (client-side routing)
   - Pas de rechargement complet

---

## Checklist Finale

Après avoir effectué tous les tests, cochez les cases :

### Authentification
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Déconnexion fonctionne
- [ ] Session persiste (optionnel)

### Modules CRUD
- [ ] Clients CRUD complet
- [ ] Contacts CRUD complet
- [ ] Opportunités CRUD complet
- [ ] Interactions CRUD complet
- [ ] Tâches CRUD complet
- [ ] Projets CRUD complet
- [ ] Collaborateurs CRUD complet
- [ ] Documents CRUD complet

### Dashboard
- [ ] Dashboard affiche les bonnes statistiques
- [ ] Dashboard se met à jour après création de données
- [ ] Tâches urgentes affichées correctement
- [ ] Pipeline affiché correctement

### UX/UI
- [ ] Design GROUP MI respecté
- [ ] Navigation fluide
- [ ] Responsive mobile/tablet/desktop
- [ ] Messages d'erreur clairs
- [ ] États de chargement affichés

### Storage
- [ ] Upload de fichiers fonctionne
- [ ] Téléchargement de fichiers fonctionne
- [ ] Types de fichiers acceptés

---

## Rapport de Test

**Date :** ___________
**Testeur :** ___________
**Environnement :** ___________

| Test | Statut | Notes |
|------|--------|-------|
| 1.1 Inscription | ⬜ Pass ⬜ Fail | |
| 1.2 Connexion | ⬜ Pass ⬜ Fail | |
| 1.3 Déconnexion | ⬜ Pass ⬜ Fail | |
| 2.1 Dashboard vide | ⬜ Pass ⬜ Fail | |
| 2.2 Dashboard avec données | ⬜ Pass ⬜ Fail | |
| 3.1 Création client | ⬜ Pass ⬜ Fail | |
| 3.2 Liste clients | ⬜ Pass ⬜ Fail | |
| 3.3 Recherche clients | ⬜ Pass ⬜ Fail | |
| 4.1 Création contact | ⬜ Pass ⬜ Fail | |
| 4.2 Liste contacts | ⬜ Pass ⬜ Fail | |
| 5.1 Création opportunité | ⬜ Pass ⬜ Fail | |
| 5.2 Liste opportunités | ⬜ Pass ⬜ Fail | |
| 6.1 Création interaction | ⬜ Pass ⬜ Fail | |
| 6.2 Liste interactions | ⬜ Pass ⬜ Fail | |
| 7.1 Création tâche | ⬜ Pass ⬜ Fail | |
| 7.2 Liste tâches | ⬜ Pass ⬜ Fail | |
| 7.3 Tâches en retard | ⬜ Pass ⬜ Fail | |
| 8.1 Création projet | ⬜ Pass ⬜ Fail | |
| 8.2 Liste projets | ⬜ Pass ⬜ Fail | |
| 9.1 Création collaborateur | ⬜ Pass ⬜ Fail | |
| 9.2 Liste collaborateurs | ⬜ Pass ⬜ Fail | |
| 10.1 Configuration Storage | ⬜ Pass ⬜ Fail | |
| 10.2 Création document sans fichier | ⬜ Pass ⬜ Fail | |
| 10.3 Upload fichier | ⬜ Pass ⬜ Fail | |
| 10.4 Liste documents | ⬜ Pass ⬜ Fail | |
| 11.1 Navigation header | ⬜ Pass ⬜ Fail | |
| 11.2 Boutons création | ⬜ Pass ⬜ Fail | |
| 12.1 Responsive desktop | ⬜ Pass ⬜ Fail | |
| 12.2 Responsive tablet | ⬜ Pass ⬜ Fail | |
| 12.3 Responsive mobile | ⬜ Pass ⬜ Fail | |
| 13.1 Couleurs branding | ⬜ Pass ⬜ Fail | |
| 13.2 Typographie | ⬜ Pass ⬜ Fail | |
| 14.1 Validation formulaires | ⬜ Pass ⬜ Fail | |
| 14.2 Gestion erreurs | ⬜ Pass ⬜ Fail | |

**Nombre de tests passés :** ____ / ____
**Pourcentage de réussite :** ____ %

**Observations générales :**
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________

**Bugs trouvés :**
1. _______________________________________________________________________
2. _______________________________________________________________________
3. _______________________________________________________________________

**Améliorations suggérées :**
1. _______________________________________________________________________
2. _______________________________________________________________________
3. _______________________________________________________________________
