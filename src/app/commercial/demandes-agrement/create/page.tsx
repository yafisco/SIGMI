'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Save, Printer, Download } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/utils/errorHandler';

export default function CreateDemandeAgrementPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    client_id: '',
    pole: '',
    objet: '',
    contenu: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
  const [numero, setNumero] = useState('');

  useEffect(() => {
    async function fetchData() {
      const clientsData = await supabase.from('clients').select('id, nom').order('nom');
      setClients(clientsData.data || []);

      const { count } = await supabase.from('demandes_agrement').select('*', { count: 'exact', head: true });
      const newNumero = `000${(count || 0) + 1}_GMI`;
      setNumero(newNumero);
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.client_id || !formData.pole || !formData.objet) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from('demandes_agrement').insert({
        numero,
        client_id: formData.client_id,
        pole: formData.pole,
        objet: formData.objet,
        contenu: formData.contenu,
        notes: formData.notes,
        statut: 'brouillon',
        date_demande: new Date().toISOString(),
      });

      if (error) throw error;
      router.push('/commercial/demandes-agrement');
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la création de la demande'));
      setLoading(false);
    }
  };

  const poles = [
    'Ingénierie informatique',
    'Génie civil et BTP',
    'Agrobusiness',
    'Trading international',
    'Transition énergétique',
    'Centre d\'incubation',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/commercial/demandes-agrement">
              <Button variant="ghost" size="icon" className="hover:bg-purple-100 hover:text-purple-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">
                Nouvelle demande d'agrément
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Référence</label>
                    <input
                      type="text"
                      value={numero}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50"
                    />
                  </div>
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
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Pôle concerné *</label>
                  <select
                    value={formData.pole}
                    onChange={(e) => setFormData({ ...formData, pole: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  >
                    <option value="">Sélectionnez un pôle</option>
                    {poles.map((pole) => (
                      <option key={pole} value={pole}>{pole}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Objet de la demande *</label>
                  <input
                    type="text"
                    value={formData.objet}
                    onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    placeholder="Ex: De Madina Infotech au Group MI : une vision plus grande, une ambition renouvelée"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Contenu de la demande</label>
                  <textarea
                    value={formData.contenu}
                    onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    rows={10}
                    placeholder="Rédigez le contenu de votre demande d'agrément ici..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes internes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    rows={3}
                    placeholder="Notes internes pour l'équipe..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Aperçu du document</h3>
              <div className="bg-white border-2 border-slate-200 rounded-xl p-8 font-serif">
                <div className="text-right mb-8">
                  <p className="text-slate-600">Réf. : {numero}</p>
                </div>
                <div className="mb-8">
                  <p className="text-slate-600 font-semibold">Objet : {formData.objet || '[Objet de la demande]'}</p>
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
              <div className="flex gap-2 mr-auto">
                <Button type="button" variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer
                </Button>
                <Button type="button" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
              <Link href="/commercial/demandes-agrement">
                <Button variant="outline" disabled={loading}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Création...' : 'Créer la demande'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
