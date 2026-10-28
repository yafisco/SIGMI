'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Search, Filter, Edit, Trash2, ArrowLeft, DollarSign, Tag, Download, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/AnimatedCard';
import Link from 'next/link';
import { produitsService } from '@/lib/services';
import { useData } from '@/hooks/useData';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';
import { generateGMITPDF } from '@/lib/utils/gmiTemplate';

export default function ProduitsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPole, setFilterPole] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const { data: produits, refresh } = useData({
    fetchFn: () => produitsService.getAll(),
  });

  // Charger les stats
  useEffect(() => {
    async function loadStats() {
      const statsData = await produitsService.getStats();
      setStats(statsData);
    }
    loadStats();
  }, []);

  // Abonnement Realtime
  useEffect(() => {
    const subscription = produitsService.subscribeToChanges(() => {
      refresh();
      produitsService.getStats().then(setStats);
    });

    return () => {
      produitsService.unsubscribe();
    };
  }, [refresh]);

  const filteredProduits = (produits || []).filter(p => {
    const matchesSearch = p.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPole = filterPole === 'all' || p.pole === filterPole;
    const matchesStatut = filterStatut === 'all' || 
                          (filterStatut === 'actif' && p.actif) ||
                          (filterStatut === 'inactif' && !p.actif);
    return matchesSearch && matchesPole && matchesStatut;
  });

  const poles = Array.from(new Set((produits || []).map(p => p.pole).filter(Boolean)));

  const formatPrice = (value: number) => {
    return `${value.toLocaleString('fr-FR')} FCFA`;
  };

  const handleDelete = async (id: string, designation: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous vraiment supprimer le produit "${designation}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      customClass: SWEETALERT_CONFIG.customClass,
    });

    if (result.isConfirmed) {
      try {
        await produitsService.delete(id);
        await Swal.fire({
          title: 'Supprimé !',
          text: 'Le produit a été supprimé',
          icon: 'success',
          confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
        refresh();
        const statsData = await produitsService.getStats();
        setStats(statsData);
      } catch (error) {
        await Swal.fire({
          title: 'Erreur',
          text: 'Erreur lors de la suppression',
          icon: 'error',
          confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
          customClass: SWEETALERT_CONFIG.customClass,
        });
      }
    }
  };

  const handleExportPDF = async () => {
    try {
      const lignesText = filteredProduits.map(p => 
        `${p.reference} - ${p.designation} : ${formatPrice(p.prix_unitaire)}`
      ).join('\n');
      
      const doc = await generateGMITPDF({
        type: 'rapport',
        titre: 'Catalogue Produits',
        date: new Date().toLocaleDateString('fr-FR'),
        objet: 'Liste complète des produits',
        contenu: lignesText,
        data: {
          'Nombre de produits': filteredProduits.length.toString(),
          'Produits actifs': filteredProduits.filter(p => p.actif).length.toString(),
          'Valeur totale': `${stats?.valeurTotale?.toLocaleString('fr-FR') || 0} FCFA`,
        },
      });
      
      doc.save('Catalogue_Produits.pdf');
      
      await Swal.fire({
        title: 'Succès !',
        text: 'Le catalogue a été exporté',
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Catalogue Produits"
        description="Gestion du catalogue de produits"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Produits"
            value={stats?.total || 0}
            icon={Package}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="Produits Actifs"
            value={stats?.actifs || 0}
            icon={Tag}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.1}
          />
          <StatCard
            title="Produits Inactifs"
            value={stats?.inactifs || 0}
            icon={Package}
            color="text-red-600"
            bgColor="bg-gradient-to-br from-red-100 to-red-200"
            delay={0.2}
          />
          <StatCard
            title="Valeur Totale"
            value={`${(stats?.valeurTotale || 0).toLocaleString('fr-FR')} FCFA`}
            icon={DollarSign}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.3}
          />
        </div>

        {/* Header avec retour */}
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

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/gestion-commerciale/produits/create">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau produit
            </Button>
          </Link>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
              />
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtrer
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </motion.div>

        {/* Filtres */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 border border-slate-200 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pôle</label>
                <select
                  value={filterPole}
                  onChange={(e) => setFilterPole(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="all">Tous les pôles</option>
                  {poles.map((pole) => (
                    <option key={pole} value={pole}>{pole}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Statut</label>
                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="all">Tous</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tableau des produits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              Liste des produits ({filteredProduits.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Référence</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Désignation</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Prix unitaire</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Fournisseur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Pôle</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Statut</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProduits.map((produit, index) => (
                  <motion.tr
                    key={produit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {produit.image_url ? (
                        <img 
                          src={produit.image_url} 
                          alt={produit.designation}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center">
                          <Package className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{produit.reference}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{produit.designation}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatPrice(produit.prix_unitaire)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{produit.fournisseur_nom || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{produit.pole || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        produit.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {produit.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <Link href={`/gestion-commerciale/produits/${produit.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(produit.id, produit.designation)}
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
        </motion.div>
      </div>
    </div>
  );
}
