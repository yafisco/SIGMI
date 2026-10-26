'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Plus, Edit, Trash2, TrendingUp, Wallet, Calendar, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { budgetsService } from '@/lib/services';
import { Budget } from '@/types';
import Swal from 'sweetalert2';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPole, setFilterPole] = useState<string>('all');
  const [stats, setStats] = useState({ totalBudget: 0, totalDepense: 0, restant: 0, pourcentageUtilise: 0 });

  useEffect(() => {
    async function fetchData() {
      const [budgetsData, statsData] = await Promise.all([
        budgetsService.getAll(),
        budgetsService.getStats(),
      ]);
      setBudgets(budgetsData);
      setStats(statsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredBudgets = budgets.filter(b => {
    const matchesSearch = b.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPole = filterPole === 'all' || b.pole === filterPole;
    return matchesSearch && matchesPole;
  });

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Ce budget sera supprimé définitivement',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await budgetsService.delete(id);
        setBudgets(budgets.filter(b => b.id !== id));
        Swal.fire('Supprimé !', 'Le budget a été supprimé', 'success');
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer le budget', 'error');
      }
    }
  };

  const formatAmount = (value: number) => {
    return `${value.toLocaleString('fr-FR')} FCFA`;
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      actif: 'bg-green-100 text-green-700',
      archive: 'bg-gray-100 text-gray-700',
      depasse: 'bg-red-100 text-red-700',
    };
    return colors[statut] || colors.actif;
  };

  const getPoleColor = (pole?: string) => {
    const colors: Record<string, string> = {
      'direction_generale': 'bg-purple-100 text-purple-700',
      'commercial': 'bg-blue-100 text-blue-700',
      'finance_comptabilite': 'bg-green-100 text-green-700',
      'responsable_pole': 'bg-orange-100 text-orange-700',
      'back_office': 'bg-pink-100 text-pink-700',
    };
    return pole ? colors[pole] || 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700';
  };

  const poles = [
    { value: 'all', label: 'Tous les pôles' },
    { value: 'direction_generale', label: 'Direction Générale' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'finance_comptabilite', label: 'Finance & Comptabilité' },
    { value: 'responsable_pole', label: 'Responsable Pôle' },
    { value: 'back_office', label: 'Back Office' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Budgets"
        description="Gestion des budgets par pôle et par projet"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Budget Total</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatAmount(stats.totalBudget)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Dépensé</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatAmount(stats.totalDepense)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Restant</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatAmount(stats.restant)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Utilisation</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.pourcentageUtilise.toFixed(1)}%</p>
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
                placeholder="Rechercher un budget..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <select
              value={filterPole}
              onChange={(e) => setFilterPole(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {poles.map(pole => (
                <option key={pole.value} value={pole.value}>{pole.label}</option>
              ))}
            </select>
          </div>
          <Link href="/finance/budgets/create">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau budget
            </Button>
          </Link>
        </motion.div>

        {/* Budgets List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              Liste des budgets ({filteredBudgets.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600">Chargement...</div>
          ) : filteredBudgets.length === 0 ? (
            <div className="p-12 text-center">
              <PieChart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 mb-4">Aucun budget trouvé</p>
              <Link href="/finance/budgets/create">
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le premier budget
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredBudgets.map((budget, index) => {
                const pourcentageUtilise = budget.montant_budget > 0
                  ? (budget.montant_depense / budget.montant_budget) * 100
                  : 0;
                const estDepasse = pourcentageUtilise > 100;

                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    className="p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-slate-900">{budget.nom}</h4>
                          {budget.pole && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPoleColor(budget.pole)}`}>
                              {budget.pole}
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(budget.statut)}`}>
                            {budget.statut}
                          </span>
                        </div>
                        {budget.description && (
                          <p className="text-sm text-slate-600 mb-3">{budget.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-slate-600 mb-3">
                          <span>Année: {budget.annee}</span>
                          {budget.mois && <span>Mois: {budget.mois}</span>}
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Utilisation</span>
                            <span className={estDepasse ? 'text-red-600 font-semibold' : 'text-slate-900'}>
                              {pourcentageUtilise.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                estDepasse ? 'bg-red-500' : pourcentageUtilise > 80 ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(pourcentageUtilise, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <span className="text-slate-600">Budget: {formatAmount(budget.montant_budget)}</span>
                          <span className="text-slate-600">Dépensé: {formatAmount(budget.montant_depense)}</span>
                          <span className={estDepasse ? 'text-red-600 font-semibold' : 'text-green-600'}>
                            Restant: {formatAmount(budget.montant_budget - budget.montant_depense)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link href={`/finance/budgets/${budget.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(budget.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
