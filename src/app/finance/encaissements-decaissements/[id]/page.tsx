'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowLeftRight, Edit, Trash2, Calendar, Wallet, DollarSign, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { transactionsService } from '@/lib/services';
import { Transaction } from '@/types';
import Swal from 'sweetalert2';

export default function TransactionDetailPage() {
  const params = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransaction() {
      const data = await transactionsService.getById(params.id as string);
      setTransaction(data);
      setLoading(false);
    }
    fetchTransaction();
  }, [params.id]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette transaction sera supprimée définitivement',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await transactionsService.delete(params.id as string);
        window.location.href = '/finance/encaissements-decaissements';
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer la transaction', 'error');
      }
    }
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      en_attente: 'bg-amber-100 text-amber-700',
      valide: 'bg-green-100 text-green-700',
      annule: 'bg-red-100 text-red-700',
    };
    return colors[statut] || colors.en_attente;
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'valide': return CheckCircle2;
      case 'annule': return XCircle;
      default: return Clock;
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'encaissement' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Transaction non trouvée</div>
      </div>
    );
  }

  const StatutIcon = getStatutIcon(transaction.statut);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/finance/encaissements-decaissements">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour aux transactions
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
              <h1 className="text-2xl font-bold text-slate-900">{transaction.description}</h1>
              <p className="text-slate-600 mt-1">{transaction.reference || 'Sans référence'}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/finance/encaissements-decaissements/${transaction.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </Link>
              <Button variant="outline" className="text-red-600" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6 flex gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                {transaction.type === 'encaissement' ? 'Encaissement' : 'Décaissement'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(transaction.statut)}`}>
                {transaction.statut}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-slate-600">Montant</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{transaction.montant.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-slate-600">Catégorie</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{transaction.categorie}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-600">Date</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {new Date(transaction.date_transaction).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {transaction.pole && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <ArrowLeftRight className="w-5 h-5 text-amber-600" />
                    <span className="text-sm text-slate-600">Pôle</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{transaction.pole}</p>
                </div>
              )}
            </div>

            {transaction.reference && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Référence</h3>
                <p className="text-slate-700">{transaction.reference}</p>
              </div>
            )}

            <div className="text-sm text-slate-500">
              <p>Créée le {new Date(transaction.created_at).toLocaleDateString('fr-FR')}</p>
              <p>Mise à jour le {new Date(transaction.updated_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
