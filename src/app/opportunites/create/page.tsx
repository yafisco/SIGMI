'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, Calendar, Building2, Save, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';
import { opportunitiesService, clientsService } from '@/lib/services';

interface Client {
  id: string;
  nom: string;
}

export default function CreateOpportunityPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    amount: '',
    probability: 50,
    stage: 'nouveau',
    expected_close_date: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsService.getAll();
      setClients(data);
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await opportunitiesService.create({
        name: formData.name,
        client_id: formData.client_id || null,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        probability: formData.probability,
        stage: formData.stage as any,
        expected_close_date: formData.expected_close_date || null,
        description: formData.description,
      });
      router.push('/opportunites');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'opportunité');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/opportunites">
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
                  <h2 className="text-xl font-bold text-slate-900">Détails de l'opportunité</h2>
                  <p className="text-slate-500 text-sm">Informations principales</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#1D4ED8]" />
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    required
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
                      onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
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
                      onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
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
              <Link href="/opportunites">
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
