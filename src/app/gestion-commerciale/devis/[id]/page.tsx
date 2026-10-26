'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Edit, CheckCircle, XCircle, Clock, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Devis, LigneDevis } from '@/types';

export default function DevisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [devis, setDevis] = useState<Devis | null>(null);
  const [lignes, setLignes] = useState<LigneDevis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDevis() {
      const { data: devisData } = await supabase
        .from('devis')
        .select('*, clients(*)')
        .eq('id', params.id)
        .single();

      if (devisData) {
        setDevis(devisData);
      }

      const { data: lignesData } = await supabase
        .from('lignes_devis')
        .select('*, produits(designation)')
        .eq('devis_id', params.id);

      setLignes(lignesData || []);
      setLoading(false);
    }
    fetchDevis();
  }, [params.id]);

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'accepté':
        return { color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'refusé':
        return { color: 'bg-red-100 text-red-700', icon: XCircle };
      case 'envoyé':
        return { color: 'bg-blue-100 text-blue-700', icon: Clock };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: FileText };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!devis) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Devis non trouvé</div>
      </div>
    );
  }

  const badge = getStatutBadge(devis.statut);
  const Icon = badge.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/gestion-commerciale/devis">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour aux devis
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
              <h1 className="text-2xl font-bold text-slate-900">{devis.numero}</h1>
              <p className="text-slate-600 mt-1">Devis pour {devis.client_nom || 'Client inconnu'}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/gestion-commerciale/devis/${devis.id}/edit`}>
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
                <p className="font-semibold text-slate-900">{new Date(devis.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Validité</p>
                <p className="font-semibold text-slate-900">
                  {devis.date_validite ? new Date(devis.date_validite).toLocaleDateString('fr-FR') : 'Non définie'}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Statut</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                  <Icon className="w-3 h-3" />
                  {devis.statut}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Lignes du devis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Désignation</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Quantité</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Prix unitaire</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignes.map((ligne, index) => (
                      <tr key={ligne.id} className="border-b border-slate-100">
                        <td className="px-4 py-3 text-sm text-slate-900">{ligne.designation}</td>
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
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Total HT</span>
                  <span>{devis.total_ht.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>TTC (18%)</span>
                  <span>{devis.total_ttc.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>

            {devis.notes && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Notes</h3>
                <p className="text-slate-600">{devis.notes}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
