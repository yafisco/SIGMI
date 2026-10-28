'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Edit, Trash2, Briefcase, Calendar, Mail, Phone, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { candidaturesService } from '@/lib/services';
import { Candidature } from '@/types';
import Swal from 'sweetalert2';

export default function CandidatureDetailPage() {
  const params = useParams();
  const [candidature, setCandidature] = useState<Candidature | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCandidature() {
      const data = await candidaturesService.getById(params.id as string);
      setCandidature(data);
      setLoading(false);
    }
    fetchCandidature();
  }, [params.id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette candidature sera supprimée définitivement',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await candidaturesService.delete(params.id as string);
        window.location.href = '/recrutement/candidatures';
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer la candidature', 'error');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      en_attente: 'bg-amber-100 text-amber-700',
      en_revision: 'bg-blue-100 text-blue-700',
      entretien: 'bg-purple-100 text-purple-700',
      accepte: 'bg-green-100 text-green-700',
      refuse: 'bg-red-100 text-red-700',
    };
    return colors[statut] || colors.en_attente;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!candidature) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Candidature non trouvée</div>
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
          <Link href="/recrutement/candidatures">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour aux candidatures
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
              <h1 className="text-2xl font-bold text-slate-900">{candidature.nom_complet}</h1>
              <p className="text-slate-600 mt-1">{candidature.email}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/recrutement/candidatures/${candidature.id}/edit`}>
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
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(candidature.statut)}`}>
                {candidature.statut}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {candidature.telephone && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-slate-600" />
                    <span className="text-sm text-slate-600">Téléphone</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{candidature.telephone}</p>
                </div>
              )}
              {candidature.poste_nom && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-5 h-5 text-slate-600" />
                    <span className="text-sm text-slate-600">Poste visé</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{candidature.poste_nom}</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <span className="text-sm text-slate-600">Date de candidature</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{formatDate(candidature.date_candidature)}</p>
              </div>
              {candidature.experience_annees !== undefined && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-slate-600" />
                    <span className="text-sm text-slate-600">Expérience</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{candidature.experience_annees} ans</p>
                </div>
              )}
            </div>

            {candidature.competences && candidature.competences.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Compétences</h3>
                <div className="flex flex-wrap gap-2">
                  {candidature.competences.map((competence, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      {competence}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {candidature.lettre_motivation && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Lettre de motivation</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-700 whitespace-pre-wrap">{candidature.lettre_motivation}</p>
                </div>
              </div>
            )}

            {candidature.cv_url && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">CV</h3>
                <a href={candidature.cv_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Voir le CV
                </a>
              </div>
            )}

            {candidature.commentaires && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Commentaires</h3>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-700">{candidature.commentaires}</p>
                </div>
              </div>
            )}

            {candidature.note !== undefined && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Note</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <CheckCircle2
                      key={star}
                      className={`w-6 h-6 ${star <= (candidature.note || 0) ? 'text-amber-500 fill-current' : 'text-slate-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-slate-600">({candidature.note}/5)</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
