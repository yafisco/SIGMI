import { redirect } from 'next/navigation';

// Plus d'inscription publique : les comptes sont créés par un administrateur (/admin/utilisateurs)
export default function RegisterPage() {
  redirect('/login');
}
