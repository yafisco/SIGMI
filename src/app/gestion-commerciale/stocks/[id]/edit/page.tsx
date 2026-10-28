'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Save } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/utils/errorHandler';

export default function EditMouvementStockPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    produit_id: '',
    type: 'entree',
    quantite: '',
    source: 'ajustement',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [produits, setProduits] = useState<{ id: string; designation: string }[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [mouvementData, produitsData] = await Promise.all([
        supabase.from('mouvements_stock').select('*').eq('id', params.id).single(),
        supabase.from('produits').select('id, designation').eq('actif', true).order('designation'),
      ]);

      if (mouvementData.data) {
        setFormData({
          produit_id: mouvementData.data.produit_id,
          type: mouvementData.data.type,
          quantite: mouvementData.data.quantite.toString(),
          source: mouvementData.data.source,
          notes: mouvementData.data.notes || '',
        });
      }

      setProduits(produitsData.data || []);
      setInitialLoading(false);
    }
    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('mouvements_stock')
        .update({
          produit_id: formData.produit_id,
          type: formData.type,
          quantite: parseInt(formData.quantite),
          source: formData.source,
          notes: formData.notes,
        })
        .eq('id', params.id);

      if (error) throw error;
      router.push(`/gestion-commerciale/stocks/${params.id}`);
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la modification du mouvement'));
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/gestion-commerciale/stocks/${params.id}`}>
              <Button variant="ghost" size="icon" className="hover:bg-purple-100 hover:text-purple-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">
                Modifier le mouvement de stock
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Produit *</label>
                  <select
                    value={formData.produit_id}
                    onChange={(e) => setFormData({ ...formData, produit_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  >
                    <option value="">Sélectionnez un produit</option>
                    {produits.map((p) => (
                      <option key={p.id} value={p.id}>{p.designation}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      required
                    >
                      <option value="entree">Entrée</option>
                      <option value="sortie">Sortie</option>
                      <option value="ajustement">Ajustement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Source</label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    >
                      <option value="ajustement">Ajustement</option>
                      <option value="achat">Achat</option>
                      <option value="vente">Vente</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Quantité *</label>
                  <input
                    type="number"
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    rows={3}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mt-4">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href={`/gestion-commerciale/stocks/${params.id}`}>
                <Button variant="outline" disabled={loading}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Modification...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
