'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Filter, Edit, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Devis } from '@/types';

export default function DevisPage() {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchDevis() {
      const { data } = await supabase.from('devis').select('*, clients(nom)').order('date', { ascending: false });
      setDevis(data || []);
      setLoading(false);
    }
    fetchDevis();
  }, []);

  const filteredDevis = devis.filter(d =>
    d.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.client_nom && d.client_nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'accepté':
        return { color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'refusé':
        return { color: 'bg-red-100 text-red-700', icon: XCircle };
      case 'envoyé':
        return { color: 'bg-blue-100 text-blue-700', icon: Clock };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: FileText };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Devis"
        description="Création et suivi des devis clients"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/gestion-commerciale">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour à Gestion commerciale
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/gestion-commerciale/devis/create">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau devis
            </Button>
          </Link>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un devis..."
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
              Liste des devis ({filteredDevis.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">N° Devis</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Validité</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Total HT</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Statut</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevis.map((dev, index) => {
                    const badge = getStatutBadge(dev.statut);
                    const Icon = badge.icon;
                    return (
                      <motion.tr
                        key={dev.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                          <Link href={`/gestion-commerciale/devis/${dev.id}`} className="hover:text-[#1D4ED8]">
                            {dev.numero}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">{dev.client_nom || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(dev.date).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{dev.date_validite ? new Date(dev.date_validite).toLocaleDateString('fr-FR') : '-'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-right text-slate-900">{dev.total_ht.toLocaleString('fr-FR')} FCFA</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                            <Icon className="w-3 h-3" />
                            {dev.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <Link href={`/gestion-commerciale/devis/${dev.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
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
