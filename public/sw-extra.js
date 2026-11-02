// Extra service-worker behaviour for Course Mate (loaded by the generated Workbox service worker)

// Tapping a class reminder brings the app to the front (or opens it)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow(self.registration.scope);
    })
  );
});

// Let the page ask a waiting update to take over (used by the "Update" button)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
