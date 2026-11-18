'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, DollarSign, Users, Briefcase, MessageSquare, Calendar, Plus, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function CommercialPage() {
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
          const formatName = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
          
          if (data.prenom && data.nom) {
            setUserName(`${formatName(data.prenom)} ${formatName(data.nom)}`);
          } else if (data.prenom) {
            setUserName(formatName(data.prenom));
          } else if (data.nom) {
            setUserName(formatName(data.nom));
          } else if (data.email) {
            const emailName = data.email.split('@')[0];
            setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
          }
        } else if (user.email) {
          const emailName = user.email.split('@')[0];
          setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
      }
    }
    fetchUserName();
  }, [user]);

  const sections = [
    {
      id: 'prospection',
      title: 'Prospection',
      description: 'Gérez vos prospects et campagnes de prospection',
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      link: '/commercial/prospection',
    },
    {
      id: 'clients',
      title: 'Clients',
      description: 'Gérez votre portefeuille de clients',
      icon: Users,
      color: 'from-green-500 to-green-600',
      link: '/clients',
    },
    {
      id: 'interactions',
      title: 'Interactions',
      description: 'Suivez vos communications avec clients et prospects',
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      link: '/commercial/interactions',
    },
    {
      id: 'calendrier',
      title: 'Calendrier',
      description: 'Planifiez vos rendez-vous et événements',
      icon: Calendar,
      color: 'from-amber-500 to-amber-600',
      link: '/commercial/calendrier',
    },
    {
      id: 'opportunites',
      title: 'Opportunités',
      description: 'Gérez votre pipeline commercial',
      icon: Target,
      color: 'from-indigo-500 to-indigo-600',
      link: '/opportunites',
    },
    {
      id: 'demandes-agrement',
      title: 'Demandes d\'agrément',
      description: 'Créez et suivez vos demandes d\'agrément',
      icon: TrendingUp,
      color: 'from-rose-500 to-rose-600',
      link: '/commercial/demandes-agrement',
    },
  ];

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
            Bonjour, {userName || 'Assistante Commerciale et Marketing'} 👋
          </h1>
          <p className="text-white/80 text-lg md:text-xl">
            Espace Assistante Commerciale et Marketing - Prêt à développer les affaires de GROUP MI ?
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>
        </motion.div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={section.link}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer group">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <section.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{section.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{section.description}</p>
                  <div className="flex items-center text-[#1D4ED8] font-medium text-sm group-hover:translate-x-2 transition-transform">
                    Accéder
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Actions rapides</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/opportunites/create">
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
            <Link href="/commercial/demandes-agrement/create">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Demande d'agrément
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
