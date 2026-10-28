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

subprocess.run([sys.executable, str(ICI / 'empreintes.py'), str(DIST)], check=True)
ZIP.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in sorted(DIST.rglob('*')):
        if f.is_file():
            z.write(f, f.relative_to(DIST))
print('Prêt :', ZIP, '→ lancez ensuite outils/mettre-a-jour-site.sh')
