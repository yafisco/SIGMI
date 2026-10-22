'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Building2, Search, Plus, MapPin, Mail, Phone, Calendar, TrendingUp, Trash2, Star } from 'lucide-react';
import { Client } from '@/types';
import Link from 'next/link';
import { useClients, useDeleteClient } from '@/lib/api/useClients';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { CLIENT_STATUT_COLORS, CLIENT_STATUT_LABELS, CLIENT_STATUT_OPTIONS, POLE_OPTIONS } from '@/lib/constants';
import { StatCard } from '@/components/AnimatedCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import Swal from 'sweetalert2';
import { useWorkspace } from '@/hooks/useWorkspace';
import { errorMessage } from '@/lib/utils/errorHandler';

function ClientsPageContent() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '';
  const { data: clients, isLoading: loading, error } = useClients();
  const deleteClient = useDeleteClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterPole, setFilterPole] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Rediriger les non-admin vers leur espace de travail
  useEffect(() => {
    if (from === 'commercial') {
      router.push('/commercial');
    } else if (from === 'tresorerie') {
      router.push('/tresorerie');
    } else if (workspace !== 'dashboard') {
      if (workspace === 'commercial') {
        router.push('/commercial');
      } else if (workspace === 'tresorerie') {
        router.push('/tresorerie');
      }
    }
  }, [workspace, router, from]);

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer le client "${name}". Cette action est irréversible !`,
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
        await deleteClient.mutateAsync(id);
        await Swal.fire({
          title: 'Supprimé !',
          text: 'Le client a été supprimé avec succès.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (err) {
        await Swal.fire({
          title: 'Erreur',
          text: errorMessage(err, 'Erreur lors de la suppression du client'),
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const filteredClients = (clients || []).filter((client) => {
    const matchesSearch =
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.ville?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatut = filterStatut === 'all' || client.statut === filterStatut;

    return matchesSearch && matchesStatut;
  });

  const stats = {
    total: (clients || []).length,
    prospects: (clients || []).filter((c) => c.statut === 'prospect').length,
    clientsActifs: (clients || []).filter((c) => c.statut === 'client').length,
    ca_total: (clients || []).reduce((sum, c) => sum + (c.chiffre_affaires_annuel || 0), 0),
  };

  const formatCA = (value: number) => {
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
          <p className="text-slate-600 font-medium">Chargement des clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Clients"
        description="Gérez votre portefeuille de clients"
        actionHref="/clients/create"
        actionLabel="Nouveau client"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total clients"
            value={stats.total}
            icon={Building2}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="Prospects"
            value={stats.prospects}
            icon={Search}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.1}
          />
          <StatCard
            title="Clients actifs"
            value={stats.clientsActifs}
            icon={TrendingUp}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.2}
          />
          <StatCard
            title="CA total"
            value={formatCA(stats.ca_total)}
            icon={Calendar}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.3}
          />
        </div>

        {/* Filtres et recherche */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher un client..."
          filters={[
            {
              label: 'Statut',
              options: [{ value: 'all', label: 'Tous les statuts' }, ...CLIENT_STATUT_OPTIONS],
              value: filterStatut,
              onChange: setFilterStatut,
            },
          ]}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {/* Liste des clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
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
                      <Building2 className="w-7 h-7 text-blue-600" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{client.nom}</h3>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPin className="w-3 h-3" />
                        {client.ville}, {client.pays}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(client.id, client.nom);
                      }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>

                <div className="space-y-2 relative">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </div>
                  )}
                  {client.telephone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      {client.telephone}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{client.secteur_activite || '-'}</span>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${CLIENT_STATUT_COLORS[client.statut]}`}>
                      {CLIENT_STATUT_LABELS[client.statut]}
                    </span>
                  </div>
                  {client.chiffre_affaires_annuel && (
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <TrendingUp className="w-4 h-4 text-slate-600" />
                      {formatCA(client.chiffre_affaires_annuel)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>

        {filteredClients.length === 0 && (
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
              <Building2 className="w-8 h-8 text-blue-600" />
            </motion.div>
            <p className="text-slate-600 text-lg">Aucun client trouvé</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// useSearchParams exige une frontière <Suspense> pour le prerender
export default function ClientsPage() {
  return (
    <Suspense>
      <ClientsPageContent />
    </Suspense>
  );
}
