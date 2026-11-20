import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactsEmailService } from '@/lib/services/contactsEmail';
import type { CreateContactEmailInput, UpdateContactEmailInput } from '@/types';

export function useContactsEmail() {
  const queryClient = useQueryClient();

  const contacts = useQuery({
    queryKey: ['contacts_email'],
    queryFn: () => contactsEmailService.getAll(),
  });

  const createContact = useMutation({
    mutationFn: (input: CreateContactEmailInput) =>
      contactsEmailService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts_email'] });
    },
  });

  const updateContact = useMutation({
    mutationFn: (input: UpdateContactEmailInput) =>
      contactsEmailService.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts_email'] });
    },
  });

  const deleteContact = useMutation({
    mutationFn: (id: string) => contactsEmailService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts_email'] });
    },
  });

  const importContacts = useMutation({
    mutationFn: (contacts: CreateContactEmailInput[]) =>
      contactsEmailService.importMany(contacts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts_email'] });
    },
  });

  return {
    contacts,
    createContact,
    updateContact,
    deleteContact,
    importContacts,
  };
}
