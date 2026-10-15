// Hooks React Query pour les opportunités
// Gestion du cache, des mutations et des invalidations automatiques

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunitiesService } from '@/lib/services';
import { CreateOpportunityInput, UpdateOpportunityInput, Pole } from '@/types';

export function useOpportunities(poleFilter?: Pole) {
  return useQuery({
    queryKey: ['opportunities', poleFilter],
    queryFn: () => opportunitiesService.getAll(poleFilter),
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunities', id],
    queryFn: () => opportunitiesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpportunityInput) => opportunitiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOpportunityInput) => opportunitiesService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => opportunitiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}
