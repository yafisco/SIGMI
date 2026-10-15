'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Building2, Edit, Trash2, MessageSquare, Calendar, Plus } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { contactsService } from '@/lib/services';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/AnimatedCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import Link from 'next/link';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: contact, loading, error, refresh } = useData({
    fetchFn: () => contactsService.getById(id),
  });

  const { data: interactions } = useData({
    fetchFn: () => contactsService.getByClient(contact?.client_id || ''),
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
        await contactsService.delete(id);
        await Swal.fire({
          title: 'Supprimé !',
          text: 'Le contact a été supprimé avec succès.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
        router.push('/contacts');
      } catch (err: any) {
        await Swal.fire({
          title: 'Erreur',
          text: err.message || 'Erreur lors de la suppression',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
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
          <p className="text-slate-600 font-medium">Chargement du contact...</p>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Contact non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title={`${contact.prenom} ${contact.nom}`}
        description="Fiche détaillée du contact"
        actionHref="/contacts"
        actionLabel="Retour"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header du contact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
          <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
            <div className="flex items-center gap-4 relative">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] rounded-xl flex items-center justify-center shadow-lg"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{contact.prenom} {contact.nom}</h2>
                <p className="text-slate-600 mt-1">{contact.poste || 'Contact'}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/contacts/${contact.id}/edit`}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all"
                  >
                    <Edit className="w-5 h-5" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Interactions"
            value={interactions?.length || 0}
            icon={MessageSquare}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="Client associé"
            value={contact.client_nom || 'Aucun'}
            icon={Building2}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.1}
          />
          <StatCard
            title="Depuis"
            value={new Date(contact.created_at).toLocaleDateString('fr-FR')}
            icon={Calendar}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.2}
          />
        </div>

        {/* Informations du contact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
          <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
            <h3 className="text-xl font-bold text-slate-900 mb-4 relative">Informations du contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {contact.email && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-700">{contact.email}</span>
                </div>
              )}
              {contact.telephone && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">{contact.telephone}</span>
                </div>
              )}
              {contact.poste && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <User className="w-5 h-5 text-purple-600" />
                  <span className="text-slate-700">{contact.poste}</span>
                </div>
              )}
              {contact.client_nom && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <span className="text-slate-700">{contact.client_nom}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Interactions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
          <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-4 relative">
              <h3 className="text-xl font-bold text-slate-900">Interactions</h3>
              {contact.client_id && (
                <Link href={`/interactions/create?related_type=client&related_id=${contact.client_id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] hover:from-[#B89B6E] to-[#D4AF37] text-[#1D4ED8] px-4 py-2 rounded-lg transition-all duration-300 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Nouvelle interaction</span>
                  </motion.button>
                </Link>
              )}
            </div>
            {interactions && interactions.length > 0 ? (
              <div className="space-y-3 relative">
                {interactions.map((interaction, index) => (
                  <div key={interaction.id} className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">{interaction.titre || 'Interaction'}</span>
                      <span className="text-sm text-slate-500">
                        {new Date(interaction.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{interaction.description || ''}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                Aucune interaction enregistrée
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
