'use client';

import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  TrendingUp, 
  ShoppingCart, 
  FileText, 
  Receipt, 
  ArrowLeft, 
  Sparkles 
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

const modules = [
  {
    id: 'produits',
    title: 'Catalogue Produits',
    description: 'Gestion du catalogue de produits et services',
    icon: Package,
    color: 'from-blue-500 to-blue-600',
    href: '/gestion-commerciale/produits',
  },
  {
    id: 'fournisseurs',
    title: 'Fournisseurs',
    description: 'Gestion des fournisseurs et contacts',
    icon: Truck,
    color: 'from-green-500 to-green-600',
    href: '/gestion-commerciale/fournisseurs',
  },
  {
    id: 'stocks',
    title: 'Gestion des Stocks',
    description: 'Suivi des entrées, sorties et mouvements de stock',
    icon: TrendingUp,
    color: 'from-purple-500 to-purple-600',
    href: '/gestion-commerciale/stocks',
  },
  {
    id: 'ventes',
    title: 'Espace de Vente',
    description: 'Enregistrement des ventes et clients',
    icon: ShoppingCart,
    color: 'from-amber-500 to-amber-600',
    href: '/gestion-commerciale/ventes',
  },
  {
    id: 'devis',
    title: 'Devis',
    description: 'Création et suivi des devis clients',
    icon: FileText,
    color: 'from-cyan-500 to-cyan-600',
    href: '/gestion-commerciale/devis',
  },
  {
    id: 'factures',
    title: 'Factures',
    description: 'Gestion des factures clients',
    icon: Receipt,
    color: 'from-rose-500 to-rose-600',
    href: '/finance/factures',
  },
];

export default function GestionCommercialePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Gestion Commerciale"
        description="Module transversal de gestion des ventes, stocks et approvisionnements"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec retour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link href="/">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour au dashboard
            </button>
          </Link>
        </motion.div>

        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 bg-gradient-to-r from-[#0F172A] via-[#1D4ED8] to-[#0F172A] rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 via-transparent to-[#D4AF37]/20 animate-pulse" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Module Commerciale</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Gestion Commerciale
            </h1>
            <p className="text-white/80">
              Gérez le cycle complet des ventes, des stocks et des approvisionnements
            </p>
          </div>
        </motion.div>

        {/* Flux cible */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">Flux cible du module</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700">Produit</span>
            </div>
            <span className="text-slate-400">→</span>
            <div className="flex items-center gap-2 bg-cyan-50 px-4 py-2 rounded-lg">
              <FileText className="w-4 h-4 text-cyan-600" />
              <span className="text-slate-700">Devis</span>
            </div>
            <span className="text-slate-400">→</span>
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg">
              <ShoppingCart className="w-4 h-4 text-amber-600" />
              <span className="text-slate-700">Vente</span>
            </div>
            <span className="text-slate-400">→</span>
            <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-lg">
              <Receipt className="w-4 h-4 text-rose-600" />
              <span className="text-slate-700">Facture</span>
            </div>
            <span className="text-slate-400">→</span>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-slate-700">Stock</span>
            </div>
          </div>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Link href={module.href}>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-slate-300 group cursor-pointer">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{module.title}</h3>
                    <p className="text-slate-600 text-sm">{module.description}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Note sur l'implémentation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-amber-900 mb-2">Statut de l'implémentation</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>✅ Catalogue Produits - Complet (CRUD)</li>
            <li>✅ Fournisseurs - Complet (CRUD)</li>
            <li>✅ Gestion des Stocks - Complet (CRUD + Détails)</li>
            <li>✅ Espace de Vente - Complet (Historique + Détails + Édition)</li>
            <li>✅ Devis - Complet (CRUD + Détails + Édition)</li>
            <li>✅ Factures - Existant (à améliorer)</li>
            <li>⏳ Bons de Livraison - À venir</li>
            <li>⏳ Achats Fournisseurs - À venir</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
