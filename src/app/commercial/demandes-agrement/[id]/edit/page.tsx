'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/utils/errorHandler';
import { POLE_OPTIONS } from '@/lib/constants';

export default function EditDemandeAgrementPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    reference: '',
    client_id: '',
    pole: '',
    libelle: '',
    contenu: '',
    statut: 'soumise',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [demandeData, clientsData] = await Promise.all([
        supabase.from('demandes_agrement').select('*').eq('id', params.id).single(),
        supabase.from('clients').select('id, nom').eq('statut', 'client').order('nom'),
      ]);

      if (demandeData.data) {
        // Extraire la référence si elle existe dans le libellé (format: "000426_GMI - Description")
        const libelleParts = demandeData.data.libelle.split(' - ');
        const reference = libelleParts.length > 1 ? libelleParts[0] : '';
        const libelle = libelleParts.length > 1 ? libelleParts.slice(1).join(' - ') : demandeData.data.libelle;

        setFormData({
          reference,
          client_id: demandeData.data.client_id,
          pole: demandeData.data.pole,
          libelle,
          contenu: demandeData.data.decision || '',
          statut: demandeData.data.statut,
        });
      }

      setClients(clientsData.data || []);
      setInitialLoading(false);
    }
    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.client_id || !formData.pole || !formData.libelle) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      // Combiner référence et libellé si une référence est saisie
      const libelleFinal = formData.reference
        ? `${formData.reference} - ${formData.libelle}`
        : formData.libelle;

      const { error } = await supabase
        .from('demandes_agrement')
        .update({
          client_id: formData.client_id,
          pole: formData.pole,
          libelle: libelleFinal,
          decision: formData.contenu,
          statut: formData.statut,
        })
        .eq('id', params.id);

      if (error) throw error;
      router.push(`/commercial/demandes-agrement/${params.id}`);
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la modification de la demande'));
      setLoading(false);
    }
  };

  const poles = [
    'ingénierie informatique',
    'génie civil et BTP',
    'agrobusiness',
    'trading international',
    'transition énergétique',
    'centre d\'incubation et d\'impulsion des entreprises',
  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/commercial/demandes-agrement/${params.id}`}>
              <Button variant="ghost" size="icon" className="hover:bg-purple-100 hover:text-purple-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">
                Modifier la demande d'agrément
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Informations de la demande</h2>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  >
                    <option value="">Sélectionnez un client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Pôle concerné *</label>
                    <select
                      value={formData.pole}
                      onChange={(e) => setFormData({ ...formData, pole: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      required
                    >
                      <option value="">Sélectionnez un pôle</option>
                      {POLE_OPTIONS.map((pole) => (
                        <option key={pole.value} value={pole.value}>{pole.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Référence</label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                      placeholder="Ex: 000426_GMI"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Statut</label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    >
                      <option value="soumise">Soumise</option>
                      <option value="en_examen">En examen</option>
                      <option value="approuvee">Approuvée</option>
                      <option value="refusee">Refusée</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Libellé *</label>
                  <input
                    type="text"
                    value={formData.libelle}
                    onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Contenu</label>
                  <textarea
                    value={formData.contenu}
                    onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    rows={5}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Aperçu du document</h3>
              <div className="bg-white border-2 border-slate-200 rounded-xl p-8 font-serif">
                <div className="mb-4">
                  <p className="text-slate-600 font-semibold">Réf. : {formData.reference || '[Référence]'}</p>
                </div>
                <div className="mb-8">
                  <p className="text-slate-600 font-semibold">Objet : {formData.libelle || '[Objet de la demande]'}</p>
                </div>
                <div className="min-h-[300px] text-slate-700 whitespace-pre-line">
                  {formData.contenu || '[Contenu de la demande]'}
                </div>
                <div className="mt-12 flex justify-end">
                  <div className="text-center">
                    <p className="text-slate-600">Fait à Thiès le {new Date().toLocaleDateString('fr-FR')}</p>
                    <p className="text-slate-900 font-semibold mt-2">Le Directeur Général</p>
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
              <Link href={`/commercial/demandes-agrement/${params.id}`}>
                <Button variant="outline" disabled={loading}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white">
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
