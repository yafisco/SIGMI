'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { Bell, Check, Trash2, Clock, Target, FileText, AlertCircle, CheckCheck, Sparkles, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, deleteNotification, deleteAll, refresh } = useNotificationContext();
  const [creatingTest, setCreatingTest] = useState(false);

  const showEmpty = !loading && (!error || error === '') && notifications.length === 0;
  const showError = !loading && error && error !== '';

  const createTestNotification = async () => {
    if (!user) return;
    setCreatingTest(true);
    try {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'alert',
        title: 'Notification de test',
        message: 'Ceci est une notification de test pour vérifier le fonctionnement du système.',
        read: false,
      });
      refresh();
    } catch (err) {
      console.error('Error creating test notification:', err);
    } finally {
      setCreatingTest(false);
    }
  };

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

  const getGradient = (type: string) => {
    switch (type) {
      case 'interaction': return 'from-blue-500 to-blue-600';
      case 'opportunity': return 'from-emerald-500 to-emerald-600';
      case 'task': return 'from-amber-500 to-amber-600';
      case 'document': return 'from-purple-500 to-purple-600';
      case 'alert': return 'from-red-500 to-red-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header premium */}
      <div className="bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="relative"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                  >
                    <span className="text-xs font-bold text-white">{unreadCount}</span>
                  </motion.div>
                )}
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Notifications</h1>
                <p className="text-blue-100 text-sm">
                  {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createTestNotification}
                disabled={creatingTest}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/20 backdrop-blur-sm text-white rounded-xl hover:bg-emerald-500/30 transition-all border border-emerald-400/30 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">{creatingTest ? 'Création...' : 'Test'}</span>
              </motion.button>
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all border border-white/30"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="font-medium">Tout marquer lu</span>
                </motion.button>
              )}
              {notifications.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={deleteAll}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 backdrop-blur-sm text-white rounded-xl hover:bg-red-500/30 transition-all border border-red-400/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Tout supprimer</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 border-4 border-[#D4AF37] border-t-transparent rounded-full mb-6"
              />
              <p className="text-slate-600 font-medium text-lg">Chargement des notifications...</p>
            </motion.div>
          ) : showError ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-red-600 font-medium text-lg mb-4">{error}</p>
              <p className="text-slate-500 text-sm">
                Assurez-vous que la table notifications existe dans Supabase
              </p>
            </motion.div>
          ) : showEmpty ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6"
              >
                <Sparkles className="w-12 h-12 text-slate-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Aucune notification</h3>
              <p className="text-slate-500 mb-4">Cliquez sur "Test" pour créer une notification de test</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    notification.read
                      ? 'bg-white border border-slate-200 shadow-sm opacity-70'
                      : 'bg-white border-2 border-[#D4AF37] shadow-xl'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  {!notification.read && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#D4AF37] to-[#B8941F]" />
                  )}
                  <div className="flex items-start gap-5 p-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(notification.type)} flex items-center justify-center shrink-0 shadow-lg`}
                    >
                      {(() => {
                        const Icon = getIcon(notification.type);
                        return <Icon className="w-7 h-7 text-white" />;
                      })()}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className={`font-bold text-lg ${notification.read ? 'text-slate-600' : 'text-slate-900'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                            {formatTime(notification.created_at)}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                      <p className={`text-base ${notification.read ? 'text-slate-500' : 'text-slate-700'}`}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
