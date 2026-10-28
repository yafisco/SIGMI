'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Edit, Clock, CheckCircle, XCircle, Send, Printer, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { generateGMITPDF } from '@/lib/utils/gmiTemplate';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';

export default function DemandeAgrementDetailPage() {
  const params = useParams();
  const [demande, setDemande] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDemande() {
      const { data } = await supabase
        .from('demandes_agrement')
        .select('*, clients(*)')
        .eq('id', params.id)
        .single();

      setDemande(data);
      setLoading(false);
    }
    fetchDemande();
  }, [params.id]);

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'acceptee':
        return { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Acceptée' };
      case 'refusee':
        return { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Refusée' };
      case 'envoyee':
        return { color: 'bg-blue-100 text-blue-700', icon: Send, label: 'Envoyée' };
      case 'en_cours':
        return { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'En cours' };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: FileText, label: 'Brouillon' };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const doc = await generateGMITPDF({
        type: 'demande_agrement',
        numero: demande.numero,
        objet: demande.objet,
        contenu: demande.contenu,
      });
      
      doc.save(`Demande_Agrement_${demande.numero}.pdf`);
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Demande non trouvée</div>
      </div>
    );
  }

  const badge = getStatutBadge(demande.statut);
  const Icon = badge.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/commercial/demandes-agrement">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour aux demandes
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{demande.numero}</h1>
              <p className="text-slate-600 mt-1">Demande d'agrément pour {demande.client_nom || 'Client inconnu'}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/commercial/demandes-agrement/${demande.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </Link>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              {demande.statut === 'brouillon' && (
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Client</p>
                <p className="font-semibold text-slate-900">{demande.client_nom || '-'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Pôle</p>
                <p className="font-semibold text-slate-900">{demande.pole}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Date demande</p>
                <p className="font-semibold text-slate-900">{new Date(demande.date_demande).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Statut</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                  <Icon className="w-3 h-3" />
                  {badge.label}
                </span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Document de demande</h3>
              <div className="bg-white border-2 border-slate-200 rounded-xl p-8 font-serif max-w-3xl mx-auto">
                <div className="text-right mb-8">
                  <p className="text-slate-600">Réf. : {demande.numero}</p>
                </div>
                <div className="mb-8">
                  <p className="text-slate-600 font-semibold">Objet : {demande.objet}</p>
                </div>
                <div className="min-h-[300px] text-slate-700 whitespace-pre-line">
                  {demande.contenu || '[Contenu de la demande]'}
                </div>
                <div className="mt-12 flex justify-end">
                  <div className="text-center">
                    <p className="text-slate-600">Fait à Thiès le {new Date(demande.date_demande).toLocaleDateString('fr-FR')}</p>
                    <p className="text-slate-900 font-semibold mt-2">Le Directeur Général</p>
                  </div>
                </div>
              </div>
            </div>

            {demande.notes && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Notes internes</h3>
                <p className="text-slate-600">{demande.notes}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
