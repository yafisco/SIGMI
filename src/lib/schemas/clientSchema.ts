// Schémas de validation Zod pour les formulaires
// Utilisés avec React Hook Form pour la validation des formulaires

import { z } from 'zod';
import { ClientStatut } from '@/types';

export const clientSchema = z.object({
  nom: z.string().optional(),
  structure: z.string().min(1, 'La structure (nom de l\'entreprise) est requise'),
  secteur_activite: z.string().optional(),
  interlocuteur: z.string().optional(),
  fonction: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().min(1, 'Le pays est requis'),
  chiffre_affaires_annuel: z.number().optional(),
  nombre_employes: z.number().optional(),
  statut: z.enum(['prospect', 'client', 'inactif', 'bloqué'] as const),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientSchema>;
