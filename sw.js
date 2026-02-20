const CACHE_NAME = 'chef-ai-v1';

// Install event
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Fetch event for offline support
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
