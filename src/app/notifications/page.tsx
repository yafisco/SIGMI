'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check, Trash2, Clock, Target, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, deleteNotification, deleteAll } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'interaction': return Clock;
      case 'opportunity': return Target;
      case 'task': return Check;
      case 'document': return FileText;
      case 'alert': return AlertCircle;
      default: return Bell;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'interaction': return 'text-blue-600 bg-blue-100';
      case 'opportunity': return 'text-green-600 bg-green-100';
      case 'task': return 'text-amber-600 bg-amber-100';
      case 'document': 'text-purple-600 bg-purple-100';
      case 'alert': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h1>
            <p className="text-slate-600">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-[#1D4ED8] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
              >
                Tout marquer comme lu
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Tout supprimer
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-500">Chargement des notifications...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 rounded-xl border transition-all ${
                  notification.read
                    ? 'bg-white border-slate-200 opacity-60'
                    : 'bg-white border-[#D4AF37] shadow-lg'
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getColor(notification.type)}`}>
                    {(() => {
                      const Icon = getIcon(notification.type);
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {new Date(notification.created_at).toLocaleString('fr-FR')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm ${notification.read ? 'text-slate-500' : 'text-slate-700'}`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
