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
- **Terminal caché** (`Ctrl/⌘ + K`) : `help`, `ipcalc`, `dig`, `device`, `neofetch`, `htop`, `secrets`…
- **Supervision** : état du certificat TLS, des e-mails (MX, SPF, DMARC, TLS-RPT) et de DNSSEC, relevé automatiquement à chaque mise en ligne.
- **Audit de sécurité animé**, mesures réelles de poids et de chargement, réglages d'accessibilité (taille du texte, contraste).
- Fonctionne **hors ligne** après une première visite, et s'installe comme une application.

## Choix de sécurité et de confidentialité

- **0 cookie, 0 traceur, 0 requête vers un autre site, aucun formulaire** : le site ne collecte aucune donnée.
- En-têtes stricts : **CSP** `default-src 'none'` sans `unsafe-*`, **Trusted Types**, **HSTS**, COOP/COEP/CORP, `X-Frame-Options`, `Referrer-Policy: no-referrer`, `Permissions-Policy`.
- Aucun script ou style en ligne, aucune bibliothèque externe : **HTML, CSS et JavaScript écrits à la main**, sans framework ni dépendance.
- Adresse e-mail assemblée par le script (non lisible par les robots qui lisent le HTML).
- Domaine : **DNSSEC**, **SPF**, **DKIM**, **DMARC** (`quarantine`), **TLS-RPT**, fichier [`security.txt`](https://jeremy-grosjean.fr/.well-known/security.txt).

## Organisation du dépôt

```
site/                     le site, tel qu'il est publié (version lisible)
  index.html              page d'accueil
  404.html                page d'erreur personnalisée
  mentions-legales.html   mentions légales et confidentialité
  assets/                 styles, scripts, traductions (i18n.js)
  sw.js                   service worker (mode hors ligne)
  .htaccess               en-têtes de sécurité et redirections (Apache)
outils/
  preparer.py             minifie, versionne et crée le zip de mise en ligne
  empreintes.py           empreintes ?v=… anti-cache + génération du service worker
  mettre-a-jour-site.sh   mise en ligne par SFTP, vérifications et annulation automatique
  qr.py                   générateur de QR code (sans dépendance)
```

## Mise en ligne

1. `python3 outils/preparer.py` crée `~/Downloads/jeremy-grosjean-site.zip`.
2. `outils/mettre-a-jour-site.sh` envoie le site par **SFTP** (le mot de passe est demandé à chaque fois et n'est jamais enregistré), relève la supervision, puis vérifie en ligne les fichiers, les en-têtes, les redirections et la page 404. En cas de panne, il retire automatiquement le `.htaccess`.

L'hôte et l'identifiant SFTP ne sont **pas** dans ce dépôt : le script les lit dans un fichier privé, `~/.config/jeremy-grosjean/site.conf`, qui reste sur l'ordinateur.

## Droits

© 2026 Jérémy Grosjean. Tous droits réservés. Le code est visible pour présenter mon travail ; merci de me contacter avant toute réutilisation.

---

## English

Personal website of **Jérémy Grosjean**, IT technician, available for a work-study contract (IT Technician, 2-year degree).

- Hand-written HTML, CSS and JavaScript: **no framework, no dependency, no external request**.
- **6 languages**, two mini-games (server defense and a **level 1/2 IT support simulator**), a hidden terminal (`ipcalc`, `dig`, `device`, `htop`…), service monitoring, offline mode.
- **0 cookies, 0 trackers, no forms.** Strict security headers (CSP without `unsafe-*`, Trusted Types, HSTS, COOP/COEP/CORP).
- Grades: **A+** on SSL Labs, Mozilla Observatory and securityheaders.com; **100/100/100** on PageSpeed Insights.

Contact: use the « Contact me » button on [jeremy-grosjean.fr](https://jeremy-grosjean.fr).
