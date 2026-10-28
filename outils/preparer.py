# Prépare la version en ligne : copie de site/, minification (esbuild, si disponible), empreintes, zip.
# Utilisation : python3 outils/preparer.py   →   crée ~/Downloads/jeremy-grosjean-site.zip
import pathlib, shutil, subprocess, sys, zipfile
ICI = pathlib.Path(__file__).resolve().parent
SOURCES, DIST = ICI.parent / 'site', ICI.parent / 'dist'
ZIP = pathlib.Path.home() / 'Downloads' / 'jeremy-grosjean-site.zip'

subprocess.run([sys.executable, str(ICI / 'empreintes.py'), str(SOURCES)], check=True)
if DIST.exists():
    shutil.rmtree(DIST)
shutil.copytree(SOURCES, DIST, ignore=shutil.ignore_patterns('.DS_Store'))

esbuild = shutil.which('esbuild')
if esbuild:
    for f in sorted((DIST / 'assets').iterdir()):
        if f.suffix in ('.js', '.css') and f.name != 'status.js':
            subprocess.run([esbuild, str(f), '--minify', '--charset=utf8', '--legal-comments=none',
                            '--log-level=warning', '--outfile=' + str(f), '--allow-overwrite'], check=True)
    print('Fichiers minifiés avec esbuild')
else:
    print('esbuild absent : fichiers envoyés non minifiés (le site fonctionne de la même façon)')

# Feuille de style intégrée à la page d'accueil : plus de requête qui bloque l'affichage.
# Sécurité intacte : la CSP n'autorise que CE style précis, grâce à son empreinte SHA-256 (pas de 'unsafe-inline').
import base64, hashlib, re
page = DIST / 'index.html'
html = page.read_text()
css = (DIST / 'assets' / 'app.css').read_text().strip()
lien = re.compile(r'<link rel="stylesheet" href="/assets/app\.css(\?v=[0-9a-f]+)?">')
if lien.search(html) and '</style' not in css:
    html = lien.sub(lambda m: '<style>' + css + '</style>', html, count=1)
    page.write_text(html)
    empreinte = base64.b64encode(hashlib.sha256(css.encode('utf-8')).digest()).decode()
    ht = DIST / '.htaccess'
    regles = ht.read_text()
    assert regles.count("style-src 'self';") == 1, 'CSP inattendue dans .htaccess'
    ht.write_text(regles.replace("style-src 'self';", "style-src 'self' 'sha256-" + empreinte + "';"))
    print('Feuille de style intégrée à la page, autorisée par son empreinte sha256-' + empreinte[:12] + '…')

subprocess.run([sys.executable, str(ICI / 'empreintes.py'), str(DIST)], check=True)
ZIP.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in sorted(DIST.rglob('*')):
        if f.is_file():
            z.write(f, f.relative_to(DIST))
print('Prêt :', ZIP, '→ lancez ensuite outils/mettre-a-jour-site.sh')
