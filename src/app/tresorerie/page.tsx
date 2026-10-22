'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Receipt, FileText, BarChart3, Calendar, Settings, LogOut, Menu, X, Plus, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/AnimatedCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function TresoreriePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function fetchUserName() {
      if (user) {
        const { data, error } = await supabase
          .from('collaborateurs')
          .select('prenom, nom, email')
          .eq('id', user.id)
          .maybeSingle();
        if (data) {
          // Utiliser le prénom si disponible, sinon extraire depuis l'email
          if (data.prenom) {
            setUserName(data.prenom);
          } else if (data.email) {
            // Extraire le prénom depuis l'email (avant le @)
            const emailName = data.email.split('@')[0];
            // Mettre la première lettre en majuscule
            const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
            setUserName(formattedName);
          } else if (data.nom) {
            setUserName(data.nom);
          }
        }
      }
    }
    fetchUserName();
  }, [user]);

  const stats = {
    totalRevenus: 15000000,
    totalDepenses: 8500000,
    solde: 6500000,
    transactions: 24,
  };

  const formatAmount = (value: number) => {
    return `${(value / 1000).toFixed(0)}K FCFA`;
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'factures', label: 'Factures', icon: Receipt },
    { id: 'rapports', label: 'Rapports', icon: FileText },
    { id: 'parametres', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-[#0F172A] to-[#1D4ED8] text-white z-50 lg:static lg:translate-x-0"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Trésorerie</h2>
          <p className="text-sm text-white/70 mt-1">Espace de travail</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#0F172A]'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </motion.div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header Mobile */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Trésorerie</h1>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Welcome Banner */}
              <div className="mb-8 bg-gradient-to-r from-[#0F172A] via-[#1D4ED8] to-[#0F172A] rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 via-transparent to-[#D4AF37]/20 animate-pulse" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                    <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Bienvenue</span>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Bonjour, {userName || 'Comptable'} 👋
                  </h1>
                  <p className="text-white/80 text-lg">
                    Prêt à gérer la trésorerie de GROUP MI aujourd&apos;hui ?
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Vue d&apos;ensemble</h2>
                <p className="text-slate-600">Statistiques financières en temps réel</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Revenus"
                  value={formatAmount(stats.totalRevenus)}
                  icon={TrendingUp}
                  color="text-green-600"
                  bgColor="bg-gradient-to-br from-green-100 to-green-200"
                  delay={0}
                />
                <StatCard
                  title="Total Dépenses"
                  value={formatAmount(stats.totalDepenses)}
                  icon={TrendingDown}
                  color="text-red-600"
                  bgColor="bg-gradient-to-br from-red-100 to-red-200"
                  delay={0.1}
                />
                <StatCard
                  title="Solde"
                  value={formatAmount(stats.solde)}
                  icon={Wallet}
                  color="text-blue-600"
                  bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
                  delay={0.2}
                />
                <StatCard
                  title="Transactions"
                  value={stats.transactions}
                  icon={DollarSign}
                  color="text-purple-600"
                  bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
                  delay={0.3}
                />
              </div>

              {/* Actions rapides */}
              <div className="mb-8 flex gap-4">
                <Link href="/tresorerie/factures/create">
                  <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle facture
                  </Button>
                </Link>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>

              {/* Placeholder pour le contenu */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Contenu de la vue d&apos;ensemble</h3>
                <p className="text-slate-600">Le contenu détaillé sera ajouté ici.</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Transactions</h1>
                <p className="text-slate-600">Gestion des transactions financières</p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Liste des transactions</h3>
                <p className="text-slate-600">Le contenu sera ajouté ici.</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'factures' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Factures</h1>
                <p className="text-slate-600">Gestion des factures clients</p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Liste des factures</h3>
                <Link href="/tresorerie/factures?from=tresorerie">
                  <Button>Voir toutes les factures</Button>
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === 'rapports' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Rapports</h1>
                <p className="text-slate-600">Rapports financiers et analytiques</p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Rapports disponibles</h3>
                <p className="text-slate-600">Le contenu sera ajouté ici.</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'parametres' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Paramètres</h1>
                <p className="text-slate-600">Configuration de la trésorerie</p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Paramètres</h3>
                <p className="text-slate-600">Le contenu sera ajouté ici.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
