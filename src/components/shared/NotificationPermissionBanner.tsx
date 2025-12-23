"use client";

import { useEffect } from 'react';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function NotificationPermissionBanner() {
  const { permission, isSupported, requestPermission, canShowNotifications } = useBrowserNotifications();
  const { success, info } = useToast();

  // Auto-register service worker on mount
  useEffect(() => {
    if (isSupported && permission === 'default') {
      // Don't auto-request, just let user know it's available
      console.log('Browser notifications are supported but not enabled');
    }
  }, [isSupported, permission]);

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      success('Browser notifications enabled! You\'ll receive alerts even when the tab is inactive.');
    } else if (result === 'denied') {
      info('Notification permission denied. You can enable it later in your browser settings.');
    }
  };

  // Don't show banner if not supported or already granted/denied
  if (!isSupported || permission === 'granted' || permission === 'denied') {
    return null;
  }

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4 flex items-start gap-3">
      <Bell className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="font-semibold text-sm mb-1">Enable Browser Notifications</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Get notified about new messages and updates even when this tab is in the background.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleEnableNotifications}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition"
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple indicator component to show notification status
export function NotificationStatusIndicator() {
  const { permission, isSupported, canShowNotifications } = useBrowserNotifications();

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {canShowNotifications ? (
        <>
          <Bell className="w-3 h-3 text-green-500" />
          <span>Browser notifications enabled</span>
        </>
      ) : permission === 'denied' ? (
        <>
          <BellOff className="w-3 h-3 text-red-500" />
          <span>Browser notifications blocked</span>
        </>
      ) : (
        <>
          <BellOff className="w-3 h-3 text-yellow-500" />
          <span>Browser notifications disabled</span>
        </>
      )}
    </div>
  );
}
