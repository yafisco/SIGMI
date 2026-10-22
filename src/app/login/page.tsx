'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Building2, Eye, EyeOff, Loader2, ArrowRight, Users, FolderKanban, FileText, CheckCircle2, Shield, Zap, Clock, BarChart3, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  // Message dérivé de l'URL (pas d'état ni d'effet nécessaire)
  const successMessage =
    searchParams.get('confirmed') === 'true'
      ? 'Votre e-mail a été confirmé avec succès ! Vous pouvez maintenant vous connecter.'
      : searchParams.get('registered') === 'true'
        ? 'Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.'
        : '';

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { email?: string; password?: string; general?: string } = {};

    if (!email) {
      newErrors.email = "L'e-mail est requis";
    } else if (!validateEmail(email)) {
      newErrors.email = "Format d'e-mail invalide";
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      try {

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });


        if (error) {
          console.error("Erreur d'authentification:", error);
          
          // Messages d'erreur plus explicites
          let errorMessage = error.message;
          if (error.message === 'Invalid login credentials') {
            errorMessage = 'E-mail ou mot de passe incorrect. Veuillez vérifier vos identifiants.';
          } else if (error.message === 'Email not confirmed') {
            errorMessage = 'Veuillez confirmer votre adresse e-mail avant de vous connecter.';
          }
          
          setErrors({ general: errorMessage });
          setIsLoading(false);
          return;
        }

        if (data.user) {

          // Récupérer les informations utilisateur supplémentaires par ID
          const { data: userData, error: userError } = await supabase
            .from('collaborateurs')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle(); // maybeSingle au lieu de single pour éviter l'erreur si pas trouvé


          if (userError) {
            console.error('Erreur lors de la récupération des données utilisateur:', userError);
            // Si l'utilisateur n'a pas de profil collaborateur, on le redirige vers le dashboard général
            router.push('/dashboard');
            return;
          }

          // Rediriger selon la fonction de l'utilisateur
          if (userData) {
            const poste = userData.poste?.toLowerCase() || '';
            const role = userData.role?.toLowerCase() || '';

            // Comptable → Trésorerie
            if (poste.includes('comptable') || role.includes('comptable')) {
              router.push('/tresorerie');
            }
            // Commercial → Dashboard Commercial
            else if (poste.includes('commercial') || role.includes('commercial')) {
              router.push('/commercial');
            }
            // Direction Générale → Dashboard Global
            else if (poste.includes('direction') || role.includes('direction')) {
              router.push('/dashboard');
            }
            // Autres → Dashboard du pôle
            else if (userData.poles && userData.poles.length > 0) {
              const firstPole = userData.poles[0];
              router.push(`/poles/${encodeURIComponent(firstPole)}`);
            }
            // Fallback → Dashboard global
            else {
              router.push('/dashboard');
            }
          } else {
            // Si l'utilisateur n'a pas de profil collaborateur, rediriger vers le dashboard général
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Erreur générale lors de la connexion:', error);
        setErrors({ general: 'Une erreur est survenue lors de la connexion' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Header Band */}
      <div className="lg:hidden w-full bg-gradient-to-r from-[#1A2B47] to-[#1D4ED8] py-4 sm:py-6 px-4 border-b-2 border-[#D4AF37]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#1D4ED8]" />
          </div>
          <h1 className="text-xl font-bold text-white">SIGMI</h1>
        </div>
        <p className="text-[#D4AF37] text-sm">Diversifier, innover, impacter</p>
      </div>

      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center gap-4 mb-8">
            <img
              src="/logo-group-mi.png"
              alt="GROUP MI Logo"
              className="w-14 h-14 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">SIGMI</h1>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mt-1">
                Diversifier, innover, impacter
              </p>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Connexion</h2>
            <p className="text-slate-600 text-sm sm:text-base">Accédez à votre espace SIGMI</p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                E-mail professionnel
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={`w-full px-4 py-3 rounded-lg border bg-white transition-all duration-200 text-slate-900 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 focus:ring-[#2563EB] focus:border-[#2563EB]'
                } focus:outline-none focus:ring-2`}
                placeholder="votre@email.com"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white transition-all duration-200 text-slate-900 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-[#2563EB] focus:border-[#2563EB]'
                  } focus:outline-none focus:ring-2`}
                  placeholder="••••••••"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2563EB] transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                />
                <span className="text-xs sm:text-sm text-slate-600">Se souvenir de moi</span>
              </label>
              <Link href="#" className="text-xs sm:text-sm text-[#2563EB] hover:text-[#1D4ED8] transition-colors font-medium">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B89B6E] hover:from-[#B89B6E] hover:to-[#D4AF37] hover:scale-105 text-[#1D4ED8] font-semibold h-10 sm:h-12 text-sm sm:text-base transition-all duration-200 shadow-xl border-2 border-[#D4AF37]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
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

            {/* No Account Link */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <p className="text-slate-900 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Pas encore de compte ?</p>
              <p className="text-slate-600 text-xs sm:text-sm mb-2 sm:mb-3">Rejoignez SIGMI et centralisez vos activités</p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#2563EB] hover:scale-105 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 shadow-lg text-xs sm:text-sm"
              >
                Créer un compte gratuitement
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Link>
            </div>
          </form>

          {/* Benefits */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-200">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 sm:mb-4">Pourquoi SIGMI ?</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                <span>Données sécurisées et chiffrées</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Accès rapide et intuitif</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                <span>Historisation complète des actions</span>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-4 sm:mt-6 text-center">
            <Link
              href="/"
              className="text-xs sm:text-sm text-slate-600 hover:text-[#2563EB] transition-colors inline-flex items-center gap-1"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column - Decoration (Desktop only) */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#1A2B47] via-[#1D4ED8] to-[#2563EB] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [background-size:3rem_3rem]" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center max-w-lg relative z-10">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <Users className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-blue-100 text-xs">Collaborateurs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <FolderKanban className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">45</div>
                <div className="text-blue-100 text-xs">Projets actifs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <FileText className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">2.5K</div>
                <div className="text-blue-100 text-xs">Documents</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <BarChart3 className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">6</div>
                <div className="text-blue-100 text-xs">Pôles</div>
              </div>
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">Système d&apos;Information Unifié</h3>
            <p className="text-blue-100 text-lg mb-8">
              Centralisez la gestion de vos 6 pôles d&apos;activité dans une interface unifiée et performante.
            </p>

            {/* Features */}
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-[#1D4ED8]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Sécurité maximale</h4>
                  <p className="text-blue-100 text-xs">Données chiffrées et accès par rôle</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-[#1D4ED8]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Performance optimale</h4>
                  <p className="text-blue-100 text-xs">Interface rapide et intuitive</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-[#1D4ED8]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Traçabilité complète</h4>
                  <p className="text-blue-100 text-xs">Historisation de toutes les actions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// useSearchParams exige une frontière <Suspense> pour le prerender
export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
