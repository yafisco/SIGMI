// Gestion d'erreurs centralisée pour SIGMI
// Fournit une gestion cohérente des erreurs dans toute l'application

/**
 * Extrait un message d'erreur lisible pour l'utilisateur
 * @param error - L'erreur à traiter
 * @param context - Contexte optionnel pour le logging
 * @returns Message d'erreur lisible
 */
export function getErrorMessage(error: unknown, context?: string): string {
  // Log de l'erreur pour le débogage
  if (context) {
    console.error(`[Error - ${context}]`, error);
  } else {
    console.error('[Error]', error);
  }

  // Si c'est une instance de Error
  if (error instanceof Error) {
    return error.message;
  }

  // Si c'est une chaîne de caractères
  if (typeof error === 'string') {
    return error;
  }

  // Si c'est un objet avec un message
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  // Message par défaut
  return 'Une erreur inattendue est survenue';
}

/**
 * Message d'une erreur inconnue (Error ou erreur Supabase), sinon le message par défaut fourni
 */
export function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error && error.message) {
    return String(error.message);
  }
  return fallback;
}

/**
 * Type pour les options de gestion d'erreur
 */
export interface ErrorHandlerOptions {
  context?: string;
  showToast?: boolean;
  logToSentry?: boolean;
}

/**
 * Gère une erreur avec logging et optionnellement affichage d'un toast
 * @param error - L'erreur à traiter
 * @param options - Options de gestion
 * @returns Message d'erreur
 */
export function handleError(error: unknown, options: ErrorHandlerOptions = {}): string {
  const { context, showToast = true } = options;

  const message = getErrorMessage(error, context);

  // TODO: Ajouter toast notification ici si nécessaire
  // if (showToast) {
  //   toast.error(message);
  // }

  // TODO: Ajouter logging vers Sentry ici si nécessaire
  // if (options.logToSentry) {
  //   Sentry.captureException(error);
  // }

  return message;
}

/**
 * Classe personnalisée pour les erreurs métier
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Erreurs courantes prédéfinies
 */
export const ERROR_MESSAGES = {
  NETWORK: 'Erreur de connexion. Vérifiez votre connexion internet.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
  NOT_FOUND: 'Ressource introuvable.',
  VALIDATION: 'Les données fournies sont invalides.',
  SERVER: 'Une erreur serveur est survenue. Veuillez réessayer plus tard.',
  TIMEOUT: 'La requête a expiré. Veuillez réessayer.',
} as const;
