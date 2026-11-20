'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, Mail, Send, Check, X, Trash2, Clock, Building2, Paperclip, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import Swal from 'sweetalert2';
import { useEnvoisEmail } from '@/lib/api/useEnvoisEmail';
import { useContactsEmail } from '@/lib/api/useContactsEmail';
import { useEmailTemplates } from '@/lib/api/useEmailTemplates';
import Link from 'next/link';

export default function EmailsPage() {
  const { envoisPlanifies, envoisEnvoyes, createEnvoi, markAsEnvoye, cancelEnvoi, deleteEnvoi, checkDuplicate } = useEnvoisEmail();
  const { contacts } = useContactsEmail();
  const { templates } = useEmailTemplates();
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const handleCancel = async (id: string, nom: string) => {
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

  const handleDelete = async (id: string, nom: string) => {
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

  const handleCreate = async (data: any) => {
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
      setShowCreateModal(false);
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

  const stats = {
    aEnvoyer: envoisPlanifies.data?.length || 0,
    envoyesMois: envoisEnvoyes.data?.filter(e => {
      const date = new Date(e.date_envoi_reelle || e.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length || 0,
    totalEnvoyes: envoisEnvoyes.data?.length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="E-mails"
        description="Gérez vos envois d'e-mails marketing"
        actionLabel="Planifier un envoi"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm mb-1">À envoyer</p>
                <p className="text-3xl font-bold">{stats.aEnvoyer}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Envoyés ce mois</p>
                <p className="text-3xl font-bold">{stats.envoyesMois}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total envoyés</p>
                <p className="text-3xl font-bold">{stats.totalEnvoyes}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Liste des envois planifiés */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-4">À envoyer ({stats.aEnvoyer})</h3>
          <EnvoisList
            envois={envoisPlanifies.data || []}
            onMarkAsEnvoye={handleMarkAsEnvoye}
            onCancel={handleCancel}
            onDelete={handleDelete}
            showActions={true}
          />
        </motion.div>

        {/* Liste des envois envoyés */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-slate-900 mb-4">Envoyés ({stats.totalEnvoyes})</h3>
          <EnvoisList
            envois={envoisEnvoyes.data || []}
            onMarkAsEnvoye={() => {}}
            onCancel={() => {}}
            onDelete={handleDelete}
            showActions={false}
          />
        </motion.div>
      </div>

      {showCreateModal && (
        <CreateEnvoiModal
          contacts={contacts.data || []}
          templates={templates.data || []}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
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
        className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200"
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
      transition={{ duration: 0.6 }}
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
                className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              >
                <Mail className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{envoi.objet}</h3>
                <p className="text-sm text-slate-600">À : {envoi.contact_nom_entreprise}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(envoi.id, envoi.contact_nom_entreprise)}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
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
              {envoi.date_envoi_reelle && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-green-600" />
                  Envoyé le {new Date(envoi.date_envoi_reelle).toLocaleDateString('fr-FR')}
                </div>
              )}
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
        modele_id,
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
