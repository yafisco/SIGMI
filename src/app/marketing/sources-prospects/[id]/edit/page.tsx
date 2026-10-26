'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Radio } from 'lucide-react';
import Link from 'next/link';
import { sourcesProspectsService } from '@/lib/services';
import { errorMessage } from '@/lib/utils/errorHandler';
import { UpdateSourceProspectInput } from '@/types';

export default function EditSourceProspectPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    description: '',
    conversion_rate: 0,
    qualite_leads: 'moyenne' as const,
    actif: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  const qualites = [
    { value: 'haute', label: 'Haute' },
    { value: 'moyenne', label: 'Moyenne' },
    { value: 'faible', label: 'Faible' },
  ];

  useEffect(() => {
    async function fetchSource() {
      const data = await sourcesProspectsService.getById(params.id as string);
      if (data) {
        setFormData({
          nom: data.nom,
          type: data.type,
          description: data.description || '',
          conversion_rate: data.conversion_rate || 0,
          qualite_leads: data.qualite_leads,
          actif: data.actif,
        });
      }
      setInitialLoading(false);
    }
    fetchSource();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.nom || !formData.type) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      await sourcesProspectsService.update({
        id: params.id as string,
        ...formData,
      });
      router.push(`/marketing/sources-prospects/${params.id}`);
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la modification de la source'));
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
            <Link href={`/marketing/sources-prospects/${params.id}`}>
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] bg-clip-text text-transparent">
                Modifier la source
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
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Informations de la source</h2>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nom de la source *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Type *</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Taux de conversion (%)</label>
                    <input
                      type="number"
                      value={formData.conversion_rate}
                      onChange={(e) => setFormData({ ...formData, conversion_rate: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Qualité des leads</label>
                    <select
                      value={formData.qualite_leads}
                      onChange={(e) => setFormData({ ...formData, qualite_leads: e.target.value as any })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    >
                      {qualites.map(qualite => (
                        <option key={qualite.value} value={qualite.value}>{qualite.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="actif"
                    checked={formData.actif}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="actif" className="text-sm text-slate-700">Source active</label>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href={`/marketing/sources-prospects/${params.id}`}>
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
