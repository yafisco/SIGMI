'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FolderKanban, Calendar, DollarSign, Users, TrendingUp, MessageSquare, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSingleData } from '@/hooks/useData';
import { projetsService } from '@/lib/services';
import { tasksService } from '@/lib/services';
import { documentsService } from '@/lib/services';
import { interactionsService } from '@/lib/services';
import { Projet, Task, Document, Interaction } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/AnimatedCard';
import { motion } from 'framer-motion';
import { PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/lib/constants';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import Swal from 'sweetalert2';
import { errorMessage } from '@/lib/utils/errorHandler';

export default function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: projet, loading, error } = useSingleData<Projet>({
    fetchFn: projetsService.getById,
    id: id,
  });

  const { data: tasks, loading: tasksLoading } = useSingleData<Task[]>({
    fetchFn: () => tasksService.getByProjet(id),
    id: id,
  });

  const { data: documents, loading: documentsLoading } = useSingleData<Document[]>({
    fetchFn: () => documentsService.getByProjet(id),
    id: id,
  });

  const { data: interactions, loading: interactionsLoading } = useSingleData<Interaction[]>({
    fetchFn: () => interactionsService.getByRelated('projet', id),
    id: id,
  });

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer le projet "${name}". Cette action est irréversible !`,
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
        await projetsService.delete(id);
        await Swal.fire({
          title: 'Supprimé !',
          text: 'Le projet a été supprimé avec succès.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
        router.push('/projets');
      } catch (err) {
        await Swal.fire({
          title: 'Erreur',
          text: errorMessage(err, 'Erreur lors de la suppression du projet'),
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const formatAmount = (value: number) => {
    if (!value) return '0 FCFA';
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M FCFA`;
    }
    return `${(value / 1000).toFixed(0)}K FCFA`;
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
          <p className="text-slate-600 font-medium">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!projet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Projet non trouvé</p>
          <Link href="/projets">
            <Button className="mt-4">Retour à la liste</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title={projet.nom}
        description="Vue détaillée du projet"
        backHref="/projets"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex gap-4 mb-8"
        >
          <Link href={`/projets/${projet.id}/edit`}>
            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => handleDelete(projet.id, projet.nom)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Budget total"
            value={formatAmount(projet.budget_estime || 0)}
            icon={DollarSign}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0}
          />
          <StatCard
            title="Budget consommé"
            value={formatAmount(projet.budget_consomme || 0)}
            icon={TrendingUp}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0.1}
          />
          <StatCard
            title="Tâches"
            value={(tasks || []).length}
            icon={FolderKanban}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.2}
          />
          <StatCard
            title="Documents"
            value={(documents || []).length}
            icon={FileText}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.3}
          />
        </div>

        {/* Informations du projet */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2" />
          <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
            <div className="flex items-start gap-6 mb-6 relative">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0"
              >
                <FolderKanban className="w-10 h-10 text-white" />
              </motion.div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{projet.nom}</h2>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${PROJECT_STATUS_COLORS[projet.statut]}`}>
                    {PROJECT_STATUS_LABELS[projet.statut]}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {projet.description && (
                <div className="md:col-span-2">
                  <p className="text-slate-700">{projet.description}</p>
                </div>
              )}
              {projet.date_debut && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  Début : {new Date(projet.date_debut).toLocaleDateString('fr-FR')}
                </div>
              )}
              {projet.date_fin_prevue && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  Fin : {new Date(projet.date_fin_prevue).toLocaleDateString('fr-FR')}
                </div>
              )}
              {projet.responsable_nom && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Users className="w-5 h-5 text-[#D4AF37]" />
                  Responsable : {projet.responsable_nom}
                </div>
              )}
              {projet.poles?.length > 0 && (
                <div className="flex items-center gap-3 text-slate-700">
                  <FolderKanban className="w-5 h-5 text-[#D4AF37]" />
                  Pôle : {projet.poles.join(', ')}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sections liées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tâches */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-white rounded-2xl transform rotate-1" />
            <div className="relative bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-purple-200 transition-all duration-500 overflow-hidden">
              <div className="flex items-center justify-between mb-4 relative">
                <div className="flex items-center gap-3">
                  <FolderKanban className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-bold text-slate-900">Tâches</h3>
                </div>
                <Link href="/taches/create">
                  <Button size="sm" className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8] border-2 border-[#D4AF37]">
                    <Plus className="w-4 h-4 mr-1" />
                    Nouvelle
                  </Button>
                </Link>
              </div>
              <div className="space-y-3 relative">
                {(tasks || []).length === 0 ? (
                  <div className="text-center py-8 text-slate-500 relative">
                    Aucune tâche associée
                  </div>
                ) : (
                  tasks?.slice(0, 3).map((task) => (
                    <Link key={task.id} href={`/taches/${task.id}`}>
                      <div className="p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                        <div className="font-medium text-slate-900">{task.title}</div>
                        <div className="text-sm text-slate-600">{task.status}</div>
                      </div>
                    </Link>
                  ))
                )}
                {(tasks || []).length > 3 && (
                  <div className="text-center text-sm text-slate-500">
                    +{(tasks || []).length - 3} autres tâches
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Documents */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-white rounded-2xl transform -rotate-1" />
            <div className="relative bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-amber-200 transition-all duration-500 overflow-hidden">
              <div className="flex items-center justify-between mb-4 relative">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-amber-600" />
                  <h3 className="text-lg font-bold text-slate-900">Documents</h3>
                </div>
                <Link href="/documents/create">
                  <Button size="sm" className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8] border-2 border-[#D4AF37]">
                    <Plus className="w-4 h-4 mr-1" />
                    Nouveau
                  </Button>
                </Link>
              </div>
              <div className="space-y-3 relative">
                {(documents || []).length === 0 ? (
                  <div className="text-center py-8 text-slate-500 relative">
                    Aucun document associé
                  </div>
                ) : (
                  documents?.slice(0, 3).map((doc) => (
                    <Link key={doc.id} href={`/documents/${doc.id}`}>
                      <div className="p-3 bg-white rounded-lg hover:bg-amber-50 transition-colors cursor-pointer">
                        <div className="font-medium text-slate-900">{doc.nom}</div>
                        <div className="text-sm text-slate-600">{doc.type}</div>
                      </div>
                    </Link>
                  ))
                )}
                {(documents || []).length > 3 && (
                  <div className="text-center text-sm text-slate-500">
                    +{(documents || []).length - 3} autres documents
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Historique des interactions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative mt-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
          <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-4 relative">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Historique des interactions</h3>
              </div>
              <Link href="/interactions/create">
                <Button size="sm" className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8] border-2 border-[#D4AF37]">
                  <Plus className="w-4 h-4 mr-1" />
                  Nouvelle
                </Button>
              </Link>
            </div>
            <div className="space-y-3 relative">
              {(interactions || []).length === 0 ? (
                <div className="text-center py-8 text-slate-500 relative">
                  Aucune interaction enregistrée
                </div>
              ) : (
                interactions?.slice(0, 5).map((interaction) => (
                  <div key={interaction.id} className="p-3 bg-white rounded-lg">
                    <div className="font-medium text-slate-900">{interaction.title}</div>
                    <div className="text-sm text-slate-600">
                      {new Date(interaction.interaction_date || interaction.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))
              )}
              {(interactions || []).length > 5 && (
                <div className="text-center text-sm text-slate-500">
                  +{(interactions || []).length - 5} autres interactions
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
