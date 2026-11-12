'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Filter, ArrowLeft, Edit, Eye, Clock, CheckCircle, XCircle, Send, Trash2, Download } from 'lucide-react';
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
  clients?: {
    nom: string;
  };
}

export default function DemandesAgrementPage() {
  const [demandes, setDemandes] = useState<DemandeAgrement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchDemandes() {
      const { data } = await supabase.from('demandes_agrement').select('*, clients!inner(*)').order('created_at', { ascending: false });
      setDemandes(data || []);
      setLoading(false);
    }
    fetchDemandes();
  }, []);

  const filteredDemandes = demandes.filter(d =>
    d.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.clients?.nom && d.clients.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      // Extraire la référence et l'objet du libellé (format: "000426_GMI - Description")
      const libelleParts = demande.libelle.split(' - ');
      const reference = libelleParts.length > 1 ? libelleParts[0] : '';
      const objet = libelleParts.length > 1 ? libelleParts.slice(1).join(' - ') : demande.libelle;

      const doc = await generateGMITPDF({
        type: 'demande_agrement',
        numero: reference || '', // Réf. contient uniquement la référence
        objet: objet, // Objet contient uniquement la description
        contenu: demande.decision || '',
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
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
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
                        <td className="px-6 py-4 text-sm text-slate-900">{demande.clients?.nom || '-'}</td>
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
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/commercial/demandes-agrement/${demande.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
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
