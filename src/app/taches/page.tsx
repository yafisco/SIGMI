'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Search, Filter, Plus, Calendar, Clock, AlertCircle, CheckCircle, Trash2, Zap, Target } from 'lucide-react';
import { Task } from '@/types';
import Link from 'next/link';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS, TASK_STATUS_OPTIONS, TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_OPTIONS, POLE_OPTIONS } from '@/lib/constants';
import { StatCard } from '@/components/AnimatedCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { useData } from '@/hooks/useData';
import { tasksService } from '@/lib/services';
import Swal from 'sweetalert2';
import { usePoleFilter } from '@/hooks/usePoleFilter';

export default function TachesPage() {
  const { pole: userPole, shouldFilter, user } = usePoleFilter();
  const { data: tasks, loading, error, refresh } = useData({
    fetchFn: () => tasksService.getAll(shouldFilter ? userPole || undefined : undefined),
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterPole, setFilterPole] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Masquer le filtre par pôle pour les non-administrateurs
  const canFilterByPole = user?.isAdmin || false;

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer la tâche "${name}". Cette action est irréversible !`,
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
        refresh();
        await Swal.fire({
          title: 'Supprimé !',
          text: 'La tâche a été supprimée avec succès.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (err: any) {
        await Swal.fire({
          title: 'Erreur',
          text: err.message || 'Erreur lors de la suppression de la tâche',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assigned_to_nom || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesPole = filterPole === 'all' || (task.pole && task.pole === filterPole);

    return matchesSearch && matchesStatus && matchesPriority && matchesPole;
  });

  const stats = {
    total: (tasks || []).length,
    todo: (tasks || []).filter((t) => t.status === 'todo').length,
    in_progress: (tasks || []).filter((t) => t.status === 'in_progress').length,
    done: (tasks || []).filter((t) => t.status === 'done').length,
    overdue: (tasks || []).filter((t) => {
      if (!t.due_date || t.status === 'done') return false;
      return new Date(t.due_date) < new Date();
    }).length,
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date();
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
          <p className="text-slate-600 font-medium">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Tâches"
        description="Gérez vos tâches et suivis"
        actionHref="/taches/create"
        actionLabel="Nouvelle tâche"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total"
            value={stats.total}
            icon={CheckCircle2}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="À faire"
            value={stats.todo}
            icon={Target}
            color="text-slate-600"
            bgColor="bg-gradient-to-br from-slate-100 to-slate-200"
            delay={0.1}
          />
          <StatCard
            title="En cours"
            value={stats.in_progress}
            icon={Zap}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.2}
          />
          <StatCard
            title="Terminées"
            value={stats.done}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.3}
          />
          <StatCard
            title="En retard"
            value={stats.overdue}
            icon={AlertCircle}
            color="text-red-600"
            bgColor="bg-gradient-to-br from-red-100 to-red-200"
            delay={0.4}
          />
        </div>

        {/* Filtres et recherche */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher une tâche..."
          filters={[
            {
              label: 'Statut',
              options: [{ value: 'all', label: 'Tous les statuts' }, ...TASK_STATUS_OPTIONS],
              value: filterStatus,
              onChange: setFilterStatus,
            },
            {
              label: 'Priorité',
              options: [{ value: 'all', label: 'Toutes les priorités' }, ...TASK_PRIORITY_OPTIONS],
              value: filterPriority,
              onChange: setFilterPriority,
            },
            ...(canFilterByPole ? [{
              label: 'Pôle',
              options: [{ value: 'all', label: 'Tous les pôles' }, ...POLE_OPTIONS],
              value: filterPole,
              onChange: setFilterPole,
            }] : []),
          ]}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {/* Liste des tâches */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: 'easeOut' }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2 group-hover:rotate-4 transition-all duration-500" />
              <div className={`relative bg-gradient-to-br ${isOverdue(task) ? 'from-red-50 to-white' : 'from-white to-slate-50'} rounded-2xl p-6 shadow-lg hover:shadow-2xl border ${isOverdue(task) ? 'border-red-200 hover:border-red-300' : 'border-slate-100 hover:border-blue-200'} transition-all duration-500 overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-32 h-32 ${isOverdue(task) ? 'bg-gradient-to-br from-red-100/50 to-transparent' : 'bg-gradient-to-br from-blue-100/50 to-transparent'} rounded-full blur-2xl group-hover:from-blue-200/50 transition-all duration-500`} />
                
                <div className="flex items-start gap-4 mb-4 relative">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`w-14 h-14 ${isOverdue(task) ? 'bg-gradient-to-br from-red-100 to-red-200' : task.status === 'done' ? 'bg-gradient-to-br from-green-100 to-green-200' : task.status === 'in_progress' ? 'bg-gradient-to-br from-amber-100 to-amber-200' : 'bg-gradient-to-br from-slate-100 to-slate-200'} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                  >
                    {task.status === 'done' ? (
                      <CheckCircle className="w-7 h-7 text-green-600" />
                    ) : task.status === 'in_progress' ? (
                      <Zap className="w-7 h-7 text-amber-600" />
                    ) : isOverdue(task) ? (
                      <AlertCircle className="w-7 h-7 text-red-600" />
                    ) : (
                      <Target className="w-7 h-7 text-slate-600" />
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{task.title || '-'}</h3>
                    {task.assigned_to_nom && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-xs">Assigné à:</span>
                        <span className="font-medium">{task.assigned_to_nom}</span>
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(task.id, task.title)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="space-y-2 relative">
                  {task.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${TASK_STATUS_COLORS[task.status as keyof typeof TASK_STATUS_COLORS] || 'bg-slate-100 text-slate-700'}`}>
                      {TASK_STATUS_LABELS[task.status as keyof typeof TASK_STATUS_LABELS] || task.status}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${TASK_PRIORITY_COLORS[task.priority as keyof typeof TASK_PRIORITY_COLORS] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {TASK_PRIORITY_LABELS[task.priority as keyof typeof TASK_PRIORITY_LABELS] || task.priority}
                    </span>
                  </div>
                  {task.due_date && (
                    <div className={`flex items-center gap-2 text-sm ${isOverdue(task) ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                      <Calendar className="w-4 h-4" />
                      {new Date(task.due_date).toLocaleDateString('fr-FR')}
                      {isOverdue(task) && <span className="text-xs">(En retard)</span>}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </motion.div>
            <p className="text-slate-600 text-lg">Aucune tâche trouvée</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
