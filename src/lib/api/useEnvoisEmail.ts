import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { envoisEmailService } from '@/lib/services/envoisEmail';
import type { CreateEnvoiEmailInput, UpdateEnvoiEmailInput } from '@/types';

export function useEnvoisEmail() {
  const queryClient = useQueryClient();

  const envois = useQuery({
    queryKey: ['envois_email'],
    queryFn: () => envoisEmailService.getAll(),
  });

  const envoisPlanifies = useQuery({
    queryKey: ['envois_email', 'planifies'],
    queryFn: () => envoisEmailService.getPlanifies(),
  });

  const envoisEnvoyes = useQuery({
    queryKey: ['envois_email', 'envoyes'],
    queryFn: () => envoisEmailService.getEnvoyes(),
  });

  const createEnvoi = useMutation({
    mutationFn: (input: CreateEnvoiEmailInput) =>
      envoisEmailService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envois_email'] });
      queryClient.invalidateQueries({ queryKey: ['envois_email', 'planifies'] });
    },
  });

  const updateEnvoi = useMutation({
    mutationFn: (input: UpdateEnvoiEmailInput) =>
      envoisEmailService.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envois_email'] });
      queryClient.invalidateQueries({ queryKey: ['envois_email', 'planifies'] });
      queryClient.invalidateQueries({ queryKey: ['envois_email', 'envoyes'] });
    },
  });

  const markAsEnvoye = useMutation({
    mutationFn: (id: string) => envoisEmailService.markAsEnvoye(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envois_email'] });
      queryClient.invalidateQueries({ queryKey: ['envois_email', 'planifies'] });
      queryClient.invalidateQueries({ queryKey: ['envois_email', 'envoyes'] });
    },
  });

  const cancelEnvoi = useMutation({
    mutationFn: (id: string) => envoisEmailService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envois_email'] });
      queryClient.invalidateQueries({ queryKey: ['envois_email', 'planifies'] });
    },
  });

  const deleteEnvoi = useMutation({
    mutationFn: (id: string) => envoisEmailService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envois_email'] });
      queryClient.invalidateQueries({ queryKey: ['envois_email', 'planifies'] });
      queryClient.invalidateQueries({ queryKey: ['envois_email', 'envoyes'] });
    },
  });

  const checkDuplicate = useMutation({
    mutationFn: ({ contactId, modeleId }: { contactId: string; modeleId: string }) =>
      envoisEmailService.checkDuplicate(contactId, modeleId),
  });

  return {
    envois,
    envoisPlanifies,
    envoisEnvoyes,
    createEnvoi,
    updateEnvoi,
    markAsEnvoye,
    cancelEnvoi,
    deleteEnvoi,
    checkDuplicate,
  };
}
