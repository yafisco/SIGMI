'use client';

import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, loading, error } = useNotifications();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Notifications</h1>
        <p className="text-slate-600 mb-2">Page en cours de développement</p>
        <p className="text-sm text-slate-400 mb-2">
          {user ? `Connecté en tant que : ${user.email}` : 'Non connecté'}
        </p>
        <p className="text-sm text-slate-400">
          {loading ? 'Chargement...' : error ? `Erreur: ${error}` : `${notifications.length} notifications`}
        </p>
      </div>
    </div>
  );
}
