'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Phone, FileText, Award, ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface EvaluationStats {
  prospectsContactes: number;
  rendezVousObtenus: number;
  opportunitesEnCours: number;
  contratsConclus: number;
  tauxConversion: number;
}

export default function EvaluationProspectionPage() {
  const [stats, setStats] = useState<EvaluationStats>({
    prospectsContactes: 0,
    rendezVousObtenus: 0,
    opportunitesEnCours: 0,
    contratsConclus: 0,
    tauxConversion: 0,
  });
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('30'); // 30 jours par défaut

  useEffect(() => {
    async function fetchStats() {
      const dateDebut = new Date(Date.now() - parseInt(periode) * 24 * 60 * 60 * 1000).toISOString();

      const [prospects, interactions, opportunites, contrats] = await Promise.all([
        supabase.from('clients').select('id').gte('date_creation', dateDebut),
        supabase.from('interactions').select('id').gte('date', dateDebut),
        supabase.from('opportunities').select('id').gte('date_creation', dateDebut).in('statut', ['en_cours', 'negociation']),
        supabase.from('opportunities').select('id').gte('date_creation', dateDebut).eq('statut', 'gagne'),
      ]);

      const prospectsCount = prospects.data?.length || 0;
      const contratsCount = contrats.data?.length || 0;
      const tauxConversion = prospectsCount > 0 ? (contratsCount / prospectsCount) * 100 : 0;

      setStats({
        prospectsContactes: prospectsCount,
        rendezVousObtenus: interactions.data?.length || 0,
        opportunitesEnCours: opportunites.data?.length || 0,
        contratsConclus: contratsCount,
        tauxConversion,
      });
      setLoading(false);
    }
    fetchStats();
  }, [periode]);

  const kpis = [
    {
      id: 'prospects',
      title: 'Prospects contactés',
      value: stats.prospectsContactes,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: 'Nouveaux prospects identifiés',
    },
    {
      id: 'rendez-vous',
      title: 'Rendez-vous obtenus',
      value: stats.rendezVousObtenus,
      icon: Phone,
      color: 'from-green-500 to-green-600',
      description: 'Interactions avec les prospects',
    },
    {
      id: 'opportunites',
      title: 'Opportunités en cours',
      value: stats.opportunitesEnCours,
      icon: Award,
      color: 'from-purple-500 to-purple-600',
      description: 'Opportunités actives dans le pipeline',
    },
    {
      id: 'contrats',
      title: 'Contrats conclus',
      value: stats.contratsConclus,
      icon: FileText,
      color: 'from-emerald-500 to-emerald-600',
      description: 'Opportunités converties en contrats',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Évaluation de la Prospection"
        description="Suivi des résultats et performance de la prospection"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex items-center justify-between"
        >
          <Link href="/commercial/prospection">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour à Prospection
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
              <option value="365">Cette année</option>
            </select>
          </div>
        </motion.div>

        {/* KPIs principaux */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-slate-600 mb-1">{kpi.title}</p>
                <p className="text-3xl font-bold text-slate-900">{loading ? '-' : kpi.value}</p>
                <p className="text-xs text-slate-500 mt-2">{kpi.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Taux de conversion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Taux de conversion</h3>
                <p className="text-sm text-slate-600">Prospects → Contrats</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">{loading ? '-' : stats.tauxConversion.toFixed(1)}%</p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${stats.tauxConversion}%` }}
            />
          </div>
        </motion.div>

        {/* Indicateurs de performance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-slate-600" />
              <h3 className="text-lg font-bold text-slate-900">Répartition par type d'interaction</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Appels téléphoniques</span>
                <span className="text-sm font-semibold text-slate-900">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">E-mails</span>
                <span className="text-sm font-semibold text-slate-900">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Réunions</span>
                <span className="text-sm font-semibold text-slate-900">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Visites</span>
                <span className="text-sm font-semibold text-slate-900">--</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-slate-600" />
              <h3 className="text-lg font-bold text-slate-900">Performance par pôle</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Ingénierie informatique</span>
                <span className="text-sm font-semibold text-slate-900">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Génie civil et BTP</span>
                <span className="text-sm font-semibold text-slate-900">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Agrobusiness</span>
                <span className="text-sm font-semibold text-slate-900">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Trading international</span>
                <span className="text-sm font-semibold text-slate-900">--</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
