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

export type ProjectStatus = 'planifié' | 'en cours' | 'en pause' | 'terminé' | 'annulé';
export type ProjectPriority = 'basse' | 'moyenne' | 'haute' | 'critique';

export type DocumentType = 'contrat' | 'facture' | 'rapport' | 'plan' | 'autre';
export type DocumentStatus = 'brouillon' | 'validé' | 'archivé';

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
