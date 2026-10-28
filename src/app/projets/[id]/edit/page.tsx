'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FolderKanban, Calendar, DollarSign, Users, Save, Flag, Building2 } from 'lucide-react';
import Link from 'next/link';
import { collaborateursService, projetsService } from '@/lib/services';
import { errorMessage } from '@/lib/utils/errorHandler';
import { useData } from '@/hooks/useData';
import { POLE_OPTIONS, PROJECT_PRIORITY_OPTIONS, PROJECT_STATUS_OPTIONS } from '@/lib/constants';
import type { Pole, ProjectPriority, ProjectStatus } from '@/types';

export default function EditProjetPage() {
  const params = useParams();
  const router = useRouter();
  const { data: collaborateurs } = useData({ fetchFn: () => collaborateursService.getAll() });
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    pole: '',
    statut: 'planifié' as ProjectStatus,
    priorite: 'moyenne' as ProjectPriority,
    date_debut: '',
    date_fin_prevue: '',
    budget_estime: '',
    responsable_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function fetchProjet() {
      const data = await projetsService.getById(params.id as string);
      if (data) {
        setFormData({
          nom: data.nom,
          description: data.description || '',
          pole: data.poles?.[0] || '',
          statut: data.statut,
          priorite: data.priorite,
          date_debut: data.date_debut || '',
          date_fin_prevue: data.date_fin_prevue || '',
          budget_estime: data.budget_estime?.toString() || '',
          responsable_id: data.responsable_id || '',
        });
      }
      setInitialLoading(false);
    }
    fetchProjet();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await projetsService.update({
        id: params.id as string,
        nom: formData.nom,
        description: formData.description,
        poles: formData.pole ? [formData.pole as Pole] : [],
        statut: formData.statut,
        priorite: formData.priorite,
        date_debut: formData.date_debut || undefined,
        date_fin_prevue: formData.date_fin_prevue || undefined,
        budget_estime: formData.budget_estime ? parseFloat(formData.budget_estime) : undefined,
        responsable_id: formData.responsable_id || undefined,
      });
      router.push(`/projets/${params.id}`);
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la modification du projet'));
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/projets/${params.id}`}>
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#D4AF37] bg-clip-text text-transparent">
                Modifier le projet
              </h1>
              <p className="text-slate-600 text-sm mt-0.5">Modifiez les informations du projet</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg shadow-blue-100/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] flex items-center justify-center shadow-lg">
                  <FolderKanban className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Informations générales</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nom du projet *</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    placeholder="Nom du projet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    placeholder="Description du projet..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pôle</label>
                    <select
                      value={formData.pole}
                      onChange={(e) => setFormData({ ...formData, pole: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    >
                      <option value="">Sélectionner un pôle</option>
                      {POLE_OPTIONS.map((pole) => (
                        <option key={pole.value} value={pole.value}>{pole.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Responsable</label>
                    <select
                      value={formData.responsable_id}
                      onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    >
                      <option value="">Sélectionner un responsable</option>
                      {collaborateurs?.map((collab) => (
                        <option key={collab.id} value={collab.id}>
                          {collab.prenom} {collab.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Statut</label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value as ProjectStatus })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    >
                      {PROJECT_STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Priorité</label>
                    <select
                      value={formData.priorite}
                      onChange={(e) => setFormData({ ...formData, priorite: e.target.value as ProjectPriority })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    >
                      {PROJECT_PRIORITY_OPTIONS.map((priority) => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date de début</label>
                    <input
                      type="date"
                      value={formData.date_debut}
                      onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date de fin prévue</label>
                    <input
                      type="date"
                      value={formData.date_fin_prevue}
                      onChange={(e) => setFormData({ ...formData, date_fin_prevue: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Budget estimé (FCFA)</label>
                  <input
                    type="number"
                    value={formData.budget_estime}
                    onChange={(e) => setFormData({ ...formData, budget_estime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                    placeholder="Budget estimé"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Link href={`/projets/${params.id}`}>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
