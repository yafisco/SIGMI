'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  FolderKanban,
  FileText,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Zap,
  Shield,
  Clock,
  Globe,
  Sparkles,
  Star,
  Layers,
  Target,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedSection } from '@/components/AnimatedSection';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { usePoleStats } from '@/hooks/usePoleStats';
import { POLE_OPTIONS } from '@/lib/constants';
import { usePoleFilter } from '@/hooks/usePoleFilter';

const features = [
  {
    icon: Users,
    title: 'Annuaire Centralisé',
    description: 'Gérez tous les collaborateurs avec leurs rôles, pôles d\'affectation et informations de contact.',
    color: 'from-blue-400 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
  },
  {
    icon: FolderKanban,
    title: 'Gestion de Projets',
    description: 'Suivez l\'avancement des projets multi-pôles avec des indicateurs de progression et budgétaires.',
    color: 'from-amber-400 to-amber-600',
    bgGradient: 'from-amber-50 to-amber-100',
  },
  {
    icon: FileText,
    title: 'Documents Centralisés',
    description: 'Centralisez tous les documents avec classification par type, tags et association aux projets.',
    color: 'from-purple-400 to-purple-600',
    bgGradient: 'from-purple-50 to-purple-100',
  },
  {
    icon: BarChart3,
    title: 'Dashboard 360°',
    description: 'Visualisez l\'ensemble des activités avec des tableaux de bord consolidés par pôle et par projet.',
    color: 'from-green-400 to-green-600',
    bgGradient: 'from-green-50 to-green-100',
  },
];

const benefits = [
  'Vision 360° sur tous les pôles d\'activité',
  'Centralisation des données clients et projets',
  'Suivi budgétaire en temps réel',
  'Collaboration améliorée entre équipes',
  'Historisation complète des actions',
  'Accès sécurisé par rôle',
];

const poles = [
  {
    name: 'Ingénierie Informatique',
    description: 'Développement de solutions logicielles et infrastructure IT',
    icon: '💻',
  },
  {
    name: 'Génie Civil et BTP',
    description: 'Construction et gestion de projets immobiliers',
    icon: '🏗️',
  },
  {
    name: 'Agrobusiness',
    description: 'Production agricole et transformation alimentaire',
    icon: '🌾',
  },
  {
    name: 'Trading International',
    description: 'Import-export et logistique internationale',
    icon: '🚢',
  },
  {
    name: 'Transition Énergétique',
    description: 'Énergies renouvelables et solutions durables',
    icon: '⚡',
  },
  {
    name: 'Centre d\'Incubation',
    description: 'Accompagnement de startups et innovation',
    icon: '🚀',
  },
];

