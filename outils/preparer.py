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

# Journal « Quoi de neuf » : les derniers commits du dépôt, rangés par type (feat, fix, perf, sec)
import json
TYPES = {'feat': 'new', 'fix': 'fix', 'perf': 'perf', 'sec': 'sec', 'security': 'sec'}
IGNORES = ('docs', 'chore', 'test', 'tests', 'ci', 'refactor', 'style', 'build')
try:
    sortie = subprocess.run(['git', '-C', str(ICI.parent), 'log', '--no-merges', '-n', '40', '--format=%cs%x09%s'],
                            capture_output=True, text=True, check=True).stdout
    news = []
    for ligne in sortie.splitlines():
        date, _, sujet = ligne.partition('\t')
        m = re.match(r'^(\w+)(\([^)]*\))?!?:\s*(.+)$', sujet)
        if m and m.group(1).lower() in IGNORES:
            continue
        if sujet.lower().startswith(('initial commit', 'merge')):
            continue
        genre, texte = (TYPES.get(m.group(1).lower(), 'misc'), m.group(3)) if m else ('misc', sujet)
        news.append({'d': date, 'k': genre, 't': texte[:1].upper() + texte[1:]})
        if len(news) == 8:
            break
    (DIST / 'assets' / 'news.js').write_text('/* Journal des nouveautés, généré le ' + news[0]['d'] + ' */\nwindow.JG_NEWS = '
                                             + json.dumps(news, ensure_ascii=False) + ';\n' if news else (DIST / 'assets' / 'news.js').read_text())
    print('Journal des nouveautés :', len(news), 'entrées')
    # Numéro de version de cette mise en ligne (fourni par publier.sh), affiché en bas du site avec un lien vers le code
    import os
    v, sha = os.environ.get('JG_VERSION', ''), os.environ.get('JG_VERSION_SHA', '')
    if re.fullmatch(r'v\d{4}\.\d{2}\.\d{2}\.\d+', v) and re.fullmatch(r'[0-9a-f]{40}', sha):
        with open(DIST / 'assets' / 'news.js', 'a', encoding='utf-8') as f:
            f.write('window.JG_VERSION = ' + json.dumps({'v': v, 'url': 'https://github.com/jeremy-grosjean/jeremy-grosjean.fr/commit/' + sha}) + ';\n')
        print('Version affichée en bas du site :', v)
except (OSError, subprocess.CalledProcessError, IndexError):
    print('Journal des nouveautés : git indisponible, journal inchangé')

subprocess.run([sys.executable, str(ICI / 'empreintes.py'), str(DIST)], check=True)
ZIP.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in sorted(DIST.rglob('*')):
        if f.is_file():
            z.write(f, f.relative_to(DIST))
import os
print('Prêt :', ZIP) if os.environ.get('JG_PUBLIER') else print('Prêt :', ZIP, '→ lancez ensuite outils/mettre-a-jour-site.sh')
