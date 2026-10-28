'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Plus, Minus, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/utils/errorHandler';

interface LigneVente {
  id?: string;
  produit_id: string;
  designation: string;
  quantite: number;
  prix_unitaire: number;
}

export default function EditVentePage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    client_id: '',
    mode_paiement: 'especes',
  });
  const [lignes, setLignes] = useState<LigneVente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
  const [produits, setProduits] = useState<{ id: string; designation: string; prix_unitaire: number }[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [venteData, lignesData, clientsData, produitsData] = await Promise.all([
        supabase.from('ventes').select('*').eq('id', params.id).single(),
        supabase.from('lignes_vente').select('*, produits(designation)').eq('vente_id', params.id),
        supabase.from('clients').select('id, nom').order('nom'),
        supabase.from('produits').select('id, designation, prix_unitaire').eq('actif', true).order('designation'),
      ]);

      if (venteData.data) {
        setFormData({
          client_id: venteData.data.client_id,
          mode_paiement: venteData.data.mode_paiement,
        });
      }

      if (lignesData.data) {
        setLignes(lignesData.data.map(l => ({
          id: l.id,
          produit_id: l.produit_id,
          designation: l.produit_nom || '',
          quantite: l.quantite,
          prix_unitaire: l.prix_unitaire,
        })));
      }

      setClients(clientsData.data || []);
      setProduits(produitsData.data || []);
      setInitialLoading(false);
    }
    fetchData();
  }, [params.id]);

  const addLigne = () => {
    setLignes([...lignes, { produit_id: '', designation: '', quantite: 1, prix_unitaire: 0 }]);
  };

  const removeLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const updateLigne = (index: number, field: keyof LigneVente, value: any) => {
    const newLignes = [...lignes];
    newLignes[index] = { ...newLignes[index], [field]: value };
    setLignes(newLignes);
  };

  const total = lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.client_id || lignes.length === 0) {
      setError('Veuillez sélectionner un client et ajouter au moins une ligne');
      setLoading(false);
      return;
    }

    try {
      const { error: venteError } = await supabase
        .from('ventes')
        .update({
          client_id: formData.client_id,
          total,
          mode_paiement: formData.mode_paiement,
        })
        .eq('id', params.id);

      if (venteError) throw venteError;

      const { error: deleteError } = await supabase
        .from('lignes_vente')
        .delete()
        .eq('vente_id', params.id);

      if (deleteError) throw deleteError;

      const lignesToInsert = lignes.map(ligne => ({
        vente_id: params.id,
        produit_id: ligne.produit_id,
        quantite: ligne.quantite,
        prix_unitaire: ligne.prix_unitaire,
      }));

      const { error: lignesError } = await supabase.from('lignes_vente').insert(lignesToInsert);
      if (lignesError) throw lignesError;

      router.push(`/gestion-commerciale/ventes/${params.id}`);
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la modification de la vente'));
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-amber-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/gestion-commerciale/ventes/${params.id}`}>
              <Button variant="ghost" size="icon" className="hover:bg-cyan-100 hover:text-cyan-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0891B2] to-[#06B6D4] bg-clip-text text-transparent">
                Modifier la vente
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0891B2] to-[#06B6D4] flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Informations de la vente</h2>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  >
                    <option value="">Sélectionnez un client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mode de paiement</label>
                  <select
                    value={formData.mode_paiement}
                    onChange={(e) => setFormData({ ...formData, mode_paiement: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                  >
                    <option value="especes">Espèces</option>
                    <option value="cheque">Chèque</option>
                    <option value="virement">Virement</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="carte">Carte</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Articles</h3>
                <Button type="button" onClick={addLigne} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              </div>

              {lignes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Aucun article ajouté</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lignes.map((ligne, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Produit</label>
                          <select
                            value={ligne.produit_id}
                            onChange={(e) => {
                              const produit = produits.find(p => p.id === e.target.value);
                              updateLigne(index, 'produit_id', e.target.value);
                              if (produit) {
                                updateLigne(index, 'designation', produit.designation);
                                updateLigne(index, 'prix_unitaire', produit.prix_unitaire);
                              }
                            }}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          >
                            <option value="">Sélectionnez un produit</option>
                            {produits.map((p) => (
                              <option key={p.id} value={p.id}>{p.designation}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Quantité</label>
                          <input
                            type="number"
                            value={ligne.quantite}
                            onChange={(e) => updateLigne(index, 'quantite', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Prix unitaire</label>
                          <input
                            type="number"
                            value={ligne.prix_unitaire}
                            onChange={(e) => updateLigne(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="flex-1 text-right">
                            <p className="text-sm font-bold text-slate-900">{(ligne.quantite * ligne.prix_unitaire).toLocaleString('fr-FR')} FCFA</p>
                          </div>
                          <Button type="button" variant="ghost" size="sm" className="text-red-600 ml-2" onClick={() => removeLigne(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex justify-between text-xl font-bold text-slate-900">
                  <span>Total</span>
                  <span>{total.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href={`/gestion-commerciale/ventes/${params.id}`}>
                <Button variant="outline" disabled={loading}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#0891B2] to-[#06B6D4] text-white">
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
