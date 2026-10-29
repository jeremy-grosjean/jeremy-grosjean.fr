/* jeremy-grosjean.fr — service worker : le site reste disponible sans connexion.
   Pages : réseau d'abord (toujours la dernière version en ligne), copie locale seulement sans connexion.
   Fichiers versionnés (?v=…) : copie locale d'abord. Aucune donnée personnelle n'est stockée. */
'use strict';
const VERSION = '7559b8f170d9';
const CACHE = 'jg-' + VERSION;
const PRECACHE = ["/", "/mentions-legales.html", "/accessibilite.html", "/404.html", "/favicon.ico?v=5d8dad93ca", "/favicon.svg?v=c653120d20", "/apple-touch-icon.png?v=ea10cf004d", "/site.webmanifest?v=1170d79b15", "/assets/app.css?v=4302b59cf3", "/assets/i18n.js?v=91faf46deb", "/assets/labs.js?v=24e840f65d", "/assets/labs2.js?v=3ef38b7751", "/assets/status.js", "/assets/news.js?v=5b80be41d3", "/assets/app.js?v=ab83960d9a", "/qr.svg", "/assets/legal.css?v=81e48507a2", "/assets/legal.js?v=28dde1ef7d", "/assets/a11y.js?v=6d8d0c5a58", "/assets/404.css?v=608d9756c5", "/assets/404.js?v=f69e4adc89", "/icon-192.png", "/og.jpg"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(PRECACHE.map(u => fetch(u, { cache: 'no-cache' }).then(r => {
    if (!r.ok) throw new Error(u + ' → ' + r.status);
    return c.put(u, r);
  })))).then(() => self.skipWaiting()).catch(err => { console.warn('[sw] installation impossible :', err && err.message); throw err; }));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('jg-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(url.pathname, copy)); }
      return res;
    }).catch(() => caches.match(url.pathname).then(hit => hit || caches.match('/'))));
    return;
  }
  const save = res => { if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
  if (url.searchParams.has('v')) {
    /* fichier versionné : son contenu ne change jamais, la copie locale suffit */
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(save)));
  } else {
    /* autres fichiers (relevés de supervision, images…) : réseau d'abord, copie locale sans connexion */
    e.respondWith(fetch(req).then(save).catch(() => caches.match(req, { ignoreSearch: true })));
  }
});
