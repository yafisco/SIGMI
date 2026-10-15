'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { interactionsService } from '@/lib/services';
import { PageHeader } from '@/components/PageHeader';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InteractionType } from '@/types';

const interactionSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis'),
  type: z.enum(['email', 'appel', 'réunion', 'visite', 'autre']),
  description: z.string().optional(),
  notes: z.string().optional(),
  outcome: z.string().optional(),
  status: z.enum(['completed', 'pending', 'cancelled']).optional(),
  interaction_date: z.string().optional(),
  duration: z.string().optional(),
  related_type: z.string().optional(),
  related_id: z.string().optional(),
});

type InteractionFormData = z.infer<typeof interactionSchema>;

export default function InteractionEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: interaction, loading, error, refresh } = useData({
    fetchFn: () => interactionsService.getById(id),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
  });

  useEffect(() => {
    if (interaction) {
      reset({
        titre: interaction.titre || '',
        type: interaction.type || 'autre',
        description: interaction.description || '',
        notes: interaction.notes || '',
        outcome: interaction.outcome || '',
        status: interaction.status || 'pending',
        interaction_date: interaction.interaction_date || '',
        duration: interaction.duration || '',
        related_type: interaction.related_type || '',
        related_id: interaction.related_id || '',
      });
    }
  }, [interaction, reset]);

  const onSubmit = async (data: InteractionFormData) => {
    try {
      await interactionsService.update(id, data);
      await Swal.fire({
        title: 'Modifié !',
        text: 'L\'interaction a été modifiée avec succès.',
        icon: 'success',
        confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
      router.push(`/interactions/${id}`);
    } catch (error) {
      await Swal.fire({
        title: 'Erreur !',
        text: 'Une erreur est survenue lors de la modification.',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Modifier l'interaction"
        description="Mettez à jour les informations"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href={`/interactions/${id}`}>
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour au détail
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2" />
          <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Titre *</label>
                  <input
                    type="text"
                    {...register('titre')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                    placeholder="Titre de l'interaction"
                  />
                  {errors.titre && (
                    <p className="text-red-600 text-sm mt-1">{errors.titre.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type *</label>
                  <select
                    {...register('type')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                  >
                    <option value="email">Email</option>
                    <option value="appel">Appel</option>
                    <option value="réunion">Réunion</option>
                    <option value="visite">Visite</option>
                    <option value="autre">Autre</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                  placeholder="Description de l'interaction"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                  placeholder="Notes supplémentaires"
                />
                {errors.notes && (
                  <p className="text-red-600 text-sm mt-1">{errors.notes.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Résultat</label>
                <textarea
                  {...register('outcome')}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                  placeholder="Résultat de l'interaction"
                />
                {errors.outcome && (
                  <p className="text-red-600 text-sm mt-1">{errors.outcome.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Statut</label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                  >
                    <option value="pending">En attente</option>
                    <option value="completed">Complété</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                  {errors.status && (
                    <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date d'interaction</label>
                  <input
                    type="date"
                    {...register('interaction_date')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                  />
                  {errors.interaction_date && (
                    <p className="text-red-600 text-sm mt-1">{errors.interaction_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Durée</label>
                  <input
                    type="text"
                    {...register('duration')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                    placeholder="Ex: 30 min, 1h"
                  />
                  {errors.duration && (
                    <p className="text-red-600 text-sm mt-1">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type d'entité liée</label>
                  <select
                    {...register('related_type')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                  >
                    <option value="">Aucune</option>
                    <option value="client">Client</option>
                    <option value="opportunity">Opportunité</option>
                    <option value="project">Projet</option>
                  </select>
                  {errors.related_type && (
                    <p className="text-red-600 text-sm mt-1">{errors.related_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ID de l'entité liée</label>
                  <input
                    type="text"
                    {...register('related_id')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                    placeholder="ID de l'entité"
                  />
                  {errors.related_id && (
                    <p className="text-red-600 text-sm mt-1">{errors.related_id.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1D4ED8] to-[#1e40af] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </motion.button>
                <Link href={`/interactions/${id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-all"
                  >
                    <X className="w-5 h-5" />
                    Annuler
                  </motion.button>
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
