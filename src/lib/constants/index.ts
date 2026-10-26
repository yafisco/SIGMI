// Constantes partagées pour SIGMI
// Couleurs, labels, options utilisées dans toute l'application

import { AppRole, ClientStatut, OpportunityStage, TaskStatus, TaskPriority, InteractionType, ProjectStatus, ProjectPriority, DocumentType, DocumentStatus } from '@/types';

// === CLIENT ===
export const CLIENT_STATUT_COLORS: Record<ClientStatut, string> = {
  prospect: 'bg-blue-100 text-blue-700',
  client: 'bg-green-100 text-green-700',
  inactif: 'bg-gray-100 text-gray-700',
  bloqué: 'bg-red-100 text-red-700',
};

export const CLIENT_STATUT_LABELS: Record<ClientStatut, string> = {
  prospect: 'Prospect',
  client: 'Client',
  inactif: 'Inactif',
  bloqué: 'Bloqué',
};

export const CLIENT_STATUT_OPTIONS: Array<{ value: ClientStatut; label: string }> = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'client', label: 'Client' },
  { value: 'inactif', label: 'Inactif' },
  { value: 'bloqué', label: 'Bloqué' },
];

// === OPPORTUNITÉ ===
export const OPPORTUNITY_STAGE_COLORS: Record<OpportunityStage, string> = {
  nouveau: 'bg-gray-100 text-gray-700',
  qualifié: 'bg-blue-100 text-blue-700',
  proposition: 'bg-yellow-100 text-yellow-700',
  négociation: 'bg-orange-100 text-orange-700',
  gagné: 'bg-green-100 text-green-700',
  perdu: 'bg-red-100 text-red-700',
};

export const OPPORTUNITY_STAGE_LABELS: Record<OpportunityStage, string> = {
  nouveau: 'Nouveau',
  qualifié: 'Qualifié',
  proposition: 'Proposition',
  négociation: 'Négociation',
  gagné: 'Gagné',
  perdu: 'Perdu',
};

export const OPPORTUNITY_STAGE_ORDER: OpportunityStage[] = ['nouveau', 'qualifié', 'proposition', 'négociation', 'gagné', 'perdu'];

export const OPPORTUNITY_STAGE_OPTIONS: Array<{ value: OpportunityStage; label: string }> = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'qualifié', label: 'Qualifié' },
  { value: 'proposition', label: 'Proposition' },
  { value: 'négociation', label: 'Négociation' },
  { value: 'gagné', label: 'Gagné' },
  { value: 'perdu', label: 'Perdu' },
];

// === TÂCHE ===
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
  cancelled: 'Annulé',
};

export const TASK_STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: 'todo', label: 'À faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' },
];

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
  urgent: 'Urgente',
};

export const TASK_PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
  { value: 'urgent', label: 'Urgente' },
];

// === INTERACTION ===
export const INTERACTION_TYPE_COLORS: Record<InteractionType, string> = {
  email: 'bg-blue-100 text-blue-700',
  appel: 'bg-green-100 text-green-700',
  réunion: 'bg-purple-100 text-purple-700',
  visite: 'bg-orange-100 text-orange-700',
  autre: 'bg-gray-100 text-gray-700',
};

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  email: 'Email',
  appel: 'Appel',
  réunion: 'Réunion',
  visite: 'Visite',
  autre: 'Autre',
};

export const INTERACTION_TYPE_OPTIONS: Array<{ value: InteractionType; label: string }> = [
  { value: 'email', label: 'Email' },
  { value: 'appel', label: 'Appel' },
  { value: 'réunion', label: 'Réunion' },
  { value: 'visite', label: 'Visite' },
  { value: 'autre', label: 'Autre' },
];

// === PROJET ===
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planifié: 'bg-blue-100 text-blue-700',
  'en cours': 'bg-green-100 text-green-700',
  'en pause': 'bg-yellow-100 text-yellow-700',
  terminé: 'bg-gray-100 text-gray-700',
  annulé: 'bg-red-100 text-red-700',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planifié: 'Planifié',
  'en cours': 'En cours',
  'en pause': 'En pause',
  terminé: 'Terminé',
  annulé: 'Annulé',
};

