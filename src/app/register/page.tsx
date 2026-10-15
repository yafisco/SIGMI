'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Building2, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { POLE_OPTIONS } from '@/lib/constants';
import { Pole } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    pole: '' as Pole | '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    nom?: string;
    prenom?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    pole?: string;
    general?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      nom?: string;
      prenom?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      general?: string;
    } = {};

    if (!formData.nom) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.prenom) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (!formData.email) {
      newErrors.email = "L'e-mail est requis";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Format d'e-mail invalide";
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.pole) {
      newErrors.pole = 'Le pôle est requis';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      try {
        console.log('Tentative d\'inscription avec:', formData.email);

        // 1. Créer l'utilisateur dans Supabase Auth SANS confirmation email
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nom: formData.nom,
              prenom: formData.prenom,
            },
          },
        });

        console.log('Réponse auth:', { authData, authError });

        if (authError) {
          console.error("Erreur d'inscription:", authError);
          setErrors({ general: authError.message });
          setIsLoading(false);
          return;
        }

        if (authData.user) {
          console.log('Utilisateur créé:', authData.user.id);

          // Créer directement le collaborateur avec le pôle sélectionné
          const { error: collabError } = await supabase
            .from('collaborateurs')
            .insert({
              id: authData.user.id,
              nom: formData.nom,
              prenom: formData.prenom,
              email: formData.email,
              telephone: '',
              poste: 'Nouveau collaborateur',
              role: 'commercial',
              poles: [formData.pole], // Utiliser le pôle sélectionné
              date_embauche: new Date().toISOString().split('T')[0],
              actif: true,
            });

          if (collabError) {
            console.error('Erreur lors de la création du collaborateur:', collabError);
            setErrors({ general: 'Compte créé mais erreur lors de la création du profil. Veuillez contacter l\'administrateur.' });
            setIsLoading(false);
            return;
          }

          // Afficher le message de succès
          setSuccessMessage('Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.');

          // Rediriger vers la page de connexion après 2 secondes
          setTimeout(() => {
            router.push('/login?registered=true');
          }, 2000);
        }
      } catch (error) {
        console.error('Erreur générale lors de l\'inscription:', error);
        setErrors({ general: 'Une erreur est survenue lors de l\'inscription' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Header Band */}
      <div className="lg:hidden w-full bg-gradient-to-r from-blue-600 to-blue-700 py-6 px-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-white">SIGMI</h1>
        </div>
        <p className="text-blue-100 text-sm">Système d'Information GROUP MI</p>
      </div>

      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">SIGMI</h1>
              <p className="text-xs text-slate-500 -mt-1">Système d'Information GROUP MI</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Créer un compte</h2>
            <p className="text-slate-600">Rejoignez SIGMI pour gérer vos activités</p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom Field */}
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-slate-700 mb-2">
                Nom
              </label>
              <input
                id="nom"
                type="text"
                value={formData.nom}
                onChange={(e) => {
                  setFormData({ ...formData, nom: e.target.value });
                  if (errors.nom) setErrors({ ...errors, nom: undefined });
                }}
                className={`w-full px-4 py-3 rounded-lg border bg-white transition-all duration-200 text-slate-900 ${
                  errors.nom
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2`}
                placeholder="Votre nom"
                aria-invalid={errors.nom ? 'true' : 'false'}
              />
              {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
            </div>

            {/* Prénom Field */}
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-slate-700 mb-2">
                Prénom
              </label>
              <input
                id="prenom"
                type="text"
                value={formData.prenom}
                onChange={(e) => {
                  setFormData({ ...formData, prenom: e.target.value });
                  if (errors.prenom) setErrors({ ...errors, prenom: undefined });
                }}
                className={`w-full px-4 py-3 rounded-lg border bg-white transition-all duration-200 text-slate-900 ${
                  errors.prenom
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-[#2563EB] focus:border-[#2563EB]'
                } focus:outline-none focus:ring-2`}
                placeholder="Votre prénom"
                aria-invalid={errors.prenom ? 'true' : 'false'}
              />
              {errors.prenom && <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={`w-full px-4 py-3 rounded-lg border bg-white transition-all duration-200 text-slate-900 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-[#2563EB] focus:border-[#2563EB]'
                } focus:outline-none focus:ring-2`}
                placeholder="votre@email.com"
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Pole Field */}
            <div>
              <label htmlFor="pole" className="block text-sm font-medium text-slate-700 mb-2">
                Pôle d'activité
              </label>
              <select
                id="pole"
                value={formData.pole}
                onChange={(e) => {
                  setFormData({ ...formData, pole: e.target.value as Pole });
                  if (errors.pole) setErrors({ ...errors, pole: undefined });
                }}
                className={`w-full px-4 py-3 rounded-lg border bg-white transition-all duration-200 text-slate-900 ${
                  errors.pole
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-[#2563EB] focus:border-[#2563EB]'
                } focus:outline-none focus:ring-2`}
              >
                <option value="">Sélectionnez votre pôle</option>
                {POLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.pole && <p className="mt-1 text-sm text-red-600">{errors.pole}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white transition-all duration-200 text-slate-900 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-[#2563EB] focus:border-[#2563EB]'
                  } focus:outline-none focus:ring-2`}
                  placeholder="••••••••"
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              <p className="mt-1 text-xs text-slate-500">Minimum 8 caractères</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white transition-all duration-200 text-slate-900 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-[#2563EB] focus:border-[#2563EB]'
                  } focus:outline-none focus:ring-2`}
                  placeholder="••••••••"
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg h-12 text-base transition-all duration-200 shadow-lg shadow-blue-500/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-50 text-slate-500">ou</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-slate-900 font-medium mb-2">Vous avez déjà un compte ?</p>
              <p className="text-slate-600 text-sm mb-2">Connectez-vous pour accéder à SIGMI</p>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors inline-flex items-center gap-1"
              >
                Se connecter
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </form>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column - Decoration (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [background-size:3rem_3rem]" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center max-w-lg relative z-10">
            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Annuaire centralisé</div>
                  <div className="text-blue-100 text-sm">Gérez vos collaborateurs</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Gestion de projets</div>
                  <div className="text-blue-100 text-sm">Suivez vos projets multi-pôles</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <div className="text-left">
                  <div className="text-white font-medium">Documents centralisés</div>
                  <div className="text-blue-100 text-sm">Organisez vos fichiers</div>
                </div>
              </div>
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">Rejoignez SIGMI</h3>
            <p className="text-blue-100 text-lg">
              Créez votre compte et commencez à centraliser l'ensemble de vos activités GROUP MI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
