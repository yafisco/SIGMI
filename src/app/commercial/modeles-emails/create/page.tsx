'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { emailTemplatesService } from '@/lib/services';
import { errorMessage } from '@/lib/utils/errorHandler';
import { EmailTemplateCategory } from '@/types';

export default function CreateEmailTemplatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: '',
    categorie: 'prospection' as EmailTemplateCategory,
    sujet: '',
    corps: '',
    variables: [] as string[],
    actif: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newVariable, setNewVariable] = useState('');

  const categories = [
    { value: 'prospection', label: 'Prospection' },
    { value: 'agrement', label: 'Agrément' },
    { value: 'relance', label: 'Relance' },
    { value: 'rendez-vous', label: 'Rendez-vous' },
    { value: 'devis', label: 'Devis' },
    { value: 'livraison', label: 'Livraison' },
    { value: 'contrat', label: 'Contrat' },
    { value: 'autre', label: 'Autre' },
  ];

  const suggestedVariables = [
    '{nom_client}',
    '{nom_prospect}',
    '{nom_entreprise}',
    '{nom_contact}',
    '{reference}',
    '{date}',
    '{montant}',
    '{signature}',
  ];

  const addVariable = (variable: string) => {
    if (!formData.variables.includes(variable)) {
      setFormData({ ...formData, variables: [...formData.variables, variable] });
    }
  };

  const removeVariable = (variable: string) => {
    setFormData({ ...formData, variables: formData.variables.filter(v => v !== variable) });
  };

  const addCustomVariable = () => {
    if (newVariable && !formData.variables.includes(newVariable)) {
      setFormData({ ...formData, variables: [...formData.variables, newVariable] });
      setNewVariable('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.nom || !formData.sujet || !formData.corps) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      await emailTemplatesService.create(formData);
      router.push('/commercial/modeles-emails');
    } catch (err) {
      setError(errorMessage(err, 'Erreur lors de la création du modèle'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/commercial/modeles-emails">
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] bg-clip-text text-transparent">
                Nouveau modèle d'e-mail
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
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Informations du modèle</h2>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nom du modèle *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    placeholder="Ex: Présentation GROUP MI"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Catégorie *</label>
                  <select
                    value={formData.categorie}
                    onChange={(e) => setFormData({ ...formData, categorie: e.target.value as EmailTemplateCategory })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Sujet de l'e-mail *</label>
                  <input
                    type="text"
                    value={formData.sujet}
                    onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
                    placeholder="Ex: Présentation de nos services - GROUP MI"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Corps de l'e-mail *</label>
                  <textarea
                    value={formData.corps}
                    onChange={(e) => setFormData({ ...formData, corps: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-mono text-sm"
                    rows={12}
                    placeholder="Rédigez le contenu de votre e-mail ici... Vous pouvez utiliser des variables comme {nom_client}"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="actif"
                    checked={formData.actif}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="actif" className="text-sm text-slate-700">Modèle actif</label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Variables du modèle</h3>
              <p className="text-sm text-slate-600 mb-4">Ajoutez des variables qui pourront être remplacées automatiquement lors de l'envoi.</p>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Variables suggérées</label>
                <div className="flex flex-wrap gap-2">
                  {suggestedVariables.map(variable => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => addVariable(variable)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition-colors"
                    >
                      + {variable}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ajouter une variable personnalisée</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg text-sm"
                    placeholder="Ex: {nom_projet}"
                  />
                  <Button type="button" onClick={addCustomVariable} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>

              {formData.variables.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Variables sélectionnées</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.variables.map(variable => (
                      <div key={variable} className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
                        {variable}
                        <button
                          type="button"
                          onClick={() => removeVariable(variable)}
                          className="hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link href="/commercial/modeles-emails">
                <Button variant="outline" disabled={loading}>Annuler</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Création...' : 'Créer le modèle'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
