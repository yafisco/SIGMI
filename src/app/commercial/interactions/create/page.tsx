'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Calendar, Phone, Mail, Video, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { interactionsService } from '@/lib/services';
import { InteractionType } from '@/types';
import Swal from 'sweetalert2';
import { SWEETALERT_CONFIG } from '@/lib/constants';

const typeOptions: Array<{ value: InteractionType; label: string; icon: any }> = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'appel', label: 'Appel', icon: Phone },
  { value: 'réunion', label: 'Réunion', icon: Video },
  { value: 'visite', label: 'Visite', icon: MapPin },
  { value: 'autre', label: 'Autre', icon: Clock },
];

export default function CreateInteractionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'email' as InteractionType,
    interaction_date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await interactionsService.create({
        title: form.title,
        description: form.description,
        type: form.type,
        interaction_date: form.interaction_date,
      });

      await Swal.fire({
        title: 'Succès !',
        text: 'L\'interaction a été créée avec succès.',
        icon: 'success',
        confirmButtonColor: SWEETALERT_CONFIG.successButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });

      router.push('/commercial/interactions');
    } catch (error) {
      await Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors de la création de l\'interaction.',
        icon: 'error',
        confirmButtonColor: SWEETALERT_CONFIG.errorButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/commercial/interactions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Nouvelle interaction</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Titre *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                placeholder="Titre de l'interaction"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type *</label>
              <select
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as InteractionType })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
              <input
                type="date"
                required
                value={form.interaction_date}
                onChange={(e) => setForm({ ...form, interaction_date: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                placeholder="Détails de l'interaction..."
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
              <Link href="/commercial/interactions">
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
