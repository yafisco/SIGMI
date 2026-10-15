import { z } from 'zod';
import { OpportunityStage } from '@/types';

export const opportunitySchema = z.object({
  name: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  client_id: z.string().uuid().optional().or(z.literal('')),
  amount: z.number().min(0, 'Le montant doit être positif'),
  stage: z.enum(['nouveau', 'qualifié', 'proposition', 'négociation', 'gagné', 'perdu'] as const),
  probability: z.number().min(0).max(100),
  expected_close_date: z.string().optional(),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
  poles: z.array(z.string()).optional(),
});

export type OpportunityFormData = z.infer<typeof opportunitySchema>;
