/**
 * Jibam Pharmacy PWA Service Worker
 * Version: 1.0.0
 * 
 * Caching Strategy:
 * - Static assets: Cache First (fast loading)
 * - API calls: Network First (fresh data)
 * - Images: Cache First with fallback
 * - Offline fallback for failed requests
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `jibam-pharmacy-${CACHE_VERSION}`;

// Cache names for different strategies
const STATIC_CACHE = `${CACHE_NAME}-static`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;
const API_CACHE = `${CACHE_NAME}-api`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add your critical CSS/JS files here after build
  // These will be dynamically updated during build
];

// Cache size limits (in bytes)
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB per cache type
const MAX_IMAGE_CACHE_SIZE = 100 * 1024 * 1024; // 100MB for images

/**
 * Install event - precache critical assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching static assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  
  // Force the waiting service worker to become active
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that don't match current version
          if (cacheName.startsWith('jibam-pharmacy-') && !cacheName.includes(CACHE_VERSION)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients immediately
  return self.clients.claim();
});

/**
 * Fetch event - handle all network requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (except for our API)
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/api')) {
    return;
  }

  // API calls - Network First strategy
  if (url.pathname.startsWith('/api')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Images - Cache First strategy
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Static assets - Cache First strategy
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Default - Network First with offline fallback
  event.respondWith(handleDefaultRequest(request));
});

/**
 * Handle API requests with Network First strategy
 */
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (networkResponse.ok) {
      // Don't cache sensitive data
      if (!isSensitiveRequest(request)) {
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    // Fall back to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for API calls
    return createOfflineResponse(request);
  }
}

/**
 * Handle image requests with Cache First strategy
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse);
      }
    });
    return cachedResponse;
  }
  
  // Fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Check cache size before adding
      await checkCacheSize(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Image fetch failed:', request.url);
    return createOfflineResponse(request);
  }
}

/**
 * Handle static asset requests with Cache First strategy
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Check cache size before adding
      await checkCacheSize(STATIC_CACHE, MAX_CACHE_SIZE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static asset fetch failed:', request.url);
    return createOfflineResponse(request);
  }
}

/**
 * Handle default requests with Network First strategy
 */
async function handleDefaultRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return createOfflineResponse(request);
  }
}

/**
 * Check if request is for static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.css', '.js', '.woff', '.woff2', '.ttf', '.eot', '.svg'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

/**
 * Check if request is for sensitive data (don't cache)
 */
function isSensitiveRequest(request) {
  const url = new URL(request.url);
  const sensitivePaths = ['/auth/login', '/auth/register', '/cart', '/checkout', '/payments', '/profile', '/addresses'];
  const sensitiveMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  // Don't cache sensitive endpoints
  if (sensitivePaths.some(path => url.pathname.includes(path))) {
    return true;
  }
  
  // Don't cache non-GET requests
  if (sensitiveMethods.includes(request.method)) {
    return true;
  }
  
  // Don't cache requests with authorization headers
  if (request.headers.get('authorization')) {
    return true;
  }
  
  return false;
}

/**
 * Check cache size and clean if necessary
 */
async function checkCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  let totalSize = 0;
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const size = await getResponseSize(response);
      totalSize += size;
    }
  }
  
  // If over limit, remove oldest entries
  if (totalSize > maxSize) {
    console.log('[SW] Cache size exceeded, cleaning old entries');
    const deleteCount = Math.floor(keys.length * 0.2); // Remove 20% of entries
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

/**
 * Get response size in bytes
 */
async function getResponseSize(response) {
  const blob = await response.blob();
  return blob.size;
}

/**
 * Create offline response
 */
function createOfflineResponse(request) {
  const url = new URL(request.url);
  
  // For HTML requests, return offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    return caches.match('/offline.html').then((response) => {
      return response || new Response('Offline - No connection available', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    });
  }
  
  // For other requests, return appropriate error
  return new Response('Offline - No connection available', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

/**
 * Handle push notifications (for future implementation)
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  // TODO: Implement push notification handling
  // This will be integrated with backend later
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Jibam Pharmacy',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Jibam Pharmacy', options)
  );
});

/**
 * Handle notification click
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if none open
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

/**
 * Handle background sync (for future implementation)
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  // TODO: Implement background sync for offline actions
  // This will handle queuing actions when offline and syncing when online
});

/**
 * Handle message from client
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received from client:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});