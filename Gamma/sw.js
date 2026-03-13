const CACHE_NAME = "signal-shelter-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/about.html",
  "/methodology.html",
  "/stations.html",
  "/data.html",
  "/resources.html",
  "/faq.html",
  "/contact.html",
  "/privacy.html",
  "/terms.html",
  "/disclaimer.html",
  "/404.html",
  "/pages/map.html",
  "/manifest.json",
  "/data/stations.json",
  "/assets/css/theme.css",
  "/assets/css/base.css",
  "/assets/css/layout.css",
  "/assets/css/components.css",
  "/assets/css/pages.css",
  "/assets/js/main.js",
  "/assets/js/config.js",
  "/assets/js/layout.js",
  "/assets/js/stations.js",
  "/assets/js/radnet.js",
  "/assets/js/pages.js",
  "/assets/js/map.js",
  "/assets/icons/favicon-16.png",
  "/assets/icons/favicon-32.png",
  "/assets/icons/apple-touch-icon.png",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-192-maskable.png",
  "/assets/icons/icon-512.png",
  "/assets/icons/icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.pathname.startsWith("/radnet/")) {
    event.respondWith(
      fetch(request).catch(() => new Response("Live data temporarily unavailable.", { status: 503 }))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match("/404.html"));
    })
  );
});
