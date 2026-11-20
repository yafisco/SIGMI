'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Upload, Download, Search, Trash2, Edit, Mail, Building2, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { useContactsEmail } from '@/lib/api/useContactsEmail';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';

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
      confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
      cancelButtonColor: SWEETALERT_CONFIG.cancelButtonColor,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      customClass: SWEETALERT_CONFIG.customClass,
    });

    if (result.isConfirmed) {
      try {
        await deleteContact.mutateAsync(id);
        await Swal.fire({
          title: 'Supprimé !',
          text: 'Le contact a été supprimé.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (error) {
        await Swal.fire({
          title: 'Erreur',
          text: 'Impossible de supprimer le contact.',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1);
      const contactsData = lines
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
        await importContacts.mutateAsync(contactsData);
        await Swal.fire({
          title: 'Import réussi !',
          text: `${contactsData.length} contacts importés.`,
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (error) {
        await Swal.fire({
          title: 'Erreur',
          text: 'Impossible d\'importer les contacts.',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Base de Contacts E-mails"
        description="Gérez votre base de contacts pour les campagnes d'e-mailing"
        actionLabel="Nouveau contact"
        extraAction={
          <div className="flex gap-2">
            <Button onClick={handleImportCSV} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <Link href="/commercial">
          <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Retour à Commercial
          </button>
        </Link>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cartes de statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total contacts</p>
                <p className="text-3xl font-bold">{contacts.data?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Contacts ce mois</p>
                <p className="text-3xl font-bold">
                  {contacts.data?.filter(c => {
                    const date = new Date(c.date);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Secteurs représentés</p>
                <p className="text-3xl font-bold">
                  {new Set(contacts.data?.map(c => c.secteur).filter(Boolean)).size || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recherche */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par entreprise, email ou secteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] transition-all"
            />
          </div>
        </motion.div>

        {/* Liste des contacts */}
        {contacts.isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-600">Chargement des contacts...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="inline-block w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-slate-600 text-lg">Aucun contact trouvé</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact.id}
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
                      className="w-14 h-14 bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                    >
                      <Building2 className="w-7 h-7 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{contact.nom_entreprise}</h3>
                      <p className="text-sm text-slate-600">{contact.secteur || 'Secteur non renseigné'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 relative">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-[#1D4ED8]" />
                      {contact.email}
                    </div>
                    {contact.telephone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-4 h-4 text-[#1D4ED8]">📞</span>
                        {contact.telephone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="w-4 h-4 text-[#1D4ED8]">📅</span>
                      {contact.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {/* TODO: Implement edit modal */}}
                      className="flex-1 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                    >
                      <Edit className="w-4 h-4 mr-2 inline" />
                      Modifier
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(contact.id, contact.nom_entreprise)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {showCreateModal && (
        <CreateContactModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            try {
              await createContact.mutateAsync(data);
              setShowCreateModal(false);
              await Swal.fire({
                title: 'Succès',
                text: 'Contact créé avec succès.',
                icon: 'success',
                confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
                customClass: SWEETALERT_CONFIG.customClass,
              });
            } catch (error) {
              await Swal.fire({
                title: 'Erreur',
                text: 'Impossible de créer le contact.',
                icon: 'error',
                confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
                customClass: SWEETALERT_CONFIG.customClass,
              });
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <h2 className="text-xl font-bold mb-4">Nouveau contact</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom entreprise *</label>
            <input
              type="text"
              required
              value={formData.nom_entreprise}
              onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
            <input
              type="text"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Secteur</label>
            <input
              type="text"
              value={formData.secteur}
              onChange={(e) => setFormData({ ...formData, secteur: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white rounded-lg hover:shadow-lg"
            >
              Créer
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
