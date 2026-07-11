// The Legends of Ren Zu — PWA service worker
// Faster installed-app startup: cached shell first, background refresh.

const CACHE_VERSION = "renzu-v2026-07-11-speed-2";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

const APP_SHELL = [
  "/",
  "/index.html",
  "/auth-dropin.js",
  "/manifest.webmanifest",
  "/offline.html",
  "/assets/renzu-main-app-image.jpg",
  "/assets/omniarch-footer-logo.webp",
  "/assets/email-omniarch-logo.jpg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL).catch(() => {})));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkUpdate(cacheName, request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (_) {
    return null;
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // API must always be live.
  if (url.pathname.startsWith("/api/")) return;

  // Installed app launch/navigation: shell cache first.
  if (req.mode === "navigate" || url.pathname === "/" || url.pathname === "/index.html") {
    event.respondWith((async () => {
      const cached = await caches.match("/index.html") || await caches.match("/");
      const freshPromise = networkUpdate(SHELL_CACHE, req);
      if (cached) {
        event.waitUntil(freshPromise);
        return cached;
      }
      const fresh = await freshPromise;
      return fresh || caches.match("/offline.html") || new Response("Offline", { status: 503 });
    })());
    return;
  }

  // Static local assets: cache first.
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/icons/") || url.pathname === "/auth-dropin.js" || url.pathname === "/manifest.webmanifest" || url.pathname === "/offline.html")
  ) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      const freshPromise = networkUpdate(ASSET_CACHE, req);
      if (cached) {
        event.waitUntil(freshPromise);
        return cached;
      }
      return await freshPromise || new Response("", { status: 404 });
    })());
    return;
  }

  // CDN scripts: stale-while-revalidate.
  if (url.origin !== self.location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      const freshPromise = networkUpdate(ASSET_CACHE, req);
      if (cached) {
        event.waitUntil(freshPromise);
        return cached;
      }
      return await freshPromise || fetch(req);
    })());
  }
});
