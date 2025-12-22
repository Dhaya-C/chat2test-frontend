"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { Notification } from '@/types/notification';
import { useBrowserNotifications } from './useBrowserNotifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const previousNotificationIds = useRef<Set<number>>(new Set());
  
  // Browser notification support
  const { showNotification, canShowNotifications } = useBrowserNotifications();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/notifications');
      // Sort by id in descending order (latest/highest id first)
      const sortedNotifications = [...response.data].sort((a, b) => b.id - a.id);
      
      // Detect new notifications and show browser notification
      if (canShowNotifications && previousNotificationIds.current.size > 0) {
        const newNotifications = sortedNotifications.filter(
          notif => !previousNotificationIds.current.has(notif.id) && notif.status === 'unread'
        );
        
        // Show browser notification for each new notification (max 3 to avoid spam)
        newNotifications.slice(0, 3).forEach((notif) => {
          showNotification({
            title: 'New Notification',
            body: notif.message,
            tag: `notification-${notif.id}`,
            data: {
              chatId: notif.chat_id,
              projectId: notif.project_id,
              url: notif.chat_id ? `/chat?chatId=${notif.chat_id}` : `/dashboard/projects/${notif.project_id}`,
            },
          });
        });
      }
      
      // Update the previous notification IDs
      previousNotificationIds.current = new Set(sortedNotifications.map(n => n.id));
      
      setNotifications(sortedNotifications);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [canShowNotifications, showNotification]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      // Optimistically update the UI
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'read' as const }
            : notif
        )
      );

      // Call the API to mark as read
      await api.put(`/notifications/${notificationId}/read`);
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
      // Revert the optimistic update on error
      await fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    // Prevent concurrent mark all operations
    if (isMarkingAll) return;

    const unreadIds = notifications.filter(n => n.status === 'unread').map(n => n.id);
    if (unreadIds.length === 0) return;

    setIsMarkingAll(true);
    // Optimistic update: set all to read
    setNotifications(prev => prev.map(notif => (
      unreadIds.includes(notif.id) ? { ...notif, status: 'read' as const } : notif
    )));
    try {
      // Prefer a batch endpoint if available
      await api.put('/notifications/read', { ids: unreadIds });
    } catch (err) {
      // If the batch endpoint isn't supported / fails, fall back to per-item updates
      try {
        await Promise.all(unreadIds.map(id => api.put(`/notifications/${id}/read`)));
      } catch (err2: any) {
        console.error('Failed to mark all notifications as read:', err2);
        // Revert optimistic update on error
        await fetchNotifications();
      }
    } finally {
      setIsMarkingAll(false);
    }
  }, [isMarkingAll, notifications, fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    isMarkingAll,
  };
}
