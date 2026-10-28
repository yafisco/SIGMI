'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Plus, Briefcase, Calendar, MapPin, DollarSign, Search, Filter, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { postesService } from '@/lib/services';
import { Poste } from '@/types';
import Swal from 'sweetalert2';

export default function PostesPage() {
  const [postes, setPostes] = useState<Poste[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [stats, setStats] = useState({ total: 0, ouvert: 0, ferme: 0, pourvu: 0 });

  useEffect(() => {
    async function fetchData() {
      const [postesData, statsData] = await Promise.all([
        postesService.getAll(),
        postesService.getStats(),
      ]);
      setPostes(postesData);
      setStats(statsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredPostes = postes.filter(p => {
    const matchesSearch = p.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.departement && p.departement.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatut = filterStatut === 'all' || p.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Ce poste sera supprimé définitivement',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await postesService.delete(id);
        setPostes(postes.filter(p => p.id !== id));
        Swal.fire('Supprimé !', 'Le poste a été supprimé', 'success');
      } catch (error) {
        Swal.fire('Erreur', 'Impossible de supprimer le poste', 'error');
      }
    }
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      ouvert: 'bg-green-100 text-green-700',
      ferme: 'bg-red-100 text-red-700',
      pourvu: 'bg-blue-100 text-blue-700',
    };
    return colors[statut] || colors.ouvert;
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'ferme': return Lock;
      case 'pourvu': return CheckCircle2;
      default: return ClipboardCheck;
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return '-';
    if (min && max) return `${min.toLocaleString('fr-FR')} - ${max.toLocaleString('fr-FR')} FCFA`;
    if (min) return `${min.toLocaleString('fr-FR')} FCFA`;
    return `${max?.toLocaleString('fr-FR')} FCFA`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Postes"
        description="Gestion des postes ouverts et des fiches de poste"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Total Postes</span>
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Ouverts</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.ouvert}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Pourvus</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.pourvu}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-slate-600">Fermés</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.ferme}</p>
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
                placeholder="Rechercher un poste..."
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
              <option value="ouvert">Ouverts</option>
              <option value="ferme">Fermés</option>
              <option value="pourvu">Pourvus</option>
            </select>
          </div>
          <Link href="/recrutement/postes/create">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau poste
            </Button>
          </Link>
        </motion.div>

        {/* Postes List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">
              Liste des postes ({filteredPostes.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600">Chargement...</div>
          ) : filteredPostes.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-600 mb-4">Aucun poste trouvé</p>
              <Link href="/recrutement/postes/create">
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] text-[#1D4ED8]">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer le premier poste
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPostes.map((poste, index) => {
                const StatutIcon = getStatutIcon(poste.statut);
                return (
                  <motion.div
                    key={poste.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    className="p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-slate-900">{poste.titre}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(poste.statut)}`}>
                            {poste.statut}
                          </span>
                          {poste.type_contrat && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {poste.type_contrat}
                            </span>
                          )}
                        </div>
                        {poste.description && (
                          <p className="text-sm text-slate-600 mb-3">{poste.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-slate-600 mb-3">
                          {poste.departement && <span>Département: {poste.departement}</span>}
                          {poste.lieu && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{poste.lieu}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatSalary(poste.salaire_min, poste.salaire_max)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Publié le {formatDate(poste.date_publication)}</span>
                          </div>
                          {poste.date_limite && (
                            <span>Limite: {formatDate(poste.date_limite)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link href={`/recrutement/postes/${poste.id}`}>
                          <Button variant="ghost" size="sm">
                            <StatutIcon className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/recrutement/postes/${poste.id}/edit`}>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(poste.id)}>
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
