'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Edit, Receipt, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface LigneVente {
  id: string;
  produit_id: string;
  quantite: number;
  prix_unitaire: number;
  produit_nom?: string;
}

interface Vente {
  id: string;
  numero: string;
  date: string;
  client_id: string;
  client_nom?: string;
  total: number;
  mode_paiement: string;
}

export default function VenteDetailPage() {
  const params = useParams();
  const [vente, setVente] = useState<Vente | null>(null);
  const [lignes, setLignes] = useState<LigneVente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVente() {
      const { data: venteData } = await supabase
        .from('ventes')
        .select('*, clients(*)')
        .eq('id', params.id)
        .single();

      if (venteData) {
        setVente(venteData);
      }

      const { data: lignesData } = await supabase
        .from('lignes_vente')
        .select('*, produits(designation)')
        .eq('vente_id', params.id);

      setLignes(lignesData || []);
      setLoading(false);
    }
    fetchVente();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!vente) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Vente non trouvée</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/gestion-commerciale/ventes">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour aux ventes
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{vente.numero}</h1>
              <p className="text-slate-600 mt-1">Vente pour {vente.client_nom || 'Client inconnu'}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/gestion-commerciale/ventes/${vente.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </Link>
              <Button variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Date</p>
                <p className="font-semibold text-slate-900">{new Date(vente.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Mode de paiement</p>
                <p className="font-semibold text-slate-900 capitalize">{vente.mode_paiement}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Total</p>
                <p className="font-semibold text-slate-900">{vente.total.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Articles vendus</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Produit</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Quantité</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Prix unitaire</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignes.map((ligne) => (
                      <tr key={ligne.id} className="border-b border-slate-100">
                        <td className="px-4 py-3 text-sm text-slate-900">{ligne.produit_nom || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">{ligne.quantite}</td>
                        <td className="px-4 py-3 text-sm text-right text-slate-600">
                          {ligne.prix_unitaire.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-right text-slate-900">
                          {(ligne.quantite * ligne.prix_unitaire).toLocaleString('fr-FR')} FCFA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between text-xl font-bold text-slate-900">
                  <span>Total</span>
                  <span>{vente.total.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
