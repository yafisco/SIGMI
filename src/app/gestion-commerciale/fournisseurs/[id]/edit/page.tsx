'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Save } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/utils/errorHandler';

function EditFournisseurPageContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [formData, setFormData] = useState({
    raison_sociale: '',
    contact_principal: '',
    telephone: '',
    email: '',
    adresse: '',
    secteur_activite: '',
    conditions_paiement: '',
    notes: '',
    actif: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchFournisseur() {
      const { data } = await supabase.from('fournisseurs').select('*').eq('id', id).single();
      if (data) {
        setFormData({
          raison_sociale: data.raison_sociale,
          contact_principal: data.contact_principal || '',
          telephone: data.telephone || '',
          email: data.email || '',
          adresse: data.adresse || '',
          secteur_activite: data.secteur_activite || '',
          conditions_paiement: data.conditions_paiement || '',
          notes: data.notes || '',
          actif: data.actif,
        });
      }
    }
    fetchFournisseur();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.from('fournisseurs').update({
        raison_sociale: formData.raison_sociale,
        contact_principal: formData.contact_principal,
        telephone: formData.telephone,
        email: formData.email,
        adresse: formData.adresse,
        secteur_activite: formData.secteur_activite,
        conditions_paiement: formData.conditions_paiement,
        notes: formData.notes,
        actif: formData.actif,
      }).eq('id', id);

      if (error) throw error;
      router.push('/gestion-commerciale/fournisseurs');
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la modification'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/gestion-commerciale/fournisseurs">
              <Button variant="ghost" size="icon" className="hover:bg-green-100 hover:text-green-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#059669] to-[#10B981] bg-clip-text text-transparent">
                Modifier le fournisseur
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Raison sociale *</label>
                  <input
                    type="text"
                    value={formData.raison_sociale}
                    onChange={(e) => setFormData({ ...formData, raison_sociale: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Statut</label>
                  <select
                    value={formData.actif ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.value === 'true' })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                  >
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mt-4">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/gestion-commerciale/fournisseurs">
                <Button variant="outline" disabled={loading}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#059669] to-[#10B981] text-white">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Modification...' : 'Modifier'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditFournisseurPage() {
  return (
    <Suspense>
      <EditFournisseurPageContent />
    </Suspense>
  );
}
