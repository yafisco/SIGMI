'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Filter, ArrowLeft, Edit, Receipt, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { errorMessage } from '@/lib/utils/errorHandler';

export default function VentesHistoriquePage() {
  const [ventes, setVentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchVentes() {
      const { data } = await supabase.from('ventes').select('*, clients(*)').order('date', { ascending: false });
      setVentes(data || []);
      setLoading(false);
    }
    fetchVentes();
  }, []);

  const filteredVentes = ventes.filter(v =>
    v.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.client_nom && v.client_nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string, numero: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer la vente "${numero}". Cette action est irréversible !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
      cancelButtonColor: SWEETALERT_CONFIG.cancelButtonColor,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      customClass: SWEETALERT_CONFIG.customClass,
    });

    if (result.isConfirmed) {
      try {
        // Supprimer d'abord les lignes de vente
        const { error: lignesError } = await supabase.from('lignes_vente').delete().eq('vente_id', id);
        if (lignesError) throw lignesError;

        // Supprimer la vente
        const { error: venteError } = await supabase.from('ventes').delete().eq('id', id);
        if (venteError) throw venteError;

        // Rafraîchir la liste
        const { data } = await supabase.from('ventes').select('*, clients(*)').order('date', { ascending: false });
        setVentes(data || []);

        await Swal.fire({
          title: 'Supprimé !',
          text: 'La vente a été supprimée avec succès.',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      } catch (err) {
        await Swal.fire({
          title: 'Erreur',
          text: errorMessage(err, 'Erreur lors de la suppression de la vente'),
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Historique des Ventes"
        description="Consultation et gestion des ventes enregistrées"
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
          <Link href="/gestion-commerciale/ventes/create">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Nouvelle vente
            </Button>
          </Link>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une vente..."
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
              Liste des ventes ({filteredVentes.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">N° Vente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mode paiement</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Total</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVentes.map((vente, index) => (
                    <motion.tr
                      key={vente.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        <Link href={`/gestion-commerciale/ventes/${vente.id}`} className="hover:text-[#1D4ED8]">
                          {vente.numero}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">{vente.client_nom || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{new Date(vente.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 capitalize">{vente.mode_paiement}</td>
                      <td className="px-6 py-4 text-sm font-medium text-right text-slate-900">
                        {vente.total.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Link href={`/gestion-commerciale/ventes/${vente.id}`}>
                            <Button variant="ghost" size="sm">
                              <Receipt className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/gestion-commerciale/ventes/${vente.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(vente.id, vente.numero)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
