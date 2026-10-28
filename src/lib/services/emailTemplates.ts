import { supabase } from '@/lib/supabase';
import { EmailTemplate, CreateEmailTemplateInput, UpdateEmailTemplateInput, EmailTemplateCategory } from '@/types';

export const emailTemplatesService = {
  // Récupérer tous les modèles
  async getAll(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('nom', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Récupérer par catégorie
  async getByCategory(categorie: EmailTemplateCategory): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('categorie', categorie)
      .eq('actif', true)
      .order('nom', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Récupérer un modèle par ID
  async getById(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un nouveau modèle
  async create(input: CreateEmailTemplateInput): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un modèle
  async update(input: UpdateEmailTemplateInput): Promise<EmailTemplate> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un modèle
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Rechercher des modèles
  async search(query: string): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .or(`nom.ilike.%${query}%,sujet.ilike.%${query}%`)
      .order('nom', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
