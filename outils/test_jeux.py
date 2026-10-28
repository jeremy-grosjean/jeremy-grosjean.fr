# Test dans un vrai navigateur (Chromium) : les pages et les 4 jeux s'ouvrent sans aucune erreur JavaScript.
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
    for taille, nom in (((1280, 800), 'ordinateur'), ((390, 844), 'mobile')):
        ctx = nav.new_context(viewport={'width': taille[0], 'height': taille[1]}, locale='fr-FR')
        pg = ctx.new_page(); suivre(pg, nom)
        pg.goto(BASE + '/'); pg.wait_for_timeout(1500)
        largeur = pg.evaluate('document.documentElement.scrollWidth')
        if largeur > taille[0]:
            erreurs.append(f'{nom} : la page déborde ({largeur} px)')
        for bouton, panneau in (('pickServer', 'intro'), ('pickSupport', 'supportPanel'), ('pickPanne', 'panPanel'), ('pickQuiz', 'quizPanel')):
            pg.evaluate("document.getElementById('openGame').click()"); pg.wait_for_timeout(150)
            pg.evaluate(f"document.getElementById('{bouton}').click()"); pg.wait_for_timeout(300)
            if not pg.evaluate(f"document.getElementById('{panneau}').classList.contains('open')"):
                erreurs.append(f'{nom} : le jeu {bouton} ne s’ouvre pas')
            pg.keyboard.press('Escape'); pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open'))")
        ok(f'{nom} : les 4 jeux s’ouvrent')
        for cmd in ('help', 'whoami --long', 'secrets', 'retro', 'retro'):
            pg.evaluate(f"(() => {{ const i = document.getElementById('termInput'); i.value = {cmd!r}; document.getElementById('termForm').requestSubmit(); }})()")
            pg.wait_for_timeout(120)
        ok(f'{nom} : commandes du terminal')
        for panneau, bouton in (('contactPanel', 'contactBtn'), ('newsPanel', 'newsBtn'), ('supPanel', 'supBtn'), ('secPanel', 'secBtn')):
            pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open')); document.body.classList.remove('term-open')")
            pg.evaluate(f"document.getElementById('{bouton}').click()"); pg.wait_for_timeout(250)
            if not pg.evaluate(f"document.getElementById('{panneau}').classList.contains('open')"):
                erreurs.append(f'{nom} : la fenêtre {panneau} ne s’ouvre pas')
        ok(f'{nom} : fenêtres Contact, Nouveautés, Supervision, Sécurité')
        pg.goto(BASE + '/#recruteur'); pg.wait_for_timeout(800)
        if not pg.evaluate("document.body.classList.contains('rec-on')"):
            erreurs.append(f'{nom} : la vue recruteur ne s’ouvre pas')
        for page in ('/mentions-legales.html', '/accessibilite.html', '/une-page-qui-n-existe-pas'):
            pg.goto(BASE + page); pg.wait_for_timeout(400)
        ok(f'{nom} : vue recruteur, mentions légales, accessibilité, page 404')
        ctx.close()
    nav.close()
srv.shutdown()

print()
if erreurs:
    for e in erreurs:
        print('  ✗ ' + e)
    print(f'✗ {len(erreurs)} problème(s)')
    sys.exit(1)
print('✓ Aucune erreur dans le navigateur')
