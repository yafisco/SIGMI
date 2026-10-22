'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Save, Mail, Phone, Briefcase, Shield, Building2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { collaborateursService } from '@/lib/services';
import { supabase } from '@/lib/supabase';
import { POLE_OPTIONS } from '@/lib/constants';
import { errorMessage } from '@/lib/utils/errorHandler';

const FONCTION_OPTIONS = [
  { value: 'direction générale', label: 'Direction Générale' },
  { value: 'comptable', label: 'Comptable' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'responsable de pôle', label: 'Responsable de Pôle' },
  { value: 'gestionnaire de projet', label: 'Gestionnaire de Projet' },
  { value: 'assistant', label: 'Assistant' },
  { value: 'autre', label: 'Autre' },
];

const ROLE_OPTIONS = [
  { value: 'direction', label: 'Direction' },
  { value: 'comptable', label: 'Comptable' },
  { value: 'administrateur système', label: 'Administrateur Système' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'manager', label: 'Manager' },
  { value: 'directeur', label: 'Directeur' },
  { value: 'technique', label: 'Technique' },
  { value: 'administratif', label: 'Administratif' },
];

export default function EditCollaborateurPage() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    poste: '',
    role: 'commercial',
    poles: [] as string[],
    date_embauche: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCollaborateur = async () => {
      try {
        const id = params.id as string;
        const data = id ? await collaborateursService.getById(id) : null;
        if (!data) {
          setError('Collaborateur introuvable');
        } else {
          setFormData({
            nom: data.nom || '',
            prenom: data.prenom || '',
            email: data.email || '',
            telephone: data.telephone || '',
            poste: data.poste || '',
            role: data.role || 'commercial',
            poles: Array.isArray(data.poles) ? data.poles : [],
            date_embauche: data.date_embauche || '',
          });
        }
      } catch (err) {
        setError(errorMessage(err, 'Erreur lors du chargement du collaborateur'));
      } finally {
        setLoading(false);
      }
    };
    loadCollaborateur();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const id = params.id as string;
      
      // Filtrer les pôles vides
      const polesFiltered = formData.poles.filter(p => p !== '' && p !== null);
      
      const updateData: Record<string, unknown> = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        poste: formData.poste,
        role: formData.role,
        date_embauche: formData.date_embauche || null,
      };
      
      // N'inclure poles que si non vide
      if (polesFiltered.length > 0) {
        updateData.poles = polesFiltered;
      }
      
      
      // Utiliser Supabase directement
      const { error } = await supabase
        .from('collaborateurs')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }
      
      router.push('/collaborateurs');
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(errorMessage(err, 'Erreur lors de la modification du collaborateur'));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/collaborateurs">
              <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#D4AF37] bg-clip-text text-transparent">
                Modifier le collaborateur
              </h1>
              <p className="text-slate-600 text-sm mt-0.5">Mettez à jour les informations du collaborateur</p>
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
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Informations personnelles</h2>
                  <p className="text-slate-500 text-sm">Coordonnées du collaborateur</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#1D4ED8]" />
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#1D4ED8]" />
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#1D4ED8]" />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#1D4ED8]" />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
                      placeholder="+221 33 123 45 67"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#1D4ED8]" />
                      Poste *
                    </label>
                    <select
                      value={formData.poste}
                      onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                      required
                    >
                      <option value="">Sélectionnez le poste</option>
                      {FONCTION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#1D4ED8]" />
                      Rôle *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                      required
                    >
                      <option value="">Sélectionnez le rôle</option>
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1D4ED8]" />
                    Pôle(s)
                  </label>
                  <select
                    value={formData.poles[0] || ''}
                    onChange={(e) => setFormData({ ...formData, poles: e.target.value ? [e.target.value] : [] })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 bg-white"
                  >
                    <option value="">Sélectionnez le pôle</option>
                    {POLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1D4ED8]" />
                    Date d&apos;embauche
                  </label>
                  <input
                    type="date"
                    value={formData.date_embauche}
                    onChange={(e) => setFormData({ ...formData, date_embauche: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all hover:border-slate-300 text-slate-900 placeholder:text-slate-400 bg-white"
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
              <Link href="/collaborateurs">
                <Button variant="outline" className="px-6 py-3 rounded-xl hover:bg-slate-100" disabled={saving}>
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={saving} className="bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] hover:from-[#B89B6E] hover:to-[#D4AF37] text-[#1D4ED8] shadow-lg border-2 border-[#D4AF37] px-6 py-3 rounded-xl transition-all hover:scale-105">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Modification...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
