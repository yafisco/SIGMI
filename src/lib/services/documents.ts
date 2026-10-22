import { supabase } from '@/lib/supabase';
import { Document, CreateDocumentInput, UpdateDocumentInput } from '@/types';

export const documentsService = {
  // Récupérer tous les documents avec détails
  async getAll(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur Supabase documents:', error);
      throw error;
    }
    return data || [];
  },

  // Récupérer un document par ID
  async getById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un nouveau document
  async create(input: CreateDocumentInput): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un document
  async update(input: UpdateDocumentInput): Promise<Document> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un document
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Rechercher des documents
  async search(query: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .or(`nom.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par type
  async getByType(type: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par statut
  async getByStatut(statut: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('statut', statut)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par projet
  async getByProjet(projetId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('projet_id', projetId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par client
  async getByClient(clientId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par uploader
  async getByUploader(uploaderId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('uploaded_by', uploaderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Filtrer par tag
  async getByTag(tag: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .contains('tags', [tag])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les statistiques
  async getStats() {
    const [totalResult, validesResult, brouillonsResult, tailleResult] = await Promise.all([
      supabase.from('documents').select('id', { count: 'exact', head: true }),
      supabase.from('documents').select('id', { count: 'exact', head: true }).eq('statut', 'validé'),
      supabase.from('documents').select('id', { count: 'exact', head: true }).eq('statut', 'brouillon'),
      supabase.from('documents').select('fichier_taille'),
    ]);

    const total = totalResult.count || 0;
    const valides = validesResult.count || 0;
    const brouillons = brouillonsResult.count || 0;

    const tailleTotale = tailleResult.data?.reduce((acc: number, d: { fichier_taille: number }) => acc + d.fichier_taille, 0) || 0;

    return { total, valides, brouillons, tailleTotale };
  },
};
