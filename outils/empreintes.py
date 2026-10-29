# Ajoute une empreinte (?v=…) aux fichiers CSS/JS/icônes et régénère le service worker.
# Ainsi, chaque mise à jour est vue immédiatement par les navigateurs, sans vieux cache.
# Utilisation : python3 outils/empreintes.py [dossier]   (par défaut : site/)
import hashlib, json, pathlib, re, sys
ICI = pathlib.Path(__file__).resolve().parent
RACINE = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ICI.parent / 'site'

def empreinte(f):
    return hashlib.sha256((RACINE / f).read_bytes()).hexdigest()[:10]

def versionner(page, fichiers):
    html = (RACINE / page).read_text()
    for f in fichiers:
        html = re.sub(r'(/' + re.escape(f) + r')(\?v=[0-9a-f]+)?"', r'\1?v=' + empreinte(f) + '"', html)
    (RACINE / page).write_text(html)

versionner('index.html', ['assets/app.css', 'assets/i18n.js', 'assets/labs.js', 'assets/labs2.js', 'assets/labs3.js', 'assets/labs4.js', 'assets/labs5.js', 'assets/labs6.js', 'assets/news.js', 'assets/app.js', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'site.webmanifest'])
versionner('404.html', ['assets/404.css', 'assets/404.js', 'favicon.ico', 'favicon.svg'])
versionner('mentions-legales.html', ['assets/legal.css', 'assets/legal.js', 'favicon.ico', 'favicon.svg'])
versionner('accessibilite.html', ['assets/legal.css', 'assets/a11y.js', 'favicon.ico', 'favicon.svg'])

# Service worker : liste des fichiers gardés hors ligne + version = empreinte de tout le site
urls = ['/', '/mentions-legales.html', '/accessibilite.html', '/404.html']
for page in ['index.html', 'mentions-legales.html', 'accessibilite.html', '404.html']:
    for u in re.findall(r'(?:href|src)="(/[^"#]+)"', (RACINE / page).read_text()):
        if u.endswith('.html') or u == '/' or u.startswith('/.well-known') or u.endswith('.vcf'):
            continue
        if u not in urls:
            urls.append(u)
for extra in ['/qr.svg', '/icon-192.png', '/og.jpg', '/assets/status.js', '/assets/fonts/sora.woff']:
    if extra not in urls:
        urls.append(extra)
tout = hashlib.sha256()
for f in sorted(p for p in RACINE.rglob('*') if p.is_file() and p.name != 'sw.js'):
    tout.update(str(f.relative_to(RACINE)).encode()); tout.update(f.read_bytes())
modele = (ICI / 'sw.template.js').read_text()
(RACINE / 'sw.js').write_text(modele.replace('__VERSION__', tout.hexdigest()[:12]).replace('__PRECACHE__', json.dumps(urls)))
print('Empreintes à jour, service worker', tout.hexdigest()[:12], '·', len(urls), 'fichiers hors ligne')
