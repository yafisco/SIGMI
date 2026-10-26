'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, Edit, Trash2, MapPin, Calendar, DollarSign, ClipboardCheck, Lock, CheckCircle2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { postesService } from '@/lib/services';
import { Poste } from '@/types';
import Swal from 'sweetalert2';

export default function PosteDetailPage() {
  const params = useParams();
  const [poste, setPoste] = useState<Poste | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoste() {
      const data = await postesService.getById(params.id as string);
      setPoste(data);
      setLoading(false);
    }
    fetchPoste();
  }, [params.id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Ce poste sera supprimé définitivement',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await postesService.delete(params.id as string);
        window.location.href = '/recrutement/postes';
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer le poste', 'error');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      ouvert: 'bg-green-100 text-green-700',
      ferme: 'bg-red-100 text-red-700',
      pourvu: 'bg-blue-100 text-blue-700',
    };
    return colors[statut] || colors.ouvert;
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'ferme': return Lock;
      case 'pourvu': return CheckCircle2;
      default: return ClipboardCheck;
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return '-';
    if (min && max) return `${min.toLocaleString('fr-FR')} - ${max.toLocaleString('fr-FR')} FCFA`;
    if (min) return `${min.toLocaleString('fr-FR')} FCFA`;
    return `${max?.toLocaleString('fr-FR')} FCFA`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!poste) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Poste non trouvée</div>
      </div>
    );
  }

  const StatutIcon = getStatutIcon(poste.statut);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/recrutement/postes">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour aux postes
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
              <h1 className="text-2xl font-bold text-slate-900">{poste.titre}</h1>
              <p className="text-slate-600 mt-1">{poste.description || 'Aucune description'}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/recrutement/postes/${poste.id}/edit`}>
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
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(poste.statut)}`}>
                {poste.statut}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-slate-600">Type de contrat</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{poste.type_contrat || '-'}</p>
              </div>
              {poste.departement && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-slate-600">Département</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{poste.departement}</p>
                </div>
              )}
              {poste.lieu && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-slate-600">Lieu</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{poste.lieu}</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-slate-600">Salaire</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{formatSalary(poste.salaire_min, poste.salaire_max)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <span className="text-sm text-slate-600">Date de publication</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{formatDate(poste.date_publication)}</p>
              </div>
              {poste.date_limite && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-slate-600">Date limite</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{formatDate(poste.date_limite)}</p>
                </div>
              )}
            </div>

            {poste.competences_requises && poste.competences_requises.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Compétences requises</h3>
                <div className="flex flex-wrap gap-2">
                  {poste.competences_requises.map((competence, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      {competence}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/recrutement/candidatures/create">
                  <Users className="w-4 h-4 mr-2" />
                  Créer une candidature
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
