'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Calendar, Clock, MapPin, Video, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';

const typeOptions: Array<{ value: string; label: string; icon: any }> = [
  { value: 'réunion', label: 'Réunion', icon: Video },
  { value: 'appel', label: 'Appel', icon: Phone },
  { value: 'visite', label: 'Visite', icon: MapPin },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'autre', label: 'Autre', icon: Clock },
];

export default function CreateEvenementPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    titre: '',
    description: '',
    type: 'réunion',
    date_debut: '',
    date_fin: '',
    lieu: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Temporairement : Simulation de création (sera remplacé par Supabase quand la table sera créée)
    await new Promise(resolve => setTimeout(resolve, 1000));

    await Swal.fire({
      title: 'Succès !',
      text: 'L\'événement a été créé avec succès (données simulées - à connecter à Supabase une fois la table créée).',
      icon: 'success',
      confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
      customClass: SWEETALERT_CONFIG.customClass,
    });

    router.push('/commercial/calendrier');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/commercial/calendrier">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Nouvel événement</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Titre *</label>
              <input
                type="text"
                required
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                placeholder="Titre de l'événement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type *</label>
              <select
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date de début *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.date_debut}
                  onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date de fin</label>
                <input
                  type="datetime-local"
                  value={form.date_fin}
                  onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Lieu</label>
              <input
                type="text"
                value={form.lieu}
                onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                placeholder="Lieu de l'évendement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3EB] focus:border-[#2563EB]"
                placeholder="Détails de l'événement..."
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Création...' : 'Créer'}
              </Button>
              <Link href="/commercial/calendrier">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
