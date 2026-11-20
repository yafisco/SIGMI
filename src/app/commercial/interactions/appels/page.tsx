'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, Phone, Trash2, Clock, Building2, User, ArrowLeft, Check, X } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import Swal from 'sweetalert2';
import { interactionsService } from '@/lib/services';
import { useData } from '@/hooks/useData';
import { errorMessage } from '@/lib/utils/errorHandler';
import Link from 'next/link';

export default function AppelsPage() {
  const { data: interactions, loading, error, refresh } = useData({
    fetchFn: () => interactionsService.getAll(),
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer l'appel "${title}".`,
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
          text: "L'appel a été supprimé avec succès.",
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (err) {
        await Swal.fire({
          title: 'Erreur',
          text: errorMessage(err, "Erreur lors de la suppression de l'appel"),
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const appels = (interactions || []).filter((i) => i.type === 'appel');
  const stats = {
    total: appels.length,
    ceMois: appels.filter(i => {
      const date = new Date(i.interaction_date || i.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
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
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Appels"
        description="Historique des appels"
        actionLabel="Nouvel appel"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link href="/commercial/interactions">
          <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Retour aux interactions
          </button>
        </Link>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Total</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Ce mois</p>
                <p className="text-3xl font-bold">{stats.ceMois}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Liste des appels */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-slate-900 mb-4">Tous les appels ({stats.total})</h3>
          <AppelsList appels={appels} onDelete={handleDelete} />
        </motion.div>
      </div>
    </div>
  );
}

function AppelsList({ appels, onDelete }: { appels: any[]; onDelete: (id: string, title: string) => void }) {
  if (appels.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200"
      >
        <div className="inline-block w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-slate-600 text-lg">Aucun appel à afficher</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {appels.map((appel, index) => (
        <motion.div
          key={appel.id}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: index * 0.05 }}
          whileHover={{ y: -10, scale: 1.02 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2 group-hover:rotate-4 transition-all duration-500" />
          <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-green-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-transparent rounded-full blur-2xl group-hover:from-green-200/50 transition-all duration-500" />
            
            <div className="flex items-start gap-4 mb-4 relative">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              >
                <Phone className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{appel.title}</h3>
                <p className="text-sm text-slate-600">{appel.client_nom || '-'}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(appel.id, appel.title)}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="space-y-2 relative">
              {appel.description && (
                <p className="text-sm text-slate-600 line-clamp-2">{appel.description}</p>
              )}
              {appel.interaction_date && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-green-600" />
                  {new Date(appel.interaction_date).toLocaleDateString('fr-FR')}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                {appel.created_by_nom || '-'}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
