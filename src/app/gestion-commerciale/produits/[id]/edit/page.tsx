'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/utils/errorHandler';

function EditProduitPageContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [formData, setFormData] = useState({
    reference: '',
    designation: '',
    description: '',
    prix_unitaire: '',
    unite_mesure: 'unité',
    fournisseur_id: '',
    pole: '',
    stock_minimum: '0',
    actif: true,
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fournisseurs, setFournisseurs] = useState<{ id: string; raison_sociale: string }[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduit() {
      const { data } = await supabase.from('produits').select('*').eq('id', id).single();
      if (data) {
        setFormData({
          reference: data.reference,
          designation: data.designation,
          description: data.description || '',
          prix_unitaire: data.prix_unitaire.toString(),
          unite_mesure: data.unite_mesure,
          fournisseur_id: data.fournisseur_id || '',
          pole: data.pole || '',
          stock_minimum: data.stock_minimum.toString(),
          actif: data.actif,
          image_url: data.image_url || '',
        });
        setImagePreview(data.image_url || null);
      }
    }
    fetchProduit();

    async function fetchFournisseurs() {
      const { data } = await supabase.from('fournisseurs').select('id, raison_sociale').eq('actif', true);
      setFournisseurs(data || []);
    }
    fetchFournisseurs();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `produits/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      setImagePreview(publicUrl);
    } catch (error) {
      setError('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: '' });
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.from('produits').update({
        reference: formData.reference,
        designation: formData.designation,
        description: formData.description,
        prix_unitaire: parseFloat(formData.prix_unitaire),
        unite_mesure: formData.unite_mesure,
        fournisseur_id: formData.fournisseur_id || null,
        pole: formData.pole || null,
        stock_minimum: parseInt(formData.stock_minimum),
        actif: formData.actif,
        image_url: formData.image_url || null,
      }).eq('id', id);

      if (error) throw error;
      router.push('/gestion-commerciale/produits');
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la modification du produit'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/gestion-commerciale/produits">
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#D4AF37] bg-clip-text text-transparent">
                Modifier le produit
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Référence *</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Désignation *</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Prix unitaire (FCFA) *</label>
                  <input
                    type="number"
                    value={formData.prix_unitaire}
                    onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Fournisseur</label>
                  <select
                    value={formData.fournisseur_id}
                    onChange={(e) => setFormData({ ...formData, fournisseur_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                  >
                    <option value="">Aucun</option>
                    {fournisseurs.map((f) => (
                      <option key={f.id} value={f.id}>{f.raison_sociale}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Statut</label>
                  <select
                    value={formData.actif ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.value === 'true' })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                  >
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#1D4ED8]" />
                    Image du produit
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-[#1D4ED8] transition-colors">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Aperçu" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="hidden"
                          id="image-upload-edit"
                        />
                        <label
                          htmlFor="image-upload-edit"
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col items-center">
                            <Upload className="w-12 h-12 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-600">
                              {uploading ? 'Upload en cours...' : 'Cliquez pour uploader une image'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG jusqu'à 5MB</p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mt-4">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/gestion-commerciale/produits">
                <Button variant="outline" disabled={loading}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Modification...' : 'Modifier'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditProduitPage() {
  return (
    <Suspense>
      <EditProduitPageContent />
    </Suspense>
  );
}
