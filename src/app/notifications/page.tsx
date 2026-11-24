'use client';

import { useAuth } from '@/hooks/useAuth';

export default function NotificationsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Notifications</h1>
        <p className="text-slate-600 mb-2">Page en cours de développement</p>
        <p className="text-sm text-slate-400">
          {user ? `Connecté en tant que : ${user.email}` : 'Non connecté'}
        </p>
      </div>
    </div>
  );
}