export const PROJECT_STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string }> = [
  { value: 'planifié', label: 'Planifié' },
  { value: 'en cours', label: 'En cours' },
  { value: 'en pause', label: 'En pause' },
  { value: 'terminé', label: 'Terminé' },
  { value: 'annulé', label: 'Annulé' },
];

export const PROJECT_PRIORITY_COLORS: Record<ProjectPriority, string> = {
  basse: 'bg-gray-100 text-gray-700',
  moyenne: 'bg-blue-100 text-blue-700',
  haute: 'bg-orange-100 text-orange-700',
  critique: 'bg-red-100 text-red-700',
};

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
  basse: 'Basse',
  moyenne: 'Moyenne',
  haute: 'Haute',
  critique: 'Critique',
};

export const PROJECT_PRIORITY_OPTIONS: Array<{ value: ProjectPriority; label: string }> = [
  { value: 'basse', label: 'Basse' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'haute', label: 'Haute' },
  { value: 'critique', label: 'Critique' },
];

// === DOCUMENT ===
export const DOCUMENT_TYPE_COLORS: Record<DocumentType, string> = {
  contrat: 'bg-blue-100 text-blue-700',
  facture: 'bg-green-100 text-green-700',
  rapport: 'bg-purple-100 text-purple-700',
  plan: 'bg-orange-100 text-orange-700',
  autre: 'bg-gray-100 text-gray-700',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  contrat: 'Contrat',
  facture: 'Facture',
  rapport: 'Rapport',
  plan: 'Plan',
  autre: 'Autre',
};

export const DOCUMENT_TYPE_OPTIONS: Array<{ value: DocumentType; label: string }> = [
  { value: 'contrat', label: 'Contrat' },
  { value: 'facture', label: 'Facture' },
  { value: 'rapport', label: 'Rapport' },
  { value: 'plan', label: 'Plan' },
  { value: 'autre', label: 'Autre' },
];

export const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  brouillon: 'bg-gray-100 text-gray-700',
  validé: 'bg-green-100 text-green-700',
  archivé: 'bg-blue-100 text-blue-700',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  brouillon: 'Brouillon',
  validé: 'Validé',
  archivé: 'Archivé',
};

export const DOCUMENT_STATUS_OPTIONS: Array<{ value: DocumentStatus; label: string }> = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'validé', label: 'Validé' },
  { value: 'archivé', label: 'Archivé' },
];

// === PÔLES ===
export const POLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'transversal', label: 'Aucun pôle / Transversal' },
  { value: 'ingénierie informatique', label: 'Ingénierie informatique' },
  { value: 'génie civil et BTP', label: 'Génie civil et BTP' },
  { value: 'agrobusiness', label: 'Agrobusiness' },
  { value: 'trading international', label: 'Trading international' },
  { value: 'transition énergétique', label: 'Transition énergétique' },
  { value: "centre d'incubation et d'impulsion des entreprises", label: "Centre d'incubation et d'impulsion des entreprises" },
];

// === RÔLES APPLICATIFS ===
export const APP_ROLE_LABELS: Record<AppRole, string> = {
  direction_generale: 'Direction générale',
  commercial: 'Commercial',
  finance_comptabilite: 'Finance et comptabilité',
  responsable_pole: 'Responsable de pôle',
  back_office: 'Back office',
  admin: 'Administrateur',
};

export const APP_ROLE_OPTIONS: Array<{ value: AppRole; label: string }> = (
  Object.keys(APP_ROLE_LABELS) as AppRole[]
).map((value) => ({ value, label: APP_ROLE_LABELS[value] }));

// === COULEURS GROUP MI ===
export const GROUP_MI_COLORS = {
  primary: '#1D4ED8',
  secondary: '#2563EB',
  gold: '#D4AF37',
  goldDark: '#B89B6E',
  blueGradient: 'from-[#1D4ED8] to-[#2563EB]',
  goldGradient: 'from-[#D4AF37] to-[#B89B6E]',
} as const;

// === SWEETALERT CONFIG ===
export const SWEETALERT_CONFIG = {
  confirmButtonColor: '#d33',
  cancelButtonColor: '#3085d6',
  successButtonColor: '#1D4ED8',
  errorButtonColor: '#d33',
  customClass: {
    popup: 'rounded-xl',
    confirmButton: 'rounded-lg',
    cancelButton: 'rounded-lg',
  },
} as const;
