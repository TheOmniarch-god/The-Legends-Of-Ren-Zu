const CACHE_NAME = "renzu-shell-v3";
const SHELL_URLS = [
  "/",
  "/index.html",
  "/auth-dropin.js",
  "/manifest.webmanifest",
  "/offline.html",
  "/icons/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/assets/realm-gumaster.jpg",
  "/assets/realm-guimmortal.jpg",
  "/assets/realm-venerable.jpg"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(req)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("/offline.html") || caches.match("/")))
  );
});
