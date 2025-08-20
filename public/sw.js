self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    data: data.data,
    actions: data.actions,
    tag: data.tag,
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const action = event.action;
  const notification = event.notification;
  const data = notification.data || {};

  if (action) {
    // Handle action clicks
    console.log('Action clicked:', action);
  } else {
    // Handle notification click
    const urlToOpen = data.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clients => {
          // Check if there's already a window/tab open with the target URL
          for (const client of clients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If not, open a new window/tab
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle background sync (optional)
self.addEventListener('backgroundsync', event => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Handle any background notification tasks
      console.log('Background sync for notifications')
    );
  }
});