import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { EmailTemplate, CreateEmailTemplateInput, UpdateEmailTemplateInput } from '@/types';

const supabase = createClient();

export const emailTemplatesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as EmailTemplate[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as EmailTemplate;
  },

  async create(input: CreateEmailTemplateInput) {
    const { data, error } = await supabase
      .from('email_templates')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as EmailTemplate;
  },

  async update(input: UpdateEmailTemplateInput) {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as EmailTemplate;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export function useEmailTemplates() {
  const queryClient = useQueryClient();

  const templates = useQuery({
    queryKey: ['email_templates'],
    queryFn: () => emailTemplatesService.getAll(),
  });

  const createTemplate = useMutation({
    mutationFn: (input: CreateEmailTemplateInput) =>
      emailTemplatesService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email_templates'] });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: (input: UpdateEmailTemplateInput) =>
      emailTemplatesService.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email_templates'] });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => emailTemplatesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email_templates'] });
    },
  });

  return {
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
