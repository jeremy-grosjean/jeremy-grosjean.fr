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
    for taille, nom in (((1280, 800), 'ordinateur'), ((390, 844), 'mobile')):
        ctx = nav.new_context(viewport={'width': taille[0], 'height': taille[1]}, locale='fr-FR')
        pg = ctx.new_page(); suivre(pg, nom)
        pg.goto(BASE + '/'); pg.wait_for_timeout(1500)
        largeur = pg.evaluate('document.documentElement.scrollWidth')
        if largeur > taille[0]:
            erreurs.append(f'{nom} : la page déborde ({largeur} px)')
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
        pg.evaluate("document.getElementById('quit').click()"); pg.wait_for_timeout(100)
        ok(f'{nom} : pendant le jeu, seul « Quitter » est cliquable')
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
    nav.close()
srv.shutdown()

print()
if erreurs:
    for e in erreurs:
        print('  ✗ ' + e)
    print(f'✗ {len(erreurs)} problème(s)')
    sys.exit(1)
print('✓ Aucune erreur dans le navigateur')
