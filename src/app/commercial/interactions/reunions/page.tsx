'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, MessageSquare, Trash2, Clock, Building2, User, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import Swal from 'sweetalert2';
import { interactionsService } from '@/lib/services';
import { useData } from '@/hooks/useData';
import { errorMessage } from '@/lib/utils/errorHandler';
import Link from 'next/link';

export default function ReunionsPage() {
  const { data: interactions, loading, error, refresh } = useData({
    fetchFn: () => interactionsService.getAll(),
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer la réunion "${title}".`,
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
          text: "La réunion a été supprimée avec succès.",
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (err) {
        await Swal.fire({
          title: 'Erreur',
          text: errorMessage(err, "Erreur lors de la suppression de la réunion"),
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const handleCreate = async (data: any) => {
    try {
      await interactionsService.create(data);
      setShowCreateModal(false);
      refresh();
      await Swal.fire({
        title: 'Succès',
        text: 'La réunion a été enregistrée avec succès.',
        icon: 'success',
        confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    } catch (err) {
      await Swal.fire({
        title: 'Erreur',
        text: errorMessage(err, "Erreur lors de la création de la réunion"),
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    }
  };

  const reunions = (interactions || []).filter((i) => i.type === 'réunion');
  const stats = {
    total: reunions.length,
    ceMois: reunions.filter(i => {
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
        title="Réunions"
        description="Historique des réunions"
        extraAction={
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#D4AF37] via-[#B89B6E] to-[#D4AF37] bg-[length:200%_auto] animate-gradient hover:scale-105 text-[#1D4ED8] shadow-lg shadow-[#D4AF37]/30 border-2 border-[#D4AF37] transition-all duration-300 font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle réunion
          </Button>
        }
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
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm mb-1">Total</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Ce mois</p>
                <p className="text-3xl font-bold">{stats.ceMois}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Liste des réunions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-slate-900 mb-4">Toutes les réunions ({stats.total})</h3>
          <ReunionsList reunions={reunions} onDelete={handleDelete} />
        </motion.div>
      </div>

      {showCreateModal && (
        <CreateReunionModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}

function ReunionsList({ reunions, onDelete }: { reunions: any[]; onDelete: (id: string, title: string) => void }) {
  if (reunions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200"
      >
        <div className="inline-block w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-amber-600" />
        </div>
        <p className="text-slate-600 text-lg">Aucune réunion à afficher</p>
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
      {reunions.map((reunion, index) => (
        <motion.div
          key={reunion.id}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: index * 0.05 }}
          whileHover={{ y: -10, scale: 1.02 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2 group-hover:rotate-4 transition-all duration-500" />
          <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-amber-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-transparent rounded-full blur-2xl group-hover:from-amber-200/50 transition-all duration-500" />
            
            <div className="flex items-start gap-4 mb-4 relative">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              >
                <MessageSquare className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{reunion.title}</h3>
                <p className="text-sm text-slate-600">{reunion.client_nom || '-'}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(reunion.id, reunion.title)}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="space-y-2 relative">
              {reunion.description && (
                <p className="text-sm text-slate-600 line-clamp-2">{reunion.description}</p>
              )}
              {reunion.lieu && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  {reunion.lieu}
                </div>
              )}
              {reunion.participants && reunion.participants.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4 text-amber-600" />
                  {reunion.participants.length} participant(s)
                </div>
              )}
              {reunion.interaction_date && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  {new Date(reunion.interaction_date).toLocaleDateString('fr-FR')}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                {reunion.created_by_nom || '-'}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function CreateReunionModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'réunion' as const,
    interaction_date: new Date().toISOString().split('T')[0],
    lieu: '',
    participants: '',
    ordre_du_jour: '',
    related_type: 'client' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      participants: formData.participants ? formData.participants.split(',').map(p => p.trim()) : [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <h2 className="text-xl font-bold mb-4">Nouvelle réunion</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lieu</label>
            <input
              type="text"
              value={formData.lieu}
              onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Participants (séparés par des virgules)</label>
            <input
              type="text"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ordre du jour</label>
            <textarea
              rows={3}
              value={formData.ordre_du_jour}
              onChange={(e) => setFormData({ ...formData, ordre_du_jour: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Compte rendu</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
            <input
              type="date"
              required
              value={formData.interaction_date}
              onChange={(e) => setFormData({ ...formData, interaction_date: e.target.value })}
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
              Enregistrer
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
