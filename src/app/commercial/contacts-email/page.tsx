'use client';

import { useState } from 'react';
import { useContactsEmail } from '@/lib/api/useContactsEmail';
import { Plus, Upload, Download, Search, Trash2, Edit } from 'lucide-react';
import Swal from 'sweetalert2';
import type { ContactEmail } from '@/types';

export default function ContactsEmailPage() {
  const { contacts, createContact, deleteContact, importContacts } = useContactsEmail();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredContacts = contacts.data?.filter(
    (contact) =>
      contact.nom_entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.secteur?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = async (id: string, nom: string) => {
    const result = await Swal.fire({
      title: 'Supprimer ce contact ?',
      text: `Êtes-vous sûr de vouloir supprimer ${nom} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await deleteContact.mutateAsync(id);
        Swal.fire('Supprimé !', 'Le contact a été supprimé.', 'success');
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer le contact.', 'error');
      }
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1); // Skip header
      const contacts = lines
        .filter((line) => line.trim())
        .map((line) => {
          const [nom_entreprise, email, telephone, adresse, secteur] = line.split(',');
          return {
            nom_entreprise: nom_entreprise?.trim() || '',
            email: email?.trim() || '',
            telephone: telephone?.trim() || undefined,
            adresse: adresse?.trim() || undefined,
            secteur: secteur?.trim() || undefined,
          };
        })
        .filter((c) => c.nom_entreprise && c.email);

      try {
        await importContacts.mutateAsync(contacts);
        Swal.fire('Import réussi !', `${contacts.length} contacts importés.`, 'success');
      } catch (error) {
        Swal.fire('Erreur', 'Impossible d\'importer les contacts.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    const headers = ['Nom entreprise', 'Email', 'Téléphone', 'Adresse', 'Secteur', 'Date'];
    const rows = contacts.data?.map((c) => [
      c.nom_entreprise,
      c.email,
      c.telephone || '',
      c.adresse || '',
      c.secteur || '',
      c.date,
    ]) || [];

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_email_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (contacts.isLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Base de contacts e-mails</h1>
          <p className="text-gray-600 mt-1">Gérez vos contacts pour les campagnes d'e-mailing</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => document.getElementById('csvInput')?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <input
            id="csvInput"
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Nouveau contact
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par entreprise, email ou secteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Entreprise</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Téléphone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Secteur</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Aucun contact trouvé
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{contact.nom_entreprise}</td>
                    <td className="py-3 px-4">{contact.email}</td>
                    <td className="py-3 px-4">{contact.telephone || '-'}</td>
                    <td className="py-3 px-4">{contact.secteur || '-'}</td>
                    <td className="py-3 px-4">{contact.date}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {/* TODO: Implement edit modal */}}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id, contact.nom_entreprise)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <CreateContactModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            try {
              await createContact.mutateAsync(data);
              setShowCreateModal(false);
              Swal.fire('Succès', 'Contact créé avec succès.', 'success');
            } catch (error) {
              Swal.fire('Erreur', 'Impossible de créer le contact.', 'error');
            }
          }}
        />
      )}
    </div>
  );
}

function CreateContactModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    nom_entreprise: '',
    email: '',
    telephone: '',
    adresse: '',
    secteur: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Nouveau contact</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom entreprise *</label>
            <input
              type="text"
              required
              value={formData.nom_entreprise}
              onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              type="text"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
            <input
              type="text"
              value={formData.secteur}
              onChange={(e) => setFormData({ ...formData, secteur: e.target.value })}
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
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
