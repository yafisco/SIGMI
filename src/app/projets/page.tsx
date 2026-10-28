'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, FolderKanban, Calendar, DollarSign, Users, TrendingUp, AlertCircle, Building2, Trash2 } from 'lucide-react';
import { Projet, Pole, ProjectStatus, ProjectPriority } from '@/types';
import { useProjets, useProjetStats } from '@/hooks/useProjets';
import Link from 'next/link';
import { StatCard } from '@/components/AnimatedCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { projetsService } from '@/lib/services';
import Swal from 'sweetalert2';
import { usePoleFilter } from '@/hooks/usePoleFilter';
import { errorMessage } from '@/lib/utils/errorHandler';

const statusLabels: Record<ProjectStatus, string> = {
  'planifié': 'Planifié',
  'en cours': 'En cours',
  'en pause': 'En pause',
  'terminé': 'Terminé',
  'annulé': 'Annulé',
};

const statusColors: Record<ProjectStatus, string> = {
  'planifié': 'bg-blue-100 text-blue-700',
  'en cours': 'bg-amber-100 text-amber-700',
  'en pause': 'bg-orange-100 text-orange-700',
  'terminé': 'bg-green-100 text-green-700',
  'annulé': 'bg-red-100 text-red-700',
};

const priorityLabels: Record<ProjectPriority, string> = {
  'basse': 'Basse',
  'moyenne': 'Moyenne',
  'haute': 'Haute',
  'critique': 'Critique',
};

const priorityColors: Record<ProjectPriority, string> = {
  'basse': 'bg-slate-100 text-slate-700',
  'moyenne': 'bg-blue-100 text-blue-700',
  'haute': 'bg-orange-100 text-orange-700',
  'critique': 'bg-red-100 text-red-700',
};

const poleLabels: Record<Pole, string> = {
  'ingénierie informatique': 'Ingénierie Informatique',
  'génie civil et BTP': 'Génie Civil et BTP',
  'agrobusiness': 'Agrobusiness',
  'trading international': 'Trading International',
  'transition énergétique': 'Transition Énergétique',
  'centre d\'incubation et d\'impulsion des entreprises': 'Centre d\'Incubation',
};

const poleOptions: Array<{ value: Pole | 'tous'; label: string }> = [
  { value: 'tous', label: 'Tous les pôles' },
  { value: 'ingénierie informatique', label: 'Ingénierie Informatique' },
  { value: 'génie civil et BTP', label: 'Génie Civil et BTP' },
  { value: 'agrobusiness', label: 'Agrobusiness' },
  { value: 'trading international', label: 'Trading International' },
  { value: 'transition énergétique', label: 'Transition Énergétique' },
  { value: 'centre d\'incubation et d\'impulsion des entreprises', label: 'Centre d\'Incubation' },
];

const statusOptions: Array<{ value: ProjectStatus | 'tous'; label: string }> = [
  { value: 'tous', label: 'Tous les statuts' },
  { value: 'planifié', label: 'Planifié' },
  { value: 'en cours', label: 'En cours' },
  { value: 'en pause', label: 'En pause' },
  { value: 'terminé', label: 'Terminé' },
  { value: 'annulé', label: 'Annulé' },
];

const priorityOptions: Array<{ value: ProjectPriority | 'tous'; label: string }> = [
  { value: 'tous', label: 'Toutes les priorités' },
  { value: 'basse', label: 'Basse' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'haute', label: 'Haute' },
  { value: 'critique', label: 'Critique' },
];

