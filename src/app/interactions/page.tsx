'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, MessageSquare, Calendar, User, Phone, Mail, Trash2, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { interactionsService } from '@/lib/services';
import { Interaction, InteractionType } from '@/types';
import { StatCard } from '@/components/AnimatedCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { useData } from '@/hooks/useData';
import Swal from 'sweetalert2';
import { errorMessage } from '@/lib/utils/errorHandler';

const typeLabels: Record<string, string> = {
  email: 'Email',
  appel: 'Appel',
  réunion: 'Réunion',
  visite: 'Visite',
  autre: 'Autre',
};

const typeIcons: Record<string, LucideIcon> = {
  email: Mail,
  appel: Phone,
  réunion: MessageSquare,
  visite: Calendar,
  autre: Clock,
};

const typeColors: Record<string, string> = {
  email: 'bg-blue-100 text-blue-700',
  appel: 'bg-green-100 text-green-700',
  réunion: 'bg-purple-100 text-purple-700',
  visite: 'bg-orange-100 text-orange-700',
  autre: 'bg-slate-100 text-slate-700',
};

const typeOptions: Array<{ value: InteractionType | 'all'; label: string }> = [
  { value: 'all', label: 'Tous les types' },
  { value: 'email', label: 'Email' },
  { value: 'appel', label: 'Appel' },
  { value: 'réunion', label: 'Réunion' },
  { value: 'visite', label: 'Visite' },
  { value: 'autre', label: 'Autre' },
];

export default function InteractionsPage() {
  const { data: interactions, loading, error, refresh } = useData({
    fetchFn: () => interactionsService.getAll(),
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<InteractionType | 'all'>('all');

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer l'interaction "${name}". Cette action est irréversible !`,
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
        refresh();
        await Swal.fire({
          title: 'Supprimé !',
          text: "L'interaction a été supprimée avec succès.",
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (err) {
        await Swal.fire({
          title: 'Erreur',
          text: errorMessage(err, "Erreur lors de la suppression de l'interaction"),
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const filteredInteractions = (interactions || []).filter((interaction) => {
    const matchesSearch =
      interaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.created_by_nom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || (interaction.type || 'autre') === filterType;

    return matchesSearch && matchesType;
  });

  const stats = {
    total: (interactions || []).length,
    emails: (interactions || []).filter((i) => i.type === 'email').length,
    appels: (interactions || []).filter((i) => i.type === 'appel').length,
    reunions: (interactions || []).filter((i) => i.type === 'réunion').length,
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
          <p className="text-slate-600 font-medium">Chargement des interactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Interactions"
        description="Historique des interactions"
        actionHref="/interactions/create"
        actionLabel="Nouvelle interaction"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total interactions"
            value={stats.total}
            icon={MessageSquare}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="Emails"
            value={stats.emails}
            icon={Mail}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.1}
          />
          <StatCard
            title="Appels"
            value={stats.appels}
            icon={Phone}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.2}
          />
          <StatCard
            title="Réunions"
            value={stats.reunions}
            icon={Calendar}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.3}
          />
        </div>

        {/* Filtres et recherche */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher une interaction..."
          filters={[
            {
              label: 'Type',
              options: typeOptions,
              value: filterType,
              onChange: setFilterType,
            },
          ]}
          showFilters={false}
          onToggleFilters={() => {}}
        />

        {/* Liste des interactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInteractions.map((interaction, index) => {
            const Icon = typeIcons[interaction.type] || typeIcons.autre;
            return (
              <motion.div
                key={interaction.id}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: 'easeOut' }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2 group-hover:rotate-4 transition-all duration-500" />
                <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl group-hover:from-blue-200/50 transition-all duration-500" />
                  
                  <div className="flex items-start gap-4 mb-4 relative">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-14 h-14 ${(typeColors[interaction.type] || typeColors.autre).split(' ')[0]} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{interaction.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4" />
                        {interaction.created_by_nom || '-'}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(interaction.id, interaction.title)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <div className="space-y-2 relative">
                    {interaction.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">{interaction.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${typeColors[interaction.type] || typeColors.autre}`}>
                        {typeLabels[interaction.type] || typeLabels.autre}
                      </span>
                    </div>
                    {interaction.interaction_date && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(interaction.interaction_date).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredInteractions.length === 0 && (
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
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </motion.div>
            <p className="text-slate-600 text-lg">Aucune interaction trouvée</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
