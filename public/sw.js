// Service Worker for Browser Notifications
// This handles showing notifications even when the app is in the background

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

// Handle notification display
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Get the data from the notification
  const data = event.notification.data || {};
  const { chatId, projectId, url } = data;
  
  // Open or focus the app window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (let client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus().then((client) => {
            // Navigate to the specific URL if provided
            if (url && client.navigate) {
              return client.navigate(url);
            }
            return client;
          });
        }
      }
      
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        const targetUrl = url || '/dashboard';
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag, data } = event.data.payload;
    
    self.registration.showNotification(title, {
      body,
      icon: icon || '/favicon.ico',
      tag: tag || 'default-notification',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: data || {},
      requireInteraction: false,
      silent: false,
    });
  }
});

console.log('Service Worker: Loaded');
