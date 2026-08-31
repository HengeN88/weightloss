/* Weightloss — service worker.
   Cache-first. Appen skal virke uten nett, alltid.
   Bump VERSJON når index.html endres, ellers ser du den gamle. */

const VERSJON = "weightloss-v5";
const FILER = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSJON)
      .then(c => c.addAll(FILER))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(n => Promise.all(n.filter(x => x !== VERSJON).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(traff => {
      if (traff) return traff;
      return fetch(e.request).then(svar => {
        if (svar && svar.status === 200 && svar.type === "basic") {
          const kopi = svar.clone();
          caches.open(VERSJON).then(c => c.put(e.request, kopi));
        }
        return svar;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
