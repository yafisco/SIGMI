'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Megaphone, Edit, Trash2, Calendar, Users, TrendingUp, DollarSign, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { campagnesMarketingService } from '@/lib/services';
import { CampagneMarketing } from '@/types';
import Swal from 'sweetalert2';

export default function CampagneDetailPage() {
  const params = useParams();
  const [campagne, setCampagne] = useState<CampagneMarketing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampagne() {
      const data = await campagnesMarketingService.getById(params.id as string);
      setCampagne(data);
      setLoading(false);
    }
    fetchCampagne();
  }, [params.id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette campagne sera supprimée définitivement',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await campagnesMarketingService.delete(params.id as string);
        window.location.href = '/marketing/campagnes';
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer la campagne', 'error');
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      planifie: 'bg-blue-100 text-blue-700',
      en_cours: 'bg-green-100 text-green-700',
      termine: 'bg-gray-100 text-gray-700',
      annule: 'bg-red-100 text-red-700',
    };
    return colors[statut] || colors.planifie;
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'en_cours': return PlayCircle;
      case 'termine': return CheckCircle2;
      case 'annule': return XCircle;
      default: return Calendar;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!campagne) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Campagne non trouvée</div>
      </div>
    );
  }

  const StatutIcon = getStatutIcon(campagne.statut);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/marketing/campagnes">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour aux campagnes
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
              <h1 className="text-2xl font-bold text-slate-900">{campagne.nom}</h1>
              <p className="text-slate-600 mt-1">{campagne.description || 'Aucune description'}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/marketing/campagnes/${campagne.id}/edit`}>
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
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(campagne.statut)}`}>
                {campagne.statut}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Megaphone className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-slate-600">Type</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{campagne.type}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-slate-600">Canal</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{campagne.canal}</p>
              </div>
              {campagne.budget && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-slate-600">Budget</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{campagne.budget.toLocaleString('fr-FR')} FCFA</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-slate-600">Leads générés</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{campagne.leads_generes}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <span className="text-sm text-slate-600">Période</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {formatDate(campagne.date_debut)} - {formatDate(campagne.date_fin)}
                </p>
              </div>
              {campagne.taux_conversion && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-slate-600">Taux de conversion</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{campagne.taux_conversion}%</p>
                </div>
              )}
            </div>

            {campagne.objectif && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Objectif</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-700">{campagne.objectif}</p>
                </div>
              </div>
            )}

            {campagne.pole && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Pôle responsable</h3>
                <p className="text-slate-700">{campagne.pole}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
