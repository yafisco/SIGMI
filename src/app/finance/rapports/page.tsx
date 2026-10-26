'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, Calendar, Filter, Search, TrendingUp, TrendingDown, DollarSign, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';

export default function RapportsFinanciersPage() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPeriode, setFilterPeriode] = useState<string>('mois');

  const rapports = [
    {
      id: 1,
      titre: 'Rapport mensuel - Janvier 2024',
      type: 'mensuel',
      periode: '2024-01',
      statut: 'disponible',
      created_at: '2024-01-31',
    },
    {
      id: 2,
      titre: 'Rapport trimestriel - T1 2024',
      type: 'trimestriel',
      periode: '2024-T1',
      statut: 'disponible',
      created_at: '2024-03-31',
    },
    {
      id: 3,
      titre: 'Rapport annuel - 2023',
      type: 'annuel',
      periode: '2023',
      statut: 'disponible',
      created_at: '2024-01-15',
    },
    {
      id: 4,
      titre: 'Rapport budget prévisionnel - 2024',
      type: 'budget',
      periode: '2024',
      statut: 'en_cours',
      created_at: '2024-01-20',
    },
  ];

  const filteredRapports = rapports.filter(r => {
    const matchesSearch = r.titre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mensuel: 'bg-blue-100 text-blue-700',
      trimestriel: 'bg-purple-100 text-purple-700',
      annuel: 'bg-green-100 text-green-700',
      budget: 'bg-amber-100 text-700',
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

  const handleDownload = (id: number) => {
    alert(`Téléchargement du rapport ${id} - fonctionnalité à implémenter`);
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Total Rapports</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{rapports.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Revenus 2024</span>
            </div>
            <p className="text-2xl font-bold text-green-600">15M FCFA</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Dépenses 2024</span>
            </div>
            <p className="text-2xl font-bold text-red-600">8.5M FCFA</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Solde Net</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">6.5M FCFA</p>
          </motion.div>
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
          <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
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
              <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
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
                          <span>Créé le {rapport.created_at}</span>
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
    </div>
  );
}
