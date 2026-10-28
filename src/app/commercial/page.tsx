'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, DollarSign, Users, Briefcase, MessageSquare, Calendar, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/AnimatedCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Opportunity } from '@/types';

export default function CommercialPage() {
  const { user } = useAuth();
  const [userName, setUserName] = useState('');

  const [stats, setStats] = useState({
    totalOpportunities: 0,
    totalPipeline: 0,
    conversionRate: 0,
    totalClients: 0,
    wonDeals: 0,
    avgDealSize: 0,
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    async function fetchUserName() {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('prenom, nom, email')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data) {
          // Utiliser le prénom si disponible
          if (data.prenom && data.prenom.trim()) {
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
        } else {
          // Si pas de collaborateur trouvé, utiliser l'email de l'utilisateur auth
          if (user.email) {
            const emailName = user.email.split('@')[0];
            const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
            setUserName(formattedName);
          }
        }
      }
    }
    fetchUserName();
  }, [user]);

  useEffect(() => {
    async function fetchCommercialData() {
      try {
        const { data: opps } = await supabase
          .from('opportunities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        const totalOpps = opps?.length || 0;
        const totalPipeline = opps?.reduce((sum, opp) => sum + (opp.amount || 0), 0) || 0;
        const wonDeals = opps?.filter(o => o.stage === 'gagné').length || 0;
        const conversionRate = totalOpps > 0 ? (wonDeals / totalOpps) * 100 : 0;
        const avgDealSize = wonDeals > 0 
          ? opps?.filter(o => o.stage === 'gagné').reduce((sum, o) => sum + (o.amount || 0), 0) / wonDeals 
          : 0;

        const { count: clientsCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalOpportunities: totalOpps,
          totalPipeline,
          conversionRate,
          totalClients: clientsCount || 0,
          wonDeals,
          avgDealSize,
        });

        setOpportunities(opps || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    }
    fetchCommercialData();

    // Synchronisation en temps réel
    const channels = [
      supabase
        .channel('opportunities_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, () => fetchCommercialData())
        .subscribe(),
      supabase
        .channel('clients_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchCommercialData())
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const formatAmount = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M FCFA`;
    }
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
            Bonjour, {userName || 'Commercial'} 👋
          </h1>
          <p className="text-white/80 text-lg md:text-xl">
            Espace Commercial - Prêt à développer les affaires de GROUP MI ?
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onglets horizontaux */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Target },
            { id: 'prospection', label: 'Prospection', icon: Briefcase },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'interactions', label: 'Interactions', icon: MessageSquare },
            { id: 'calendrier', label: 'Calendrier', icon: Calendar },
          ].map((tab) => (
            <Link
              key={tab.id}
              href={tab.id === 'overview' ? '/commercial' : `/commercial/${tab.id}`}
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
            title="Opportunités"
            value={stats.totalOpportunities}
            icon={Target}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <StatCard
            title="Pipeline"
            value={formatAmount(stats.totalPipeline)}
            icon={DollarSign}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.1}
          />
          <StatCard
            title="Taux de conversion"
            value={`${stats.conversionRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.2}
          />
          <StatCard
            title="Clients"
            value={stats.totalClients}
            icon={Users}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.3}
          />
        </div>

        {/* Actions rapides */}
        <div className="mb-8 flex gap-4">
          <Link href="/opportunites/create">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle opportunité
            </Button>
          </Link>
          <Link href="/commercial/prospection">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Lancer une prospection
            </Button>
          </Link>
          <Link href="/clients/create?from=commercial">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau client
            </Button>
          </Link>
          <Link href="/commercial/demandes-agrement/create">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Demande d'agrément
            </Button>
          </Link>
        </div>

        {/* Statistiques supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Affaires gagnées</h3>
                <p className="text-sm text-slate-600">Opportunités converties</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">
              <AnimatedCounter value={stats.wonDeals} />
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Taille moyenne</h3>
                <p className="text-sm text-slate-600">Valeur moyenne par affaire</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {formatAmount(stats.avgDealSize)}
            </p>
          </div>
        </div>

        {/* Opportunités récentes */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Opportunités récentes</h3>
              <Link href="/opportunites">
                <Button variant="outline" size="sm">
                  Voir tout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Étape</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Probabilité</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp, index) => (
                  <motion.tr
                    key={opp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{opp.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{opp.client_id || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatAmount(opp.amount || 0)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        opp.stage === 'gagné' ? 'bg-green-100 text-green-700' :
                        opp.stage === 'perdu' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {opp.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{opp.probability || 0}%</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
