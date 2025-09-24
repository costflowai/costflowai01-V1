/**
 * CostFlowAI Service Worker
 * Provides offline functionality and caching for better performance
 */

const CACHE_NAME = 'costflowai-v1.2.0';
const OFFLINE_URL = '/offline.html';

// Core assets to cache immediately
const CORE_ASSETS = [
  '/',
  '/calculators/',
  '/assets/css/dist/app.min.css',
  '/assets/css/enterprise.css',
  '/assets/js/core/analytics.js',
  '/assets/js/core/performance.js',
  '/assets/js/core/accessibility.js',
  '/vendor/lunr/lunr.min.js',
  '/manifest.json'
];

// Calculator assets to cache on demand
const CALCULATOR_ASSETS = [
  '/calculators/concrete/',
  '/calculators/drywall/',
  '/calculators/paint/',
  '/calculators/electrical/',
  '/calculators/plumbing/',
  '/calculators/hvac/',
  '/calculators/roofing/',
  '/calculators/framing/',
  '/calculators/flooring/',
  '/calculators/insulation/'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Core assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache core assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache error responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache calculator pages and assets
            if (shouldCache(event.request.url)) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  console.log('Service Worker: Caching new asset:', event.request.url);
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(error => {
            console.log('Service Worker: Network failed, serving offline page');

            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }

            throw error;
          });
      })
  );
});

// Helper function to determine if a URL should be cached
function shouldCache(url) {
  // Cache calculator pages
  if (url.includes('/calculators/')) {
    return true;
  }

  // Cache CSS and JS assets
  if (url.includes('/assets/css/') || url.includes('/assets/js/')) {
    return true;
  }

  // Cache vendor libraries
  if (url.includes('/vendor/')) {
    return true;
  }

  // Cache blog posts
  if (url.includes('/blog/')) {
    return true;
  }

  return false;
}

// Handle background sync for analytics
self.addEventListener('sync', event => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(
      syncAnalytics()
    );
  }
});

// Sync analytics data when online
async function syncAnalytics() {
  try {
    // Get pending analytics events from IndexedDB
    const pendingEvents = await getPendingAnalyticsEvents();

    if (pendingEvents.length > 0) {
      console.log('Service Worker: Syncing', pendingEvents.length, 'analytics events');

      // Send events to analytics
      for (const event of pendingEvents) {
        await sendAnalyticsEvent(event);
      }

      // Clear pending events
      await clearPendingAnalyticsEvents();
      console.log('Service Worker: Analytics sync completed');
    }
  } catch (error) {
    console.error('Service Worker: Analytics sync failed:', error);
  }
}

// Mock analytics functions (implement based on your analytics provider)
async function getPendingAnalyticsEvents() {
  // Implementation would read from IndexedDB
  return [];
}

async function sendAnalyticsEvent(event) {
  // Implementation would send to analytics provider
  console.log('Sending analytics event:', event);
}

async function clearPendingAnalyticsEvents() {
  // Implementation would clear IndexedDB
  console.log('Clearing pending analytics events');
}

// Handle push notifications (if needed)
self.addEventListener('push', event => {
  console.log('Service Worker: Push message received');

  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/assets/images/icon-192x192.png',
    badge: '/assets/images/badge-72x72.png',
    tag: 'costflowai-update',
    requireInteraction: false,
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification('CostFlowAI', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

console.log('Service Worker: Script loaded');