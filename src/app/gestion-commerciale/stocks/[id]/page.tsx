'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Edit, Package, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function MouvementStockDetailPage() {
  const params = useParams();
  const [mouvement, setMouvement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMouvement() {
      const { data } = await supabase
        .from('mouvements_stock')
        .select('*, produits(*)')
        .eq('id', params.id)
        .single();

      setMouvement(data);
      setLoading(false);
    }
    fetchMouvement();
  }, [params.id]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'entree':
        return { color: 'bg-green-100 text-green-700', icon: ArrowUp, label: 'Entrée' };
      case 'sortie':
        return { color: 'bg-red-100 text-red-700', icon: ArrowDown, label: 'Sortie' };
      default:
        return { color: 'bg-blue-100 text-blue-700', icon: TrendingUp, label: 'Ajustement' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!mouvement) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Mouvement non trouvé</div>
      </div>
    );
  }

  const badge = getTypeBadge(mouvement.type);
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
          <Link href="/gestion-commerciale/stocks">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour aux stocks
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
              <h1 className="text-2xl font-bold text-slate-900">Détail du mouvement</h1>
              <p className="text-slate-600 mt-1">
                {mouvement.produits?.designation || 'Produit inconnu'}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/gestion-commerciale/stocks/${mouvement.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Date</p>
                <p className="font-semibold text-slate-900">{new Date(mouvement.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Type</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                  <Icon className="w-3 h-3" />
                  {badge.label}
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Quantité</p>
                <p className="font-semibold text-slate-900">{mouvement.quantite}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Source</p>
                <p className="font-semibold text-slate-900 capitalize">{mouvement.source}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Responsable</p>
                <p className="font-semibold text-slate-900">{mouvement.responsable_nom || '-'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">ID Mouvement</p>
                <p className="font-semibold text-slate-900 text-sm">{mouvement.id}</p>
              </div>
            </div>

            {mouvement.notes && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Notes</h3>
                <p className="text-slate-600">{mouvement.notes}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
