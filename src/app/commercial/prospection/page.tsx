'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, FileText, Award, BarChart3, ArrowLeft, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface StatProspection {
  totalProspects: number;
  contactsEtablis: number;
  demandesAgrrement: number;
  opportunitesEnCours: number;
  contratsConclus: number;
}

export default function ProspectionPage() {
  const [stats, setStats] = useState<StatProspection>({
    totalProspects: 0,
    contactsEtablis: 0,
    demandesAgrrement: 0,
    opportunitesEnCours: 0,
    contratsConclus: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [prospects, contacts, agréments, opportunites, contrats] = await Promise.all([
        supabase.from('clients').select('id').eq('statut', 'prospect'),
        supabase.from('interactions').select('id').gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('demandes_agrement').select('id'),
        supabase.from('opportunities').select('id').in('statut', ['en_cours', 'negociation']),
        supabase.from('opportunities').select('id').eq('statut', 'gagne'),
      ]);

      setStats({
        totalProspects: prospects.data?.length || 0,
        contactsEtablis: contacts.data?.length || 0,
        demandesAgrrement: agréments.data?.length || 0,
        opportunitesEnCours: opportunites.data?.length || 0,
        contratsConclus: contrats.data?.length || 0,
      });
      setLoading(false);
    }
    fetchStats();

    // Synchronisation en temps réel
    const channels = [
      supabase
        .channel('clients_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchStats())
        .subscribe(),
      supabase
        .channel('interactions_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'interactions' }, () => fetchStats())
        .subscribe(),
      supabase
        .channel('demandes_agrement_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'demandes_agrement' }, () => fetchStats())
        .subscribe(),
      supabase
        .channel('opportunities_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, () => fetchStats())
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Prospection Commerciale"
        description="Processus complet de prospection du GROUP MI"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/commercial">
            <button className="flex items-center gap-2 text-slate-600 hover:text-[#1D4ED8] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Retour à Commercial
            </button>
          </Link>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Prospects</p>
                <p className="text-xl font-bold text-slate-900">{loading ? '-' : stats.totalProspects}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Contacts (30j)</p>
                <p className="text-xl font-bold text-slate-900">{loading ? '-' : stats.contactsEtablis}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Agréments</p>
                <p className="text-xl font-bold text-slate-900">{loading ? '-' : stats.demandesAgrrement}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Opportunités</p>
                <p className="text-xl font-bold text-slate-900">{loading ? '-' : stats.opportunitesEnCours}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Contrats</p>
                <p className="text-xl font-bold text-slate-900">{loading ? '-' : stats.contratsConclus}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 flex gap-4"
        >
          <Link href="/clients/create">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau prospect
            </Button>
          </Link>
          <Link href="/commercial/demandes-agrement/create">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Nouvelle demande d'agrément
            </Button>
          </Link>
          <Link href="/opportunites/create">
            <Button variant="outline">
              <Award className="w-4 h-4 mr-2" />
              Nouvelle opportunité
            </Button>
          </Link>
          <Link href="/commercial/prospection/evaluation">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Voir l'évaluation
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