export default function ProjetsPage() {
  const { pole: userPole, shouldFilter, user } = usePoleFilter();
  const { projets, loading, error } = useProjets(shouldFilter ? userPole || undefined : undefined);
  const { stats: statsData, loading: statsLoading } = useProjetStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPole, setFilterPole] = useState<Pole | 'tous'>('tous');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'tous'>('tous');
  const [filterPriority, setFilterPriority] = useState<ProjectPriority | 'tous'>('tous');

  // Masquer le filtre par pôle pour les non-administrateurs
  const canFilterByPole = user?.canSeeAllPoles || false;

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

  const displayProjets = error || loading ? [] : projets;
  const displayStats = error || statsLoading ? {
    total: 0,
    enCours: 0,
    termines: 0,
    budgetTotal: 0,
    budgetConsomme: 0,
  } : {
    total: statsData.total,
    enCours: statsData.enCours,
    termines: statsData.termines,
    budgetTotal: statsData.budgetTotal,
    budgetConsomme: statsData.budgetConsomme,
  };

  const filteredProjets = (displayProjets || []).filter((projet) => {
    const matchesSearch =
      projet.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.responsable_nom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPole = filterPole === 'tous' || projet.poles.includes(filterPole);
    const matchesStatus = filterStatus === 'tous' || projet.statut === filterStatus;
    const matchesPriority = filterPriority === 'tous' || projet.priorite === filterPriority;

    return matchesSearch && matchesPole && matchesStatus && matchesPriority;
  });

  const stats = displayStats;

  const formatBudget = (value: number) => {
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
          <p className="text-slate-600 font-medium">Chargement des projets...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Projets"
        description="Gérez et suivez vos projets"
        actionHref="/projets/create"
        actionLabel="Nouveau projet"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total projets"
            value={stats.total}
            icon={FolderKanban}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="En cours"
            value={stats.enCours}
            icon={TrendingUp}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.1}
          />
          <StatCard
            title="Terminés"
            value={stats.termines}
            icon={AlertCircle}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.2}
          />
          <StatCard
            title="Budget total"
            value={formatBudget(stats.budgetTotal)}
            icon={DollarSign}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.3}
          />
          <StatCard
            title="Budget consommé"
            value={formatBudget(stats.budgetConsomme)}
            icon={Calendar}
            color="text-red-600"
            bgColor="bg-gradient-to-br from-red-100 to-red-200"
            delay={0.4}
          />
        </div>

        {/* Filtres et recherche */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher un projet..."
          filters={[
            ...(canFilterByPole ? [{
              label: 'Pôle',
              options: poleOptions,
              value: filterPole,
              onChange: setFilterPole,
            }] : []),
            {
              label: 'Statut',
              options: statusOptions,
              value: filterStatus,
              onChange: setFilterStatus,
            },
            {
              label: 'Priorité',
              options: priorityOptions,
              value: filterPriority,
              onChange: setFilterPriority,
            },
          ]}
          showFilters={false}
          onToggleFilters={() => {}}
        />

        {/* Liste des projets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjets.map((projet, index) => (
            <Link key={projet.id} href={`/projets/${projet.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: 'easeOut' }}
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
                      <FolderKanban className="w-7 h-7 text-blue-600" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{projet.nom}</h3>
                      {projet.responsable_nom && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="w-4 h-4" />
                          {projet.responsable_nom}
                        </div>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(projet.id, projet.nom);
                      }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>

                <div className="space-y-2 relative">
                  <p className="text-sm text-slate-600 line-clamp-2">{projet.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusColors[projet.statut]}`}>
                      {statusLabels[projet.statut]}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${priorityColors[projet.priorite]}`}>
                      {priorityLabels[projet.priorite]}
                    </span>
                  </div>
                  {projet.poles.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 className="w-4 h-4" />
                      {projet.poles.map((pole) => poleLabels[pole]).join(', ')}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Budget: {formatBudget(projet.budget_estime ?? 0)}</span>
                    {projet.date_debut && (
                      <span className="text-slate-600">
                        {new Date(projet.date_debut).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>

        {filteredProjets.length === 0 && (
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
              <FolderKanban className="w-8 h-8 text-blue-600" />
            </motion.div>
            <p className="text-slate-600 text-lg">Aucun projet trouvé</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
