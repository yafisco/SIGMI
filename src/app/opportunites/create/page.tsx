'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, Calendar, Building2, Save, TrendingUp, Target, Briefcase, Tag, Users, Search } from 'lucide-react';
import Link from 'next/link';
import { opportunitiesService, clientsService } from '@/lib/services';
import { useWorkspace } from '@/hooks/useWorkspace';
import { POLE_OPTIONS } from '@/lib/constants';
import { errorMessage } from '@/lib/utils/errorHandler';
import { useData } from '@/hooks/useData';
import type { OpportunityStage } from '@/types';

function CreateOpportunityPageContent() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '';
  const [formData, setFormData] = useState({
    reference: '',
    structure_concernee: '',
    secteur_activite: '',
    pole_groupe_mi: '',
    intitule_besoin: '',
    source_opportunite: '',
    name: '',
    client_id: '',
    amount: '',
    probability: '',
    stage: 'nouveau' as OpportunityStage,
    expected_close_date: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: clients, loading: loadingClients } = useData({ fetchFn: () => clientsService.getAll() });

  const getBackLink = () => {
    if (from === 'commercial') return '/commercial';
    if (from === 'tresorerie') return '/tresorerie';
    if (workspace === 'commercial') return '/commercial';
    if (workspace === 'tresorerie') return '/tresorerie';
    return '/opportunites';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await opportunitiesService.create({
        name: formData.intitule_besoin || formData.name,
        reference: formData.reference,
        structure_concernee: formData.structure_concernee,
        secteur_activite: formData.secteur_activite,
        pole_groupe_mi: formData.pole_groupe_mi,
        intitule_besoin: formData.intitule_besoin,
        source_opportunite: formData.source_opportunite,
        client_id: formData.client_id || undefined,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
        probability: formData.probability ? parseInt(formData.probability, 10) : undefined,
        stage: formData.stage,
        expected_close_date: formData.expected_close_date || undefined,
        description: formData.description,
      });
      router.push(getBackLink());
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la création de l\'opportunité'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={getBackLink()}>
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#D4AF37] bg-clip-text text-transparent">
                Nouvelle opportunité
              </h1>
              <p className="text-slate-600 text-sm mt-0.5">Créez une nouvelle opportunité commerciale</p>
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
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Détails de l&apos;opportunité</h2>
                  <p className="text-slate-500 text-sm">Informations principales</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#1D4ED8]" />
                    Référence de l&apos;opportunité *
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    placeholder="Ex: OPP-2024-001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1D4ED8]" />
                    Nom de la structure concernée *
                  </label>
                  <input
                    type="text"
                    value={formData.structure_concernee}
                    onChange={(e) => setFormData({ ...formData, structure_concernee: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    placeholder="Ex: BCEAO, SONATEL"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#1D4ED8]" />
                      Secteur d&apos;activité
                    </label>
                    <input
                      type="text"
                      value={formData.secteur_activite}
                      onChange={(e) => setFormData({ ...formData, secteur_activite: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                      placeholder="Ex: Banque, Télécommunications"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#1D4ED8]" />
                      Pôle du Groupe MI concerné
                    </label>
                    <select
                      value={formData.pole_groupe_mi}
                      onChange={(e) => setFormData({ ...formData, pole_groupe_mi: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    >
                      <option value="">Sélectionner un pôle</option>
                      {POLE_OPTIONS.map((pole) => (
                        <option key={pole.value} value={pole.value}>
                          {pole.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#1D4ED8]" />
                    Intitulé du besoin ou du marché *
                  </label>
                  <input
                    type="text"
                    value={formData.intitule_besoin}
                    onChange={(e) => setFormData({ ...formData, intitule_besoin: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    placeholder="Ex: Développement application mobile, Audit de sécurité"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#1D4ED8]" />
                    Source de l&apos;opportunité
                  </label>
                  <input
                    type="text"
                    value={formData.source_opportunite}
                    onChange={(e) => setFormData({ ...formData, source_opportunite: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    placeholder="Ex: Appel d'offres, Réseau, Partenaire"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1D4ED8]" />
                    Client
                  </label>
                  {loadingClients ? (
                    <div className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-500">
                      Chargement des clients...
                    </div>
                  ) : (
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.nom}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#1D4ED8]" />
                      Montant (FCFA)
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                      placeholder="50000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#1D4ED8]" />
                      Probabilité (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                      placeholder="Optionnel"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#1D4ED8]" />
                      Étape
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value as OpportunityStage })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    >
                      <option value="nouveau">Nouveau</option>
                      <option value="qualifié">Qualifié</option>
                      <option value="proposition">Proposition</option>
                      <option value="négociation">Négociation</option>
                      <option value="gagné">Gagné</option>
                      <option value="perdu">Perdu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#1D4ED8]" />
                      Date de clôture prévue
                    </label>
                    <input
                      type="date"
                      value={formData.expected_close_date}
                      onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#1D4ED8]" />
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    rows={3}
                    placeholder="Description de l'opportunité"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href={getBackLink()}>
                <Button variant="outline" className="px-6 py-3 rounded-xl hover:bg-slate-100" disabled={loading}>
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] hover:from-[#B89B6E] hover:to-[#D4AF37] text-[#1D4ED8] shadow-lg border-2 border-[#D4AF37] px-6 py-3 rounded-xl transition-all hover:scale-105">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Création...' : 'Créer l\'opportunité'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// useSearchParams exige une frontière <Suspense> pour le prerender
export default function CreateOpportunityPage() {
  return (
    <Suspense>
      <CreateOpportunityPageContent />
    </Suspense>
  );
}
