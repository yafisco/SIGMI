'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Radio, Edit, Trash2, TrendingUp, Target, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { sourcesProspectsService } from '@/lib/services';
import { SourceProspect } from '@/types';
import Swal from 'sweetalert2';

export default function SourceProspectDetailPage() {
  const params = useParams();
  const [source, setSource] = useState<SourceProspect | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSource() {
      const data = await sourcesProspectsService.getById(params.id as string);
      setSource(data);
      setLoading(false);
    }
    fetchSource();
  }, [params.id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette source sera supprimée définitivement',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await sourcesProspectsService.delete(params.id as string);
        window.location.href = '/marketing/sources-prospects';
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer la source', 'error');
      }
    }
  };

  const getQualiteColor = (qualite: string) => {
    const colors: Record<string, string> = {
      haute: 'bg-green-100 text-green-700',
      moyenne: 'bg-amber-100 text-amber-700',
      faible: 'bg-red-100 text-red-700',
    };
    return colors[qualite] || colors.moyenne;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Source non trouvée</div>
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
          <Link href="/marketing/sources-prospects">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour aux sources
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
              <h1 className="text-2xl font-bold text-slate-900">{source.nom}</h1>
              <p className="text-slate-600 mt-1">{source.type}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/marketing/sources-prospects/${source.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </Link>
              <Button variant="outline" className="text-red-600" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${source.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {source.actif ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Radio className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-slate-600">Type</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{source.type}</p>
              </div>
              {source.conversion_rate && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-slate-600">Taux de conversion</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{source.conversion_rate}%</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-slate-600">Qualité des leads</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  <span className={`px-2 py-1 rounded ${getQualiteColor(source.qualite_leads)}`}>
                    {source.qualite_leads}
                  </span>
                </p>
              </div>
            </div>

            {source.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-700">{source.description}</p>
                </div>
              </div>
            )}

            <div className="text-sm text-slate-500">
              <p>Créée le {new Date(source.created_at).toLocaleDateString('fr-FR')}</p>
              <p>Mise à jour le {new Date(source.updated_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
