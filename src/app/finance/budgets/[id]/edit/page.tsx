'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Wallet } from 'lucide-react';
import Link from 'next/link';
import { budgetsService } from '@/lib/services';
import { errorMessage } from '@/lib/utils/errorHandler';
import { UpdateBudgetInput } from '@/types';

export default function EditBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    montant_budget: 0,
    pole: '',
    projet_id: '',
    annee: new Date().getFullYear(),
    mois: new Date().getMonth() + 1,
    statut: 'actif' as const,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  const poles = [
    { value: '', label: 'Sélectionner un pôle' },
    { value: 'direction_generale', label: 'Direction Générale' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'finance_comptabilite', label: 'Finance & Comptabilité' },
    { value: 'responsable_pole', label: 'Responsable Pôle' },
    { value: 'back_office', label: 'Back Office' },
  ];

  useEffect(() => {
    async function fetchBudget() {
      const data = await budgetsService.getById(params.id as string);
      if (data) {
        setFormData({
          nom: data.nom,
          description: data.description || '',
          montant_budget: data.montant_budget || 0,
          pole: data.pole || '',
          projet_id: data.projet_id || '',
          annee: data.annee || new Date().getFullYear(),
          mois: data.mois || new Date().getMonth() + 1,
          statut: (data.statut || 'actif') as any,
        });
      }
      setInitialLoading(false);
    }
    fetchBudget();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.nom || !formData.montant_budget || !formData.annee) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      await budgetsService.update({
        id: params.id as string,
        ...formData,
      });
      router.push(`/finance/budgets/${params.id}`);
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la modification du budget'));
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/finance/budgets/${params.id}`}>
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] bg-clip-text text-transparent">
                Modifier le budget
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
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Informations du budget</h2>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nom du budget *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Montant budget (FCFA) *</label>
                  <input
                    type="number"
                    value={formData.montant_budget}
                    onChange={(e) => setFormData({ ...formData, montant_budget: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Pôle</label>
                  <select
                    value={formData.pole}
                    onChange={(e) => setFormData({ ...formData, pole: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                  >
                    {poles.map(pole => (
                      <option key={pole.value} value={pole.value}>{pole.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Année *</label>
                    <input
                      type="number"
                      value={formData.annee}
                      onChange={(e) => setFormData({ ...formData, annee: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      required
                      min="2020"
                      max="2030"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mois</label>
                    <input
                      type="number"
                      value={formData.mois}
                      onChange={(e) => setFormData({ ...formData, mois: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      min="1"
                      max="12"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                  >
                    <option value="actif">Actif</option>
                    <option value="archive">Archivé</option>
                    <option value="depasse">Dépassé</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href={`/finance/budgets/${params.id}`}>
                <Button variant="outline" disabled={loading}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Modification...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
