'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Building2, Edit, Trash2, MessageSquare, Calendar, Plus, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { interactionsService } from '@/lib/services';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/AnimatedCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import Link from 'next/link';

const interactionIcons: Record<string, any> = {
  email: Mail,
  appel: Phone,
  réunion: MessageSquare,
  visite: Calendar,
  autre: FileText,
};

const interactionColors: Record<string, string> = {
  email: 'from-blue-100 to-blue-200',
  appel: 'from-green-100 to-green-200',
  réunion: 'from-purple-100 to-purple-200',
  visite: 'from-amber-100 to-amber-200',
  autre: 'from-slate-100 to-slate-200',
};

const interactionTextColors: Record<string, string> = {
  email: 'text-blue-600',
  appel: 'text-green-600',
  réunion: 'text-purple-600',
  visite: 'text-amber-600',
  autre: 'text-slate-600',
};

export default function InteractionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: interaction, loading, error, refresh } = useData({
    fetchFn: () => interactionsService.getById(id),
  });

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
      cancelButtonColor: SWEETALERT_CONFIG.cancelButtonColor,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      customClass: SWEETALERT_CONFIG.customClass,
    });

    if (result.isConfirmed) {
      try {
        await interactionsService.delete(id);
        await Swal.fire({
          title: 'Supprimé !',
          text: 'L\'interaction a été supprimée avec succès.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
        router.push('/interactions');
      } catch (error) {
        await Swal.fire({
          title: 'Erreur !',
          text: 'Une erreur est survenue lors de la suppression.',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !interaction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Interaction non trouvée</p>
          <Link href="/interactions">
            <button className="mt-4 px-6 py-2 bg-[#1D4ED8] text-white rounded-lg hover:bg-[#1e40af] transition-colors">
              Retour aux interactions
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = interactionIcons[interaction.type] || FileText;
  const bgColor = interactionColors[interaction.type] || interactionColors.autre;
  const textColor = interactionTextColors[interaction.type] || interactionTextColors.autre;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Détail de l'interaction"
        description="Informations complètes"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/interactions">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour aux interactions
            </button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2" />
            <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
              
              <div className="flex items-start justify-between mb-6 relative">
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 bg-gradient-to-br ${bgColor} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                  >
                    <Icon className={`w-8 h-8 ${textColor}`} />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{interaction.titre || 'Sans titre'}</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${bgColor} ${textColor}`}>
                        {interaction.type}
                      </span>
                      {interaction.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          interaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                          interaction.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {interaction.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/interactions/${id}/edit`}>
                    <button className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 relative">
                {interaction.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </h3>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{interaction.description}</p>
                  </div>
                )}

                {interaction.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Notes
                    </h3>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{interaction.notes}</p>
                  </div>
                )}

                {interaction.outcome && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Résultat
                    </h3>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{interaction.outcome}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Informations secondaires */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-white rounded-2xl transform -rotate-2" />
              <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
                <h3 className="text-lg font-bold text-slate-900 mb-4 relative">Informations</h3>
                
                <div className="space-y-3 relative">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Date d'interaction</p>
                      <p className="text-sm font-medium text-slate-900">
                        {interaction.interaction_date ? new Date(interaction.interaction_date).toLocaleDateString('fr-FR') : '-'}
                      </p>
                    </div>
                  </div>

                  {interaction.duration && (
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Durée</p>
                        <p className="text-sm font-medium text-slate-900">{interaction.duration}</p>
                      </div>
                    </div>
                  )}

                  {interaction.related_type && interaction.related_id && (
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Entité liée</p>
                        <p className="text-sm font-medium text-slate-900">
                          {interaction.related_type} - {interaction.related_id}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Créé par</p>
                      <p className="text-sm font-medium text-slate-900">
                        {interaction.collaborateurs ? `${interaction.collaborateurs.prenom} ${interaction.collaborateurs.nom}` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Date de création</p>
                      <p className="text-sm font-medium text-slate-900">
                        {interaction.created_at ? new Date(interaction.created_at).toLocaleDateString('fr-FR') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-white rounded-2xl transform rotate-2" />
              <div className="relative bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-purple-200 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full blur-2xl" />
                <h3 className="text-lg font-bold text-slate-900 mb-4 relative">Actions rapides</h3>
                
                <div className="space-y-2 relative">
                  <Link href={`/interactions/${id}/edit`}>
                    <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                  </Link>
                  <Link href="/interactions">
                    <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                      Retour à la liste
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
