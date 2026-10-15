'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, Mail, Phone, Building2, User, MapPin, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { contactsService } from '@/lib/services';
import { Contact, ContactRole } from '@/types';
import { StatCard } from '@/components/AnimatedCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { useData } from '@/hooks/useData';
import Swal from 'sweetalert2';

const roleColors: Record<ContactRole, string> = {
  directeur: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  technique: 'bg-green-100 text-green-700',
  commercial: 'bg-orange-100 text-orange-700',
  autre: 'bg-gray-100 text-gray-700',
};

const roleLabels: Record<ContactRole, string> = {
  directeur: 'Directeur',
  manager: 'Manager',
  technique: 'Technique',
  commercial: 'Commercial',
  autre: 'Autre',
};

const roleOptions: Array<{ value: ContactRole | 'all'; label: string }> = [
  { value: 'all', label: 'Tous les rôles' },
  { value: 'directeur', label: 'Directeur' },
  { value: 'manager', label: 'Manager' },
  { value: 'technique', label: 'Technique' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'autre', label: 'Autre' },
];

export default function ContactsPage() {
  const { data: contacts, loading, error, refresh } = useData({
    fetchFn: () => contactsService.getAll(),
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<ContactRole | 'all'>('all');

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer le contact "${name}". Cette action est irréversible !`,
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
        refresh();
        await Swal.fire({
          title: 'Supprimé !',
          text: 'Le contact a été supprimé avec succès.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (err: any) {
        await Swal.fire({
          title: 'Erreur',
          text: err.message || 'Erreur lors de la suppression du contact',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const filteredContacts = (contacts || []).filter((contact) => {
    const matchesSearch =
      contact.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.client_nom?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || contact.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: (contacts || []).length,
    directeurs: (contacts || []).filter((c) => c.role === 'directeur').length,
    managers: (contacts || []).filter((c) => c.role === 'manager').length,
    techniques: (contacts || []).filter((c) => c.role === 'technique').length,
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
          <p className="text-slate-600 font-medium">Chargement des contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Contacts"
        description="Annuaire des contacts clients"
        actionHref="/contacts/create"
        actionLabel="Nouveau contact"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total contacts"
            value={stats.total}
            icon={User}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="Directeurs"
            value={stats.directeurs}
            icon={Building2}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.1}
          />
          <StatCard
            title="Managers"
            value={stats.managers}
            icon={MapPin}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.2}
          />
          <StatCard
            title="Techniques"
            value={stats.techniques}
            icon={Phone}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.3}
          />
        </div>

        {/* Filtres et recherche */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher un contact..."
          filters={[
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

        {/* Liste des contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
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
                    className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                  >
                    <User className="w-7 h-7 text-blue-600" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{contact.prenom} {contact.nom}</h3>
                    <p className="text-sm text-slate-600">{contact.poste || '-'}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(contact.id, `${contact.prenom} ${contact.nom}`)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="space-y-2 relative">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </div>
                  )}
                  {contact.telephone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      {contact.telephone}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${roleColors[contact.role]}`}>
                      {roleLabels[contact.role]}
                    </span>
                  </div>
                  {contact.client_nom && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 className="w-4 h-4" />
                      {contact.client_nom}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
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
              <User className="w-8 h-8 text-blue-600" />
            </motion.div>
            <p className="text-slate-600 text-lg">Aucun contact trouvé</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
