# Surveillance du site EN LIGNE (« surveillance synthétique ») : lancée chaque matin par GitHub Actions.
# Elle visite https://jeremy-grosjean.fr comme un vrai visiteur et vérifie que tout marche ; en cas de problème,
# la vérification échoue et GitHub envoie un e-mail. Aucun mot de passe ni clé n'est utilisé (site public).
#   python3 outils/surveiller.py                     vérifie le site en ligne
#   python3 outils/surveiller.py --url http://…      vérifie une autre adresse (essais locaux : contrôles HTTPS sautés)
# Nécessite : pip install playwright && python -m playwright install chromium
import datetime, json, socket, ssl, sys, urllib.request
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

URL = sys.argv[sys.argv.index('--url') + 1].rstrip('/') if '--url' in sys.argv else 'https://jeremy-grosjean.fr'
HTTPS = URL.startswith('https://')
problemes = []


def ok(msg):
    print(f'  ✓ {msg}')


def ko(msg):
    print(f'  ✗ {msg}'); problemes.append(msg)


def lire(chemin, methode='GET'):
    req = urllib.request.Request(URL + chemin, method=methode, headers={'User-Agent': 'surveillance-jeremy-grosjean.fr'})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status, {k.lower(): v for k, v in r.headers.items()}, r.read()
    except urllib.error.HTTPError as e:
        return e.code, {k.lower(): v for k, v in e.headers.items()}, e.read()
    except Exception as e:
        return 0, {}, str(e).encode()


print(f'Surveillance de {URL} · {datetime.datetime.now(datetime.timezone.utc):%d/%m/%Y %H:%M} UTC')

# 1. Le serveur répond, avec la nouvelle version et ses protections
code, ent, corps = lire('/')
if code == 200 and b'/assets/app.js' in corps: ok('page d’accueil (HTTP 200)')
else: ko(f'page d’accueil : code {code}')
for f in ['/assets/app.js', '/assets/app.css', '/assets/i18n.js', '/assets/labs7.js', '/assets/fonts/sora.woff', '/qr-contact.svg', '/contact.vcf', '/sw.js']:
    c, _, _ = lire(f)
    if c != 200: ko(f'{f} : code {c}')
ok('fichiers principaux disponibles') if not any(p.startswith('/') for p in problemes) else None
c404, _, c4 = lire('/page-qui-n-existe-pas')
ok('page 404 personnalisée') if c404 == 404 and b'traceroute' in c4 else ko(f'page 404 : code {c404}')
if HTTPS:
    for h in ['strict-transport-security', 'content-security-policy', 'x-frame-options', 'x-content-type-options', 'referrer-policy']:
        if h not in ent: ko(f'en-tête de sécurité absent : {h}')
    if all(h in ent for h in ['strict-transport-security', 'content-security-policy']): ok('en-têtes de sécurité présents')
    # 2. Certificat HTTPS : valable encore au moins 14 jours
    try:
        hote = urlparse(URL).hostname
        with socket.create_connection((hote, 443), timeout=15) as s, ssl.create_default_context().wrap_socket(s, server_hostname=hote) as t:
            fin = datetime.datetime.fromtimestamp(ssl.cert_time_to_seconds(t.getpeercert()['notAfter']), datetime.timezone.utc)
        jours = (fin - datetime.datetime.now(datetime.timezone.utc)).days
        ok(f'certificat HTTPS valable encore {jours} jours') if jours >= 14 else ko(f'certificat HTTPS : expire dans {jours} jours')
    except Exception as e:
        ko(f'certificat HTTPS illisible : {e}')
    # 3. security.txt pas expiré (au moins 30 jours)
    c, _, st = lire('/.well-known/security.txt')
    exp = [l.split(':', 1)[1].strip() for l in st.decode('utf-8', 'replace').splitlines() if l.lower().startswith('expires:')]
    try:
        reste = (datetime.datetime.fromisoformat(exp[0].replace('Z', '+00:00')) - datetime.datetime.now(datetime.timezone.utc)).days
        ok(f'security.txt valable encore {reste} jours') if reste >= 30 else ko(f'security.txt : expire dans {reste} jours')
    except Exception:
        ko(f'security.txt illisible (code {c})')

