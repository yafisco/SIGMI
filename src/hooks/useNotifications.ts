'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  user_id: string;
  type: 'interaction' | 'opportunity' | 'task' | 'document' | 'alert';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  related_id?: string;
  related_type?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Charger les notifications existantes
    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error loading notifications:', error);
          setError('Impossible de charger les notifications');
        } else if (data) {
          setNotifications(data as Notification[]);
          setUnreadCount(data.filter((n) => !n.read).length);
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError('Impossible de charger les notifications');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // S'abonner aux changements de notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const newNotification = payload.new as Notification;
        if (newNotification.user_id === user.id) {
          setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
          setUnreadCount((prev) => prev + 1);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, (payload) => {
        const updated = payload.new as Notification;
        if (updated.user_id === user.id) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          if (updated.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notifications' }, (payload) => {
        const deleted = payload.old as Notification;
        if (deleted.user_id === user.id) {
          setNotifications((prev) => prev.filter((n) => n.id !== deleted.id));
          if (!deleted.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);
    }
  };

  const deleteNotification = async (id: string) => {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
  };

  const deleteAll = async () => {
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user?.id);
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  };
}
