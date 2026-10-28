'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Eye, Search, Filter, Loader2, DollarSign, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/AnimatedCard';
import { facturesService } from '@/lib/services';
import { useData } from '@/hooks/useData';
import { clientsService } from '@/lib/services';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { generateGMITPDF } from '@/lib/utils/gmiTemplate';
import Link from 'next/link';

export default function FacturationPage() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    client_id: '',
    montant_ht: '',
    tva: '18',
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: '',
    notes: '',
  });

  const { data: factures, refresh } = useData({
    fetchFn: () => facturesService.getAll(),
  });

  const { data: clients } = useData({
    fetchFn: () => clientsService.getAll(),
  });

  // Abonnement Realtime
  useEffect(() => {
    const subscription = facturesService.subscribeToChanges(() => {
      refresh();
    });

    return () => {
      facturesService.unsubscribe();
    };
  }, [refresh]);

  // Calculer les statistiques
  const stats = {
    totalFactures: factures?.length || 0,
    facturesPayees: factures?.filter(f => f.statut === 'payée').length || 0,
    facturesEnAttente: factures?.filter(f => f.statut === 'envoyée').length || 0,
    totalMontant: factures?.reduce((sum, f) => sum + (f.montant_ttc || 0), 0) || 0,
  };

  const filteredFactures = (factures || []).filter(f => {
    const matchesSearch = f.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (f.client_nom || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === 'all' || f.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      brouillon: 'bg-gray-100 text-gray-700',
      envoyée: 'bg-yellow-100 text-yellow-700',
      payée: 'bg-green-100 text-green-700',
      annulée: 'bg-red-100 text-red-700',
    };
    return colors[statut] || colors.brouillon;
  };

  const getStatutIcon = (statut: string) => {
    const icons: Record<string, any> = {
      brouillon: FileText,
      envoyée: Clock,
      payée: CheckCircle,
      annulée: XCircle,
    };
    return icons[statut] || FileText;
  };

  const handleCreateFacture = async () => {
    if (!createForm.client_id || !createForm.montant_ht) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Veuillez remplir tous les champs obligatoires',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
      return;
    }

    setLoading(true);
    try {
      const numero = await facturesService.generateNumero();
      const montantHT = parseFloat(createForm.montant_ht);
      const tva = parseFloat(createForm.tva);
      const montantTTC = montantHT * (1 + tva / 100);

      await facturesService.create({
        numero,
        client_id: createForm.client_id,
        montant_ht: montantHT,
        montant_ttc: montantTTC,
        tva,
        date_emission: createForm.date_emission,
        date_echeance: createForm.date_echeance || null,
        statut: 'brouillon',
        notes: createForm.notes || null,
      });

      await Swal.fire({
        title: 'Succès !',
        text: 'La facture a été créée avec succès',
        icon: 'success',
        confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });

      setShowCreateModal(false);
      setCreateForm({
        client_id: '',
        montant_ht: '',
        tva: '18',
        date_emission: new Date().toISOString().split('T')[0],
        date_echeance: '',
        notes: '',
      });
      refresh();
    } catch (error) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors de la création de la facture',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const facture = await facturesService.getById(id);
      if (facture) {
        const doc = await generateGMITPDF({
          type: 'facture',
          numero: facture.numero,
          titre: 'FACTURE',
          date: new Date(facture.date_emission).toLocaleDateString('fr-FR'),
          client: facture.client_nom,
          objet: 'Facture client',
          contenu: `Montant HT: ${facture.montant_ht.toLocaleString('fr-FR')} FCFA\nTVA: ${facture.tva}%\nMontant TTC: ${facture.montant_ttc.toLocaleString('fr-FR')} FCFA\nStatut: ${facture.statut}`,
          montant: facture.montant_ttc,
          data: {
            'Montant HT': `${facture.montant_ht.toLocaleString('fr-FR')} FCFA`,
            'TVA': `${facture.tva}%`,
            'Montant TTC': `${facture.montant_ttc.toLocaleString('fr-FR')} FCFA`,
            'Statut': facture.statut,
            'Date échéance': facture.date_echeance ? new Date(facture.date_echeance).toLocaleDateString('fr-FR') : 'N/A',
          },
        });
        
        doc.save(`Facture_${facture.numero}.pdf`);
        
        await Swal.fire({
          title: 'Succès !',
          text: 'La facture a été téléchargée',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
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

  const handleExportAll = async () => {
    try {
      const doc = await generateGMITPDF({
        type: 'facture',
        titre: 'Liste des Factures',
        date: new Date().toLocaleDateString('fr-FR'),
        contenu: `Liste complète des factures (${factures?.length || 0})`,
        data: {
          'Nombre de factures': (factures?.length || 0).toString(),
          'Total montants TTC': `${factures?.reduce((sum, f) => sum + f.montant_ttc, 0).toLocaleString('fr-FR')} FCFA`,
        },
      });
      
      doc.save('Export_Factures.pdf');
      
      await Swal.fire({
        title: 'Succès !',
        text: 'L\'export a été téléchargé',
        icon: 'success',
        confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    } catch (error) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors de l\'export',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader title="Facturation" description="Gestion des factures clients" />

      <div className="max-w-7xl mx-auto py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Factures"
            value={stats.totalFactures}
            icon={FileText}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="Factures Payées"
            value={stats.facturesPayees}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.1}
          />
          <StatCard
            title="En Attente"
            value={stats.facturesEnAttente}
            icon={Clock}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.2}
          />
          <StatCard
            title="Total Montant"
            value={stats.totalMontant}
            icon={DollarSign}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.3}
          />
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex gap-4"
        >
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle facture
          </Button>
          <Button onClick={handleExportAll} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Liste des factures ({filteredFactures.length})</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="envoyée">Envoyée</option>
                  <option value="payée">Payée</option>
                  <option value="annulée">Annulée</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">N Facture</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Montant TTC</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Statut</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFactures.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Aucune facture trouvée
                    </td>
                  </tr>
                ) : (
                  filteredFactures.map((facture, index) => {
                    const Icon = getStatutIcon(facture.statut);
                    return (
                      <motion.tr
                        key={facture.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{facture.numero}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{facture.client_nom || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(facture.date_emission).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-sm font-medium text-right text-slate-900">{facture.montant_ttc.toLocaleString('fr-FR')} FCFA</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(facture.statut)}`}>
                            <Icon className="w-3 h-3" />
                            {facture.statut === 'brouillon' ? 'Brouillon' : facture.statut === 'envoyée' ? 'Envoyée' : facture.statut === 'payée' ? 'Payée' : 'Annulée'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <Link href={`/finance/factures/${facture.id}`}>
                              <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={() => handleDownloadPDF(facture.id)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Nouvelle facture</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Client *</label>
                <select
                  value={createForm.client_id}
                  onChange={(e) => setCreateForm({ ...createForm, client_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="">Sélectionner un client</option>
                  {clients?.map((client) => (
                    <option key={client.id} value={client.id}>{client.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Montant HT (FCFA) *</label>
                <input
                  type="number"
                  value={createForm.montant_ht}
                  onChange={(e) => setCreateForm({ ...createForm, montant_ht: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="Montant HT"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">TVA (%)</label>
                <input
                  type="number"
                  value={createForm.tva}
                  onChange={(e) => setCreateForm({ ...createForm, tva: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="TVA"
                  min="0"
                  max="100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date d'émission</label>
                  <input
                    type="date"
                    value={createForm.date_emission}
                    onChange={(e) => setCreateForm({ ...createForm, date_emission: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date d'échéance</label>
                  <input
                    type="date"
                    value={createForm.date_echeance}
                    onChange={(e) => setCreateForm({ ...createForm, date_echeance: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="Notes facultatives..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleCreateFacture}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                disabled={loading}
              >
                Annuler
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
