# Vérifications automatiques du site (lancées par GitHub Actions à chaque envoi, ou à la main) :
#   python3 outils/verifier.py
# 1. HTML : langue, titre, identifiants uniques, textes alternatifs, aucun script ni style en ligne (CSP)
# 2. Liens internes : chaque fichier appelé existe
# 3. JavaScript : syntaxe valide (node --check)
# 4. Traductions : les 6 langues ont les mêmes textes
# 5. Secrets : aucun mot de passe, jeton ou clé privée dans le dépôt
# 6. Poids : le site reste léger
import html.parser, json, pathlib, re, subprocess, sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
SITE = RACINE / 'site'
LANGUES = ['fr', 'en', 'zh-Hans', 'zh-Hant', 'yue', 'ko']
erreurs, notes = [], []


def erreur(msg):
    erreurs.append(msg)
    print('  ✗ ' + msg)


def etape(titre):
    print('\n› ' + titre)


class Page(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.liens, self.pb, self.lang, self.titre, self.dans_script, self.doctype = [], [], [], None, False, False, False

    def handle_decl(self, decl):
        self.doctype = self.doctype or decl.lower().startswith('doctype html')

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html':
            self.lang = a.get('lang')
        if tag == 'title':
            self.titre = True
        if 'id' in a:
            self.ids.append(a['id'])
        if 'style' in a:
            self.pb.append(f'attribut style en ligne sur <{tag}> (bloqué par la CSP)')
        for k in a:
            if k.startswith('on'):
                self.pb.append(f'gestionnaire {k}= en ligne sur <{tag}> (bloqué par la CSP)')
        if tag == 'img' and 'alt' not in a:
            self.pb.append(f'image sans texte alternatif : {a.get("src")}')
        if tag == 'script':
            self.dans_script = 'src' not in a
            if a.get('src'):
                self.liens.append(a['src'])
        if tag in ('link', 'a') and a.get('href'):
            self.liens.append(a['href'])
        if tag == 'img' and a.get('src'):
            self.liens.append(a['src'])

    def handle_endtag(self, tag):
        if tag == 'script':
            self.dans_script = False

    def handle_data(self, data):
        if self.dans_script and data.strip():
            self.pb.append('script en ligne (bloqué par la CSP)')


etape('HTML et liens internes')
pages = sorted(SITE.glob('*.html'))
for f in pages:
    p = Page()
    p.feed(f.read_text(encoding='utf-8'))
    nom = f.name
    if not p.doctype:
        erreur(f'{nom} : <!doctype html> manquant')
    if not p.lang:
        erreur(f'{nom} : attribut lang manquant sur <html>')
    if not p.titre:
        erreur(f'{nom} : <title> manquant')
    doublons = sorted({i for i in p.ids if p.ids.count(i) > 1})
    if doublons:
        erreur(f'{nom} : identifiants en double {doublons}')
    for x in p.pb:
        erreur(f'{nom} : {x}')
    for lien in p.liens:
        if not lien.startswith('/') or lien.startswith('//'):
            continue
        chemin = lien.split('#')[0].split('?')[0]
        if chemin in ('', '/'):
            continue
        if not (SITE / chemin.lstrip('/')).exists():
            erreur(f'{nom} : lien interne cassé {lien}')
print(f'  {len(pages)} pages vérifiées')

etape('Syntaxe JavaScript')
for f in sorted((SITE / 'assets').glob('*.js')) + [SITE / 'sw.js']:
    r = subprocess.run(['node', '--check', str(f)], capture_output=True, text=True)
    if r.returncode:
        erreur(f'{f.name} : {r.stderr.strip().splitlines()[-1] if r.stderr.strip() else "erreur de syntaxe"}')
print('  fichiers JavaScript analysés')

etape('Traductions (6 langues)')
CODE = r"""
const fs = require('fs'), vm = require('vm'), base = process.argv[1];
const w = {}; const ctx = { window: w }; vm.createContext(ctx);
for (const f of ['i18n.js', 'labs.js', 'labs2.js', 'labs3.js', 'labs4.js', 'labs5.js', 'labs6.js']) vm.runInContext(fs.readFileSync(base + '/assets/' + f, 'utf8'), ctx);
const L = w.JG_I18N, out = {};
const forme = v => Array.isArray(v) ? 'tableau:' + v.length : typeof v === 'object' && v ? 'objet:' + Object.keys(v).sort().join(',') : typeof v;
for (const k of Object.keys(L)) { out[k] = {}; for (const c of Object.keys(L[k])) out[k][c] = forme(L[k][c]); }
console.log(JSON.stringify(out));
"""
r = subprocess.run(['node', '-e', CODE, str(SITE)], capture_output=True, text=True)
if r.returncode:
    erreur('i18n.js / labs.js / labs2.js / labs3.js / labs4.js / labs5.js / labs6.js : chargement impossible ' + r.stderr.strip()[:200])
else:
    T = json.loads(r.stdout)
    manquantes = [l for l in LANGUES if l not in T]
    if manquantes:
        erreur(f'langues absentes : {manquantes}')
    ref = T.get('fr', {})
    for l in LANGUES[1:]:
        if l not in T:
            continue
        absents = sorted(set(ref) - set(T[l]))
        if absents:
            erreur(f'{l} : textes manquants {absents[:12]}')
        for c in ref:
            if c in T[l] and T[l][c] != ref[c] and not c.startswith(('htmlLang', 'locale')):
                if ref[c].startswith('tableau') or ref[c].startswith('objet'):
                    erreur(f'{l} : « {c} » n’a pas la même forme qu’en français ({T[l][c]} au lieu de {ref[c]})')
    print(f'  {len(ref)} textes comparés dans {len(T)} langues')
# Un fichier de textes chargé plus tard ne doit pas écraser par erreur un texte existant
# (déjà arrivé : « tickets » et « rsTitle »). Seules les clés de VOULUS sont redéfinies exprès.
VOULUS = {'play', 'tourPlay', 'supLabels'}
CODE2 = r"""
const fs = require('fs'), vm = require('vm'), base = process.argv[1];
const w = {}; const ctx = { window: w }; vm.createContext(ctx);
const ser = v => typeof v === 'function' ? v.toString() : JSON.stringify(v);
let avant = {}; const out = [];
for (const f of ['i18n.js', 'labs.js', 'labs2.js', 'labs3.js', 'labs4.js', 'labs5.js', 'labs6.js']) {
  vm.runInContext(fs.readFileSync(base + '/assets/' + f, 'utf8'), ctx);
  const L = w.JG_I18N;
  for (const k in avant) for (const c in avant[k]) if (L[k] && c in L[k] && !Array.isArray(L[k][c]) && ser(L[k][c]) !== avant[k][c]) out.push([f, k, c]);
  avant = {}; for (const k in L) { avant[k] = {}; for (const c in L[k]) if (!Array.isArray(L[k][c])) avant[k][c] = ser(L[k][c]); }
}
console.log(JSON.stringify(out));
"""
r = subprocess.run(['node', '-e', CODE2, str(SITE)], capture_output=True, text=True)
if not r.returncode:
    ecrases = sorted({(f, c) for f, k, c in json.loads(r.stdout) if c not in VOULUS})
    for f, c in ecrases[:12]:
        erreur(f'{f} : le texte « {c} » écrase un texte déjà défini (choisissez un autre nom de clé)')
    if not ecrases:
        print('  aucun texte écrasé par erreur entre les fichiers de traduction')
for f in ['legal.js', 'a11y.js', '404.js']:
    texte = (SITE / 'assets' / f).read_text(encoding='utf-8')
    absentes = [l for l in LANGUES if not re.search(r'["\']?' + re.escape(l) + r'["\']?\s*:', texte)]
    if absentes:
        erreur(f'{f} : langues absentes {absentes}')

etape('Secrets')
MOTIFS = [
    (r'-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY', 'clé privée'),
    (r'-----BEGIN PGP PRIVATE KEY BLOCK', 'clé PGP privée'),
    (r'\bgh[pousr]_[A-Za-z0-9]{30,}', 'jeton GitHub'),
    (r'\bAKIA[0-9A-Z]{16}\b', 'clé AWS'),
    (r'\bu\d{6,}-[0-9a-f]{20,}\b|\bur\d{6,}-[0-9a-f]{20,}\b|\bm\d{6,}-[0-9a-f]{20,}\b', 'clé UptimeRobot'),
    (r'(?i)\b(password|passwd|mot_de_passe|api_key|apikey|access_token|client_secret)\s*[:=]\s*["\'](?=[^"\'\s$]*\d)[^"\'\s$]{10,}["\']', 'mot de passe ou clé en clair'),
]
suivis = subprocess.run(['git', '-C', str(RACINE), 'ls-files'], capture_output=True, text=True).stdout.split()
interdits = [f for f in suivis if re.search(r'(\.conf|\.env|\.key|\.pem|\.rev|secret.*\.asc|private.*\.asc)$', f)]
for f in interdits:
    erreur(f'fichier sensible suivi par git : {f}')
for f in suivis:
    chemin = RACINE / f
    if f == 'outils/verifier.py':
        continue
    if chemin.suffix in ('.png', '.jpg', '.ico', '.zip') or not chemin.is_file():
        continue
    texte = chemin.read_text(encoding='utf-8', errors='ignore')
    for motif, quoi in MOTIFS:
        if re.search(motif, texte):
            erreur(f'{f} : {quoi} détecté')
print(f'  {len(suivis)} fichiers du dépôt analysés')

etape('Poids')
total = sum(f.stat().st_size for f in SITE.rglob('*') if f.is_file())
print(f'  site complet : {total // 1024} Ko')
if total > 1200 * 1024:
    erreur(f'le site dépasse 1 200 Ko ({total // 1024} Ko)')
# Fichiers source (commentés) : 260 Ko au plus chacun ; la version en ligne est minifiée par esbuild (environ 2,5 fois plus légère)
for f in (SITE / 'assets').glob('*'):
    if f.is_file() and f.stat().st_size > 260 * 1024:
        erreur(f'{f.name} dépasse 260 Ko ({f.stat().st_size // 1024} Ko)')

print()
if erreurs:
    print(f'✗ {len(erreurs)} problème(s) trouvé(s)')
    sys.exit(1)
print('✓ Toutes les vérifications sont réussies')
