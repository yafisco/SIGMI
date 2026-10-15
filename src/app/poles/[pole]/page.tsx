'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, TrendingUp, DollarSign, Building2, Users, Award, AlertCircle } from 'lucide-react';
import { usePoleStats } from '@/hooks/usePoleStats';
import { useAuth } from '@/hooks/useAuth';
import { Pole } from '@/types';
import { POLE_OPTIONS } from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/AnimatedCard';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const POLE_ICONS: Record<Pole, any> = {
  'ingénierie informatique': Target,
  'génie civil et BTP': Building2,
  'agrobusiness': TrendingUp,
  'trading international': DollarSign,
  'transition énergétique': Award,
  "centre d'incubation et d'impulsion des entreprises": Users,
};

const POLE_COLORS: Record<Pole, string> = {
  'ingénierie informatique': 'from-blue-100 to-blue-200',
  'génie civil et BTP': 'from-orange-100 to-orange-200',
  'agrobusiness': 'from-green-100 to-green-200',
  'trading international': 'from-purple-100 to-purple-200',
  'transition énergétique': 'from-yellow-100 to-yellow-200',
  "centre d'incubation et d'impulsion des entreprises": 'from-pink-100 to-pink-200',
};

const POLE_TEXT_COLORS: Record<Pole, string> = {
  'ingénierie informatique': 'text-blue-600',
  'génie civil et BTP': 'text-orange-600',
  'agrobusiness': 'text-green-600',
  'trading international': 'text-purple-600',
  'transition énergétique': 'text-yellow-600',
  "centre d'incubation et d'impulsion des entreprises": 'text-pink-600',
};

export default function PoleDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const pole = decodeURIComponent(params.pole as string) as Pole;
  const { user, loading: authLoading } = useAuth();

  const { stats, loading, error } = usePoleStats(pole);

  // Vérifier les permissions
  useEffect(() => {
    if (!authLoading && user) {
      // Si l'utilisateur n'est pas admin et n'appartient pas à ce pôle, rediriger
      if (!user.isAdmin && (!user.poles || !user.poles.includes(pole))) {
        router.push('/');
      }
    }
  }, [authLoading, user, pole, router]);

  const formatAmount = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M FCFA`;
    }
    return `${(value / 1000).toFixed(0)}K FCFA`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-600 font-medium">Chargement du dashboard pôle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const PoleIcon = POLE_ICONS[pole] || Target;
  const poleColor = POLE_COLORS[pole] || 'from-blue-100 to-blue-200';
  const poleTextColor = POLE_TEXT_COLORS[pole] || 'text-blue-600';

  const poleLabel = POLE_OPTIONS.find((p) => p.value === pole)?.label || pole;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title={`Dashboard - ${poleLabel}`}
        description="Statistiques et KPIs par pôle"
        actionHref="/"
        actionLabel="Retour"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header du pôle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
          <div className={`relative bg-gradient-to-br ${poleColor} rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-opacity-50 transition-all duration-500 overflow-hidden`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/30 rounded-full blur-2xl" />
            <div className="flex items-center gap-4 relative">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg"
              >
                <PoleIcon className={`w-8 h-8 ${poleTextColor}`} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{poleLabel}</h2>
                <p className="text-slate-600 mt-1">Performance du pôle</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Opportunités"
            value={stats?.totalOpportunities || 0}
            icon={Target}
            color={poleTextColor}
            bgColor={poleColor}
            delay={0}
          />
          <StatCard
            title="Projets"
            value={stats?.totalProjects || 0}
            icon={Building2}
            color="text-blue-600"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            delay={0.1}
          />
          <StatCard
            title="Valeur pipeline"
            value={formatAmount(stats?.totalValue || 0)}
            icon={DollarSign}
            color="text-amber-600"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            delay={0.2}
          />
          <StatCard
            title="Valeur pondérée"
            value={formatAmount(stats?.weightedValue || 0)}
            icon={TrendingUp}
            color="text-purple-600"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            delay={0.3}
          />
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-xl transform rotate-1" />
            <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Target className="w-6 h-6 text-green-600" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-slate-900">En pipeline</h3>
                  <p className="text-sm text-slate-600">Opportunités actives</p>
                </div>
              </div>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-3xl font-bold text-green-600"
              >
                <AnimatedCounter value={stats?.inPipeline || 0} />
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-xl transform rotate-1" />
            <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Award className="w-6 h-6 text-blue-600" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-slate-900">Gagnées</h3>
                  <p className="text-sm text-slate-600">Opportunités signées</p>
                </div>
              </div>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-3xl font-bold text-blue-600"
              >
                <AnimatedCounter value={stats?.won || 0} />
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-xl transform rotate-1" />
            <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-slate-900">Perdues</h3>
                  <p className="text-sm text-slate-600">Opportunités perdues</p>
                </div>
              </div>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="text-3xl font-bold text-red-600"
              >
                <AnimatedCounter value={stats?.lost || 0} />
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Taux de conversion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
          <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
            <h3 className="text-xl font-bold text-slate-900 mb-4 relative">Taux de conversion</h3>
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-lg"
              >
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </motion.div>
              <div>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-4xl font-bold text-purple-600"
                >
                  <AnimatedCounter value={stats?.conversionRate || 0} suffix="%" />
                </motion.p>
                <p className="text-slate-600 mt-1">des opportunités sont converties</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
          <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-100/50 to-transparent rounded-full blur-2xl" />
            <h3 className="text-xl font-bold text-slate-900 mb-4 relative">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/opportunites/create')}
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-all"
              >
                <Target className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-slate-900">Nouvelle opportunité</span>
              </button>
              <button
                onClick={() => router.push('/projets/create')}
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-lg transition-all"
              >
                <Building2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-slate-900">Nouveau projet</span>
              </button>
              <button
                onClick={() => router.push('/opportunites')}
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition-all"
              >
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-slate-900">Voir le pipeline</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
