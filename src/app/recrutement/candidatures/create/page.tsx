'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { candidaturesService } from '@/lib/services';
import { errorMessage } from '@/lib/utils/errorHandler';
import { CreateCandidatureInput } from '@/types';

export default function CreateCandidaturePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateCandidatureInput>({
    nom_complet: '',
    email: '',
    telephone: '',
    poste_nom: '',
    cv_url: '',
    lettre_motivation: '',
    experience_annees: 0,
    competences: [],
    statut: 'en_attente',
    note: 0,
    commentaires: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newCompetence, setNewCompetence] = useState('');

  const statuts = [
    { value: 'en_attente', label: 'En attente' },
    { value: 'en_revision', label: 'En révision' },
    { value: 'entretien', label: 'Entretien' },
    { value: 'accepte', label: 'Accepté' },
    { value: 'refuse', label: 'Refusé' },
  ];

  const addCompetence = () => {
    if (newCompetence && !formData.competences?.includes(newCompetence)) {
      setFormData({ ...formData, competences: [...(formData.competences || []), newCompetence] });
      setNewCompetence('');
    }
  };

  const removeCompetence = (competence: string) => {
    setFormData({ ...formData, competences: formData.competences?.filter(c => c !== competence) || [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.nom_complet || !formData.email) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      await candidaturesService.create(formData);
      router.push('/recrutement/candidatures');
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la création de la candidature'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/recrutement/candidatures">
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] bg-clip-text text-transparent">
                Nouvelle candidature
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] flex items-center justify-center shadow-lg">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Informations du candidat</h2>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nom complet *</label>
                    <input
                      type="text"
                      value={formData.nom_complet}
                      onChange={(e) => setFormData({ ...formData, nom_complet: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Poste visé</label>
                    <input
                      type="text"
                      value={formData.poste_nom}
                      onChange={(e) => setFormData({ ...formData, poste_nom: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">CV (URL)</label>
                  <input
                    type="url"
                    value={formData.cv_url}
                    onChange={(e) => setFormData({ ...formData, cv_url: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Lettre de motivation</label>
                  <textarea
                    value={formData.lettre_motivation}
                    onChange={(e) => setFormData({ ...formData, lettre_motivation: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Années d'expérience</label>
                    <input
                      type="number"
                      value={formData.experience_annees}
                      onChange={(e) => setFormData({ ...formData, experience_annees: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Note (0-5)</label>
                    <input
                      type="number"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      min="0"
                      max="5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Compétences</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCompetence}
                      onChange={(e) => setNewCompetence(e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg"
                      placeholder="Ex: React, TypeScript..."
                    />
                    <Button type="button" onClick={addCompetence} variant="outline" size="sm">
                      Ajouter
                    </Button>
                  </div>
                  {formData.competences && formData.competences.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.competences.map((competence, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm flex items-center gap-2">
                          {competence}
                          <button type="button" onClick={() => removeCompetence(competence)} className="hover:text-blue-900">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                  >
                    {statuts.map(statut => (
                      <option key={statut.value} value={statut.value}>{statut.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Commentaires</label>
                  <textarea
                    value={formData.commentaires}
                    onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/recrutement/candidatures">
                <Button variant="outline" disabled={loading}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Création...' : 'Créer la candidature'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
