'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, TrendingUp, DollarSign, Calendar, Building2, Trash2, Target, Star } from 'lucide-react';
import { Opportunity, Pole } from '@/types';
import Link from 'next/link';
import { useOpportunities, useDeleteOpportunity } from '@/lib/api/useOpportunities';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { OPPORTUNITY_STAGE_COLORS, OPPORTUNITY_STAGE_LABELS, OPPORTUNITY_STAGE_OPTIONS, POLE_OPTIONS } from '@/lib/constants';
import { StatCard } from '@/components/AnimatedCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import Swal from 'sweetalert2';
import { usePoleFilter } from '@/hooks/usePoleFilter';
import { useWorkspace } from '@/hooks/useWorkspace';
import { errorMessage } from '@/lib/utils/errorHandler';

function OpportunitesPageContent() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '';
  const { pole: userPole, shouldFilter, user } = usePoleFilter();
  const { data: opportunities, isLoading: loading, error } = useOpportunities(shouldFilter ? userPole || undefined : undefined);
  const deleteOpportunity = useDeleteOpportunity();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterPole, setFilterPole] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Masquer le filtre par pôle pour les non-administrateurs
  const canFilterByPole = user?.isAdmin || false;

  // Rediriger les non-admin vers leur espace de travail
  useEffect(() => {
    if (from === 'commercial') {
      router.push('/commercial');
    } else if (from === 'tresorerie') {
      router.push('/tresorerie');
    } else if (workspace !== 'dashboard' && user && !user.isAdmin) {
      if (workspace === 'commercial') {
        router.push('/commercial');
      } else if (workspace === 'tresorerie') {
        router.push('/tresorerie');
      }
    }
  }, [workspace, user, router, from]);

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
        await deleteOpportunity.mutateAsync(id);
        await Swal.fire({
          title: 'Supprimé !',
          text: "L'opportunité a été supprimée avec succès.",
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
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

  const filteredOpportunities = (opportunities || []).filter((opp) => {
    const matchesSearch =
      opp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.client_nom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = filterStage === 'all' || opp.stage === filterStage;
    const matchesPole = filterPole === 'all' || (opp.poles && opp.poles.includes(filterPole as Pole));

    return matchesSearch && matchesStage && matchesPole;
  });

  const stats = {
    total: (opportunities || []).length,
    total_value: (opportunities || []).reduce((sum, opp) => sum + (opp.amount || 0), 0),
    weighted_value: (opportunities || []).reduce((sum, opp) => sum + (opp.amount || 0) * ((opp.probability || 0) / 100), 0),
    in_pipeline: (opportunities || []).filter((o) => !['gagné', 'perdu'].includes(o.stage || '')).length,
  };

  const formatAmount = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M FCFA`;
    }
    return `${(value / 1000).toFixed(0)}K FCFA`;
  };

  const byStage = (opportunities || []).reduce((acc, opp) => {
    const stage = opp.stage || 'nouveau';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {
    nouveau: 0,
    qualifié: 0,
    proposition: 0,
    négociation: 0,
    gagné: 0,
    perdu: 0,
  } as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-600 font-medium">Chargement des opportunités...</p>
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
          <p className="text-red-600 font-medium">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Opportunités"
        description="Gérez votre pipeline commercial"
        actionHref="/opportunites/create"
        actionLabel="Nouvelle opportunité"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total opportunités"
            value={stats.total}
            icon={Target}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="Valeur pipeline"
            value={formatAmount(stats.total_value)}
            icon={DollarSign}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.1}
          />
          <StatCard
            title="Valeur pondérée"
            value={formatAmount(stats.weighted_value)}
            icon={TrendingUp}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.2}
          />
          <StatCard
            title="En pipeline"
            value={stats.in_pipeline}
            icon={Calendar}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.3}
          />
        </div>

        {/* Filtres et recherche */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher une opportunité..."
          filters={[
            {
              label: 'Étape',
              options: [{ value: 'all', label: 'Toutes les étapes' }, ...OPPORTUNITY_STAGE_OPTIONS],
              value: filterStage,
              onChange: setFilterStage,
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

        {/* Pipeline Kanban */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
          <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
            <h2 className="text-xl font-bold text-slate-900 mb-4 relative">Vue Pipeline</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['nouveau', 'qualifié', 'proposition', 'négociation', 'gagné'].map((stage, index) => (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-xl transform rotate-2 group-hover:rotate-4 transition-all duration-500" />
                  <div className={`relative bg-gradient-to-br ${stage === 'nouveau' ? 'from-slate-100 to-slate-200' : stage === 'qualifié' ? 'from-blue-100 to-blue-200' : stage === 'proposition' ? 'from-amber-100 to-amber-200' : stage === 'négociation' ? 'from-orange-100 to-orange-200' : 'from-green-100 to-green-200'} rounded-xl p-4 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-opacity-50 transition-all duration-500`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900 text-sm capitalize">{OPPORTUNITY_STAGE_LABELS[stage as keyof typeof OPPORTUNITY_STAGE_LABELS] || stage}</h3>
                      <motion.span
                        whileHover={{ scale: 1.2 }}
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${OPPORTUNITY_STAGE_COLORS[stage as keyof typeof OPPORTUNITY_STAGE_COLORS] || 'bg-slate-100 text-slate-700'}`}
                      >
                        <AnimatedCounter value={byStage[stage] || 0} />
                      </motion.span>
                    </div>
                    <div className="space-y-2">
                      {filteredOpportunities.filter((o) => o.stage === stage).map((opp) => (
                        <motion.div
                          key={opp.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                          <p className="font-medium text-slate-900 text-sm line-clamp-1">{opp.name || '-'}</p>
                          <p className="text-xs text-slate-600 mt-1">{formatAmount(opp.amount || 0)}</p>
                          <p className="text-xs text-slate-500 mt-1">{opp.client_nom}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Liste des opportunités */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp, index) => (
            <Link key={opp.id} href={`/opportunites/${opp.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.05, ease: 'easeOut' }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2 group-hover:rotate-4 transition-all duration-500" />
                <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl group-hover:from-blue-200/50 transition-all duration-500" />
                  
                  <div className="flex items-start gap-4 mb-4 relative">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                    >
                      <Target className="w-7 h-7 text-blue-600" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{opp.name || '-'}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="w-4 h-4" />
                        {opp.client_nom || '-'}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(opp.id, opp.name || 'Sans nom');
                      }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>

                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">{formatAmount(opp.amount || 0)}</span>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${OPPORTUNITY_STAGE_COLORS[opp.stage as keyof typeof OPPORTUNITY_STAGE_COLORS] || 'bg-slate-100 text-slate-700'}`}>
                      {OPPORTUNITY_STAGE_LABELS[opp.stage as keyof typeof OPPORTUNITY_STAGE_LABELS] || opp.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <TrendingUp className="w-4 h-4" />
                    {opp.probability || 0}% probabilité
                  </div>
                  {opp.expected_close_date && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(opp.expected_close_date).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
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
              <Target className="w-8 h-8 text-blue-600" />
            </motion.div>
            <p className="text-slate-600 text-lg">Aucune opportunité trouvée</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// useSearchParams exige une frontière <Suspense> pour le prerender
export default function OpportunitesPage() {
  return (
    <Suspense>
      <OpportunitesPageContent />
    </Suspense>
  );
}
