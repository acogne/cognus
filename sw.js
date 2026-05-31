const CACHE = 'cognus-v2';
const SHELL = [
  './index.html', './Picto Cognus.png', './manifest.json',
  './One%20FM.png', './Radio%20Lac.png', './LFM.png', './Rouge.png'
];

// Installation : mise en cache des ressources statiques
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

// Activation : purge des anciennes versions du cache
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stratégie Network-first : toujours chercher en ligne, fallback cache si hors-ligne
self.addEventListener('fetch', e => {
  // Ne pas intercepter les appels Google APIs / Sheets / OAuth
  if (e.request.url.includes('googleapis.com') ||
      e.request.url.includes('accounts.google.com') ||
      e.request.url.includes('make.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
