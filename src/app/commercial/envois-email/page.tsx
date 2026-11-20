'use client';

import { useState } from 'react';
import { useEnvoisEmail } from '@/lib/api/useEnvoisEmail';
import { useContactsEmail } from '@/lib/api/useContactsEmail';
import { useEmailTemplates } from '@/lib/api/useEmailTemplates';
import { Plus, Send, X, Check, Calendar, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import type { CreateEnvoiEmailInput } from '@/types';

export default function EnvoisEmailPage() {
  const { envoisPlanifies, envoisEnvoyes, createEnvoi, markAsEnvoye, cancelEnvoi, deleteEnvoi, checkDuplicate } = useEnvoisEmail();
  const { contacts } = useContactsEmail();
  const { templates } = useEmailTemplates();
  const [activeTab, setActiveTab] = useState<'planifies' | 'envoyes'>('planifies');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleMarkAsEnvoye = async (id: string, nom: string) => {
    const result = await Swal.fire({
      title: 'Marquer comme envoyé ?',
      text: `Confirmer l'envoi à ${nom} ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, marquer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await markAsEnvoye.mutateAsync(id);
        Swal.fire('Envoyé !', 'L\'e-mail a été marqué comme envoyé.', 'success');
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de marquer comme envoyé.', 'error');
      }
    }
  };

  const handleCancel = async (id: string, nom: string) => {
    const result = await Swal.fire({
      title: 'Annuler l\'envoi ?',
      text: `Êtes-vous sûr de vouloir annuler l'envoi à ${nom} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non',
    });

    if (result.isConfirmed) {
      try {
        await cancelEnvoi.mutateAsync(id);
        Swal.fire('Annulé !', 'L\'envoi a été annulé.', 'success');
      } catch (error) {
        Swal.fire('Erreur', 'Impossible d\'annuler l\'envoi.', 'error');
      }
    }
  };

  const handleDelete = async (id: string, nom: string) => {
    const result = await Swal.fire({
      title: 'Supprimer cet envoi ?',
      text: `Êtes-vous sûr de vouloir supprimer l'envoi à ${nom} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await deleteEnvoi.mutateAsync(id);
        Swal.fire('Supprimé !', 'L\'envoi a été supprimé.', 'success');
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer l\'envoi.', 'error');
      }
    }
  };

  const handleCreate = async (data: CreateEnvoiEmailInput) => {
    // Vérifier les doublons
    if (data.modele_id) {
      const isDuplicate = await checkDuplicate.mutateAsync({
        contactId: data.contact_id,
        modeleId: data.modele_id,
      });
      if (isDuplicate) {
        Swal.fire(
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
      Swal.fire('Succès', 'Envoi planifié avec succès.', 'success');
    } catch (error) {
      Swal.fire('Erreur', 'Impossible de planifier l\'envoi.', 'error');
    }
  };

  if (envoisPlanifies.isLoading || envoisEnvoyes.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Envois d'e-mails</h1>
          <p className="text-gray-600 mt-1">Gérez la planification et l'historique des envois</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Planifier un envoi
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('planifies')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'planifies'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              À envoyer ({envoisPlanifies.data?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('envoyes')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'envoyes'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Envoyés ({envoisEnvoyes.data?.length || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'planifies' ? (
            <EnvoisList
              envois={envoisPlanifies.data || []}
              onMarkAsEnvoye={handleMarkAsEnvoye}
              onCancel={handleCancel}
              onDelete={handleDelete}
              showActions={true}
            />
          ) : (
            <EnvoisList
              envois={envoisEnvoyes.data || []}
              onMarkAsEnvoye={() => {}}
              onCancel={() => {}}
              onDelete={handleDelete}
              showActions={false}
            />
          )}
        </div>
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
      <div className="text-center py-8 text-gray-500">
        Aucun envoi à afficher
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {envois.map((envoi) => (
        <div key={envoi.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">{envoi.objet}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  envoi.statut === 'planifie' ? 'bg-yellow-100 text-yellow-800' :
                  envoi.statut === 'envoye' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {envoi.statut === 'planifie' ? 'Planifié' :
                   envoi.statut === 'envoye' ? 'Envoyé' : 'Annulé'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                À : {envoi.contact_nom_entreprise} ({envoi.contact_email})
              </p>
              {envoi.modele_nom && (
                <p className="text-sm text-gray-500 mb-2">
                  Modèle : {envoi.modele_nom}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {envoi.date_planifiee}
                </div>
                {envoi.date_envoi_reelle && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Envoyé le {new Date(envoi.date_envoi_reelle).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            </div>
            {showActions && (
              <div className="flex gap-2">
                <button
                  onClick={() => onMarkAsEnvoye(envoi.id, envoi.contact_nom_entreprise)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                  title="Marquer comme envoyé"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onCancel(envoi.id, envoi.contact_nom_entreprise)}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                  title="Annuler"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(envoi.id, envoi.contact_nom_entreprise)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Supprimer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
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
  onSubmit: (data: CreateEnvoiEmailInput) => void;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Planifier un envoi</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact *</label>
            <select
              required
              value={formData.contact_id}
              onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Modèle d'e-mail</label>
            <select
              value={formData.modele_id}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Objet *</label>
            <input
              type="text"
              required
              value={formData.objet}
              onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Corps de l'e-mail *</label>
            <textarea
              required
              rows={6}
              value={formData.corps}
              onChange={(e) => setFormData({ ...formData, corps: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date prévue *</label>
            <input
              type="date"
              required
              value={formData.date_planifiee}
              onChange={(e) => setFormData({ ...formData, date_planifiee: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Planifier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
