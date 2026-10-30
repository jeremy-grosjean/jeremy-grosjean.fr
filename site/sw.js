/* jeremy-grosjean.fr — service worker : le site reste disponible sans connexion.
   Pages : réseau d'abord (toujours la dernière version en ligne), copie locale seulement sans connexion.
   Fichiers versionnés (?v=…) : copie locale d'abord. Aucune donnée personnelle n'est stockée. */
'use strict';
const VERSION = '72c69cad7dc2';
const CACHE = 'jg-' + VERSION;
const PRECACHE = ["/", "/mentions-legales.html", "/accessibilite.html", "/404.html", "/favicon.ico?v=5d8dad93ca", "/favicon.svg?v=c653120d20", "/apple-touch-icon.png?v=ea10cf004d", "/site.webmanifest?v=1170d79b15", "/assets/app.css?v=d1cfe35386", "/assets/i18n.js?v=e3234991b4", "/assets/labs.js?v=28d66e0db4", "/assets/labs2.js?v=194508f5f9", "/assets/labs3.js?v=e42ceff3d6", "/assets/labs4.js?v=1f113c584a", "/assets/labs5.js?v=60720498d6", "/assets/labs6.js?v=716e5179dc", "/assets/labs7.js?v=139f325add", "/assets/status.js", "/assets/news.js?v=5b80be41d3", "/assets/app.js?v=716f53f2ae", "/qr.svg", "/qr-contact.svg", "/assets/legal.css?v=81e48507a2", "/assets/legal.js?v=877bcce331", "/assets/a11y.js?v=aeb01283a6", "/assets/404.css?v=608d9756c5", "/assets/404.js?v=79c1757ca4", "/icon-192.png", "/og.jpg", "/assets/fonts/sora.woff"];

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
