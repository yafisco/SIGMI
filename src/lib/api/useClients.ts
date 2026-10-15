// Hooks React Query pour les clients
// Gestion du cache, des mutations et des invalidations automatiques

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '@/lib/services';
import { CreateClientInput, UpdateClientInput } from '@/types';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: clientsService.getAll,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientInput) => clientsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateClientInput) => clientsService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
