/* jeremy-grosjean.fr — service worker : le site reste disponible sans connexion.
   Pages : réseau d'abord (toujours la dernière version en ligne), copie locale seulement sans connexion.
   Fichiers versionnés (?v=…) : copie locale d'abord. Aucune donnée personnelle n'est stockée. */
'use strict';
const VERSION = 'f1f1dccdf377';
const CACHE = 'jg-' + VERSION;
const PRECACHE = ["/", "/mentions-legales.html", "/accessibilite.html", "/404.html", "/favicon.ico?v=207d79eba8", "/favicon.svg?v=3b2a8a60bb", "/apple-touch-icon.png?v=8f2070778e", "/site.webmanifest?v=638d654df0", "/assets/app.css?v=7887f42113", "/assets/i18n.js?v=2d5d2a711f", "/assets/labs.js?v=20998f7cc8", "/assets/labs2.js?v=1e3d821f80", "/assets/labs3.js?v=25097cc3f0", "/assets/labs4.js?v=08596d3504", "/assets/labs5.js?v=60720498d6", "/assets/labs6.js?v=716e5179dc", "/assets/labs7.js?v=aaf66b176d", "/assets/status.js", "/assets/news.js?v=5b80be41d3", "/assets/app.js?v=1266e0d07d", "/qr.svg", "/qr-contact.svg", "/assets/legal.css?v=c3b1ed11b9", "/assets/legal.js?v=910215cffa", "/assets/a11y.js?v=d63478cad2", "/assets/404.css?v=545c5df718", "/assets/404.js?v=645aece7b5", "/icon-192.png", "/assets/fonts/sora.woff"];

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
