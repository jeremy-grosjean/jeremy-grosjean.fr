# jeremy-grosjean.fr

Site personnel de **Jérémy Grosjean**, technicien informatique, disponible pour une alternance Technicien informatique (Bac+2).

**➜ [jeremy-grosjean.fr](https://jeremy-grosjean.fr)**

| Test | Note |
|---|---|
| [SSL Labs](https://www.ssllabs.com/ssltest/analyze.html?d=jeremy-grosjean.fr) | A+ |
| [Mozilla Observatory](https://developer.mozilla.org/fr/observatory/analyze?host=jeremy-grosjean.fr) | A+ (150/100) |
| [securityheaders.com](https://securityheaders.com/?q=jeremy-grosjean.fr&followRedirects=on) | A+ |
| [PageSpeed Insights](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fjeremy-grosjean.fr) | 100 · 100 · 100 (mobile et ordinateur) |

*Notes relevées le 28 octobre 2026.*

## Ce que contient le site

- Page d'accueil animée (réseau interactif à la souris et au doigt), en **6 langues** : français, anglais, chinois simplifié et traditionnel, cantonais, coréen.
- **Deux mini-jeux** : « Protéger le serveur » (malware, DDoS, hameçonnage) et un **simulateur de support N1/N2** (tickets réalistes : DHCP, DNS, Active Directory, GPO, droits NTFS…).
- **Terminal caché** (`Ctrl/⌘ + K`) : `help`, `cv`, `ipcalc`, `dig`, `device`, `neofetch`, `htop`, `secrets`…
- **Vue recruteur** sur une page, sans animation : [jeremy-grosjean.fr/#recruteur](https://jeremy-grosjean.fr/#recruteur). C'est aussi la fiche A4 imprimée avec `Ctrl/⌘ + P`.
- **Me contacter** : e-mail déjà rempli en un clic dans Gmail, Outlook, Outlook pro (Microsoft 365) ou Yahoo Mail, ou dans la messagerie de l'appareil. Ce sont de simples liens : rien ne passe par le site.
- **Page 404 jouable** : trois questions réseau pour que le paquet retrouve sa route.
- **[Déclaration d'accessibilité](https://jeremy-grosjean.fr/accessibilite.html)** (objectif WCAG 2.2 AA).
- **Supervision** : état du certificat TLS, des e-mails (MX, SPF, DMARC, TLS-RPT), de DNSSEC, du CAA et des méthodes HTTP, relevé automatiquement à chaque mise en ligne, avec un lien vers la [disponibilité en direct](https://stats.uptimerobot.com/gHB6v8KF6j) (UptimeRobot).
- **Audit de sécurité animé**, mesures réelles de poids et de chargement, réglages d'accessibilité (taille du texte, contraste).
- Fonctionne **hors ligne** après une première visite, et s'installe comme une application.

## Choix de sécurité et de confidentialité

- **0 cookie, 0 traceur, 0 requête vers un autre site, aucun formulaire** : le site ne collecte aucune donnée.
- En-têtes stricts : **CSP** `default-src 'none'` sans `unsafe-*`, **Trusted Types**, **HSTS**, COOP/COEP/CORP, `X-Frame-Options`, `Referrer-Policy: no-referrer`, `Permissions-Policy`.
- Aucun script en ligne. La feuille de style est intégrée à la page d'accueil au moment de la préparation (affichage plus rapide) et autorisée **uniquement par son empreinte SHA-256** dans la CSP : tout autre style injecté est bloqué.
- Aucune bibliothèque externe : **HTML, CSS et JavaScript écrits à la main**, sans framework ni dépendance.
- Adresse e-mail assemblée par le script (non lisible par les robots qui lisent le HTML).
- Serveur en **lecture seule** : seules les requêtes `GET` et `HEAD` sont acceptées, tout le reste est refusé (`405`).
- Domaine : **DNSSEC**, **SPF**, **DKIM**, **DMARC** (`quarantine`), **TLS-RPT**, **MTA-STS** (e-mails reçus obligatoirement chiffrés), **CAA** (seul Let's Encrypt peut émettre un certificat), fichier [`security.txt`](https://jeremy-grosjean.fr/.well-known/security.txt) dont la date d'expiration est contrôlée à chaque mise en ligne.

## Organisation du dépôt

```
site/                     le site, tel qu'il est publié (version lisible)
  index.html              page d'accueil
  404.html                page d'erreur personnalisée
  mentions-legales.html   mentions légales et confidentialité
  accessibilite.html      déclaration d'accessibilité
  assets/                 styles, scripts, traductions (i18n.js)
  sw.js                   service worker (mode hors ligne)
  .htaccess               en-têtes de sécurité et redirections (Apache)
docs/                     politique MTA-STS, publiée par GitHub Pages sur mta-sts.jeremy-grosjean.fr
outils/
  preparer.py             minifie, intègre la feuille de style (empreinte CSP), versionne et crée le zip
  empreintes.py           empreintes ?v=… anti-cache + génération du service worker
  publier.sh              tout en une commande : préparer, envoyer, vérifier
  mettre-a-jour-site.sh   mise en ligne par SFTP, vérifications et annulation automatique
  qr.py                   générateur de QR code (sans dépendance)
  signer-security-txt.sh  signe security.txt avec ma clé PGP (source : outils/security.txt)
```

## Mise en ligne

Une seule commande :

```
bash outils/publier.sh
```

Elle prépare la version en ligne (minification avec esbuild si présent, empreintes anti-cache, service worker), l'envoie par **SFTP** (le mot de passe est demandé à chaque fois et n'est jamais enregistré), relève la supervision, puis vérifie en ligne les fichiers, les en-têtes, les redirections, la page 404 et le refus des requêtes autres que `GET`/`HEAD`. En cas de panne, le `.htaccess` est retiré automatiquement. Pour finir, elle signale si GitHub n'est pas à jour.

Les deux étapes existent aussi séparément : `outils/preparer.py` puis `outils/mettre-a-jour-site.sh`.

L'hôte et l'identifiant SFTP ne sont **pas** dans ce dépôt : le script les lit dans un fichier privé, `~/.config/jeremy-grosjean/site.conf`, qui reste sur l'ordinateur.

## Droits

© 2026 Jérémy Grosjean. Tous droits réservés. Le code est visible pour présenter mon travail ; merci de me contacter avant toute réutilisation.

---

## English

Personal website of **Jérémy Grosjean**, IT technician, available for a work-study contract (IT Technician, 2-year degree).

- Hand-written HTML, CSS and JavaScript: **no framework, no dependency, no external request**.
- **6 languages**, a one-page recruiter view (also the printed A4 sheet), two mini-games (server defense and a **level 1/2 IT support simulator**), a hidden terminal (`ipcalc`, `dig`, `device`, `htop`…), service monitoring, offline mode.
- **0 cookies, 0 trackers, no forms.** Strict security headers (CSP without `unsafe-*`, Trusted Types, HSTS, COOP/COEP/CORP).
- Grades: **A+** on SSL Labs, Mozilla Observatory and securityheaders.com; **100/100/100** on PageSpeed Insights.

Contact: use the « Contact me » button on [jeremy-grosjean.fr](https://jeremy-grosjean.fr).
