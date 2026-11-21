'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, MessageSquare, Calendar, User, Phone, Mail, Trash2, Clock, Building2, Send, Check, X, Paperclip } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { interactionsService } from '@/lib/services';
import { Interaction, InteractionType } from '@/types';
import { FilterBar } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { useData } from '@/hooks/useData';
import Swal from 'sweetalert2';
import { errorMessage } from '@/lib/utils/errorHandler';
import { SendEmailModal } from '@/components/SendEmailModal';
import { useEnvoisEmail } from '@/lib/api/useEnvoisEmail';
import { useContactsEmail } from '@/lib/api/useContactsEmail';
import { useEmailTemplates } from '@/lib/api/useEmailTemplates';

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

const typeOptions: Array<{ value: InteractionType | 'all' | 'envois'; label: string }> = [
  { value: 'all', label: 'Tous les types' },
  { value: 'email', label: 'Emails' },
  { value: 'envois', label: 'Envois planifiés' },
  { value: 'appel', label: 'Appels' },
  { value: 'réunion', label: 'Réunions' },
  { value: 'visite', label: 'Visites' },
  { value: 'autre', label: 'Autre' },
];

export default function InteractionsPage() {
  const { data: interactions, loading, error, refresh } = useData({
    fetchFn: () => interactionsService.getAll(),
  });
  const { envoisPlanifies, envoisEnvoyes, createEnvoi, markAsEnvoye, cancelEnvoi, deleteEnvoi, checkDuplicate } = useEnvoisEmail();
  const { contacts } = useContactsEmail();
  const { templates } = useEmailTemplates();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<InteractionType | 'all' | 'envois'>('all');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [showCreateEnvoiModal, setShowCreateEnvoiModal] = useState(false);

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

  const handleMarkAsEnvoye = async (id: string, nom: string) => {
    const result = await Swal.fire({
      title: 'Marquer comme envoyé ?',
      text: `Confirmer l'envoi à ${nom} ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
      cancelButtonColor: SWEETALERT_CONFIG.cancelButtonColor,
      confirmButtonText: 'Oui, marquer',
      cancelButtonText: 'Annuler',
      customClass: SWEETALERT_CONFIG.customClass,
    });

    if (result.isConfirmed) {
      try {
        await markAsEnvoye.mutateAsync(id);
        await Swal.fire({
          title: 'Envoyé !',
          text: 'L\'e-mail a été marqué comme envoyé.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (error) {
        await Swal.fire({
          title: 'Erreur',
          text: 'Impossible de marquer comme envoyé.',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const handleCancelEnvoi = async (id: string, nom: string) => {
    const result = await Swal.fire({
      title: 'Annuler l\'envoi ?',
      text: `Êtes-vous sûr de vouloir annuler l'envoi à ${nom} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
      cancelButtonColor: SWEETALERT_CONFIG.cancelButtonColor,
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non',
      customClass: SWEETALERT_CONFIG.customClass,
    });

    if (result.isConfirmed) {
      try {
        await cancelEnvoi.mutateAsync(id);
        await Swal.fire({
          title: 'Annulé !',
          text: 'L\'envoi a été annulé.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (error) {
        await Swal.fire({
          title: 'Erreur',
          text: 'Impossible d\'annuler l\'envoi.',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const handleDeleteEnvoi = async (id: string, nom: string) => {
    const result = await Swal.fire({
      title: 'Supprimer cet envoi ?',
      text: `Êtes-vous sûr de vouloir supprimer l'envoi à ${nom} ?`,
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
        await deleteEnvoi.mutateAsync(id);
        await Swal.fire({
          title: 'Supprimé !',
          text: 'L\'envoi a été supprimé.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (error) {
        await Swal.fire({
          title: 'Erreur',
          text: 'Impossible de supprimer l\'envoi.',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const handleCreateEnvoi = async (data: any) => {
    if (data.modele_id) {
      const isDuplicate = await checkDuplicate.mutateAsync({
        contactId: data.contact_id,
        modeleId: data.modele_id,
      });
      if (isDuplicate) {
        await Swal.fire(
          'Doublon détecté',
          'Un envoi pour ce contact avec ce modèle est déjà planifié.',
          'warning'
        );
        return;
      }
    }

    try {
      await createEnvoi.mutateAsync(data);
      setShowCreateEnvoiModal(false);
      await Swal.fire({
        title: 'Succès',
        text: 'Envoi planifié avec succès.',
        icon: 'success',
        confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    } catch (error) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Impossible de planifier l\'envoi.',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    }
  };

  const filteredInteractions = (interactions || []).filter((interaction) => {
    const matchesSearch =
      interaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.created_by_nom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || filterType === 'envois' || (interaction.type || 'autre') === filterType;

    return matchesSearch && matchesType;
  });

  const stats = {
    total: (interactions || []).length + (envoisPlanifies.data?.length || 0),
    emails: (envoisEnvoyes.data?.length || 0),
    appels: (interactions || []).filter((i) => i.type === 'appel').length,
    reunions: (interactions || []).filter((i) => i.type === 'réunion').length,
    aEnvoyer: envoisPlanifies.data?.length || 0,
    envoyesMois: envoisEnvoyes.data?.filter(e => {
      const date = new Date(e.date_envoi_reelle || e.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length || 0,
    totalEnvoyes: envoisEnvoyes.data?.length || 0,
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
        description="Historique des interactions et envois d'e-mails"
        actionHref="/commercial/interactions/create"
        actionLabel="Nouvelle interaction"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/commercial/interactions/emails">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-blue-100 font-medium">Emails</p>
                  <p className="text-2xl font-bold text-white">{stats.emails}</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/commercial/interactions/appels">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-green-100 font-medium">Appels</p>
                  <p className="text-2xl font-bold text-white">{stats.appels}</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/commercial/interactions/reunions">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-amber-100 font-medium">Réunions</p>
                  <p className="text-2xl font-bold text-white">{stats.reunions}</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <motion.button
            onClick={() => setFilterType('all')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${filterType === 'all' ? 'ring-2 ring-purple-500' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm text-purple-100 font-medium">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </motion.button>
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

        {/* Bouton planifier envoi si on est dans l'onglet envois */}
        {filterType === 'envois' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              onClick={() => setShowCreateEnvoiModal(true)}
              className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Planifier un envoi
            </Button>
          </motion.div>
        )}

        {/* Liste des envois si filtre = envois */}
        {filterType === 'envois' ? (
          <EnvoisList
            envois={envoisPlanifies.data || []}
            onMarkAsEnvoye={handleMarkAsEnvoye}
            onCancel={handleCancelEnvoi}
            onDelete={handleDeleteEnvoi}
            showActions={true}
          />
        ) : (
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
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                          <Building2 className="w-4 h-4" />
                          {interaction.client_nom || '-'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          {interaction.client_email || '-'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-4 h-4" />
                          {interaction.created_by_nom || '-'}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {interaction.type === 'email' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedInteraction(interaction);
                              setIsEmailModalOpen(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all"
                            title="Envoyer un email"
                          >
                            <Mail className="w-4 h-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(interaction.id, interaction.title)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
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
        )}

        {filteredInteractions.length === 0 && filterType !== 'envois' && (
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

      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedInteraction(null);
        }}
        clientName={selectedInteraction?.client_nom || ''}
        clientEmail={selectedInteraction?.client_email || ''}
        interactionId={selectedInteraction?.id}
      />

      {showCreateEnvoiModal && (
        <CreateEnvoiModal
          contacts={contacts.data || []}
          templates={templates.data || []}
          onClose={() => setShowCreateEnvoiModal(false)}
          onSubmit={handleCreateEnvoi}
        />
      )}
    </div>
  );
}

function EnvoisList({
  envois,
  onMarkAsEnvoye,
  onCancel,
  onDelete,
  showActions,
}: {
  envois: any[];
  onMarkAsEnvoye: (id: string, nom: string) => void;
  onCancel: (id: string, nom: string) => void;
  onDelete: (id: string, nom: string) => void;
  showActions: boolean;
}) {
  if (envois.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-16"
      >
        <div className="inline-block w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-slate-600 text-lg">Aucun envoi à afficher</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {envois.map((envoi, index) => (
        <motion.div
          key={envoi.id}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: index * 0.05 }}
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
                className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              >
                <Calendar className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{envoi.objet}</h3>
                <p className="text-sm text-slate-600">À : {envoi.contact_nom_entreprise}</p>
              </div>
            </div>

            <div className="space-y-2 relative mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-[#1D4ED8]" />
                {envoi.contact_email}
              </div>
              {envoi.modele_nom && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Paperclip className="w-4 h-4 text-[#1D4ED8]" />
                  {envoi.modele_nom}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-4 h-4 text-[#1D4ED8]">📅</span>
                {envoi.date_planifiee}
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onMarkAsEnvoye(envoi.id, envoi.contact_nom_entreprise)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                >
                  <Check className="w-4 h-4 mr-2 inline" />
                  Marquer envoyé
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onCancel(envoi.id, envoi.contact_nom_entreprise)}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                >
                  <X className="w-4 h-4 mr-2 inline" />
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(envoi.id, envoi.contact_nom_entreprise)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function CreateEnvoiModal({
  contacts,
  templates,
  onClose,
  onSubmit,
}: {
  contacts: any[];
  templates: any[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    contact_id: '',
    modele_id: '',
    objet: '',
    corps: '',
    date_planifiee: new Date().toISOString().split('T')[0],
  });

  const handleTemplateChange = (modeleId: string) => {
    const template = templates.find((t) => t.id === modeleId);
    if (template) {
      setFormData({
        ...formData,
        modeleId,
        objet: template.sujet,
        corps: template.corps,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <h2 className="text-xl font-bold mb-4">Planifier un envoi</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact *</label>
            <select
              required
              value={formData.contact_id}
              onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            >
              <option value="">Sélectionner un contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.nom_entreprise} ({contact.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Modèle d'e-mail</label>
            <select
              value={formData.modele_id}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            >
              <option value="">Sans modèle</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Objet *</label>
            <input
              type="text"
              required
              value={formData.objet}
              onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Corps de l'e-mail *</label>
            <textarea
              required
              rows={6}
              value={formData.corps}
              onChange={(e) => setFormData({ ...formData, corps: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date planifiée *</label>
            <input
              type="date"
              required
              value={formData.date_planifiee}
              onChange={(e) => setFormData({ ...formData, date_planifiee: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white"
            >
              Planifier
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
