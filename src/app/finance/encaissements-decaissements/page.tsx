'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Plus, TrendingUp, TrendingDown, Wallet, Search, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { transactionsService } from '@/lib/services';
import { Transaction } from '@/types';
import Swal from 'sweetalert2';

export default function EncaissementsDecaissementsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [stats, setStats] = useState({ totalEncaissements: 0, totalDecaissements: 0, solde: 0 });

  useEffect(() => {
    async function fetchData() {
      const [transactionsData, statsData] = await Promise.all([
        transactionsService.getAll(),
        transactionsService.getStats(),
      ]);
      setTransactions(transactionsData);
      setStats(statsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (t.reference && t.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesStatut = filterStatut === 'all' || t.statut === filterStatut;
    return matchesSearch && matchesType && matchesStatut;
  });

  const formatAmount = (value: number) => {
    return `${value.toLocaleString('fr-FR')} FCFA`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getTypeColor = (type: string) => {
    return type === 'encaissement' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      en_attente: 'bg-amber-100 text-amber-700',
      valide: 'bg-green-100 text-green-700',
      annule: 'bg-red-100 text-red-700',
    };
    return colors[statut] || colors.en_attente;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Encaissements et Décaissements"
        description="Suivi des flux de trésorerie entrants et sortants"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Total Encaissements</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatAmount(stats.totalEncaissements)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Total Décaissements</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatAmount(stats.totalDecaissements)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Solde Net</span>
            </div>
            <p className={`text-2xl font-bold ${stats.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(stats.solde)}
            </p>
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
                placeholder="Rechercher..."
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
              <option value="encaissement">Encaissements</option>
              <option value="decaissement">Décaissements</option>
            </select>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="valide">Validé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
          <Link href="/finance/encaissements-decaissements/create">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle transaction
            </Button>
          </Link>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              Transactions ({filteredTransactions.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600">Chargement...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 mb-4">Aucune transaction trouvée</p>
              <Link href="/finance/encaissements-decaissements/create">
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer la première transaction
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(transaction.statut)}`}>
                          {transaction.statut}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {transaction.categorie}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{transaction.description}</p>
                      {transaction.reference && (
                        <p className="text-xs text-slate-500 mb-2">Réf: {transaction.reference}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(transaction.date_transaction)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${transaction.type === 'encaissement' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'encaissement' ? '+' : '-'}{formatAmount(transaction.montant)}
                      </p>
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
