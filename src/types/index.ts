// Types pour SIGMI - Système d'Information GROUP MI
// Basé sur le cahier des charges version 2.0

export type Pole =
  | 'ingénierie informatique'
  | 'génie civil et BTP'
  | 'agrobusiness'
  | 'trading international'
  | 'transition énergétique'
  | 'centre d\'incubation et d\'impulsion des entreprises';

export type Role =
  | 'commercial'
  | 'responsable de pôle'
  | 'direction'
  | 'gestionnaire de projet'
  | 'administrateur système';

// Rôles applicatifs (enum SQL app_role), voir docs/matrice-droits.md
export type AppRole =
  | 'direction_generale'
  | 'commercial'
  | 'finance_comptabilite'
  | 'responsable_pole'
  | 'back_office'
  | 'admin';

// Compte de connexion lié à une personne (table profiles, id = auth.users.id)
export interface Profile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  fonction?: string | null;
  pole: Pole | null;
  role: AppRole;
  actif: boolean;
  collaborateur_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus ='planifié' | 'en cours' | 'en pause' | 'terminé' | 'annulé';
export type ProjectPriority = 'basse' | 'moyenne' | 'haute' | 'critique';

export type DocumentType = 'contrat' | 'facture' | 'rapport' | 'plan' | 'autre';
export type DocumentStatus = 'brouillon' | 'validé' | 'archivé';

