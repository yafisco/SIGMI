'use client';

import { useState, useTransition } from 'react';
import { ShieldCheck, UserPlus, Save, Power, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { APP_ROLE_LABELS, APP_ROLE_OPTIONS, POLE_OPTIONS, SWEETALERT_CONFIG } from '@/lib/constants';
import type { AppRole, Pole, Profile } from '@/types';
import { createUser, setActif, updateRoleEtPole, type ActionResult } from './actions';

const POLES = POLE_OPTIONS.filter((p) => p.value !== 'transversal');

const inputClass =
  'w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-slate-900 bg-white';

const EMPTY_FORM = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  fonction: '',
  role: 'commercial' as AppRole,
  pole: '',
  password: '',
};

async function notify(result: ActionResult) {
  await Swal.fire({
    title: result.ok ? 'Enregistré' : 'Erreur',
    text: result.ok ? result.message : result.error,
    icon: result.ok ? 'success' : 'error',
    confirmButtonColor: result.ok ? SWEETALERT_CONFIG.successButtonColor : SWEETALERT_CONFIG.errorButtonColor,
    customClass: SWEETALERT_CONFIG.customClass,
  });
}

function LigneUtilisateur({ profile, isMe }: { profile: Profile; isMe: boolean }) {
  const [role, setRole] = useState<AppRole>(profile.role);
  const [pole, setPole] = useState<string>(profile.pole ?? '');
  const [pending, startTransition] = useTransition();
  const changed = role !== profile.role || pole !== (profile.pole ?? '');

  const save = () =>
    startTransition(async () => {
      await notify(await updateRoleEtPole(profile.id, { role, pole: pole || null }));
    });

  const toggleActif = () =>
    startTransition(async () => {
      const confirm = await Swal.fire({
        title: profile.actif ? 'Désactiver ce compte ?' : 'Réactiver ce compte ?',
        text: profile.actif
          ? `${profile.prenom} ${profile.nom} ne pourra plus se connecter ni accéder aux données.`
          : `${profile.prenom} ${profile.nom} pourra de nouveau se connecter.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: profile.actif ? 'Désactiver' : 'Réactiver',
        cancelButtonText: 'Annuler',
        confirmButtonColor: SWEETALERT_CONFIG.confirmButtonColor,
        cancelButtonColor: SWEETALERT_CONFIG.cancelButtonColor,
        customClass: SWEETALERT_CONFIG.customClass,
      });
      if (confirm.isConfirmed) await notify(await setActif(profile.id, !profile.actif));
    });

  return (
    <tr className={`border-t border-slate-100 ${profile.actif ? '' : 'bg-slate-50 text-slate-400'}`}>
      <td className="px-4 py-3">
        <p className="font-semibold text-slate-900">
          {profile.prenom} {profile.nom} {isMe && <span className="text-xs text-[#D4AF37]">(vous)</span>}
        </p>
        <p className="text-xs text-slate-500">{profile.email}</p>
        {profile.fonction && <p className="text-xs text-slate-500">{profile.fonction}</p>}
      </td>
      <td className="px-4 py-3">
        <select value={role} onChange={(e) => setRole(e.target.value as AppRole)} className={inputClass} disabled={pending}>
          {APP_ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <select value={pole} onChange={(e) => setPole(e.target.value)} className={inputClass} disabled={pending}>
          <option value="">Aucun pôle</option>
          {POLES.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
            profile.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {profile.actif ? 'Actif' : 'Désactivé'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2 justify-end">
          <Button size="sm" onClick={save} disabled={!changed || pending} className="bg-[#1D4ED8] hover:bg-[#2563EB] text-white">
            <Save className="w-4 h-4 mr-1" /> Enregistrer
          </Button>
          {!isMe && (
            <Button size="sm" variant="outline" onClick={toggleActif} disabled={pending}>
              <Power className="w-4 h-4 mr-1" /> {profile.actif ? 'Désactiver' : 'Réactiver'}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function UtilisateursClient({ profiles, currentUserId }: { profiles: Profile[]; currentUserId: string }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createUser({
        ...form,
        pole: (form.pole || null) as Pole | null,
        telephone: form.telephone || undefined,
        fonction: form.fonction || undefined,
      });
      await notify(result);
      if (result.ok) setForm(EMPTY_FORM);
    });
  };

  const actifs = profiles.filter((p) => p.actif).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1D4ED8] to-[#D4AF37] bg-clip-text text-transparent">
              Utilisateurs et rôles
            </h1>
            <p className="text-slate-600 text-sm">
              {profiles.length} comptes, dont {actifs} actifs. Chaque compte correspond à une personne.
            </p>
          </div>
        </div>

        {/* Création d'un compte */}
        <form onSubmit={submit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg shadow-blue-100/50 space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#1D4ED8]" />
            <h2 className="text-lg font-bold text-slate-900">Créer un compte</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input className={inputClass} placeholder="Prénom" required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
            <input className={inputClass} placeholder="Nom" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            <input className={inputClass} type="email" placeholder="E-mail professionnel" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className={inputClass} placeholder="Téléphone (optionnel)" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            <input className={inputClass} placeholder="Fonction (ex. Chargée d'affaires)" value={form.fonction} onChange={(e) => setForm({ ...form, fonction: e.target.value })} />
            <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as AppRole })}>
              {APP_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select className={inputClass} value={form.pole} onChange={(e) => setForm({ ...form, pole: e.target.value })} required={form.role === 'responsable_pole'}>
              <option value="">{form.role === 'responsable_pole' ? 'Pôle (obligatoire)' : 'Aucun pôle'}</option>
              {POLES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <input className={inputClass} type="password" placeholder="Mot de passe initial (12 caractères min.)" required minLength={12} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Communiquez le mot de passe initial à la personne par un canal sûr ; elle pourra le changer ensuite.
            </p>
            <Button type="submit" disabled={pending} className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white">
              <UserPlus className="w-4 h-4 mr-2" /> {pending ? 'Création...' : 'Créer le compte'}
            </Button>
          </div>
        </form>

        {/* Liste des comptes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-blue-100/50 overflow-x-auto">
          <div className="flex items-center gap-2 p-6 pb-2">
            <Users className="w-5 h-5 text-[#1D4ED8]" />
            <h2 className="text-lg font-bold text-slate-900">Comptes</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="px-4 py-2 font-medium">Personne</th>
                <th className="px-4 py-2 font-medium">Rôle</th>
                <th className="px-4 py-2 font-medium">Pôle</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <LigneUtilisateur key={`${profile.id}-${profile.updated_at}`} profile={profile} isMe={profile.id === currentUserId} />
              ))}
            </tbody>
          </table>
          {profiles.length === 0 && <p className="p-6 text-slate-500">Aucun compte.</p>}
        </div>

        <p className="text-xs text-slate-500">
          Rôles : {Object.values(APP_ROLE_LABELS).join(', ')}. Détail des droits : docs/matrice-droits.md.
        </p>
      </div>
    </div>
  );
}
