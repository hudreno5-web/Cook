
const CACHE_NAME = 'chef-Ai-v13'; 
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/Chefcon.png',
    '/Chefscreen.png'
];

// 1. INSTALL EVENT - App install hote hi files ko cache (download) karta hai
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching App Shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((error) => console.log('Caching failed:', error))
    );
    // Naya service worker turant activate karne ke liye
    self.skipWaiting(); 
});

// 2. ACTIVATE EVENT - Purane cache ko delete karta hai (storage bachane ke liye)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Turant control lene ke liye
});

// 3. FETCH EVENT - Pehle cache se data deta hai, agar nahi mila toh internet (network) se
self.addEventListener('fetch', (event) => {
    // Sirf apni website ki files ko cache karein, bahar ki APIs (jaise Firebase) ko ignore karein
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Agar file cache mein mil gayi, toh wahi return karo
            if (cachedResponse) {
                return cachedResponse;
            }

            // Agar cache mein nahi mili, toh internet se fetch karo
            return fetch(event.request).then((networkResponse) => {
                // Nayi file ko bhi cache mein daal do taaki agli baar jaldi load ho
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        }).catch(() => {
            // Agar internet bhi nahi hai aur cache bhi nahi, toh yahan offline page dikha sakte hain
            console.log('You are offline');
        })
    );
});
