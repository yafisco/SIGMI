'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Users, FolderKanban, CheckCircle, DollarSign, Calendar, Settings, LogOut, Menu, X, ArrowLeft, Sparkles, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/AnimatedCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { POLE_OPTIONS } from '@/lib/constants';
import type { Projet } from '@/types';

export default function PoleDashboardPage() {
  const params = useParams<{ pole: string }>();
  const poleSlug = decodeURIComponent(params.pole ?? '');
  const poleName = POLE_OPTIONS.find((p) => p.value === poleSlug)?.label || poleSlug || 'Pôle';
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userName, setUserName] = useState('');
  const [isDG, setIsDG] = useState(false);

  const [stats, setStats] = useState({
    totalProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    totalCollaborators: 0,
    totalBudget: 0,
    consumedBudget: 0,
  });

  const [projects, setProjects] = useState<Projet[]>([]);

  useEffect(() => {
    // Récupérer le prénom de l'utilisateur et vérifier si c'est le DG
    async function fetchUserName() {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('prenom, nom, email, role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data) {
          if (data.prenom && data.prenom.trim()) {
            setUserName(data.prenom);
          } else if (data.email) {
            const emailName = data.email.split('@')[0];
            const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
            setUserName(formattedName);
          } else if (data.nom) {
            setUserName(data.nom);
          }

          // Vérifier si c'est le DG
          setIsDG(data.role === 'direction_generale');
        }
      }
    }
    fetchUserName();

    // Charger les données du pôle
    async function fetchPoleData() {
      if (poleSlug) {
        // Projets du pôle
        const { data: projData } = await supabase
          .from('projets')
          .select('*')
          .contains('poles', [poleSlug])
          .order('created_at', { ascending: false })
          .limit(10);
        
        setProjects(projData || []);

        // Statistiques
        const totalProjects = projData?.length || 0;
        const inProgress = projData?.filter(p => p.statut === 'en cours').length || 0;
        const completed = projData?.filter(p => p.statut === 'terminé').length || 0;
        const totalBudget = projData?.reduce((sum, p) => sum + (p.budget_estime || 0), 0) || 0;
        const consumedBudget = projData?.reduce((sum, p) => sum + (p.budget_consomme || 0), 0) || 0;

        // Collaborateurs du pôle
        const { count: collabCount } = await supabase
          .from('collaborateurs')
          .select('*', { count: 'exact', head: true })
          .contains('poles', [poleSlug]);

        setStats({
          totalProjects,
          inProgressProjects: inProgress,
          completedProjects: completed,
          totalCollaborators: collabCount || 0,
          totalBudget,
          consumedBudget,
        });
      }
    }
    fetchPoleData();
  }, [poleSlug, user]);

  const formatAmount = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M FCFA`;
    }
    return `${(value / 1000).toFixed(0)}K FCFA`;
  };

  const sidebarItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Target },
    { id: 'projects', label: 'Projets', icon: FolderKanban },
    { id: 'team', label: 'Équipe', icon: Users },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#1D4ED8] to-[#1e40af] text-white flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">SIGMI</h2>
          <p className="text-sm text-white/70 mt-1">{poleName}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-[#D4AF37] text-[#1D4ED8] font-semibold'
                  : 'hover:bg-white/10 text-white/80'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          {isDG && (
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white/80 transition-all">
              <ArrowLeft className="w-5 h-5" />
              Dashboard global
            </Link>
          )}
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-white/80 transition-all mt-2"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-gradient-to-r from-[#1D4ED8] to-[#1e40af] text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-lg font-bold">{poleName}</h1>
          <button
            onClick={() => signOut()}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#1D4ED8] to-[#1e40af] text-white flex-col p-4">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold">SIGMI</h2>
              <p className="text-sm text-white/70 mt-1">{poleName}</p>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-[#D4AF37] text-[#1D4ED8] font-semibold'
                      : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-white/10">
              {isDG && (
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-white/80 transition-all">
                  <ArrowLeft className="w-5 h-5" />
                  Dashboard global
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Welcome Banner */}
            <div className="mb-8 bg-gradient-to-r from-[#1D4ED8] via-[#1e40af] to-[#1D4ED8] rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                  <span className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Bienvenue</span>
                </div>
                <h1 className="text-4xl font-bold mb-2">
                  Bonjour, {userName || 'Responsable'} 👋
                </h1>
                <p className="text-white/80 text-lg">
                  Prêt à gérer {poleName} aujourd&apos;hui ?
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Projets en cours"
                value={stats.inProgressProjects}
                icon={FolderKanban}
                color="text-blue-600"
                bgColor="bg-blue-100"
              />
              <StatCard
                title="Projets terminés"
                value={stats.completedProjects}
                icon={CheckCircle}
                color="text-green-600"
                bgColor="bg-green-100"
              />
              <StatCard
                title="Total collaborateurs"
                value={stats.totalCollaborators}
                icon={Users}
                color="text-purple-600"
                bgColor="bg-purple-100"
              />
              <StatCard
                title="Budget total"
                value={formatAmount(stats.totalBudget)}
                icon={DollarSign}
                color="text-amber-600"
                bgColor="bg-amber-100"
              />
              <StatCard
                title="Budget consommé"
                value={formatAmount(stats.consumedBudget)}
                icon={TrendingUp}
                color="text-red-600"
                bgColor="bg-red-100"
              />
              <StatCard
                title="Total projets"
                value={stats.totalProjects}
                icon={Briefcase}
                color="text-indigo-600"
                bgColor="bg-indigo-100"
              />
            </div>

            {/* Recent Projects */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">Projets récents</h3>
              </div>
              <div className="p-6">
                {projects.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Aucun projet pour le moment</p>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                        <div>
                          <h4 className="font-semibold text-slate-900">{project.nom}</h4>
                          <p className="text-sm text-slate-600">{project.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.statut === 'en cours' ? 'bg-blue-100 text-blue-700' :
                          project.statut === 'terminé' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {project.statut}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'projects' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Projets de {poleName}</h2>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <p className="text-slate-500">Liste des projets de ce pôle...</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'team' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Équipe de {poleName}</h2>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <p className="text-slate-500">Liste des collaborateurs de ce pôle...</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'budget' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Budget de {poleName}</h2>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <p className="text-slate-500">Détails du budget de ce pôle...</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Paramètres de {poleName}</h2>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <p className="text-slate-500">Paramètres de ce pôle...</p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