// Types Evenement
export type EvenementType = 'réunion' | 'appel' | 'visite' | 'email' | 'autre';
export interface Evenement {
  id: string;
  titre: string;
  description?: string;
  type: EvenementType;
  date_debut: string;
  date_fin?: string;
  lieu?: string;
  client_id?: string;
  prospect_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// === COLLABORATEUR ===
export interface Collaborateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  poste: string;
  role: Role;
  poles: Pole[];
  date_embauche: string;
  actif: boolean;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCollaborateurInput {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  poste: string;
  role: Role;
  poles: Pole[];
  date_embauche?: string;
  photo_url?: string;
}

export interface UpdateCollaborateurInput extends Partial<CreateCollaborateurInput> {
  id: string;
  actif?: boolean;
}

// === PROJET ===
export interface Projet {
  id: string;
  nom: string;
  description: string;
  poles: Pole[];
  responsable_id: string;
  responsable_nom?: string;
  equipe: string[]; // IDs des collaborateurs
  equipe_noms?: string[]; // Noms pour l'affichage
  statut: ProjectStatus;
  priorite: ProjectPriority;
  date_debut: string;
  date_fin_prevue: string;
  date_fin_reelle?: string;
  budget_estime?: number;
  budget_consomme?: number;
  progression: number; // 0-100
  livrables: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateProjetInput {
  nom: string;
  description: string;
  poles: Pole[];
  responsable_id?: string;
  equipe?: string[];
  statut: ProjectStatus;
  priorite: ProjectPriority;
  date_debut?: string;
  date_fin_prevue?: string;
  budget_estime?: number;
  livrables?: string[];
}

export interface UpdateProjetInput extends Partial<CreateProjetInput> {
  id: string;
  date_fin_reelle?: string;
  budget_consomme?: number;
  progression?: number;
}

// === DOCUMENT ===
export interface Document {
  id: string;
  nom: string;
  description?: string;
  type: DocumentType;
  statut: DocumentStatus;
  projet_id?: string;
  projet_nom?: string;
  client_id?: string;
  client_nom?: string;
  fichier_url: string;
  fichier_nom: string;
  fichier_taille: number;
  uploaded_by: string;
  uploaded_by_nom?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentInput {
  nom: string;
  description?: string;
  type: DocumentType;
  statut: DocumentStatus;
  projet_id?: string;
  client_id?: string;
  fichier_url: string;
  fichier_nom: string;
  fichier_taille: number;
  uploaded_by: string;
  tags: string[];
}

export interface UpdateDocumentInput extends Partial<CreateDocumentInput> {
  id: string;
}

// === STATISTIQUES ===
export interface StatsGlobales {
  total_projets: number;
  projets_en_cours: number;
  projets_termines: number;
  total_collaborateurs: number;
  collaborateurs_actifs: number;
  total_documents: number;
  budget_total_estime: number;
  budget_total_consomme: number;
}

export interface StatsParPole {
  pole: Pole;
  projets: number;
  collaborateurs: number;
  budget_estime: number;
  budget_consomme: number;
}

// === CLIENT ===
export type ClientStatut = 'prospect' | 'client' | 'inactif' | 'bloqué';

export interface Client {
  id: string;
  nom: string;
  structure?: string;
  secteur_activite?: string;
  interlocuteur?: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays: string;
  chiffre_affaires_annuel?: number;
  nombre_employes?: number;
  statut: ClientStatut;
  assigned_to?: string;
  assigned_to_nom?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  nom: string;
  structure?: string;
  secteur_activite?: string;
  interlocuteur?: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  chiffre_affaires_annuel?: number;
  nombre_employes?: number;
  statut: ClientStatut;
  assigned_to?: string;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  id: string;
}

// === OPPORTUNITY ===
export type OpportunityStage = 'nouveau' | 'qualifié' | 'proposition' | 'négociation' | 'gagné' | 'perdu';

export interface Opportunity {
  id: string;
  name: string;
  reference?: string;
  structure_concernee?: string;
  secteur_activite?: string;
  pole_groupe_mi?: string;
  intitule_besoin?: string;
  source_opportunite?: string;
  description?: string;
  client_id?: string;
  client_nom?: string;
  client_email?: string;
  amount: number;
  stage: OpportunityStage;
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  assigned_to?: string;
  assigned_to_nom?: string;
  poles: Pole[];
  created_at: string;
  updated_at: string;
}

export interface CreateOpportunityInput {
  name: string;
  reference?: string;
  structure_concernee?: string;
  secteur_activite?: string;
  pole_groupe_mi?: string;
  intitule_besoin?: string;
  source_opportunite?: string;
  description?: string;
  client_id?: string;
  amount: number;
  stage: OpportunityStage;
  probability?: number;
  expected_close_date?: string;
  assigned_to?: string;
  poles?: Pole[];
}

export interface UpdateOpportunityInput extends Partial<CreateOpportunityInput> {
  id: string;
  actual_close_date?: string;
}

// === TASK ===
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskRelatedType = 'client' | 'opportunity' | 'projet' | 'document' | 'collaborateur';

export interface Task {
  id: string;
  title: string;
  // Utilisé par le filtre par pôle, mais absent des migrations : colonne à créer
  pole?: Pole;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  related_type?: TaskRelatedType;
  related_id?: string;
  assigned_to?: string;
  assigned_to_nom?: string;
  created_by?: string;
  created_by_nom?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  related_type?: TaskRelatedType;
  related_id?: string;
  assigned_to?: string;
  created_by: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
  completed_at?: string;
}

// === CONTACT ===
export type ContactRole = 'directeur' | 'manager' | 'technique' | 'commercial' | 'autre';

export interface Contact {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role: ContactRole;
  poste?: string;
  notes?: string;
  client_id?: string | null;
  client_nom?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContactInput {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role?: ContactRole;
  poste?: string;
  notes?: string;
  client_id?: string | null;
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  id: string;
}

// === INTERACTION ===
export type InteractionType = 'email' | 'appel' | 'réunion' | 'visite' | 'autre';
export type InteractionRelatedType = 'client' | 'opportunity' | 'projet' | 'collaborateur';

export interface Interaction {
  id: string;
  title: string;
  description?: string;
  type: InteractionType;
  interaction_date: string;
  created_by: string;
  created_by_nom?: string;
  related_type: InteractionRelatedType;
  related_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInteractionInput {
  title: string;
  description?: string;
  type: InteractionType;
  interaction_date: string;
  created_by: string;
  related_type: InteractionRelatedType;
  related_id?: string;
}

export interface UpdateInteractionInput extends Partial<CreateInteractionInput> {
  id: string;
}

// === STATISTIQUES ÉTENDUES ===
export interface DashboardStats {
  total_opportunities: number;
  pipeline_value: number;
  total_tasks: number;
  total_clients: number;
  conversion_rate: number;
  monthly_revenue: number;
  opportunities_by_stage: Record<OpportunityStage, number>;
  tasks_by_status: Record<TaskStatus, number>;
  clients_by_statut: Record<ClientStatut, number>;
}

// === GESTION COMMERCIALE ===

export type DevisStatut = 'brouillon' | 'envoyé' | 'accepté' | 'refusé';
export type VenteModePaiement = 'especes' | 'cheque' | 'virement' | 'mobile_money' | 'carte';
export type AchatStatut = 'en_cours' | 'reçu' | 'annulé';
export type MouvementType = 'entree' | 'sortie' | 'ajustement';
export type MouvementSource = 'achat' | 'vente' | 'ajustement';

export interface Fournisseur {
  id: string;
  raison_sociale: string;
  contact_principal?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  secteur_activite?: string;
  conditions_paiement?: string;
  notes?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFournisseurInput {
  raison_sociale: string;
  contact_principal?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  secteur_activite?: string;
  conditions_paiement?: string;
  notes?: string;
}

export interface UpdateFournisseurInput extends Partial<CreateFournisseurInput> {
  id: string;
  actif?: boolean;
}

export interface Produit {
  id: string;
  reference: string;
  designation: string;
  description?: string;
  prix_unitaire: number;
  unite_mesure: string;
  fournisseur_id?: string;
  fournisseur_nom?: string;
  pole?: string;
  stock_minimum: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProduitInput {
  reference: string;
  designation: string;
  description?: string;
  prix_unitaire: number;
  unite_mesure?: string;
  fournisseur_id?: string;
  pole?: string;
  stock_minimum?: number;
}

export interface UpdateProduitInput extends Partial<CreateProduitInput> {
  id: string;
  actif?: boolean;
}

export interface MouvementStock {
  id: string;
  produit_id: string;
  produit_nom?: string;
  type: MouvementType;
  quantite: number;
  date: string;
  source: MouvementSource;
  responsable_id?: string;
  responsable_nom?: string;
  notes?: string;
  created_at: string;
}

export interface CreateMouvementStockInput {
  produit_id: string;
  type: MouvementType;
  quantite: number;
  source: MouvementSource;
  responsable_id?: string;
  notes?: string;
}

export interface Devis {
  id: string;
  numero: string;
  client_id?: string;
  client_nom?: string;
  date: string;
  date_validite?: string;
  statut: DevisStatut;
  total_ht: number;
  total_ttc: number;
  notes?: string;
  created_by?: string;
  created_by_nom?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDevisInput {
  numero: string;
  client_id?: string;
  date: string;
  date_validite?: string;
  statut?: DevisStatut;
  notes?: string;
  lignes?: Array<{
    produit_id?: string;
    designation: string;
    quantite: number;
    prix_unitaire: number;
  }>;
}

export interface LigneDevis {
  id: string;
  devis_id: string;
  produit_id?: string;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
  created_at: string;
}

export interface Vente {
  id: string;
  numero: string;
  client_id?: string;
  client_nom?: string;
  date: string;
  total: number;
  mode_paiement?: VenteModePaiement;
  created_by?: string;
  created_by_nom?: string;
  bon_livraison_id?: string;
  created_at: string;
}

export interface CreateVenteInput {
  client_id?: string;
  mode_paiement?: VenteModePaiement;
  lignes: Array<{
    produit_id: string;
    quantite: number;
    prix_unitaire: number;
  }>;
}

export interface LigneVente {
  id: string;
  vente_id: string;
  produit_id: string;
  produit_nom?: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
  created_at: string;
}

export interface BonLivraison {
  id: string;
  numero: string;
  vente_id?: string;
  facture_id?: string;
  date: string;
  destinataire?: string;
  statut: 'émis' | 'annulé';
  created_by?: string;
  created_by_nom?: string;
  created_at: string;
}

export interface AchatFournisseur {
  id: string;
  numero: string;
  fournisseur_id: string;
  fournisseur_nom?: string;
  date: string;
  prix_total: number;
  statut: AchatStatut;
  mode_paiement?: string;
  valide_par?: string;
  valide_par_nom?: string;
  created_at: string;
}

export interface CreateAchatInput {
  fournisseur_id: string;
  prix_total: number;
  mode_paiement?: string;
  lignes: Array<{
    produit_id: string;
    quantite: number;
    prix_unitaire: number;
  }>;
}

export interface LigneAchat {
  id: string;
  achat_id: string;
  produit_id: string;
  produit_nom?: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
  created_at: string;
}

// === EMAIL TEMPLATES ===
export type EmailTemplateCategory = 'prospection' | 'agrement' | 'relance' | 'rendez-vous' | 'devis' | 'livraison' | 'contrat' | 'autre';

export interface EmailTemplate {
  id: string;
  nom: string;
  categorie: EmailTemplateCategory;
  sujet: string;
  corps: string;
  variables?: string[]; // Liste des variables utilisables (ex: {nom_client}, {nom_prospect})
  actif: boolean;
  created_by?: string;
  created_by_nom?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailTemplateInput {
  nom: string;
  categorie: EmailTemplateCategory;
  sujet: string;
  corps: string;
  variables?: string[];
  actif?: boolean;
}

export interface UpdateEmailTemplateInput extends Partial<CreateEmailTemplateInput> {
  id: string;
}

// === BUDGETS ===
export type BudgetStatut = 'actif' | 'archive' | 'depasse';

export interface Budget {
  id: string;
  nom: string;
  description?: string;
  montant_budget: number;
  montant_depense: number;
  pole?: string;
  projet_id?: string;
  annee: number;
  mois?: number;
  statut: BudgetStatut;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetInput {
  nom: string;
  description?: string;
  montant_budget: number;
  pole?: string;
  projet_id?: string;
  annee: number;
  mois?: number;
  statut?: BudgetStatut;
}

export interface UpdateBudgetInput extends Partial<CreateBudgetInput> {
  id: string;
}

// === TRANSACTIONS FINANCIERES ===
export type TransactionType = 'encaissement' | 'decaissement';
export type TransactionCategorie = 'vente' | 'achat' | 'salaire' | 'frais' | 'divers';

export interface Transaction {
  id: string;
  type: TransactionType;
  categorie: TransactionCategorie;
  montant: number;
  description: string;
  reference?: string;
  pole?: string;
  projet_id?: string;
  facture_id?: string;
  date_transaction: string;
  statut: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  type: TransactionType;
  categorie: TransactionCategorie;
  montant: number;
  description: string;
  reference?: string;
  pole?: string;
  projet_id?: string;
  facture_id?: string;
  date_transaction: string;
  statut?: string;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string;
}

// === CAMPAGNES MARKETING ===
export type CampagneStatut = 'planifie' | 'en_cours' | 'termine' | 'annule';

export interface CampagneMarketing {
  id: string;
  nom: string;
  description?: string;
  type: string;
  canal: string;
  budget?: number;
  date_debut?: string;
  date_fin?: string;
  statut: CampagneStatut;
  leads_generes: number;
  taux_conversion?: number;
  objectif?: string;
  pole?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCampagneInput {
  nom: string;
  description?: string;
  type: string;
  canal: string;
  budget?: number;
  date_debut?: string;
  date_fin?: string;
  statut?: CampagneStatut;
  leads_generes?: number;
  taux_conversion?: number;
  objectif?: string;
  pole?: string;
}

export interface UpdateCampagneInput extends Partial<CreateCampagneInput> {
  id: string;
}

// === POSTES ===
export type TypeContrat = 'CDI' | 'CDD' | 'Freelance' | 'Stage';
export type PosteStatut = 'ouvert' | 'ferme' | 'pourvu';

export interface Poste {
  id: string;
  titre: string;
  description?: string;
  departement?: string;
  type_contrat?: TypeContrat;
  lieu?: string;
  salaire_min?: number;
  salaire_max?: number;
  statut: PosteStatut;
  competences_requises?: string[];
  date_publication: string;
  date_limite?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePosteInput {
  titre: string;
  description?: string;
  departement?: string;
  type_contrat?: TypeContrat;
  lieu?: string;
  salaire_min?: number;
  salaire_max?: number;
  statut?: PosteStatut;
  competences_requises?: string[];
  date_limite?: string;
}

export interface UpdatePosteInput extends Partial<CreatePosteInput> {
  id: string;
}

// === CANDIDATURES ===
export type CandidatureStatut = 'en_attente' | 'en_revision' | 'entretien' | 'accepte' | 'refuse';

export interface Candidature {
  id: string;
  nom_complet: string;
  email: string;
  telephone?: string;
  poste_id?: string;
  poste_nom?: string;
  cv_url?: string;
  lettre_motivation?: string;
  experience_annees?: number;
  competences?: string[];
  date_candidature: string;
  statut: CandidatureStatut;
  note?: number;
  commentaires?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCandidatureInput {
  nom_complet: string;
  email: string;
  telephone?: string;
  poste_id?: string;
  poste_nom?: string;
  cv_url?: string;
  lettre_motivation?: string;
  experience_annees?: number;
  competences?: string[];
  statut?: CandidatureStatut;
  note?: number;
  commentaires?: string;
}

export interface UpdateCandidatureInput extends Partial<CreateCandidatureInput> {
  id: string;
}

// === SOURCES PROSPECTS ===
export type QualiteLeads = 'haute' | 'moyenne' | 'faible';

export interface SourceProspect {
  id: string;
  nom: string;
  type: string;
  description?: string;
  conversion_rate?: number;
  qualite_leads: QualiteLeads;
  actif: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSourceProspectInput {
  nom: string;
  type: string;
  description?: string;
  conversion_rate?: number;
  qualite_leads?: QualiteLeads;
  actif?: boolean;
}

export interface UpdateSourceProspectInput extends Partial<CreateSourceProspectInput> {
  id: string;
}
