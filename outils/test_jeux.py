# Test dans un vrai navigateur (Chromium) : les pages et les 7 jeux s'ouvrent sans aucune erreur JavaScript.
#   python3 outils/test_jeux.py      (nécessite : pip install playwright && python -m playwright install chromium)
import functools, http.server, pathlib, sys, threading
from playwright.sync_api import sync_playwright

SITE = pathlib.Path(__file__).resolve().parent.parent / 'site'


class Serveur(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        if not (SITE / self.path.split('?')[0].split('#')[0].lstrip('/')).exists() and self.path.split('?')[0] != '/':
            self.send_response(404); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.end_headers()
            return open(SITE / '404.html', 'rb')
        return super().send_head()

    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Serveur, directory=str(SITE)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{srv.server_address[1]}'
erreurs = []


def suivre(page, nom):
    page.on('pageerror', lambda e: erreurs.append(f'{nom} : {e}'))
    page.on('console', lambda m: m.type == 'error' and 'status of 404' not in m.text and erreurs.append(f'{nom} : {m.text}'))


def ok(msg):
    print('  ✓ ' + msg)


with sync_playwright() as p:
    nav = p.chromium.launch()
    for taille, nom in (((1280, 800), 'ordinateur'), ((390, 844), 'mobile'), ((740, 280), 'téléphone à l’horizontale')):
        ctx = nav.new_context(viewport={'width': taille[0], 'height': taille[1]}, locale='fr-FR')
        pg = ctx.new_page(); suivre(pg, nom)
        pg.goto(BASE + '/'); pg.wait_for_timeout(1500)
        largeur = pg.evaluate('document.documentElement.scrollWidth')
        if largeur > taille[0]:
            erreurs.append(f'{nom} : la page déborde ({largeur} px)')
        # Rien ne doit se chevaucher : les boutons de l'accueil et la barre du bas
        chev = pg.evaluate("(() => { const a = document.querySelector('.cta').getBoundingClientRect(), d = [...document.querySelectorAll('.dock-left, .dock-mid, #sound')].map(e => e.getBoundingClientRect()); return d.some(b => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom); })()")
        if chev:
            erreurs.append(f'{nom} : les boutons de l’accueil chevauchent la barre du bas')
        for bouton, panneau in (('pickServer', 'intro'), ('pickSupport', 'supportPanel'), ('pickPanne', 'panPanel'), ('pickQuiz', 'quizPanel'), ('pickPhish', 'phPanel'), ('pickSubnet', 'snPanel')):
            pg.evaluate("document.getElementById('openGame').click()"); pg.wait_for_timeout(150)
            pg.evaluate(f"document.getElementById('{bouton}').click()"); pg.wait_for_timeout(300)
            if not pg.evaluate(f"document.getElementById('{panneau}').classList.contains('open')"):
                erreurs.append(f'{nom} : le jeu {bouton} ne s’ouvre pas')
            pg.keyboard.press('Escape'); pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open'))")
        ok(f'{nom} : les 7 jeux s’ouvrent')
        # Pendant « Protéger le serveur », un clic là où se trouvait « Me contacter » ne doit rien ouvrir
        r = pg.evaluate("(() => { const b = document.getElementById('contactBtn').getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; })()")
        pg.evaluate("document.getElementById('openGame').click(); document.getElementById('pickServer').click(); document.getElementById('start').click()"); pg.wait_for_timeout(150)
        pg.evaluate("document.getElementById('lvGo').click()"); pg.wait_for_timeout(150)
        pg.mouse.click(r[0], r[1]); pg.wait_for_timeout(150)
        if pg.evaluate("document.querySelector('.panel.open') !== null || !document.body.classList.contains('playing')"):
            erreurs.append(f'{nom} : un clic pendant le jeu ouvre une fenêtre de l’accueil')
        # Pause : le temps s'arrête, « Reprendre » relance la partie là où elle était, « Quitter la partie » la termine
        pg.evaluate("document.getElementById('pauseBtn').click()"); pg.wait_for_timeout(150)
        t1 = pg.evaluate("document.getElementById('hTime').textContent"); pg.wait_for_timeout(1300)
        if not pg.evaluate("document.getElementById('pausePanel').classList.contains('open')") or pg.evaluate("document.getElementById('hTime').textContent") != t1:
            erreurs.append(f'{nom} : la pause n’arrête pas le jeu')
        pg.mouse.click(3, r[1]); pg.wait_for_timeout(150)
        if pg.evaluate("document.getElementById('pausePanel').classList.contains('open') || !document.body.classList.contains('playing')"):
            erreurs.append(f'{nom} : un clic à côté de la pause ne fait pas reprendre la partie')
        pg.evaluate("document.getElementById('pauseBtn').click()"); pg.wait_for_timeout(100)
        pg.evaluate("document.getElementById('pzQuit').click()"); pg.wait_for_timeout(100)
        if pg.evaluate("document.body.classList.contains('playing')"):
            erreurs.append(f'{nom} : « Quitter la partie » ne termine pas le jeu')
        ok(f'{nom} : pendant le jeu, seul le bouton Pause est cliquable ; pause, reprise et abandon fonctionnent')
        # Fenêtres : un clic sur le fond flou ou sur ✕ les ferme, un clic dedans non
        for panneau, bouton in (('contactPanel', 'contactBtn'), ('gamesPanel', 'openGame'), ('secPanel', 'secBtn')):
            pg.evaluate(f"document.getElementById('{bouton}').click()"); pg.wait_for_timeout(200)
            c = pg.evaluate(f"(() => {{ const r = document.querySelector('#{panneau} .card').getBoundingClientRect(); return [r.left + r.width / 2, r.top + 30, r.left, r.top]; }})()")
            pg.mouse.click(c[0], c[1]); pg.wait_for_timeout(100)
            if not pg.evaluate(f"document.getElementById('{panneau}').classList.contains('open')"):
                erreurs.append(f'{nom} : un clic dans la fenêtre {panneau} la ferme')
            if c[2] > 4:
                pg.mouse.click(2, c[1]); pg.wait_for_timeout(100)
            else:
                pg.evaluate(f"document.querySelector('#{panneau} .panel-x').click()"); pg.wait_for_timeout(100)
            if pg.evaluate(f"document.getElementById('{panneau}').classList.contains('open')"):
                erreurs.append(f'{nom} : la fenêtre {panneau} ne se ferme pas en cliquant à côté')
            pg.evaluate(f"document.getElementById('{bouton}').click()"); pg.wait_for_timeout(150)
            pg.evaluate(f"document.querySelector('#{panneau} .panel-x').click()"); pg.wait_for_timeout(100)
            if pg.evaluate(f"document.getElementById('{panneau}').classList.contains('open')"):
                erreurs.append(f'{nom} : le ✕ ne ferme pas {panneau}')
        ok(f'{nom} : fenêtres fermées par le fond flou et par ✕, pas par un clic à l’intérieur')
        pg.evaluate("document.getElementById('pickPhish').click()"); pg.wait_for_timeout(150)
        for i in range(6):
            pg.evaluate("document.getElementById('phPhishBtn').click()"); pg.evaluate("document.getElementById('phNext').click()")
        if 'bien classés' not in pg.evaluate("document.getElementById('phTitle').textContent"):
            erreurs.append(f'{nom} : le jeu hameçonnage ne va pas jusqu’au résultat')
        pg.evaluate("document.getElementById('pickSubnet').click()"); pg.wait_for_timeout(150)
        for i in range(10):
            if pg.evaluate("document.querySelectorAll('#snOpts button').length") != 4:
                erreurs.append(f'{nom} : sous-réseaux, question {i + 1} sans 4 réponses')
            pg.evaluate("document.querySelector('#snOpts button[data-j=\"0\"]').click()"); pg.evaluate("document.getElementById('snNext').click()")
        if '10/10' not in pg.evaluate("document.getElementById('snQ').textContent"):
            erreurs.append(f'{nom} : sous-réseaux, les bonnes réponses ne sont pas comptées')
        pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open'))")
        ok(f'{nom} : hameçonnage et sous-réseaux jouables jusqu’au bout')
        for cmd in ('help', 'whoami --long', 'secrets', 'retro', 'retro', 'curl -I jeremy-grosjean.fr', 'whois', 'traceroute', 'define DNS', 'define inconnu'):
            pg.evaluate(f"(() => {{ const i = document.getElementById('termInput'); i.value = {cmd!r}; document.getElementById('termForm').requestSubmit(); }})()")
            pg.wait_for_timeout(120)
        ok(f'{nom} : commandes du terminal')
        for panneau, bouton in (('contactPanel', 'contactBtn'), ('newsPanel', 'newsBtn'), ('supPanel', 'supBtn'), ('secPanel', 'secBtn'), ('glossPanel', 'glossBtn'), ('scPanel', 'scoresBtn')):
            pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open')); document.body.classList.remove('term-open')")
            pg.evaluate(f"document.getElementById('{bouton}').click()"); pg.wait_for_timeout(250)
            if not pg.evaluate(f"document.getElementById('{panneau}').classList.contains('open')"):
                erreurs.append(f'{nom} : la fenêtre {panneau} ne s’ouvre pas')
        ok(f'{nom} : fenêtres Contact, Nouveautés, Supervision, Sécurité, Glossaire, Scores')
        pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open')); document.getElementById('availBtn').click()"); pg.wait_for_timeout(200)
        if not pg.evaluate("document.querySelectorAll('#briefList .gl-t').length"):
            erreurs.append(f'{nom} : aucun mot du glossaire souligné dans la fiche')
        else:
            pg.click('#briefList .gl-t'); pg.wait_for_timeout(150)
            if pg.evaluate("document.getElementById('glTip').hidden"):
                erreurs.append(f'{nom} : la bulle de définition ne s’affiche pas')
        pg.evaluate("window.print = () => {}; document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open')); document.getElementById('secReport').click()"); pg.wait_for_timeout(200)
        if not pg.evaluate("document.querySelectorAll('#repBody table').length"):
            erreurs.append(f'{nom} : le rapport de sécurité est vide')
        ok(f'{nom} : glossaire et rapport de sécurité')
        pg.goto(BASE + '/#recruteur'); pg.wait_for_timeout(800)
        if not pg.evaluate("document.body.classList.contains('rec-on')"):
            erreurs.append(f'{nom} : la vue recruteur ne s’ouvre pas')
        for page in ('/mentions-legales.html', '/accessibilite.html', '/une-page-qui-n-existe-pas'):
            pg.goto(BASE + page); pg.wait_for_timeout(400)
        ok(f'{nom} : vue recruteur, mentions légales, accessibilité, page 404')
        ctx.close()
    # Toutes les formes d'écran : montre, carré, écran partagé, téléphone, tablette, 4K, téléviseur 8K, bandes très fines
    ECRANS = [(200, 200), (240, 320), (280, 653), (320, 480), (360, 320), (412, 430), (600, 600), (667, 300), (768, 1024),
              (1024, 768), (1280, 480), (1440, 900), (1600, 200), (200, 1600), (2560, 1440), (3840, 2160), (5120, 1440), (7680, 4320)]
    CLES = ['.clock', '.topbar', '.brand', '#nameFx', '.who-line', '.rot-line', '.avail', '.bootlog', '.cta', '.scores', '.keys', '.dock-left', '.dock-mid', '#sound']
    MESURE = """(cles) => { const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > 0; };
      const R = cles.map(c => { const e = document.querySelector(c); if (!vis(e)) return null; const r = e.getBoundingClientRect(); return [c, r.left, r.top + scrollY, r.right, r.bottom + scrollY]; }).filter(Boolean), pb = [];
      for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i], b = R[j]; if (a[1] < b[3] - 1 && b[1] < a[3] - 1 && a[2] < b[4] - 1 && b[2] < a[4] - 1) pb.push(a[0] + ' chevauche ' + b[0]); }
      const dm = document.querySelector('.dock-mid').getBoundingClientRect();
      if ([...document.querySelectorAll('.dock-mid *')].some(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > dm.right + 1 || r.left < dm.left - 1); })) pb.push('le texte du pied de page déborde');
      return pb; }"""
    for w, h in ECRANS:
        ctx = nav.new_context(viewport={'width': w, 'height': h}, has_touch=w < 1100, is_mobile=w < 1100, locale='fr-FR', timezone_id='Europe/Paris')
        pg = ctx.new_page(); suivre(pg, f'{w}×{h}')
        pg.add_init_script("localStorage.setItem('jg-tour', '1')")
        pg.goto(BASE + '/'); pg.wait_for_timeout(900)
        large = pg.evaluate('Math.max(document.documentElement.scrollWidth, innerWidth)')
        if large > w + 1:
            erreurs.append(f'{w}×{h} : la page déborde sur le côté ({large} px)')
        for pb in pg.evaluate(MESURE, CLES):
            erreurs.append(f'{w}×{h} : {pb}')
        for panneau, bouton in (('contactPanel', 'contactBtn'), ('secPanel', 'secBtn'), ('gamesPanel', 'openGame')):
            pg.evaluate(f"document.getElementById('{bouton}').click()"); pg.wait_for_timeout(200)
            if pg.evaluate(f"(() => {{ const c = document.querySelector('#{panneau} .card'), r = c.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1 || c.scrollWidth > c.clientWidth + 2; }})()"):
                erreurs.append(f'{w}×{h} : la fenêtre {panneau} sort de l’écran')
            pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open'))")
        ctx.close()
    ok(f'{len(ECRANS)} formes d’écran, du 200×200 au 8K : rien ne déborde ni ne se chevauche')
    nav.close()
srv.shutdown()

print()
if erreurs:
    for e in erreurs:
        print('  ✗ ' + e)
    print(f'✗ {len(erreurs)} problème(s)')
    sys.exit(1)
print('✓ Aucune erreur dans le navigateur')
