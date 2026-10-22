'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, DollarSign, Users, Briefcase, MessageSquare, Calendar, Settings, LogOut, Menu, X, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/AnimatedCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Opportunity } from '@/types';

export default function CommercialPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
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
          .from('collaborateurs')
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
  }, []);

  const formatAmount = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M FCFA`;
    }
    return `${(value / 1000).toFixed(0)}K FCFA`;
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Target },
    { id: 'opportunites', label: 'Opportunités', icon: Briefcase },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'interactions', label: 'Interactions', icon: MessageSquare },
    { id: 'calendrier', label: 'Calendrier', icon: Calendar },
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
          <h2 className="text-xl font-bold">Commercial</h2>
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
          <h1 className="text-lg font-bold text-slate-900">Commercial</h1>
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
                    Bonjour, {userName || 'Commercial'} 👋
                  </h1>
                  <p className="text-white/80 text-lg">
                    Prêt à développer les affaires de GROUP MI aujourd&apos;hui ?
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Vue d&apos;ensemble</h2>
                <p className="text-slate-600">Performance commerciale en temps réel</p>
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
                <Link href="/opportunites/create?from=commercial">
                  <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle opportunité
                  </Button>
                </Link>
                <Link href="/clients/create?from=commercial">
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau client
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
                    <Link href="/opportunites?from=commercial">
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
            </motion.div>
          )}

          {activeTab === 'opportunites' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Opportunités</h1>
                <p className="text-slate-600">Gestion des opportunités commerciales</p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Liste des opportunités</h3>
                <Link href="/opportunites?from=commercial">
                  <Button>Voir toutes les opportunités</Button>
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Clients</h1>
                <p className="text-slate-600">Gestion des clients</p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Liste des clients</h3>
                <Link href="/clients">
                  <Button>Voir tous les clients</Button>
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === 'interactions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Interactions</h1>
                <p className="text-slate-600">Historique des interactions clients</p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Liste des interactions</h3>
                <Link href="/interactions">
                  <Button>Voir toutes les interactions</Button>
                </Link>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendrier' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Calendrier</h1>
                <p className="text-slate-600">Planning des activités commerciales</p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Calendrier</h3>
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
                <p className="text-slate-600">Configuration de l&apos;espace commercial</p>
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
