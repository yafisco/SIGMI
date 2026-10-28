'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageSquare, Users, ArrowLeft, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PriseContactPage() {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchInteractions() {
      const { data } = await supabase
        .from('interactions')
        .select('*, clients(*)')
        .order('date', { ascending: false })
        .limit(50);
      setInteractions(data || []);
      setLoading(false);
    }
    fetchInteractions();
  }, []);

  const filteredInteractions = interactions.filter(i =>
    i.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appel':
        return { icon: Phone, color: 'bg-blue-100 text-blue-600', label: 'Appel' };
      case 'email':
        return { icon: Mail, color: 'bg-green-100 text-green-600', label: 'E-mail' };
      case 'reunion':
        return { icon: Users, color: 'bg-purple-100 text-purple-600', label: 'Réunion' };
      case 'visite':
        return { icon: MessageSquare, color: 'bg-amber-100 text-amber-600', label: 'Visite' };
      default:
        return { icon: MessageSquare, color: 'bg-gray-100 text-gray-600', label: type };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Prise de Contact"
        description="Historique des prises de contact avec les prospects"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/commercial/prospection">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour à Prospection
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/interactions/create">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle interaction
            </Button>
          </Link>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une interaction..."
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
              Interactions récentes ({filteredInteractions.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Résultat</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInteractions.map((interaction, index) => {
                    const typeIcon = getTypeIcon(interaction.type);
                    const Icon = typeIcon.icon;
                    return (
                      <motion.tr
                        key={interaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(interaction.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${typeIcon.color}`}>
                            <Icon className="w-3 h-3" />
                            {typeIcon.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">{interaction.client_nom || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{interaction.resultat || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                          {interaction.notes || '-'}
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