# Contributeurs du dépôt sur GitHub : uniquement Jérémy Grosjean (ni autre personne, ni robot)
if URL == 'https://jeremy-grosjean.fr':
    try:
        req = urllib.request.Request('https://api.github.com/repos/jeremy-grosjean/jeremy-grosjean.fr/contributors?anon=1',
                                     headers={'User-Agent': 'surveillance-jeremy-grosjean.fr', 'Accept': 'application/vnd.github+json'})
        with urllib.request.urlopen(req, timeout=20) as r:
            noms = [c.get('login') or c.get('name') or c.get('email') for c in json.loads(r.read())]
        autres = [n for n in noms if n != 'jeremy-grosjean']
        ok('contributeurs GitHub : uniquement jeremy-grosjean') if noms and not autres else ko(f'contributeurs GitHub inattendus : {autres or noms}')
    except Exception as e:
        print(f'  ⚠ liste des contributeurs illisible pour l’instant ({str(e)[:80]})')

# 4. Dans un vrai navigateur, sur ordinateur et sur téléphone : aucune erreur, fenêtres et jeu « Plus d'Internet » jouable
JEU = """async () => {
  const $ = id => document.getElementById(id), w = ms => new Promise(r => setTimeout(r, ms)), T = window.JG_I18N.fr, out = {};
  $('contactBtn').click(); await w(300); const q = document.querySelector('#qrImg'); for (let i = 0; i < 20 && getComputedStyle(q).display !== 'none' && !q.naturalWidth; i++) await w(100); out.contact = $('contactPanel').classList.contains('open') && (getComputedStyle(q).display === 'none' || !!q.naturalWidth); /* QR chargé à l'ouverture, masqué sur téléphone */
  document.querySelector('#contactPanel .panel-x').click(); await w(150);
  $('secBtn').click(); await w(300); out.securite = $('secPanel').classList.contains('open'); document.querySelector('#secPanel .panel-x').click(); await w(150);
  $('openGame').click(); await w(200); out.jeux = document.querySelectorAll('#gamesPanel .pick').length;
  $('pickNoNet').click(); await w(250);
  const fixes = T.niScen.map(s => s.fix[0][0]), live = () => [...$('niOpts').querySelectorAll('button')].filter(b => !b.disabled);
  for (let c = 0; c < 3; c++) {
    for (let n = 0; n < 8 && !$('niOpts').hidden; n++) {
      const k = [...$('niSteps').children].findIndex(li => li.classList.contains('now'));
      const bon = k >= 0 ? T.niChecks[k] : fixes.find(f => live().some(b => b.textContent === f));
      const b = live().find(x => x.textContent === bon); if (!b) return { ...out, bloque: true }; b.click(); await w(30);
    }
    $('niNext').click(); await w(50);
  }
  await w(150); out.fin = !!document.querySelector('#niPanel .end-ring'); return out;
}"""
with sync_playwright() as p:
    nav = p.chromium.launch()
    for nom, opts in (('ordinateur', {'viewport': {'width': 1280, 'height': 800}}), ('téléphone', {'viewport': {'width': 390, 'height': 844}, 'is_mobile': True, 'has_touch': True})):
        ctx = nav.new_context(locale='fr-FR', service_workers='block', **opts); pg = ctx.new_page(); erreurs = []
        pg.on('pageerror', lambda e: erreurs.append(str(e)))
        pg.on('console', lambda m: m.type == 'error' and erreurs.append(m.text))
        pg.add_init_script("localStorage.setItem('jg-tour', '1')")
        try:
            pg.goto(URL + '/?surveillance=1', wait_until='load', timeout=30000); pg.wait_for_timeout(1500)
            r = pg.evaluate(JEU)
            if r.get('contact') and r.get('securite') and r.get('jeux', 0) >= 16 and r.get('fin') and not r.get('bloque'):
                ok(f'{nom} : fenêtres contact et sécurité, {r["jeux"]} jeux, « Plus d’Internet » joué jusqu’au bout')
            else:
                ko(f'{nom} : parcours incomplet {r}')
        except Exception as e:
            ko(f'{nom} : la page ne s’est pas chargée ({str(e)[:120]})')
        if erreurs: ko(f'{nom} : {len(erreurs)} erreur(s) dans le navigateur : {erreurs[0][:160]}')
        ctx.close()
    nav.close()

print()
if problemes:
    print(f'✗ {len(problemes)} problème(s) sur le site en ligne'); sys.exit(1)
print('✓ Le site en ligne fonctionne normalement')
