'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Plus, Users, Clock, FileText, Search, Filter, Calendar, CheckCircle2, XCircle, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { candidaturesService } from '@/lib/services';
import { Candidature } from '@/types';
import Swal from 'sweetalert2';

export default function CandidaturesPage() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [stats, setStats] = useState({ total: 0, enAttente: 0, enRevision: 0, entretien: 0, accepte: 0 });

  useEffect(() => {
    async function fetchData() {
      const [candidaturesData, statsData] = await Promise.all([
        candidaturesService.getAll(),
        candidaturesService.getStats(),
      ]);
      setCandidatures(candidaturesData);
      setStats(statsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredCandidatures = candidatures.filter(c => {
    const matchesSearch = c.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (c.poste_nom && c.poste_nom.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatut = filterStatut === 'all' || c.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette candidature sera supprimée définitivement',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await candidaturesService.delete(id);
        setCandidatures(candidatures.filter(c => c.id !== id));
        Swal.fire('Supprimé !', 'La candidature a été supprimée', 'success');
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer la candidature', 'error');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      en_attente: 'bg-amber-100 text-amber-700',
      en_revision: 'bg-blue-100 text-blue-700',
      entretien: 'bg-purple-100 text-purple-700',
      accepte: 'bg-green-100 text-green-700',
      refuse: 'bg-red-100 text-red-700',
    };
    return colors[statut] || colors.en_attente;
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'en_revision': return FileText;
      case 'entretien': return Clock;
      case 'accepte': return CheckCircle2;
      case 'refuse': return XCircle;
      default: return UserPlus;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Candidatures"
        description="Suivi des candidatures et du processus de recrutement"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">En attente</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.enAttente}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">En révision</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.enRevision}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Entretien</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.entretien}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Acceptées</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.accepte}</p>
          </motion.div>
        </div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4 justify-between"
        >
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une candidature..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_revision">En révision</option>
              <option value="entretien">Entretien</option>
              <option value="accepte">Acceptées</option>
              <option value="refuse">Refusées</option>
            </select>
          </div>
          <Link href="/recrutement/candidatures/create">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle candidature
            </Button>
          </Link>
        </motion.div>

        {/* Candidatures List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              Liste des candidatures ({filteredCandidatures.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600">Chargement...</div>
          ) : filteredCandidatures.length === 0 ? (
            <div className="p-12 text-center">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 mb-4">Aucune candidature trouvée</p>
              <Link href="/recrutement/candidatures/create">
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer la première candidature
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCandidatures.map((candidature, index) => {
                const StatutIcon = getStatutIcon(candidature.statut);
                return (
                  <motion.div
                    key={candidature.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    className="p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-slate-900">{candidature.nom_complet}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(candidature.statut)}`}>
                            {candidature.statut}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{candidature.email}</p>
                        {candidature.telephone && (
                          <p className="text-sm text-slate-600 mb-2">{candidature.telephone}</p>
                        )}
                        {candidature.poste_nom && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <Briefcase className="w-4 h-4" />
                            <span>{candidature.poste_nom}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(candidature.date_candidature)}</span>
                          </div>
                          {candidature.experience_annees !== undefined && (
                            <span>Expérience: {candidature.experience_annees} ans</span>
                          )}
                          {candidature.note && (
                            <span>Note: {candidature.note}/5</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link href={`/recrutement/candidatures/${candidature.id}`}>
                          <Button variant="ghost" size="sm">
                            <StatutIcon className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/recrutement/candidatures/${candidature.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(candidature.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