function PoleStatsSection() {
  const { pole: userPole, shouldFilter, user } = usePoleFilter();
  const { allStats, loading, error } = usePoleStats();

  // Filtrer les stats si l'utilisateur n'est pas admin
  const displayStats = shouldFilter && userPole
    ? allStats.filter(stat => stat.pole === userPole)
    : allStats;

  // Déterminer si les cartes sont cliquables (seulement pour les admins)
  const canClickPoles = user?.canSeeAllPoles || false;

  const formatAmount = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return `${(value / 1000).toFixed(0)}K`;
  };

  if (loading) {
    return (
      <div className="text-center py-8 md:py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-600 text-sm sm:text-base">Chargement des statistiques...</p>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {displayStats.map((stat, index) => {
        const poleOption = POLE_OPTIONS.find((p) => p.value === stat.pole);
        const poleLabel = poleOption?.label || stat.pole;
        const colors = [
          'from-blue-400 to-blue-600',
          'from-orange-400 to-orange-600',
          'from-green-400 to-green-600',
          'from-purple-400 to-purple-600',
          'from-yellow-400 to-yellow-600',
          'from-pink-400 to-pink-600',
        ];
        const bgColors = [
          'from-blue-50 to-blue-100',
          'from-orange-50 to-orange-100',
          'from-green-50 to-green-100',
          'from-purple-50 to-purple-100',
          'from-yellow-50 to-yellow-100',
          'from-pink-50 to-pink-100',
        ];
        const color = colors[index % colors.length];
        const bgColor = bgColors[index % bgColors.length];

        const CardContent = (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
            viewport={{ once: true }}
            whileHover={canClickPoles ? { scale: 1.05, y: -10 } : {}}
            className={`group relative ${canClickPoles ? 'cursor-pointer' : ''}`}
          >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2 group-hover:rotate-4 transition-all duration-500" />
              <div className={`relative bg-gradient-to-br ${bgColor} rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl border border-white/50 transition-all duration-500 overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-white/50 to-transparent rounded-full blur-2xl group-hover:from-white/70 transition-all duration-500" />
                <div className="flex items-center justify-between mb-3 sm:mb-4 relative">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{poleLabel}</h3>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center shadow-lg`}
                  >
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </motion.div>
                </div>
                <div className="grid grid-cols-2 gap-2 relative">
                  <div className="text-center p-2 bg-white/60 rounded-xl">
                    <p className="text-[10px] sm:text-xs text-slate-600 mb-1">Opps</p>
                    <p className="text-sm sm:text-lg font-bold text-slate-900">
                      <AnimatedCounter value={stat.totalOpportunities} />
                    </p>
                  </div>
                  <div className="text-center p-2 bg-white/60 rounded-xl">
                    <p className="text-[10px] sm:text-xs text-slate-600 mb-1">Projets</p>
                    <p className="text-sm sm:text-lg font-bold text-slate-900">
                      <AnimatedCounter value={stat.totalProjects} />
                    </p>
                  </div>
                  <div className="text-center p-2 bg-white/60 rounded-xl">
                    <p className="text-[10px] sm:text-xs text-slate-600 mb-1">Valeur</p>
                    <p className="text-[10px] sm:text-sm font-bold text-slate-900">{formatAmount(stat.totalValue)}</p>
                  </div>
                  <div className="text-center p-2 bg-white/60 rounded-xl">
                    <p className="text-[10px] sm:text-xs text-slate-600 mb-1">Conversion</p>
                    <p className="text-[10px] sm:text-sm font-bold text-slate-900">
                      <AnimatedCounter value={stat.conversionRate} suffix="%" />
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
        );

        // Envelopper dans un Link seulement si l'utilisateur est admin
        return canClickPoles ? (
          <Link key={stat.pole} href={`/poles/${encodeURIComponent(stat.pole)}`}>
            {CardContent}
          </Link>
        ) : (
          <div key={stat.pole}>{CardContent}</div>
        );
      })}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1D4ED8] via-[#2563EB] to-[#0F172A] bg-[length:400%_400%] animate-gradient">
        {/* Animated background elements */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-0 left-0 w-full h-full"
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#D4AF37] to-[#FFE4B5] rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur-3xl opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-10" />
        </motion.div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => {
          const left = ((i * 37) % 100);
          const top = ((i * 53) % 100);
          const duration = 3 + (i % 3);
          const delay = (i % 5) * 0.4;
          
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
              }}
            />
          );
        })}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="space-y-6 md:space-y-8"
            >
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              >
                Centralisez l&apos;activité de GROUP MI
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.6 }}
                  className="inline-block relative"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFE4B5] to-[#D4AF37] bg-[length:200%_auto] animate-gradient">
                    {' '}en un seul système
                  </span>
                  <motion.div
                    className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-transparent"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 1 }}
                  />
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                className="text-base sm:text-lg text-gray-200 max-w-2xl leading-relaxed"
              >
                SIGMI (Système d&apos;Information GROUP MI) offre une vision 360° sur les 6 pôles
                d&apos;activité de l&apos;entreprise : ingénierie, BTP, agrobusiness, trading, énergie et incubation.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#D4AF37] via-[#B89B6E] to-[#D4AF37] bg-[length:200%_auto] animate-gradient hover:scale-105 text-[#1D4ED8] text-lg px-8 h-14 rounded-xl shadow-2xl shadow-[#D4AF37]/50 border-2 border-[#D4AF37] transition-all duration-300 font-semibold"
                    >
                      Démarrer maintenant
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </motion.div>
                </Link>
                <div
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="cursor-pointer"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-2 border-white/50 bg-white/5 hover:bg-white hover:text-[#1D4ED8] hover:scale-105 text-lg px-8 h-14 rounded-xl transition-all duration-300 font-semibold shadow-lg backdrop-blur-sm"
                  >
                    En savoir plus
                  </Button>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
              className="relative"
            >
              <motion.div
                animate={{
                  rotate: [0, 3, -3, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-blue-600 to-[#D4AF37] rounded-3xl transform rotate-3 opacity-30 blur-2xl"
              />
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: Users, value: 150, suffix: '+', label: 'Collaborateurs', color: 'blue' },
                    { icon: FolderKanban, value: 45, label: 'Projets actifs', color: 'amber' },
                    { icon: FileText, value: 2500, suffix: '+', label: 'Documents', color: 'purple' },
                    { icon: BarChart3, value: 6, label: 'Pôles', color: 'green' },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className={`text-center p-4 sm:p-6 bg-gradient-to-br ${stat.color === 'blue' ? 'from-blue-50 to-blue-100' : stat.color === 'amber' ? 'from-amber-50 to-amber-100' : stat.color === 'purple' ? 'from-purple-50 to-purple-100' : 'from-green-50 to-green-100'} rounded-2xl cursor-pointer transition-all duration-300`}
                    >
                      <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 text-${stat.color}-600 mx-auto mb-2 sm:mb-3`} />
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                        <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                      </div>
                      <div className="text-xs sm:text-sm text-slate-600 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedSection className="py-12 md:py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            {[
              { icon: Building2, value: 6, label: 'Pôles d\'activité' },
              { icon: BarChart3, value: 360, label: 'Vision complète', suffix: '°' },
              { icon: FolderKanban, value: 100, label: 'Centralisé', suffix: '%' },
              { icon: Globe, value: 24, label: 'Accessible', suffix: '/7' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-[#2563EB]/20 rounded-full blur-xl group-hover:bg-[#2563EB]/30 transition-all duration-300" />
                  <stat.icon className="w-10 h-10 text-[#2563EB] mb-4 relative z-10" />
                </motion.div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] bg-clip-text text-transparent mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                </div>
                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection id="features" className="py-24 bg-gradient-to-b from-slate-50 to-white" delay={0.2}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4"
            >
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 text-sm font-semibold">Fonctionnalités principales</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
            >
              Découvrez comment SIGMI transforme la gestion
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Une suite complète d&apos;outils pour centraliser et optimiser toutes vos activités
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  whileHover={{ y: -15, scale: 1.02 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-3xl transform rotate-3 group-hover:rotate-6 transition-all duration-500" />
                  <div className={`relative bg-gradient-to-br ${feature.bgGradient} rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 group-hover:border-opacity-50 cursor-pointer overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl group-hover:from-white/50 transition-all duration-500" />
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}
                    >
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3 relative">{feature.title}</h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed relative">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Benefits Section */}
      <AnimatedSection id="why-us" className="py-24 bg-white" delay={0.3}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-6"
              >
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-green-700 text-sm font-semibold">Pourquoi choisir SIGMI ?</span>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
                Une solution pensée pour votre succès
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    whileHover={{ x: 10 }}
                    className="flex items-start gap-4 group cursor-pointer"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg"
                    >
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-slate-700 text-lg group-hover:text-slate-900 transition-colors">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {[
                { icon: Shield, title: 'Sécurité', desc: 'Données chiffrées et contrôle d\'accès par rôle', color: 'from-blue-400 to-blue-600', bg: 'from-blue-50 to-blue-100' },
                { icon: Clock, title: 'Historisation', desc: 'Traçabilité complète de toutes les actions', color: 'from-amber-400 to-amber-600', bg: 'from-amber-50 to-amber-100' },
                { icon: Globe, title: 'Accessibilité', desc: 'Accès 24/7 depuis n\'importe où', color: 'from-green-400 to-green-600', bg: 'from-green-50 to-green-100' },
                { icon: ChevronRight, title: 'Scalabilité', desc: 'S\'adapte à la croissance de l\'organisation', color: 'from-purple-400 to-purple-600', bg: 'from-purple-50 to-purple-100' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.15, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.08, y: -8 }}
                  className="group relative cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2 group-hover:rotate-4 transition-all duration-500" />
                  <div className={`relative bg-gradient-to-br ${item.bg} rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/50 to-transparent rounded-full blur-2xl" />
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="relative w-12 h-12 bg-gradient-to-br from-white to-white/50 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                    >
                      <item.icon className={`w-6 h-6 bg-gradient-to-br ${item.color} bg-clip-text text-transparent`} />
                    </motion.div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 relative">{item.title}</h3>
                    <p className="text-slate-600 text-sm relative">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* How it Works Section */}
      <AnimatedSection id="how-it-works" className="py-24 bg-gradient-to-b from-white to-slate-50" delay={0.4}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4"
            >
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-purple-700 text-sm font-semibold">Comment ça marche ?</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
            >
              Trois étapes simples pour commencer
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Démarrez en quelques minutes et transformez votre organisation
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200" />
            
            {[
              { step: 1, title: 'Créez votre compte', desc: 'Inscrivez-vous en quelques secondes avec votre adresse e-mail professionnelle', color: 'blue' },
              { step: 2, title: 'Configurez votre espace', desc: 'Définissez vos préférences et ajoutez vos collaborateurs', color: 'purple' },
              { step: 3, title: 'Commencez à utiliser', desc: 'Accédez à toutes les fonctionnalités et centralisez vos activités', color: 'green' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: 'easeOut' }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center relative"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    boxShadow: [
                      '0 0 0 0px rgba(59, 130, 246, 0.7)',
                      '0 0 0 20px rgba(59, 130, 246, 0)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                  className={`relative w-20 h-20 bg-gradient-to-br ${item.color === 'blue' ? 'from-blue-400 to-blue-600' : item.color === 'purple' ? 'from-purple-400 to-purple-600' : 'from-green-400 to-green-600'} rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl`}
                >
                  <span className="text-3xl font-bold text-white">{item.step}</span>
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection id="testimonials" className="py-24 bg-gradient-to-b from-slate-50 to-white" delay={0.5}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4"
            >
              <Star className="w-4 h-4 text-amber-600" />
              <span className="text-amber-700 text-sm font-semibold">Témoignages</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
            >
              Ce que disent nos collaborateurs
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-slate-600 max-w-2xl mx-auto"
            >
              Découvrez comment SIGMI a transformé leur quotidien
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Ibrahim AYAFATI', role: 'Directeur Informatique', icon: Users, color: 'blue', quote: 'SIGMI nous a permis de centraliser toutes nos informations et d\'améliorer la collaboration entre nos équipes. Un vrai gain de temps !' },
              { name: 'Moussa DIOP', role: 'Responsable Projets', icon: FolderKanban, color: 'amber', quote: 'Le suivi des projets est devenu beaucoup plus simple. Je peux voir l\'avancement en temps réel et les budgets sont sous contrôle.' },
              { name: 'Fatou SOW', role: 'Assistante Direction', icon: FileText, color: 'green', quote: 'Tous nos documents sont maintenant centralisés et faciles à retrouver. Fini le temps perdu à chercher des fichiers !' },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: 'easeOut' }}
                viewport={{ once: true }}
                whileHover={{ y: -15, scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-3xl transform -rotate-2 group-hover:rotate-2 transition-all duration-500" />
                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-slate-100 cursor-pointer transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-3xl group-hover:from-blue-200/50 transition-all duration-500" />
                  <div className="flex items-center gap-4 mb-6 relative">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 bg-gradient-to-br ${testimonial.color === 'blue' ? 'from-blue-400 to-blue-600' : testimonial.color === 'amber' ? 'from-amber-400 to-amber-600' : 'from-green-400 to-green-600'} rounded-full flex items-center justify-center shadow-lg`}
                    >
                      <testimonial.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{testimonial.name}</h4>
                      <p className="text-sm text-slate-600 font-medium">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 italic text-lg leading-relaxed relative">&quot;{testimonial.quote}&quot;</p>
                  <div className="mt-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-current" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Poles Section */}
      <AnimatedSection id="poles" className="py-24 bg-gradient-to-br from-[#0F172A] via-[#1D4ED8] via-[#2563EB] to-[#0F172A] bg-[length:400%_400%] animate-gradient" delay={0.6}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-white/20"
            >
              <Layers className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-white text-sm font-semibold">Nos 6 pôles d&apos;activité</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Une diversification stratégique
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-gray-200 max-w-2xl mx-auto"
            >
              Pour une croissance durable et innovante
            </motion.p>
          </div>

          <PoleStatsSection />
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className="py-24 bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#2563EB] bg-[length:200%_auto] animate-gradient" delay={0.7}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-20"
            >
              <Sparkles className="w-16 h-16 text-[#D4AF37]" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative">
              Prêt à unifier la gestion ?
            </h2>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Commencez à utiliser SIGMI dès aujourd&apos;hui et découvrez comment centraliser
              l&apos;ensemble des activités peut transformer l&apos;organisation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#D4AF37] via-[#B89B6E] to-[#D4AF37] bg-[length:200%_auto] animate-gradient hover:scale-105 text-[#1D4ED8] text-lg px-8 h-14 rounded-xl shadow-2xl shadow-[#D4AF37]/50 border-2 border-[#D4AF37] transition-all duration-300 font-semibold"
                  >
                    Démarrer maintenant
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="#features">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-2 border-white/50 bg-white/5 hover:bg-white hover:text-[#1D4ED8] hover:scale-105 text-lg px-8 h-14 rounded-xl transition-all duration-300 font-semibold shadow-lg backdrop-blur-sm"
                  >
                    En savoir plus
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
  );
}
