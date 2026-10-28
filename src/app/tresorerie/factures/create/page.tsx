'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, DollarSign, Calendar, User, Save, Plus } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/hooks/useWorkspace';
import { errorMessage } from '@/lib/utils/errorHandler';

function CreateFacturePageContent() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '';
  const [formData, setFormData] = useState({
    numero: '',
    client_id: '',
    montant: '',
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: '',
    description: '',
    statut: 'en_attente',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);

  const getBackLink = () => {
    if (from === 'tresorerie') return '/tresorerie';
    if ((workspace as any) === 'tresorerie') return '/tresorerie';
    return '/tresorerie/factures';
  };

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase.from('clients').select('id, nom').order('nom');
      setClients(data || []);
    }
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.from('factures').insert({
        numero: formData.numero,
        // Postgres refuse '' pour un uuid ou une date
        client_id: formData.client_id || null,
        montant: parseFloat(formData.montant),
        date_emission: formData.date_emission,
        date_echeance: formData.date_echeance || null,
        description: formData.description,
        statut: formData.statut,
      });

      if (error) throw error;
      router.push(getBackLink());
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la création de la facture'));
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
                Nouvelle facture
              </h1>
              <p className="text-slate-600 text-sm mt-0.5">Créez une nouvelle facture client</p>
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
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Informations de la facture</h2>
                  <p className="text-slate-500 text-sm">Détails de la facture</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1D4ED8]" />
                    Numéro de facture *
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    placeholder="FAC-2024-001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#1D4ED8]" />
                    Client *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    required
                  >
                    <option value="">Sélectionnez un client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#1D4ED8]" />
                      Montant (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={formData.montant}
                      onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                      placeholder="5000000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#1D4ED8]" />
                      Statut
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    >
                      <option value="en_attente">En attente</option>
                      <option value="payée">Payée</option>
                      <option value="annulée">Annulée</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#1D4ED8]" />
                      Date d&apos;émission *
                    </label>
                    <input
                      type="date"
                      value={formData.date_emission}
                      onChange={(e) => setFormData({ ...formData, date_emission: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#1D4ED8]" />
                      Date d&apos;échéance
                    </label>
                    <input
                      type="date"
                      value={formData.date_echeance}
                      onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1D4ED8]" />
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                    rows={3}
                    placeholder="Description de la facture"
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
              <Link href="/tresorerie/factures">
                <Button variant="outline" className="px-6 py-3 rounded-xl hover:bg-slate-100" disabled={loading}>
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] hover:from-[#B89B6E] hover:to-[#D4AF37] text-[#1D4ED8] shadow-lg border-2 border-[#D4AF37] px-6 py-3 rounded-xl transition-all hover:scale-105">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Création...' : 'Créer la facture'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// useSearchParams exige une frontière <Suspense> pour le prerender
export default function CreateFacturePage() {
  return (
    <Suspense>
      <CreateFacturePageContent />
    </Suspense>
  );
}
