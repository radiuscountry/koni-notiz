// Minimaler Service Worker nur fuers Installieren. Kein Caching, damit Updates sofort ankommen.
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => self.clients.claim());
