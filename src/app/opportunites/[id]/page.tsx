'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, DollarSign, Calendar, TrendingUp, Users, MessageSquare, FolderKanban, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSingleData } from '@/hooks/useData';
import { opportunitiesService } from '@/lib/services';
import { interactionsService } from '@/lib/services';
import { Opportunity, Interaction } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/AnimatedCard';
import { motion } from 'framer-motion';
import { OPPORTUNITY_STAGE_COLORS, OPPORTUNITY_STAGE_LABELS } from '@/lib/constants';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import Swal from 'sweetalert2';
import { errorMessage } from '@/lib/utils/errorHandler';

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: opportunity, loading, error } = useSingleData<Opportunity>({
    fetchFn: opportunitiesService.getById,
    id: id,
  });

  const { data: interactions, loading: interactionsLoading } = useSingleData<Interaction[]>({
    fetchFn: () => interactionsService.getByRelated('opportunity', id),
    id: id,
  });

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer l'opportunité "${name}". Cette action est irréversible !`,
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
        await opportunitiesService.delete(id);
        await Swal.fire({
          title: 'Supprimé !',
          text: "L'opportunité a été supprimée avec succès.",
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
        router.push('/opportunites');
      } catch (err) {
        await Swal.fire({
          title: 'Erreur',
          text: errorMessage(err, "Erreur lors de la suppression de l'opportunité"),
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
          <p className="text-slate-600 font-medium">Chargement de l&apos;opportunité...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Opportunité non trouvée</p>
          <Link href="/opportunites">
            <Button className="mt-4">Retour à la liste</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title={opportunity.name}
        description="Vue détaillée de l'opportunité"
        backHref="/opportunites"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex gap-4 mb-8"
        >
          <Link href={`/opportunites/${opportunity.id}/edit`}>
            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => handleDelete(opportunity.id, opportunity.name)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Montant"
            value={formatAmount(opportunity.amount)}
            icon={DollarSign}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0}
          />
          <StatCard
            title="Probabilité"
            value={`${opportunity.probability}%`}
            icon={TrendingUp}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0.1}
          />
          <StatCard
            title="Valeur pondérée"
            value={formatAmount(opportunity.amount * (opportunity.probability / 100))}
            icon={Target}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.2}
          />
          <StatCard
            title="Interactions"
            value={(interactions || []).length}
            icon={MessageSquare}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.3}
          />
        </div>

        {/* Informations de l'opportunité */}
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
                <Target className="w-10 h-10 text-white" />
              </motion.div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{opportunity.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${OPPORTUNITY_STAGE_COLORS[opportunity.stage]}`}>
                    {OPPORTUNITY_STAGE_LABELS[opportunity.stage]}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {opportunity.description && (
                <div className="md:col-span-2">
                  <p className="text-slate-700">{opportunity.description}</p>
                </div>
              )}
              {opportunity.client_nom && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Users className="w-5 h-5 text-[#1D4ED8]" />
                  {opportunity.client_nom}
                </div>
              )}
              {opportunity.expected_close_date && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  Clôture prévue : {new Date(opportunity.expected_close_date).toLocaleDateString('fr-FR')}
                </div>
              )}
              {opportunity.assigned_to_nom && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Users className="w-5 h-5 text-[#D4AF37]" />
                  Assigné à : {opportunity.assigned_to_nom}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Historique des interactions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
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
                interactions?.map((interaction) => (
                  <div key={interaction.id} className="p-3 bg-white rounded-lg">
                    <div className="font-medium text-slate-900">{interaction.title}</div>
                    <div className="text-sm text-slate-600">
                      {new Date(interaction.interaction_date || interaction.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
