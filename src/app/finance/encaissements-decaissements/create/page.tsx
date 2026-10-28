'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { transactionsService } from '@/lib/services';
import { errorMessage } from '@/lib/utils/errorHandler';
import { CreateTransactionInput } from '@/types';

export default function CreateTransactionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateTransactionInput>({
    type: 'encaissement',
    categorie: 'divers',
    montant: 0,
    description: '',
    reference: '',
    pole: '',
    projet_id: '',
    facture_id: '',
    date_transaction: new Date().toISOString().split('T')[0],
    statut: 'en_attente',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const types = [
    { value: 'encaissement', label: 'Encaissement' },
    { value: 'decaissement', label: 'Décaissement' },
  ];

  const categories = [
    { value: 'vente', label: 'Vente' },
    { value: 'achat', label: 'Achat' },
    { value: 'salaire', label: 'Salaire' },
    { value: 'frais', label: 'Frais' },
    { value: 'divers', label: 'Divers' },
  ];

  const poles = [
    { value: '', label: 'Sélectionner un pôle' },
    { value: 'direction_generale', label: 'Direction Générale' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'finance_comptabilite', label: 'Finance & Comptabilité' },
    { value: 'responsable_pole', label: 'Responsable Pôle' },
    { value: 'back_office', label: 'Back Office' },
  ];

  const statuts = [
    { value: 'en_attente', label: 'En attente' },
    { value: 'valide', label: 'Validé' },
    { value: 'annule', label: 'Annulé' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.montant || !formData.description || !formData.date_transaction) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      await transactionsService.create(formData);
      router.push('/finance/encaissements-decaissements');
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la création de la transaction'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/finance/encaissements-decaissements">
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] bg-clip-text text-transparent">
                Nouvelle transaction
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
                  <ArrowLeftRight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Informations de la transaction</h2>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      required
                    >
                      {types.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Catégorie *</label>
                    <select
                      value={formData.categorie}
                      onChange={(e) => setFormData({ ...formData, categorie: e.target.value as any })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Montant (FCFA) *</label>
                  <input
                    type="number"
                    value={formData.montant}
                    onChange={(e) => setFormData({ ...formData, montant: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    placeholder="Ex: 500000"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    rows={3}
                    placeholder="Description de la transaction..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Référence</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    placeholder="Ex: FAC-2024-001"
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date de transaction *</label>
                    <input
                      type="date"
                      value={formData.date_transaction}
                      onChange={(e) => setFormData({ ...formData, date_transaction: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Statut</label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    >
                      {statuts.map(statut => (
                        <option key={statut.value} value={statut.value}>{statut.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/finance/encaissements-decaissements">
                <Button variant="outline" disabled={loading}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Création...' : 'Créer la transaction'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
