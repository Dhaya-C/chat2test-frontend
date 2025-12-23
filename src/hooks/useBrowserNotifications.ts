"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface NotificationData {
  chatId?: number;
  projectId?: number;
  url?: string;
}

interface BrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: NotificationData;
}

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);
  const serviceWorkerRef = useRef<ServiceWorkerRegistration | null>(null);

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    }
  }, []);

  // Register service worker
  useEffect(() => {
    if (!isSupported) return;

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        
        console.log('Service Worker registered:', registration);
        serviceWorkerRef.current = registration;
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        setServiceWorkerReady(true);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn('Browser notifications not supported');
      return 'denied';
    }

    if (permission === 'granted') {
      return 'granted';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }, [isSupported, permission]);

  // Show browser notification
  const showNotification = useCallback(
    async (options: BrowserNotificationOptions) => {
      if (!isSupported) {
        console.warn('Browser notifications not supported');
        return;
      }

      // Request permission if not already granted
      let currentPermission = permission;
      if (currentPermission !== 'granted') {
        currentPermission = await requestPermission();
      }

      if (currentPermission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      try {
        // Use service worker if available, otherwise use Notification API directly
        if (serviceWorkerReady && serviceWorkerRef.current?.active) {
          serviceWorkerRef.current.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload: {
              title: options.title,
              body: options.body,
              icon: options.icon || '/favicon.ico',
              tag: options.tag || `notification-${Date.now()}`,
              data: options.data || {},
            },
          });
        } else {
          // Fallback to direct Notification API
          const notification = new Notification(options.title, {
            body: options.body,
            icon: options.icon || '/favicon.ico',
            tag: options.tag || `notification-${Date.now()}`,
            badge: '/favicon.ico',
            requireInteraction: false,
            silent: false,
          });

          notification.onclick = () => {
            window.focus();
            if (options.data?.url) {
              window.location.href = options.data.url;
            }
            notification.close();
          };
        }
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    },
    [isSupported, permission, requestPermission, serviceWorkerReady]
  );

  // Check if page is visible
  const isPageVisible = useCallback(() => {
    return document.visibilityState === 'visible';
  }, []);

  return {
    permission,
    isSupported,
    serviceWorkerReady,
    requestPermission,
    showNotification,
    isPageVisible,
    canShowNotifications: permission === 'granted' && isSupported,
  };
}
