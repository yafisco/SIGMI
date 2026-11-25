'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Filter, ArrowLeft, Edit, Eye, Clock, CheckCircle, XCircle, Send, Trash2, Download, Mail, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { generateGMITPDF } from '@/lib/utils/gmiTemplate';

interface DemandeAgrement {
  id: string;
  libelle: string;
  client_id: string;
  created_at: string;
  statut: 'soumise' | 'en_examen' | 'approuvee' | 'refusee';
  pole: string;
  decision?: string;
  reference?: string;
  destinataire?: string;
}

export default function DemandesAgrementPage() {
  const [demandes, setDemandes] = useState<DemandeAgrement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'soumise' | 'en_examen' | 'approuvee' | 'refusee'>('all');

  useEffect(() => {
    async function fetchDemandes() {
      const { data } = await supabase.from('demandes_agrement').select('*').order('created_at', { ascending: false });
      setDemandes(data || []);
      setLoading(false);
    }
    fetchDemandes();
  }, []);

  const filteredDemandes = demandes.filter(d => {
    const matchesSearch = d.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.client_id && d.client_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatut = filterStatut === 'all' || d.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  const getStatistiques = () => {
    return {
      total: demandes.length,
      soumise: demandes.filter(d => d.statut === 'soumise').length,
      en_examen: demandes.filter(d => d.statut === 'en_examen').length,
      approuvee: demandes.filter(d => d.statut === 'approuvee').length,
      refusee: demandes.filter(d => d.statut === 'refusee').length,
    };
  };

  const stats = getStatistiques();

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'approuvee':
        return { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Approuvée' };
      case 'refusee':
        return { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Refusée' };
      case 'soumise':
        return { color: 'bg-blue-100 text-blue-700', icon: Send, label: 'Soumise' };
      case 'en_examen':
        return { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'En examen' };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: FileText, label: statut };
    }
  };

  const handleDelete = async (id: string, libelle: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer la demande "${libelle}". Cette action est irréversible !`,
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
        await supabase.from('demandes_agrement').delete().eq('id', id);
        setDemandes(demandes.filter(d => d.id !== id));
        await Swal.fire({
          title: 'Supprimé !',
          text: 'La demande a été supprimée avec succès.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (err) {
        await Swal.fire({
          title: 'Erreur',
          text: 'Erreur lors de la suppression de la demande.',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const handleDownloadPDF = async (demande: DemandeAgrement) => {
    try {
      const libelleParts = demande.libelle.split(' - ');
      const reference = libelleParts.length > 1 ? libelleParts[0] : '';
      const objet = libelleParts.length > 1 ? libelleParts.slice(1).join(' - ') : demande.libelle;

      const doc = await generateGMITPDF({
        type: 'demande_agrement',
        numero: reference || '',
        objet: objet,
        contenu: demande.decision || '',
        destinataire: demande.destinataire || '',
      });

      doc.save(`Demande_Agrement_${demande.libelle}.pdf`);

      await Swal.fire({
        title: 'Succès !',
        text: 'Le document a été téléchargé',
        icon: 'success',
        confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    } catch (error) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors du téléchargement',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    }
  };

  const handleSendEmail = async (demande: DemandeAgrement) => {
    const { value: email } = await Swal.fire({
      title: 'Envoyer par email',
      input: 'email',
      inputLabel: 'Adresse email du destinataire',
      inputPlaceholder: 'exemple@email.com',
      inputValue: demande.destinataire || '',
      showCancelButton: true,
      confirmButtonText: 'Envoyer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
      cancelButtonColor: SWEETALERT_CONFIG.cancelButtonColor,
      customClass: SWEETALERT_CONFIG.customClass,
    });

    if (email) {
      try {
        await Swal.fire({
          title: 'Envoi en cours...',
          text: 'Veuillez patienter',
          icon: 'info',
          showConfirmButton: false,
          allowOutsideClick: false,
        });

        await Swal.fire({
          title: 'Succès !',
          text: `Email envoyé à ${email}`,
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (error) {
        await Swal.fire({
          title: 'Erreur',
          text: 'Erreur lors de l\'envoi de l\'email',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const handleUpdateStatut = async (demande: DemandeAgrement) => {
    const { value: statut } = await Swal.fire({
      title: 'Mettre à jour le statut',
      input: 'select',
      inputOptions: {
        soumise: 'Soumise',
        en_examen: 'En examen',
        approuvee: 'Approuvée',
        refusee: 'Refusée',
      },
      inputValue: demande.statut,
      showCancelButton: true,
      confirmButtonText: 'Mettre à jour',
      cancelButtonText: 'Annuler',
      confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
      cancelButtonColor: SWEETALERT_CONFIG.cancelButtonColor,
      customClass: SWEETALERT_CONFIG.customClass,
    });

    if (statut && statut !== demande.statut) {
      try {
        const { error } = await supabase
          .from('demandes_agrement')
          .update({ statut })
          .eq('id', demande.id);

        if (error) throw error;

        setDemandes(demandes.map(d => d.id === demande.id ? { ...d, statut } : d));

        await Swal.fire({
          title: 'Succès !',
          text: 'Statut mis à jour',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (error) {
        await Swal.fire({
          title: 'Erreur',
          text: 'Erreur lors de la mise à jour',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Demandes d'Agrément"
        description="Gestion et suivi des demandes d'agrément GROUP MI"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div className="bg-gradient-to-br from-slate-100 to-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-600">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-white rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.soumise}</p>
                <p className="text-xs text-slate-600">Soumises</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-100 to-white rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.en_examen}</p>
                <p className="text-xs text-slate-600">En examen</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-white rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.approuvee}</p>
                <p className="text-xs text-slate-600">Approuvées</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-100 to-white rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.refusee}</p>
                <p className="text-xs text-slate-600">Refusées</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/commercial/demandes-agrement/create">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle demande
            </Button>
          </Link>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une demande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatut === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatut('all')}
              className={filterStatut === 'all' ? 'bg-[#1D4ED8]' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Tous
            </Button>
            <Button
              variant={filterStatut === 'soumise' ? 'default' : 'outline'}
              onClick={() => setFilterStatut('soumise')}
              className={filterStatut === 'soumise' ? 'bg-blue-600' : ''}
            >
              Soumises
            </Button>
            <Button
              variant={filterStatut === 'en_examen' ? 'default' : 'outline'}
              onClick={() => setFilterStatut('en_examen')}
              className={filterStatut === 'en_examen' ? 'bg-amber-600' : ''}
            >
              En examen
            </Button>
            <Button
              variant={filterStatut === 'approuvee' ? 'default' : 'outline'}
              onClick={() => setFilterStatut('approuvee')}
              className={filterStatut === 'approuvee' ? 'bg-green-600' : ''}
            >
              Approuvées
            </Button>
            <Button
              variant={filterStatut === 'refusee' ? 'default' : 'outline'}
              onClick={() => setFilterStatut('refusee')}
              className={filterStatut === 'refusee' ? 'bg-red-600' : ''}
            >
              Refusées
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              Liste des demandes ({filteredDemandes.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Libellé</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Pôle</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date création</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Statut</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDemandes.map((demande, index) => {
                    const badge = getStatutBadge(demande.statut);
                    const Icon = badge.icon;
                    return (
                      <motion.tr
                        key={demande.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{demande.libelle}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{demande.client_id || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{demande.pole}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(demande.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                            <Icon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <Link href={`/commercial/demandes-agrement/${demande.id}`}>
                              <Button variant="ghost" size="sm" title="Voir">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/commercial/demandes-agrement/${demande.id}/edit`}>
                              <Button variant="ghost" size="sm" title="Modifier">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatut(demande)}
                              title="Mettre à jour le statut"
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendEmail(demande)}
                              title="Envoyer par email"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPDF(demande)}
                              title="Télécharger PDF"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(demande.id, demande.libelle)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
