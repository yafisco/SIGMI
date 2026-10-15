'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FolderKanban, Calendar, DollarSign, Users, Save, Flag, Building2 } from 'lucide-react';
import Link from 'next/link';
import { projetsService } from '@/lib/services';

export default function CreateProjetPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    poles: [''],
    statut: 'en_cours',
    priorite: 'moyenne',
    date_debut: '',
    date_fin_prevue: '',
    budget_estime: '',
    responsable_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await projetsService.create({
        nom: formData.nom,
        description: formData.description,
        poles: formData.poles.filter(p => p !== '') as any,
        statut: formData.statut as any,
        priorite: formData.priorite as any,
        date_debut: formData.date_debut || null,
        date_fin_prevue: formData.date_fin_prevue || null,
        budget_estime: formData.budget_estime ? parseFloat(formData.budget_estime) : null,
        responsable_id: formData.responsable_id || null,
      });
      router.push('/projets');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du projet');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/projets">
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#D4AF37] bg-clip-text text-transparent">
                Nouveau projet
              </h1>
              <p className="text-slate-600 text-sm mt-0.5">Créez un nouveau projet</p>
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
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Détails du projet</h2>
                  <p className="text-slate-500 text-sm">Informations principales</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-[#1D4ED8]" />
                    Nom du projet *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-[#1D4ED8]" />
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    rows={3}
                    placeholder="Description du projet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1D4ED8]" />
                    Pôle(s)
                  </label>
                  <input
                    type="text"
                    value={formData.poles[0]}
                    onChange={(e) => setFormData({ ...formData, poles: [e.target.value] })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    placeholder="Ingénierie informatique"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Flag className="w-4 h-4 text-[#1D4ED8]" />
                      Statut
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    >
                      <option value="en_cours">En cours</option>
                      <option value="planifié">Planifié</option>
                      <option value="terminé">Terminé</option>
                      <option value="suspendu">Suspendu</option>
                      <option value="annulé">Annulé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Flag className="w-4 h-4 text-[#1D4ED8]" />
                      Priorité
                    </label>
                    <select
                      value={formData.priorite}
                      onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    >
                      <option value="basse">Basse</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="haute">Haute</option>
                      <option value="critique">Critique</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#1D4ED8]" />
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={formData.date_debut}
                      onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#1D4ED8]" />
                      Date de fin prévue
                    </label>
                    <input
                      type="date"
                      value={formData.date_fin_prevue}
                      onChange={(e) => setFormData({ ...formData, date_fin_prevue: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#1D4ED8]" />
                      Budget (FCFA)
                    </label>
                    <input
                      type="number"
                      value={formData.budget_estime}
                      onChange={(e) => setFormData({ ...formData, budget_estime: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                      placeholder="50000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#1D4ED8]" />
                      Responsable
                    </label>
                    <input
                      type="text"
                      value={formData.responsable_id}
                      onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                      placeholder="Nom du responsable"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/projets">
                <Button variant="outline" className="px-6 py-3 rounded-xl hover:bg-slate-100" disabled={loading}>
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] hover:from-[#B89B6E] hover:to-[#D4AF37] text-[#1D4ED8] shadow-lg border-2 border-[#D4AF37] px-6 py-3 rounded-xl transition-all hover:scale-105">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Création...' : 'Créer le projet'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
