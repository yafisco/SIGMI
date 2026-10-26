'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Receipt, FileText, BarChart3, Plus, Download, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/AnimatedCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function FinancePage() {
  const { user } = useAuth();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function fetchUserName() {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('prenom, nom, email')
          .eq('id', user.id)
          .maybeSingle();
        if (data) {
          if (data.prenom) {
            setUserName(data.prenom);
          } else if (data.email) {
            const emailName = data.email.split('@')[0];
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1D4ED8] to-[#0F172A] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 via-transparent to-[#D4AF37]/20 animate-pulse" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Bienvenue</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Bonjour, {userName || 'Finance'} 👋
          </h1>
          <p className="text-white/80 text-lg md:text-xl">
            Espace Finance et Comptabilité - Prêt à gérer les finances de GROUP MI ?
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onglets horizontaux */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'facturation', label: 'Facturation', icon: Receipt },
            { id: 'encaissements', label: 'Encaissements / Décaissements', icon: DollarSign },
            { id: 'budgets', label: 'Budgets', icon: Wallet },
            { id: 'suivi-tresorerie', label: 'Suivi de trésorerie', icon: TrendingUp },
            { id: 'rapports', label: 'Rapports financiers', icon: FileText },
          ].map((tab) => (
            <Link
              key={tab.id}
              href={tab.id === 'overview' ? '/finance' : `/finance/${tab.id}`}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300 transition-all"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          ))}
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
          <Link href="/finance/factures/create">
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
          <h3 className="text-xl font-bold text-slate-900 mb-4">Contenu de la vue d'ensemble</h3>
          <p className="text-slate-600">Le contenu détaillé sera ajouté ici. [À VALIDER AVEC KHADY]</p>
        </div>
      </div>
    </div>
  );
}
