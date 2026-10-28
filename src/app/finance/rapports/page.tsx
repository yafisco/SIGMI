'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, Calendar, Filter, Search, TrendingUp, TrendingDown, DollarSign, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/AnimatedCard';
import { rapportsService } from '@/lib/services';
import { useData } from '@/hooks/useData';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { generateGMITPDF } from '@/lib/utils/gmiTemplate';

export default function RapportsFinanciersPage() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    type: 'mensuel' as 'mensuel' | 'trimestriel' | 'annuel' | 'budget',
    periode: '',
  });

  const { data: rapports, refresh } = useData({
    fetchFn: () => rapportsService.getAll(),
  });

  // Abonnement Realtime
  useEffect(() => {
    const subscription = rapportsService.subscribeToChanges(() => {
      refresh();
    });

    return () => {
      rapportsService.unsubscribe();
    };
  }, [refresh]);

  // Calculer les statistiques en temps réel
  const stats = {
    totalRapports: rapports?.length || 0,
    totalEncaissements: 0,
    totalDecaissements: 0,
    soldeNet: 0,
  };

  const filteredRapports = (rapports || []).filter(r => {
    const matchesSearch = r.titre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mensuel: 'bg-blue-100 text-blue-700',
      trimestriel: 'bg-purple-100 text-purple-700',
      annuel: 'bg-green-100 text-green-700',
      budget: 'bg-amber-100 text-amber-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      disponible: 'bg-green-100 text-green-700',
      en_cours: 'bg-amber-100 text-amber-700',
    };
    return colors[statut] || colors.disponible;
  };

  const handleGenerateRapport = async () => {
    if (!generateForm.periode) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Veuillez sélectionner une période',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
      return;
    }

    setGenerating(true);
    try {
      // Générer les statistiques
      const statsData = await rapportsService.generateStats(generateForm.periode, generateForm.type);

      // Créer le rapport
      const titre = `Rapport ${generateForm.type} - ${generateForm.periode}`;
      await rapportsService.create({
        titre,
        type: generateForm.type,
        periode: generateForm.periode,
        data: statsData,
      });

      await Swal.fire({
        title: 'Succès !',
        text: 'Le rapport a été généré avec succès',
        icon: 'success',
        confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });

      setShowGenerateModal(false);
      setGenerateForm({ type: 'mensuel', periode: '' });
      refresh();
    } catch (error) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors de la génération du rapport',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const rapport = await rapportsService.getById(id);
      if (rapport && rapport.data) {
        const stats = rapport.data;
        
        const doc = await generateGMITPDF({
          type: 'rapport',
          titre: rapport.titre,
          date: new Date().toLocaleDateString('fr-FR'),
          objet: `Rapport ${rapport.type} - ${rapport.periode}`,
          contenu: `Résumé financier pour la période ${rapport.periode}`,
          data: {
            'Période': stats.periode,
            'Type': stats.type,
            'Total Encaissements': `${stats.totalEncaissements.toLocaleString('fr-FR')} FCFA`,
            'Total Décaissements': `${stats.totalDecaissements.toLocaleString('fr-FR')} FCFA`,
            'Solde Net': `${stats.soldeNet.toLocaleString('fr-FR')} FCFA`,
            'Budget Total': `${stats.totalBudget.toLocaleString('fr-FR')} FCFA`,
            'Budget Utilisé': `${stats.budgetUtilise.toFixed(2)}%`,
            'Nombre Transactions': stats.nombreTransactions.toString(),
          },
        });
        
        doc.save(`${rapport.titre}.pdf`);
        
        await Swal.fire({
          title: 'Succès !',
          text: 'Le rapport a été téléchargé en PDF',
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

  const getPeriodeOptions = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (generateForm.type === 'mensuel') {
      return Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        return `${year}-${m.toString().padStart(2, '0')}`;
      });
    } else if (generateForm.type === 'trimestriel') {
      return [
        `${year}-T1`,
        `${year}-T2`,
        `${year}-T3`,
        `${year}-T4`,
      ];
    } else {
      return [year.toString(), (year - 1).toString()];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Rapports Financiers"
        description="Rapports et tableaux de bord financiers"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Rapports"
            value={stats.totalRapports}
            icon={FileText}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0}
          />
          <StatCard
            title="Revenus Annés"
            value={stats.totalEncaissements}
            icon={TrendingUp}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.1}
          />
          <StatCard
            title="Dépenses Années"
            value={stats.totalDecaissements}
            icon={TrendingDown}
            color="text-red-600"
            bgColor="bg-gradient-to-br from-red-100 to-red-200"
            delay={0.2}
          />
          <StatCard
            title="Solde Net"
            value={stats.soldeNet}
            icon={DollarSign}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0.3}
          />
        </div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4 justify-between"
        >
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un rapport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">Tous les types</option>
              <option value="mensuel">Mensuel</option>
              <option value="trimestriel">Trimestriel</option>
              <option value="annuel">Annuel</option>
              <option value="budget">Budget</option>
            </select>
          </div>
          <Button
            onClick={() => setShowGenerateModal(true)}
            className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]"
          >
            <Download className="w-4 h-4 mr-2" />
            Générer un rapport
          </Button>
        </motion.div>

        {/* Rapports List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              Rapports disponibles ({filteredRapports.length})
            </h3>
          </div>

          {filteredRapports.length === 0 ? (
            <div className="p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 mb-4">Aucun rapport trouvé</p>
              <Button
                onClick={() => setShowGenerateModal(true)}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]"
              >
                <Download className="w-4 h-4 mr-2" />
                Générer le premier rapport
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRapports.map((rapport, index) => (
                <motion.div
                  key={rapport.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-slate-900">{rapport.titre}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(rapport.type)}`}>
                          {rapport.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(rapport.statut)}`}>
                          {rapport.statut}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Période: {rapport.periode}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Créé le {new Date(rapport.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(rapport.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Voir
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de génération de rapport */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Générer un rapport</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type de rapport</label>
                <select
                  value={generateForm.type}
                  onChange={(e) => setGenerateForm({ ...generateForm, type: e.target.value as any, periode: '' })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="mensuel">Mensuel</option>
                  <option value="trimestriel">Trimestriel</option>
                  <option value="annuel">Annuel</option>
                  <option value="budget">Budget</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Période</label>
                <select
                  value={generateForm.periode}
                  onChange={(e) => setGenerateForm({ ...generateForm, periode: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="">Sélectionner une période</option>
                  {getPeriodeOptions().map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleGenerateRapport}
                disabled={generating}
                className="flex-1 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Générer
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowGenerateModal(false)}
                variant="outline"
                disabled={generating}
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
