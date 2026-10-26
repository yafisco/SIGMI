'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Eye, Search, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';

export default function FacturationPage() {
  const [factures] = useState([
    { id: 1, numero: 'FAC-2024-001', client: 'Client A', montant: 5000000, date: '2024-01-15', statut: 'payée' },
    { id: 2, numero: 'FAC-2024-002', client: 'Client B', montant: 3500000, date: '2024-01-14', statut: 'en_attente' },
    { id: 3, numero: 'FAC-2024-003', client: 'Client C', montant: 7500000, date: '2024-01-13', statut: 'annulée' },
  ]);

  const formatAmount = (value: number) => `${(value / 1000).toFixed(0)}K FCFA`;

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader title="Facturation" description="Gestion des factures clients" />

      <div className="max-w-7xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex gap-4"
        >
          <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle facture
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Liste des factures</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrer
                </Button>
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
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Montant</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Statut</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {factures.map((facture, index) => (
                  <motion.tr
                    key={facture.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{facture.numero}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{facture.client}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{facture.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-right text-slate-900">{formatAmount(facture.montant)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        facture.statut === 'payée'
                          ? 'bg-green-100 text-green-700'
                          : facture.statut === 'en_attente'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {facture.statut === 'payée' ? 'Payée' : facture.statut === 'en_attente' ? 'En attente' : 'Annulée'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
