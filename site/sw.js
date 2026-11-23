/* jeremy-grosjean.fr — service worker : le site reste disponible sans connexion.
   Pages : réseau d'abord (toujours la dernière version en ligne), copie locale seulement sans connexion.
   Fichiers versionnés (?v=…) : copie locale d'abord. Aucune donnée personnelle n'est stockée. */
'use strict';
const VERSION = 'ae7271d4f1b5';
const CACHE = 'jg-' + VERSION;
const PRECACHE = ["/", "/mentions-legales.html", "/accessibilite.html", "/404.html", "/favicon.ico?v=207d79eba8", "/favicon.svg?v=3b2a8a60bb", "/apple-touch-icon.png?v=8f2070778e", "/site.webmanifest?v=f3b98af3eb", "/assets/fonts/sora.woff2", "/assets/app.css?v=a9acb4d13b", "/assets/i18n.js?v=a4900ea0d3", "/assets/labs.js?v=20998f7cc8", "/assets/labs2.js?v=1e3d821f80", "/assets/labs3.js?v=3fbcac68eb", "/assets/labs4.js?v=130a31f193", "/assets/labs5.js?v=60720498d6", "/assets/labs6.js?v=716e5179dc", "/assets/labs7.js?v=535f93f773", "/assets/status.js", "/assets/news.js?v=5b80be41d3", "/assets/app.js?v=9f14c32b1d", "/assets/jg.webp", "/qr.svg", "/qr-contact.svg", "/assets/legal.css?v=40df3dad7d", "/assets/legal.js?v=e7f63e2a55", "/assets/a11y.js?v=c7a891bfeb", "/assets/404.css?v=545c5df718", "/assets/404.js?v=314ec3e13b", "/icon-192.png"];

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
