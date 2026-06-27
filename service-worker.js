// public/service-worker.js

const CACHE_NAME = "remoteforge-v1";
const urlsToCache = [
  "/",
  "/remotes",
  "/playground",
  "/manifest.json",
  // Don't cache Next.js specific paths
];

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Cache opened");
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("Service Worker: Failed to cache", error);
        // Don't fail installation if some URLs can't be cached
        return Promise.resolve();
      });
    }),
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - network first, cache fallback
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip WebSocket connections
  if (
    event.request.url.includes("ws://") ||
    event.request.url.includes("wss://")
  ) {
    return;
  }

  // Skip Next.js development/build files
  if (
    event.request.url.includes("/_next/") ||
    event.request.url.includes("/__next") ||
    event.request.url.includes("/api/")
  ) {
    return;
  }

  // Skip external requests (Supabase, Clerk, etc.)
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    // Try network first
    fetch(event.request)
      .then((response) => {
        // If successful, cache and return
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // If navigation request and offline, return cached home page
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
      }),
  );
});

// Log when service worker is ready
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
