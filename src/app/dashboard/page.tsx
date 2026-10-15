'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Target, TrendingUp, Clock, FolderKanban, Users,
  DollarSign, CheckCircle, AlertCircle, ArrowRight, Plus,
  Briefcase, FileText, Activity, BarChart3, Star, Sparkles,
  MessageSquare, Mail, Phone, Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/AnimatedCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { usePoleStats } from '@/hooks/usePoleStats';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { stats: poleStats, loading: poleLoading } = usePoleStats();
  const [userName, setUserName] = useState('Collaborateur');
  const [isLoading, setIsLoading] = useState(true);

  const interactionIcons: Record<string, any> = {
    email: Mail,
    appel: Phone,
    réunion: MessageSquare,
    visite: Calendar,
    autre: Activity,
  };
  
  const [stats, setStats] = useState({
    opportunities: 0,
    pipelineValue: 0,
    projects: 0,
    collaborators: 0,
    tasks: 0,
    clients: 0,
    documents: 0,
    budget: 0,
  });

  const [urgentTasks, setUrgentTasks] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pipelineData, setPipelineData] = useState([
    { stage: 'Nouveau', count: 0, value: 0, color: 'from-slate-400 to-slate-600' },
    { stage: 'Qualifié', count: 0, value: 0, color: 'from-blue-400 to-blue-600' },
    { stage: 'Proposition', count: 0, value: 0, color: 'from-amber-400 to-amber-600' },
    { stage: 'Négociation', count: 0, value: 0, color: 'from-purple-400 to-purple-600' },
    { stage: 'Gagné', count: 0, value: 0, color: 'from-green-400 to-green-600' },
  ]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from('collaborateurs')
            .select('nom, prenom')
            .eq('id', user.id)
            .single();
          
          if (userData) {
            setUserName(`${userData.prenom} ${userData.nom}`);
          }
        }

        const [
          { count: oppCount },
          { count: projectsCount },
          { count: collabsCount },
          { count: tasksCount },
          { count: clientsCount },
          { count: docsCount },
        ] = await Promise.all([
          supabase.from('opportunities').select('*', { count: 'exact', head: true }),
          supabase.from('projets').select('*', { count: 'exact', head: true }),
          supabase.from('collaborateurs').select('*', { count: 'exact', head: true }),
          supabase.from('tasks').select('*', { count: 'exact', head: true }),
          supabase.from('clients').select('*', { count: 'exact', head: true }),
          supabase.from('documents').select('*', { count: 'exact', head: true }),
        ]);

        const { data: opps } = await supabase.from('opportunities').select('amount, stage');
        const pipelineValue = opps?.reduce((sum, opp) => sum + (opp.amount || 0), 0) || 0;

        const { data: urgentTasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('priority', 'urgent')
          .eq('status', 'todo')
          .limit(5);

        const { data: interactionsData } = await supabase
          .from('interactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: oppsByStage } = await supabase.from('opportunities').select('stage, amount');
        const pipelineStages = ['nouveau', 'qualifié', 'proposition', 'négociation', 'gagné'];
        const pipelineCounts = pipelineStages.map(stage => ({
          stage: stage.charAt(0).toUpperCase() + stage.slice(1),
          count: oppsByStage?.filter(o => o.stage === stage).length || 0,
          value: oppsByStage?.filter(o => o.stage === stage).reduce((sum, o) => sum + (o.amount || 0), 0) || 0,
          color: stage === 'nouveau' ? 'from-slate-400 to-slate-600' : stage === 'qualifié' ? 'from-blue-400 to-blue-600' : stage === 'proposition' ? 'from-amber-400 to-amber-600' : stage === 'négociation' ? 'from-purple-400 to-purple-600' : 'from-green-400 to-green-600',
        }));

        setStats({
          opportunities: oppCount || 0,
          pipelineValue,
          projects: projectsCount || 0,
          collaborators: collabsCount || 0,
          tasks: tasksCount || 0,
          clients: clientsCount || 0,
          documents: docsCount || 0,
          budget: pipelineValue,
        });

        setUrgentTasks(urgentTasksData || []);
        setRecentActivities(interactionsData || []);
        setPipelineData(pipelineCounts);
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const formatAmount = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M FCFA`;
    }
    return `${(value / 1000).toFixed(0)}K FCFA`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Tableau de bord"
        description={`Bienvenue, ${userName}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Opportunités"
            value={stats.opportunities}
            icon={Target}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0}
          />
          <div className="relative group cursor-pointer">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2 group-hover:rotate-4 transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-amber-200 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-transparent rounded-full blur-2xl group-hover:from-amber-200/50 transition-all duration-500" />
                <div className="flex items-center justify-between relative">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Pipeline</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{formatAmount(stats.pipelineValue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-amber-600" />
                </div>
              </div>
            </motion.div>
          </div>
          <StatCard
            title="Projets"
            value={stats.projects}
            icon={FolderKanban}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.2}
          />
          <StatCard
            title="Collaborateurs"
            value={stats.collaborators}
            icon={Users}
            color="text-green-600"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            delay={0.3}
          />
        </div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#B89B6E] to-[#D4AF37] bg-[length:200%_auto] animate-gradient rounded-2xl transform rotate-1" />
          <div className="relative bg-gradient-to-r from-[#D4AF37] via-[#B89B6E] to-[#D4AF37] bg-[length:200%_auto] animate-gradient rounded-2xl p-6 border-2 border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1D4ED8] mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Actions rapides
                </h3>
                <p className="text-[#1D4ED8]/80 text-sm">Créez rapidement de nouveaux éléments</p>
              </div>
              <div className="flex gap-3">
                {[
                  { href: '/clients', icon: Briefcase, label: 'Client' },
                  { href: '/opportunites', icon: Target, label: 'Opportunité' },
                  { href: '/taches', icon: CheckCircle, label: 'Tâche' },
                ].map((action, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href={action.href}>
                      <Button className="bg-white hover:bg-slate-100 text-[#1D4ED8] font-medium px-4 py-2 shadow-lg transition-all duration-300">
                        <action.icon className="w-4 h-4 mr-2" />
                        {action.label}
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pipeline commercial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            className="lg:col-span-2 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2" />
            <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-6 relative">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Pipeline commercial</h3>
                  <p className="text-slate-600 text-sm">Vue d'ensemble</p>
                </div>
                <Link href="/pipeline">
                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    Voir tout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4 relative">
                {pipelineData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className={`w-4 h-4 rounded-full bg-gradient-to-br ${item.color} shadow-lg`}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-slate-900">{item.stage}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-slate-600 font-medium">
                            <AnimatedCounter value={item.count} />
                          </span>
                          <span className="text-sm font-bold text-slate-900">{formatAmount(item.value)} FCFA</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.opportunities > 0 ? (item.count / stats.opportunities) * 100 : 0}%` }}
                          transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                          className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tâches urgentes */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-white rounded-2xl transform -rotate-2" />
            <div className="relative bg-gradient-to-br from-white to-red-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-red-200 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100/50 to-transparent rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-6 relative">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Tâches urgentes</h3>
                  <p className="text-slate-600 text-sm">Actions prioritaires</p>
                </div>
                <Link href="/taches">
                  <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                    Voir tout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-3 relative">
                {urgentTasks.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-slate-500 text-center py-8"
                  >
                    Aucune tâche urgente
                  </motion.p>
                ) : (
                  urgentTasks.map((task, index) => (
                    <motion.div
                      key={task.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          className={`w-3 h-3 rounded-full mt-1.5 ${
                            task.priority === 'urgent' ? 'bg-gradient-to-br from-red-400 to-red-600' :
                            'bg-gradient-to-br from-orange-400 to-orange-600'
                          } shadow-lg`}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-sm">{task.title}</p>
                          <p className="text-xs text-slate-600 mt-1">{task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR') : '-'}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activité récente */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-white rounded-2xl transform rotate-2" />
            <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-6 relative">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Activité récente</h3>
                  <p className="text-slate-600 text-sm">Dernières actions</p>
                </div>
                <Link href="/interactions">
                  <Activity className="w-6 h-6 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" />
                </Link>
              </div>

              <div className="space-y-3 relative">
                {recentActivities.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-sm text-slate-500 text-center py-8"
                  >
                    Aucune activité récente
                  </motion.p>
                ) : (
                  recentActivities.map((activity, index) => {
                    const Icon = interactionIcons[activity.type] || Activity;
                    return (
                      <motion.div
                        key={activity.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                        whileHover={{ x: 5 }}
                        className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                          >
                            <Icon className="w-5 h-5 text-blue-600" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 text-sm">{activity.titre || 'Interaction'}</p>
                            <p className="text-xs text-slate-600 mt-1">{activity.description || activity.type}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {activity.created_at ? new Date(activity.created_at).toLocaleDateString('fr-FR') : '-'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>

          {/* Statistiques par pôle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-white rounded-2xl transform -rotate-2" />
            <div className="relative bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-purple-200 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-transparent rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-6 relative">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Performance par pôle</h3>
                  <p className="text-slate-600 text-sm">Vue détaillée</p>
                </div>
                <BarChart3 className="w-6 h-6 text-slate-400" />
              </div>
              
              <div className="space-y-3 relative">
                {poleLoading ? (
                  <p className="text-sm text-slate-500 text-center py-4">Chargement...</p>
                ) : poleStats && poleStats.length > 0 ? (
                  poleStats.map((stat, index) => {
                    const poleOption = { value: stat.pole, label: stat.pole };
                    const canClickPole = user?.isAdmin || false;
                    const CardContent = (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                        whileHover={canClickPole ? { x: 5 } : {}}
                        className={`flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all ${canClickPole ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-lg"
                          >
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                          </motion.div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{stat.pole}</p>
                            <p className="text-xs text-slate-600">{stat.totalOpportunities} opps</p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-slate-900">{formatAmount(stat.totalValue)} FCFA</span>
                      </motion.div>
                    );

                    return canClickPole ? (
                      <Link key={stat.pole} href={`/poles/${encodeURIComponent(stat.pole)}`}>
                        {CardContent}
                      </Link>
                    ) : (
                      <div key={stat.pole}>{CardContent}</div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">Aucune donnée de pôle</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Alertes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-white rounded-2xl transform rotate-1" />
          <div className="relative bg-gradient-to-br from-white to-amber-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-amber-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-transparent rounded-full blur-2xl" />
            <div className="flex items-start gap-4 relative">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
              >
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base mb-2">Actions requises</h3>
                <p className="text-sm text-slate-700">Aucune action requise pour le moment</p>
              </div>
              <Link href="/taches">
                <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100 text-sm">
                  Voir détails
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
