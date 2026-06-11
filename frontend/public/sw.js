// public/sw.js  — Push Notification Service Worker
self.addEventListener('push', (event) => {
  let data = { title: 'ExpenseTracker', body: 'You have a new notification' };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.jpg',
      badge: '/favicon.jpg',
      tag: data.tag || 'expense-tracker',
      renotify: true,
      vibrate: [150, 50, 150],
      data: { url: self.location.origin + '/dashboard' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
