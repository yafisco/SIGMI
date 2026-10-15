'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, Users, Building2, Mail, Phone, Calendar, Shield, Trash2, Edit } from 'lucide-react';
import { Collaborateur, Pole, Role } from '@/types';
import { useCollaborateurs, useCollaborateurStats } from '@/hooks/useCollaborateurs';
import Link from 'next/link';
import { StatCard } from '@/components/AnimatedCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { collaborateursService } from '@/lib/services';
import Swal from 'sweetalert2';
import { usePoleFilter } from '@/hooks/usePoleFilter';

const roleLabels: Record<Role, string> = {
  'commercial': 'Commercial',
  'responsable de pôle': 'Responsable de pôle',
  'direction': 'Direction',
  'gestionnaire de projet': 'Gestionnaire de projet',
  'administrateur système': 'Administrateur système',
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

const roleOptions: Array<{ value: Role | 'tous'; label: string }> = [
  { value: 'tous', label: 'Tous les rôles' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'responsable de pôle', label: 'Responsable de pôle' },
  { value: 'direction', label: 'Direction' },
  { value: 'gestionnaire de projet', label: 'Gestionnaire de projet' },
  { value: 'administrateur système', label: 'Administrateur système' },
];

export default function CollaborateursPage() {
  const { pole: userPole, shouldFilter, user } = usePoleFilter();
  const { collaborateurs, loading, error, refresh } = useCollaborateurs(shouldFilter ? userPole || undefined : undefined);
  const { stats: statsData, loading: statsLoading } = useCollaborateurStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPole, setFilterPole] = useState<Pole | 'tous'>('tous');
  const [filterRole, setFilterRole] = useState<Role | 'tous'>('tous');

  // Masquer le filtre par pôle pour les non-administrateurs
  const canFilterByPole = user?.isAdmin || false;

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer le collaborateur "${name}". Cette action est irréversible !`,
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
        await collaborateursService.delete(id);
        await refresh(); // Rafraîchir la liste après suppression
        await Swal.fire({
          title: 'Supprimé !',
          text: 'Le collaborateur a été supprimé avec succès.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (err: any) {
        await Swal.fire({
          title: 'Erreur',
          text: err.message || 'Erreur lors de la suppression du collaborateur',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const displayCollaborateurs = error || loading ? [] : collaborateurs;
  const displayStats = error || statsLoading ? {
    total: 0,
    actifs: 0,
    parPole: {
      'ingénierie informatique': 0,
      'trading international': 0,
      'agrobusiness': 0,
      'transition énergétique': 0,
      'génie civil et BTP': 0,
    },
  } : {
    total: statsData.total,
    actifs: statsData.actifs,
    parPole: statsData.parPole,
  };

  const filteredCollaborateurs = (displayCollaborateurs || []).filter((collab) => {
    const matchesSearch =
      collab.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collab.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collab.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collab.poste.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPole = filterPole === 'tous' || collab.poles.includes(filterPole);
    const matchesRole = filterRole === 'tous' || collab.role === filterRole;

    return matchesSearch && matchesPole && matchesRole;
  });

  const stats = displayStats;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-600 font-medium">Chargement des collaborateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Collaborateurs"
        description="Annuaire interne des collaborateurs"
        actionHref="/collaborateurs/create"
        actionLabel="Nouveau collaborateur"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total collaborateurs"
            value={stats.total}
            icon={Users}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="Collaborateurs actifs"
            value={stats.actifs}
            icon={Shield}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.1}
          />
          <StatCard
            title="Par pôle"
            value={Object.values(stats.parPole).reduce((a, b) => a + b, 0)}
            icon={Building2}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.2}
          />
        </div>

        {/* Filtres et recherche */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher un collaborateur..."
          filters={[
            ...(canFilterByPole ? [{
              label: 'Pôle',
              options: poleOptions,
              value: filterPole,
              onChange: setFilterPole,
            }] : []),
            {
              label: 'Rôle',
              options: roleOptions,
              value: filterRole,
              onChange: setFilterRole,
            },
          ]}
          showFilters={false}
          onToggleFilters={() => {}}
        />

        {/* Liste des collaborateurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollaborateurs.map((collab, index) => {
            // Déterminer le premier pôle du collaborateur pour le lien
            const firstPole = collab.poles && collab.poles.length > 0 ? collab.poles[0] : null;
            const CardContent = (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: 'easeOut' }}
                whileHover={firstPole ? { y: -10, scale: 1.02 } : {}}
                className={`relative group ${firstPole ? 'cursor-pointer' : ''}`}
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
                    <Users className="w-7 h-7 text-blue-600" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{collab.prenom} {collab.nom}</h3>
                    <p className="text-sm text-slate-600">{collab.poste}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/collaborateurs/${collab.id}/edit`} onClick={(e) => e.stopPropagation()}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(collab.id, collab.nom);
                      }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4" />
                    {collab.email}
                  </div>
                  {collab.telephone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      {collab.telephone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield className="w-4 h-4" />
                    {roleLabels[collab.role]}
                  </div>
                  {collab.poles.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 className="w-4 h-4" />
                      {collab.poles.map((pole) => poleLabels[pole]).join(', ')}
                    </div>
                  )}
                  {collab.date_embauche && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(collab.date_embauche).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            );

            // Envelopper dans un Link seulement si le collaborateur a un pôle
            return firstPole ? (
              <Link key={collab.id} href={`/poles/${encodeURIComponent(firstPole)}`}>
                {CardContent}
              </Link>
            ) : (
              <div key={collab.id}>{CardContent}</div>
            );
          })}
        </div>

        {filteredCollaborateurs.length === 0 && (
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
              <Users className="w-8 h-8 text-blue-600" />
            </motion.div>
            <p className="text-slate-600 text-lg">Aucun collaborateur trouvé</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
