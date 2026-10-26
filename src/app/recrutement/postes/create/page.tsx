'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { postesService } from '@/lib/services';
import { errorMessage } from '@/lib/utils/errorHandler';
import { CreatePosteInput } from '@/types';

export default function CreatePostePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreatePosteInput>({
    titre: '',
    description: '',
    departement: '',
    type_contrat: 'CDI',
    lieu: '',
    salaire_min: 0,
    salaire_max: 0,
    statut: 'ouvert',
    competences_requises: [],
    date_limite: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newCompetence, setNewCompetence] = useState('');

  const typesContrat = [
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'Freelance', label: 'Freelance' },
    { value: 'Stage', label: 'Stage' },
  ];

  const statuts = [
    { value: 'ouvert', label: 'Ouvert' },
    { value: 'ferme', label: 'Fermé' },
    { value: 'pourvu', label: 'Pourvu' },
  ];

  const addCompetence = () => {
    if (newCompetence && !formData.competences_requises?.includes(newCompetence)) {
      setFormData({ ...formData, competences_requises: [...(formData.competences_requises || []), newCompetence] });
      setNewCompetence('');
    }
  };

  const removeCompetence = (competence: string) => {
    setFormData({ ...formData, competences_requises: formData.competences_requises?.filter(c => c !== competence) || [] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.titre) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      await postesService.create(formData);
      router.push('/recrutement/postes');
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la création du poste'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/recrutement/postes">
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] bg-clip-text text-transparent">
                Nouveau poste
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
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Informations du poste</h2>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Titre du poste *</label>
                  <input
                    type="text"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    placeholder="Ex: Développeur Full Stack"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    rows={4}
                    placeholder="Description détaillée du poste..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Département</label>
                    <input
                      type="text"
                      value={formData.departement}
                      onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      placeholder="Ex: IT, Marketing..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Type de contrat</label>
                    <select
                      value={formData.type_contrat}
                      onChange={(e) => setFormData({ ...formData, type_contrat: e.target.value as any })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    >
                      {typesContrat.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Lieu</label>
                    <input
                      type="text"
                      value={formData.lieu}
                      onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      placeholder="Ex: Thiès, Dakar, Remote..."
                    />
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Salaire minimum (FCFA)</label>
                    <input
                      type="number"
                      value={formData.salaire_min}
                      onChange={(e) => setFormData({ ...formData, salaire_min: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Salaire maximum (FCFA)</label>
                    <input
                      type="number"
                      value={formData.salaire_max}
                      onChange={(e) => setFormData({ ...formData, salaire_max: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date limite de candidature</label>
                  <input
                    type="date"
                    value={formData.date_limite}
                    onChange={(e) => setFormData({ ...formData, date_limite: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Compétences requises</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCompetence}
                      onChange={(e) => setNewCompetence(e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg"
                      placeholder="Ex: React, TypeScript, Node.js..."
                    />
                    <Button type="button" onClick={addCompetence} variant="outline" size="sm">
                      Ajouter
                    </Button>
                  </div>
                  {formData.competences_requises && formData.competences_requises.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.competences_requises.map((competence, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm flex items-center gap-2">
                          {competence}
                          <button type="button" onClick={() => removeCompetence(competence)} className="hover:text-blue-900">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/recrutement/postes">
                <Button variant="outline" disabled={loading}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Création...' : 'Créer le poste'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
