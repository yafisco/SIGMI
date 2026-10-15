'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, MapPin, Mail, Phone, Save, Globe, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useSingleData } from '@/hooks/useData';
import { clientsService } from '@/lib/services';
import { Client } from '@/types';
import { CLIENT_STATUT_OPTIONS } from '@/lib/constants';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, ClientFormData } from '@/lib/schemas/clientSchema';
import { PageHeader } from '@/components/PageHeader';
import { motion } from 'framer-motion';

export default function EditClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: client, loading, error } = useSingleData<Client>({
    fetchFn: clientsService.getById,
    id: params.id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? {
      nom: client.nom,
      email: client.email || '',
      telephone: client.telephone || '',
      adresse: client.adresse || '',
      ville: client.ville || '',
      pays: client.pays || 'Sénégal',
      secteur_activite: client.secteur_activite || '',
      chiffre_affaires_annuel: client.chiffre_affaires_annuel,
      nombre_employes: client.nombre_employes,
      statut: client.statut,
      assigned_to: client.assigned_to || '',
    } : undefined,
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      await clientsService.update(params.id, {
        nom: data.nom,
        email: data.email || undefined,
        telephone: data.telephone || undefined,
        adresse: data.adresse || undefined,
        ville: data.ville || undefined,
        pays: data.pays,
        secteur_activite: data.secteur_activite || undefined,
        chiffre_affaires_annuel: data.chiffre_affaires_annuel,
        nombre_employes: data.nombre_employes,
        statut: data.statut,
        assigned_to: data.assigned_to || undefined,
      });
      router.push(`/clients/${params.id}`);
    } catch (err) {
      console.error('Erreur lors de la modification du client:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full mb-4"
          />
          <p className="text-slate-600 font-medium">Chargement du client...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Client non trouvé</p>
          <Link href="/clients">
            <Button className="mt-4">Retour à la liste</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PageHeader
        title="Modifier le client"
        description="Modifiez les informations du client"
        backHref={`/clients/${params.id}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Informations de base */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-1" />
              <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl" />
                <div className="flex items-center gap-3 mb-6 relative">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] flex items-center justify-center shadow-lg"
                  >
                    <Building2 className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Informations de base</h2>
                    <p className="text-slate-500 text-sm">Coordonnées principales du client</p>
                  </div>
                </div>
                
                <div className="space-y-5 relative">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#1D4ED8]" />
                      Nom de l'entreprise *
                    </label>
                    <input
                      {...register('nom')}
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-300"
                    />
                    {errors.nom && <p className="text-red-600 text-sm mt-1">{errors.nom.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#1D4ED8]" />
                        Email
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-300"
                      />
                      {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#1D4ED8]" />
                        Téléphone
                      </label>
                      <input
                        {...register('telephone')}
                        type="tel"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-300"
                      />
                      {errors.telephone && <p className="text-red-600 text-sm mt-1">{errors.telephone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#1D4ED8]" />
                      Adresse
                    </label>
                    <input
                      {...register('adresse')}
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Ville</label>
                      <input
                        {...register('ville')}
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#1D4ED8]" />
                        Pays *
                      </label>
                      <input
                        {...register('pays')}
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all duration-300"
                      />
                      {errors.pays && <p className="text-red-600 text-sm mt-1">{errors.pays.message}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Informations supplémentaires */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform -rotate-1" />
              <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-transparent rounded-full blur-2xl" />
                <div className="flex items-center gap-3 mb-6 relative">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B89B6E] flex items-center justify-center shadow-lg"
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Informations supplémentaires</h2>
                    <p className="text-slate-500 text-sm">Détails sur l'activité du client</p>
                  </div>
                </div>
                
                <div className="space-y-5 relative">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Secteur d'activité</label>
                    <input
                      {...register('secteur_activite')}
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Chiffre d'affaires annuel (FCFA)</label>
                      <input
                        {...register('chiffre_affaires_annuel', { valueAsNumber: true })}
                        type="number"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#D4AF37]" />
                        Nombre d'employés
                      </label>
                      <input
                        {...register('nombre_employes', { valueAsNumber: true })}
                        type="number"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Statut *</label>
                    <select
                      {...register('statut')}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all duration-300"
                    >
                      {CLIENT_STATUT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.statut && <p className="text-red-600 text-sm mt-1">{errors.statut.message}</p>}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Boutons d'action */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex gap-4"
            >
              <Link href={`/clients/${params.id}`} className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
              </Link>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#D4AF37] via-[#B89B6E] to-[#D4AF37] bg-[length:200%_auto] animate-gradient hover:scale-105 text-[#1D4ED8] shadow-xl shadow-[#D4AF37]/30 border-2 border-[#D4AF37] transition-all duration-300 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <div className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Modification...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
