'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Calendar, Clock, AlertCircle, Edit, Trash2, CheckCircle, Zap, Target, Plus, FileText } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { tasksService } from '@/lib/services';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/AnimatedCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS, TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from '@/lib/constants';
import Link from 'next/link';

const statusIcons: Record<string, any> = {
  todo: Target,
  in_progress: Zap,
  done: CheckCircle,
  cancelled: AlertCircle,
};

const statusColors: Record<string, string> = {
  todo: 'from-slate-100 to-slate-200',
  in_progress: 'from-amber-100 to-amber-200',
  done: 'from-green-100 to-green-200',
  cancelled: 'from-red-100 to-red-200',
};

const statusTextColors: Record<string, string> = {
  todo: 'text-slate-600',
  in_progress: 'text-amber-600',
  done: 'text-green-600',
  cancelled: 'text-red-600',
};

const priorityColors: Record<string, string> = {
  low: 'from-blue-100 to-blue-200',
  medium: 'from-yellow-100 to-yellow-200',
  high: 'from-orange-100 to-orange-200',
  urgent: 'from-red-100 to-red-200',
};

const priorityTextColors: Record<string, string> = {
  low: 'text-blue-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

function isOverdue(task: any) {
  if (!task.due_date || task.status === 'done') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.due_date);
  return dueDate < today;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: task, loading, error, refresh } = useData({
    fetchFn: () => tasksService.getById(id),
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
        await tasksService.delete(id);
        await Swal.fire({
          title: 'Supprimé !',
          text: 'La tâche a été supprimée avec succès.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
        router.push('/taches');
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

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Tâche non trouvée</p>
          <Link href="/taches">
            <button className="mt-4 px-6 py-2 bg-[#1D4ED8] text-white rounded-lg hover:bg-[#1e40af] transition-colors">
              Retour aux tâches
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = statusIcons[task.status] || Target;
  const bgColor = statusColors[task.status] || statusColors.todo;
  const textColor = statusTextColors[task.status] || statusTextColors.todo;
  const priorityBgColor = priorityColors[task.priority] || priorityColors.low;
  const priorityTextColor = priorityTextColors[task.priority] || priorityTextColors.low;
  const overdue = isOverdue(task);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Détail de la tâche"
        description="Informations complètes"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/taches">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour aux tâches
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
            <div className={`absolute inset-0 bg-gradient-to-br ${overdue ? 'from-red-100' : 'from-slate-100'} to-white rounded-2xl transform rotate-2`} />
            <div className={`relative bg-gradient-to-br ${overdue ? 'from-red-50' : 'from-white'} to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border ${overdue ? 'border-red-200 hover:border-red-300' : 'border-slate-100 hover:border-blue-200'} transition-all duration-500 overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-40 h-40 ${overdue ? 'bg-gradient-to-br from-red-100/50' : 'bg-gradient-to-br from-blue-100/50'} to-transparent rounded-full blur-2xl`} />
              
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
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{task.title || 'Sans titre'}</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${bgColor} ${textColor}`}>
                        {TASK_STATUS_LABELS[task.status as keyof typeof TASK_STATUS_LABELS] || task.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border bg-gradient-to-r ${priorityBgColor} ${priorityTextColor}`}>
                        {TASK_PRIORITY_LABELS[task.priority as keyof typeof TASK_PRIORITY_LABELS] || task.priority}
                      </span>
                      {overdue && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          En retard
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/taches/${id}/edit`}>
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
                {task.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </h3>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{task.description}</p>
                  </div>
                )}

                {task.assigned_to_nom && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Assigné à</p>
                      <p className="text-sm font-medium text-slate-900">{task.assigned_to_nom}</p>
                    </div>
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
                      <p className="text-xs text-slate-500">Date d'échéance</p>
                      <p className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-slate-900'}`}>
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR') : '-'}
                        {overdue && <span className="text-xs ml-2">(En retard)</span>}
                      </p>
                    </div>
                  </div>

                  {task.related_type && task.related_id && (
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Entité liée</p>
                        <p className="text-sm font-medium text-slate-900">
                          {task.related_type} - {task.related_id}
                        </p>
                      </div>
                    </div>
                  )}

                  {task.completed_at && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Terminée le</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(task.completed_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Date de création</p>
                      <p className="text-sm font-medium text-slate-900">
                        {task.created_at ? new Date(task.created_at).toLocaleDateString('fr-FR') : '-'}
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
                  <Link href={`/taches/${id}/edit`}>
                    <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                  </Link>
                  <Link href="/taches">
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
