# Test dans un vrai navigateur (Chromium) : les pages et les jeux s'ouvrent et se jouent sans aucune erreur JavaScript.
#   python3 outils/test_jeux.py           teste les sources (site/)
#   python3 outils/test_jeux.py --prod    teste la version en ligne (dist/, après outils/preparer.py),
#                                         avec les en-têtes de sécurité du .htaccess (CSP, Trusted Types…)
#   (nécessite : pip install playwright && python -m playwright install chromium)
import functools, http.server, pathlib, re, sys, threading
from playwright.sync_api import sync_playwright

PROD = '--prod' in sys.argv
SITE = pathlib.Path(__file__).resolve().parent.parent / ('dist' if PROD else 'site')
if PROD and not (SITE / 'index.html').exists():
    sys.exit('✗ dist/ introuvable : lancez d’abord python3 outils/preparer.py')


def entetes_htaccess():
    # Les en-têtes « Header always set » du serveur (OVH), pour que le navigateur de test applique la même politique.
    # HSTS et upgrade-insecure-requests sont retirés : le serveur de test est en http local.
    regles = (SITE / '.htaccess').read_text()
    general, sw = {}, {}
    bloc_sw = re.search(r'<Files "sw\.js">(.*?)</Files>', regles, re.S)
    for nom, val in re.findall(r'^\s*Header always set ([\w-]+) "([^"]*)"', regles.replace(bloc_sw.group(0), '') if bloc_sw else regles, re.M):
        if nom.lower() != 'strict-transport-security':
            general[nom] = val.replace('; upgrade-insecure-requests', '')
    if bloc_sw:
        sw = dict(re.findall(r'Header always set ([\w-]+) "([^"]*)"', bloc_sw.group(1)))
    return general, sw


ENTETES, ENTETES_SW = entetes_htaccess() if PROD else ({}, {})
if PROD:
    assert 'Content-Security-Policy' in ENTETES, 'CSP absente du .htaccess de dist/'
    print('  › version en ligne (dist/) avec', len(ENTETES), 'en-têtes de sécurité du .htaccess')


class Serveur(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        if not (SITE / self.path.split('?')[0].split('#')[0].lstrip('/')).exists() and self.path.split('?')[0] != '/':
            self.send_response(404); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.end_headers()
            return open(SITE / '404.html', 'rb')
        return super().send_head()

    def end_headers(self):
        chemin = self.path.split('?')[0]
        for nom, val in (ENTETES_SW if chemin.endswith('/sw.js') else {}).items():
            self.send_header(nom, val)
        for nom, val in ENTETES.items():
            if not (chemin.endswith('/sw.js') and nom in ENTETES_SW):
                self.send_header(nom, val)
        super().end_headers()

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
        for bouton, panneau in (('pickServer', 'intro'), ('pickSupport', 'supportPanel'), ('pickPanne', 'panPanel'), ('pickQuiz', 'quizPanel'), ('pickPhish', 'phPanel'), ('pickSubnet', 'snPanel'), ('pickItil', 'itPanel'), ('pickPs', 'psPanel'), ('pickRj', 'rjPanel'), ('pickCall', 'clPanel'), ('pickDaily', 'dyPanel'), ('pickPrep', 'prPanel'), ('pickRansom', 'rwPanel'), ('pickReply', 'rpPanel'), ('pickNoNet', 'niPanel')):
            pg.evaluate("document.getElementById('openGame').click()"); pg.wait_for_timeout(150)
            pg.evaluate(f"document.getElementById('{bouton}').click()"); pg.wait_for_timeout(300)
            if not pg.evaluate(f"document.getElementById('{panneau}').classList.contains('open')"):
                erreurs.append(f'{nom} : le jeu {bouton} ne s’ouvre pas')
            pg.keyboard.press('Escape'); pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open'))")
        ok(f'{nom} : les 16 jeux et défis s’ouvrent')
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
        # Sauvegarde : « Sauvegarder et quitter », puis rouvrir le jeu propose de reprendre là où on en était
        pg.evaluate("document.getElementById('openGame').click(); document.getElementById('pickServer').click()"); pg.wait_for_timeout(150)
        if pg.evaluate("document.getElementById('resumePanel').classList.contains('open')"):
            pg.evaluate("document.getElementById('rsNew').click()")
        else:
            pg.evaluate("document.getElementById('start').click()")
        pg.wait_for_timeout(150)
        if not pg.evaluate("!!document.getElementById('lvQuit') && document.getElementById('levelPanel').classList.contains('open')"):
            erreurs.append(f'{nom} : pas de bouton Quitter sur l’annonce du niveau')
        pg.evaluate("document.getElementById('lvGo').click()"); pg.wait_for_timeout(1600)
        pg.evaluate("document.getElementById('pauseBtn').click()"); pg.wait_for_timeout(100)
        avant = pg.evaluate("[document.getElementById('hLevel').textContent, document.getElementById('hScore').textContent, document.getElementById('hTime').textContent]")
        pg.evaluate("document.getElementById('pzSave').click()"); pg.wait_for_timeout(150)
        pg.evaluate("document.getElementById('openGame').click(); document.getElementById('pickServer').click()"); pg.wait_for_timeout(150)
        if not pg.evaluate("document.getElementById('resumePanel').classList.contains('open')"):
            erreurs.append(f'{nom} : la partie sauvegardée n’est pas proposée à la reprise')
        # Régression : ce titre avait été écrasé par un autre texte (« rsTitle » défini deux fois)
        titre = pg.evaluate("document.getElementById('rsTitle').textContent.trim()")
        if titre not in ('Partie en cours', 'Game in progress'):
            erreurs.append(f'{nom} : titre de la fenêtre de reprise inattendu : « {titre} »')
        pg.evaluate("document.getElementById('rsResume').click()"); pg.wait_for_timeout(150)
        apres = pg.evaluate("[document.getElementById('hLevel').textContent, document.getElementById('hScore').textContent, document.getElementById('hTime').textContent]")
        if apres != avant or not pg.evaluate("document.getElementById('pausePanel').classList.contains('open')"):
            erreurs.append(f'{nom} : la reprise ne revient pas au même endroit ({avant} → {apres})')
        pg.evaluate("document.getElementById('pzResume').click()"); pg.wait_for_timeout(1300)
        if pg.evaluate("document.getElementById('hTime').textContent") == apres[2] and pg.evaluate("document.body.classList.contains('playing')"):
            erreurs.append(f'{nom} : après la reprise, le temps ne repart pas')
        pg.evaluate("document.getElementById('pauseBtn').click(); document.getElementById('pzQuit').click()"); pg.wait_for_timeout(100)
        pg.evaluate("document.getElementById('openGame').click(); document.getElementById('pickServer').click()"); pg.wait_for_timeout(150)
        if not pg.evaluate("document.getElementById('intro').classList.contains('open')"):
            erreurs.append(f'{nom} : « Quitter sans sauvegarder » a gardé la partie')
        pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open'))")
        ok(f'{nom} : sauvegarde, reprise au même endroit, nouvelle partie et abandon sans sauvegarde')
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
        pg.goto(BASE + '/'); pg.wait_for_timeout(1200)
        # Lot 14 : jeux « Priorise les tickets », PowerShell, RJ45, appel, défi du jour, joués jusqu'au bout
        res = pg.evaluate("""async () => {
          const $ = id => document.getElementById(id), w = ms => new Promise(r => setTimeout(r, ms)), out = {};
          const T = window.JG_I18N.fr;
          // Priorise les tickets : on répond juste à chaque fois
          $('openGame').click(); await w(80); $('pickItil').click(); await w(120);
          for (let i = 0; i < 8; i++) {
            const txt = $('itTitle').textContent.slice(2, -2), tk = T.itTickets.find(x => x[0] === txt);
            $('itImp').querySelector(`[data-v="${tk[2]}"]`).click(); $('itUrgBox').querySelector(`[data-v="${tk[3]}"]`).click();
            $('itCheck').click(); await w(20); $('itNext').click(); await w(20);
          }
          out.itil = localStorage.getItem('jg-itil-best');
          $('itQuit').click(); await w(50);
          // PowerShell : d'abord une erreur, puis la bonne commande
          $('openGame').click(); await w(80); $('pickPs').click(); await w(120);
          for (let i = 0; i < 8; i++) {
            const m = T.ps.findIndex(x => x[0] === $('psTitle').textContent);
            const bs = [...$('psOpts').querySelectorAll('button')];
            const good = bs.find(b => !/-Disabled$|^ping|Get-Process|Get-Service$|-Unlock$|Reset-ADPassword|-ResetPassword|-Stopped|Stop-Service|Start-Process|Restart-Computer|gpresult|Get-GPO|System.log|Clear-EventLog|-Inactive 90|Remove-ADComputer|Get-NetTCPConnection|Enable-ADAccount|Get-LocalUser|Get-ADUser -Disabled/.test(b.textContent));
            if (i === 0) bs.find(b => b !== good).click();
            good.click(); await w(20); if ($('psTerm').hidden) out.psTerm = 'vide'; $('psNext').click(); await w(20);
          }
          out.ps = localStorage.getItem('jg-ps-best');
          $('psQuit').click(); await w(50);
          // RJ45 : T568B puis T568A dans l'ordre, puis la question
          $('openGame').click(); await w(80); $('pickRj').click(); await w(120);
          for (const order of [[0,1,2,3,4,5,6,7], [2,5,0,3,4,1,6,7]]) {
            if (order[0] === 0) { const bad = $('rjWires').querySelector('[data-c="7"]'); bad.click(); }
            for (const c of order) $('rjWires').querySelector(`[data-c="${c}"]`).click();
            out['rj' + order[0]] = $('rjSlots').querySelectorAll('.full').length;
            $('rjNext').click(); await w(20);
          }
          [...$('rjOpts').querySelectorAll('button')].find(b => b.textContent === T.rjOpts[0]).click(); $('rjNext').click(); await w(20);
          out.rj = localStorage.getItem('jg-rj45-best');
          $('rjQuit').click(); await w(50);
          // Appel : la meilleure réponse à chaque étape
          $('openGame').click(); await w(80); $('pickCall').click(); await w(120);
          for (let i = 0; i < T.call.length; i++) {
            [...$('clOpts').querySelectorAll('button')].find(b => b.textContent === T.call[i][1][0][0]).click(); await w(20); $('clNext').click(); await w(20);
          }
          out.call = localStorage.getItem('jg-call-best'); out.bulles = $('clChat').children.length;
          $('clQuit').click(); await w(50);
          // Défi du jour : une seule réponse par jour
          $('openGame').click(); await w(80); $('pickDaily').click(); await w(120);
          $('dyOpts').querySelector('button').click(); await w(20);
          out.daily = !!JSON.parse(localStorage.getItem('jg-daily')).d && [...$('dyOpts').querySelectorAll('button')].every(b => b.disabled);
          $('dyClose').click(); await w(50); $('pickDaily').click(); await w(80);
          out.daily2 = !$('dyExpl').hidden; $('dyClose').click();
          return out;
        }""")
        if res.get('itil') != '160' or res.get('ps') != '75' or res.get('rj') != '190' or res.get('call') != '16' or res.get('rj0') != 8 or res.get('rj2') != 8 or res.get('bulles') != 8 or not res.get('daily') or not res.get('daily2') or res.get('psTerm'):
            erreurs.append(f'{nom} : nouveaux jeux {res}')
        ok(f'{nom} : priorisation, PowerShell, RJ45, appel et défi du jour jouables jusqu’au bout, scores enregistrés')
        # Lot 15 : préparer un poste, rançongiciel, réponse au ticket, badges
        res = pg.evaluate("""async () => {
          const $ = id => document.getElementById(id), w = ms => new Promise(r => setTimeout(r, ms)), out = {}, T = window.JG_I18N.fr;
          const before = JSON.parse(localStorage.getItem('jg-badges') || '[]').length;
          $('openGame').click(); await w(80); $('pickPrep').click(); await w(150);
          const wrong = [...$('prOpts').querySelectorAll('button')].find(b => b.textContent !== T.prSteps[0][0]); wrong.click(); await w(20);
          for (const st of T.prSteps) { [...$('prOpts').querySelectorAll('button')].find(b => b.textContent === st[0]).click(); await w(20); }
          out.prList = $('prDone').children.length; $('prNext').click(); await w(30); out.prep = localStorage.getItem('jg-prep-best'); $('prQuit').click(); await w(60);
          $('openGame').click(); await w(80); $('pickRansom').click(); await w(150);
          for (let i = 0; i < T.ransom.length; i++) { [...$('rwOpts').querySelectorAll('button')].find(b => b.textContent === T.ransom[i][1][0]).click(); await w(20); $('rwNext').click(); await w(20); }
          out.ransom = localStorage.getItem('jg-ransom-best'); out.r321 = $('rwExpl').textContent.includes('3-2-1'); $('rwQuit').click(); await w(60);
          $('openGame').click(); await w(80); $('pickReply').click(); await w(150);
          for (let i = 0; i < T.replies.length; i++) { for (let s = 0; s < 4; s++) { [...$('rpOpts').querySelectorAll('button')].find(b => b.textContent === T.replies[i][2][s][0][0]).click(); await w(20); }
            out['mail' + i] = $('rpMail').children.length; $('rpNext').click(); await w(30); }
          out.reply = localStorage.getItem('jg-reply-best'); $('rpQuit').click(); await w(700);
          $('openGame').click(); await w(80); $('badgesBtn').click(); await w(150);
          out.bdOpen = $('bdPanel').classList.contains('open'); out.badges = $('bdGrid').children.length; out.on = $('bdGrid').querySelectorAll('.bd.on').length;
          out.count = $('bdCount').textContent; out.seen = JSON.parse(localStorage.getItem('jg-badges') || '[]').length; out.before = before;
          out.toast = document.getElementById('toast').textContent;
          $('bdClose').click(); return out;
        }""")
        if res.get('prep') != '70' or res.get('prList') != 8 or res.get('ransom') != '100' or not res.get('r321') or res.get('reply') != '80' or res.get('mail0') != 5 or not res.get('bdOpen') or res.get('badges') != 20 or res.get('on') < 4 or res.get('seen') != res.get('on'):
            erreurs.append(f'{nom} : lot 15 {res}')
        ok(f'{nom} : préparer un poste, rançongiciel et réponse au ticket jouables jusqu’au bout ; {res.get("count")}')
        # Lot 19 : « Plus d'Internet », la méthode de diagnostic (câble → IP → passerelle → Internet → DNS → navigateur)
        res = pg.evaluate("""async () => {
          const $ = id => document.getElementById(id), w = ms => new Promise(r => setTimeout(r, ms)), out = { ordre: true }, T = window.JG_I18N.fr;
          const fixes = T.niScen.map(s => s.fix[0][0]), live = () => [...$('niOpts').querySelectorAll('button')].filter(b => !b.disabled);
          $('openGame').click(); await w(80); $('pickNoNet').click(); await w(150);
          out.open = $('niPanel').classList.contains('open'); out.steps = $('niSteps').children.length;
          out.cur0 = [...$('niSteps').children].findIndex(li => li.classList.contains('now'));
          const faux = live().find(b => b.textContent !== T.niChecks[0]); faux.click(); await w(20);
          out.fauxKo = $('niExpl').classList.contains('ko') && faux.disabled;
          for (let cas = 0; cas < 3; cas++) {
            if (cas === 1) { document.querySelector('#niPanel .hint-btn').click(); await w(30); out.hint = document.querySelectorAll('#niOpts .hint-off').length; }
            for (let n = 0; n < 8 && !$('niOpts').hidden; n++) {
              const c = [...$('niSteps').children].findIndex(li => li.classList.contains('now'));
              if (c >= 0 && c !== n) out.ordre = false;
              const bon = c >= 0 ? T.niChecks[c] : fixes.find(f => live().some(b => b.textContent === f));
              live().find(b => b.textContent === bon).click(); await w(20);
            }
            out['log' + cas] = $('niLog').children.length; $('niNext').click(); await w(40);
          }
          await w(80);
          out.best = localStorage.getItem('jg-noint-best'); out.ring = !!document.querySelector('#niPanel .end-ring');
          out.methode = $('niExpl').textContent.includes('câble → adresse IP → passerelle'); $('niQuit').click(); await w(60);
          return out;
        }""")
        if not (res.get('open') and res.get('steps') == 5 and res.get('cur0') == 0 and res.get('fauxKo') and res.get('ordre') and res.get('hint', 0) >= 1
                and res.get('best') == '130' and res.get('ring') and res.get('methode') and all(res.get(f'log{c}', 0) >= 2 for c in range(3))):
            erreurs.append(f'{nom} : jeu Plus d’Internet {res}')
        ok(f'{nom} : « Plus d’Internet » jouable jusqu’au bout, étapes dans l’ordre, mauvais choix et indice comptés (130/150)')
        # Lot 16 : catégories, écran de fin, progression, raccourcis clavier, taille du texte, contraste, scènes
        pg.goto(BASE + '/'); pg.wait_for_timeout(1200)
        res = pg.evaluate("""async () => {
          const $ = id => document.getElementById(id), w = ms => new Promise(r => setTimeout(r, ms)), out = {}, T = window.JG_I18N.fr;
          const vis = () => [...document.querySelectorAll('#gamesPanel .pick')].filter(p => !p.hidden).length;
          ['jg-prep-best', 'jg-ransom-best', 'jg-noint-best'].forEach(k => localStorage.removeItem(k));
          $('openGame').click(); await w(150);
          out.tabs = $('gTabs').children.length; out.all = vis(); out.icons = document.querySelectorAll('#gamesPanel .g-ic svg').length;
          out.newTag = !!$('pickNoNet').querySelector('.g-state.new') && !$('pickPrep').querySelector('.g-state.new');
          [...$('gTabs').children].find(b => b.dataset.cat === 'sec').click(); await w(50); out.sec = vis();
          [...$('gTabs').children].find(b => b.dataset.cat === 'all').click(); await w(50);
          $('pickRansom').click(); await w(200);
          out.prog = document.querySelectorAll('#rwPanel .prog-bar i').length; out.files = document.querySelectorAll('#rwPanel .rw-files span').length;
          for (let i = 0; i < T.ransom.length; i++) { [...$('rwOpts').querySelectorAll('button')].find(b => b.textContent === T.ransom[i][1][0]).click(); await w(20); $('rwNext').click(); await w(30); }
          await w(80);
          out.ring = !!document.querySelector('#rwPanel .end-ring'); out.stars = document.querySelectorAll('#rwPanel .end-stars .on').length;
          out.record = !!document.querySelector('#rwPanel .end-record'); out.confetti = !!document.querySelector('.confetti');
          out.next = !!document.querySelector('#rwPanel .end-next .chip-btn'); const ob = document.querySelector('#rwPanel .end-other'); out.other = !!ob && !ob.hidden;
          ob.click(); await w(150); out.backToGames = $('gamesPanel').classList.contains('open'); out.done = !!$('pickRansom').querySelector('.g-state.done');
          $('pickPs').click(); await w(200); out.psWin = !document.querySelector('#psPanel .ps-win').hidden && !!document.querySelector('#psTerm .cur');
          $('psQuit').click(); await w(80);
          return out;
        }""")
        pg.evaluate("document.getElementById('openGame').click()"); pg.wait_for_timeout(120)
        pg.evaluate("document.getElementById('pickRansom').click()"); pg.wait_for_timeout(250)
        pg.keyboard.press('1'); pg.wait_for_timeout(80)
        k1 = pg.evaluate("!!document.querySelector('#rwOpts .good, #rwOpts .bad')")
        pg.evaluate("[...document.querySelectorAll('#rwOpts button')].find(b => b.textContent === window.JG_I18N.fr.ransom[0][1][0]).click()"); pg.wait_for_timeout(50)
        pg.evaluate("document.activeElement.blur()"); pg.keyboard.press('Enter'); pg.wait_for_timeout(120)
        k2 = pg.evaluate("document.getElementById('rwTag').textContent")
        pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
        sz = []
        for _ in range(3):
            pg.evaluate("document.getElementById('sizeBtn').click()"); pg.wait_for_timeout(60)
            sz.append(pg.evaluate("document.documentElement.dataset.size || 'm'"))
        pg.evaluate("document.getElementById('a11yContrast').click()"); pg.wait_for_timeout(900)
        hc = pg.evaluate("getComputedStyle(document.body).backgroundColor")
        pg.evaluate("document.getElementById('a11yContrast').click()"); pg.wait_for_timeout(60)
        if not (res['tabs'] == 5 and res['all'] == 16 and res['icons'] == 16 and res['newTag'] and res['sec'] == 3 and res['prog'] == 5 and res['files'] == 3 and res['ring'] and res['stars'] == 3 and res['record'] and res['confetti'] and res['next'] and res['other'] and res['backToGames'] and res['done'] and res['psWin']) or not k1 or '2/5' not in k2 or sz != ['l', 'xl', 'm'] or hc != 'rgb(0, 0, 0)':
            erreurs.append(f'{nom} : lot 16 {res} clavier={k1},{k2} taille={sz} contraste={hc}')
        ok(f'{nom} : catégories, icônes, écran de fin, « Autre jeu », progression, raccourcis 1-9 et Entrée, taille A++, contraste élevé, scènes')
        # Lot 18 : indices progressifs, taille par défaut, effets visuels désactivés par défaut
        pg.goto(BASE + '/'); pg.wait_for_timeout(1200)
        res = pg.evaluate("""async () => {
          const $ = id => document.getElementById(id), w = ms => new Promise(r => setTimeout(r, ms)), out = {}, T = window.JG_I18N.fr;
          out.skyOff = !document.documentElement.dataset.sky; out.seasonOff = !$('seasonFx'); out.morphOff = !document.body.classList.contains('morph');
          $('openGame').click(); await w(100); $('pickQuiz').click(); await w(200);
          const row = document.querySelector('#quizPanel .hint-row'); out.rowShown = !row.hidden;
          const hb = row.querySelector('.hint-btn'); hb.click(); await w(30);
          out.h1 = document.querySelectorAll('#qzOpts .hint-off').length; out.t1 = row.querySelector('.hint-txt').textContent;
          hb.click(); await w(30); out.t2 = row.querySelector('.hint-txt').textContent;
          hb.click(); await w(30); out.h3 = !!document.querySelector('#qzOpts .hint-good'); out.good = out.h3 ? document.querySelector('#qzOpts .hint-good').textContent.trim() : ''; out.btnGone = hb.hidden;
          document.querySelector('#qzOpts .hint-good').click(); await w(40); out.rowHidden = row.hidden;
          $('qzNext').click(); await w(60); out.reset = !row.hidden && row.querySelector('.hint-txt').textContent === '' && !hb.hidden;
          $('qzQuit').click(); await w(80);
          $('openGame').click(); await w(100); $('pickPrep').click(); await w(200);
          document.querySelector('#prPanel .hint-btn').click(); await w(30); out.prOff = document.querySelectorAll('#prOpts .hint-off').length;
          $('prQuit').click(); await w(80);
          $('openGame').click(); await w(100); $('pickPhish').click(); await w(200);
          document.querySelector('#phPanel .hint-btn').click(); await w(30); out.ph = document.querySelector('#phPanel .hint-txt').textContent.length > 5;
          $('phQuit').click(); await w(80);
          $('sizeBtn').click(); await w(40); out.dockReset = !$('sizeResetDock').hidden; $('sizeResetDock').click(); await w(40);
          out.sizeBack = !document.documentElement.dataset.size && $('sizeResetDock').hidden;
          $('keysBtn').click(); await w(150);
          $('fxSky').click(); await w(30); out.skyOn = !!document.documentElement.dataset.sky;
          $('fxSeason').click(); await w(30); out.seasonMatch = !!$('seasonFx') === !/rien/.test($('fxSeasonNow').textContent);
          $('fxJg').click(); await w(600); out.morphOn = document.body.classList.contains('morph');
          await w(4600); $('keysBtn').click(); await w(150);
          $('a11yResetAll').click(); await w(60);
          out.resetAll = !document.documentElement.dataset.sky && !$('seasonFx') && !$('fxJg').checked && !$('fxSky').checked && !document.documentElement.dataset.size;
          return out;
        }""")
        # Régression : l'indice 2 ne doit jamais donner la réponse entière (déjà arrivé avec une réponse chiffrée)
        if res.get('good') and len(res['good']) > 1 and res['good'] in res['t2']:
            erreurs.append(f"{nom} : l’indice 2 révèle la réponse entière ({res['t2']})")
        if not (res['skyOff'] and res['seasonOff'] and res['morphOff'] and res['rowShown'] and res['h1'] == 1 and 'retirée' in res['t1'] and res['t2'].startswith(('Indice 2', 'Indice 3')) and res['h3'] and res['btnGone'] and res['rowHidden'] and res['reset'] and res['prOff'] >= 3 and res['ph'] and res['dockReset'] and res['sizeBack'] and res['skyOn'] and res['seasonMatch'] and res['morphOn'] and res['resetAll']):
            erreurs.append(f'{nom} : lot 18 {res}')
        ok(f'{nom} : indices 1-2-3, taille par défaut, ciel / « JG » / saison désactivés par défaut puis activables, tout remettre par défaut')
        # Lot 14 : créneaux, compétences, partage, FAQ, lien personnalisé
        res = pg.evaluate("""async () => {
          const $ = id => document.getElementById(id), w = ms => new Promise(r => setTimeout(r, ms)), out = {};
          $('briefSlot').click(); await w(80);
          out.slotOpen = $('slotPanel').classList.contains('open'); out.days = $('slotDays').children.length; out.slots = $('slotDays').querySelectorAll('.slot').length;
          out.wkend = [...$('slotDays').querySelectorAll('.slot')].some(b => /samedi|dimanche/i.test(b.getAttribute('aria-label')));
          $('slotMail').click(); out.needPick = !$('slotMsg').hidden;
          $('slotMode').querySelectorAll('button')[1].click(); $('slotDays').querySelector('.slot').click();
          out.mail = decodeURIComponent($('slotMail').href); out.gmail = $('slGmail').href.startsWith('https://mail.google.com/');
          $('slotPanel').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); $('slotPanel').click(); await w(60); out.slotClosed = !$('slotPanel').classList.contains('open');
          $('briefSkills').click(); await w(80);
          out.skills = $('skList').querySelectorAll('.sk-block').length; out.chips = $('skList').querySelectorAll('.chip-btn').length;
          $('skList').querySelector('.chip-btn').click(); await w(150); out.chipGame = $('supportPanel').classList.contains('open');
          document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open'));
          $('briefShare').click(); await w(80);
          out.share = $('sharePanel').classList.contains('open') && $('shLinkedin').href.includes('linkedin.com/sharing') && $('shTeams').href.includes('teams.microsoft.com');
          $('shClose').click(); await w(40);
          $('briefFaq').click(); await w(80); out.faq = $('faqList').querySelectorAll('details').length; out.faqTxt = $('faqList').querySelectorAll('details p')[0].textContent.length > 3;
          $('faqClose').click();
          return out;
        }""")
        if not (res['slotOpen'] and res['days'] == 8 and res['slots'] == 32 and not res['wkend'] and res['needPick'] and 'par téléphone' in res['mail'] and res['gmail'] and res['slotClosed'] and res['skills'] == 3 and res['chips'] == 14 and res['chipGame'] and res['share'] and res['faq'] == 8 and res['faqTxt']):
            erreurs.append(f'{nom} : créneaux / compétences / partage / FAQ {res}')
        ok(f'{nom} : créneaux (8 jours ouvrés, e-mail prérempli), compétences reliées aux jeux, partage, FAQ')
        pg.goto(BASE + '/?pour=Société%20Générale%20<b>'); pg.wait_for_timeout(1200)
        res = pg.evaluate("""() => ({ hello: document.getElementById('helloLine').hidden ? '' : document.getElementById('helloTxt').textContent,
          mail: decodeURIComponent(document.getElementById('openMail').href), html: document.getElementById('helloTxt').innerHTML })""")
        if 'Société Générale b' not in res['hello'] or '<' in res['html'] or 'Entreprise : Société Générale b' not in res['mail'] or 'Alternance' not in res['mail'] and '· Société Générale b' not in res['mail']:
            erreurs.append(f'{nom} : lien personnalisé {res}')
        pg.evaluate("document.getElementById('termBtn') && document.getElementById('termBtn').click()"); pg.wait_for_timeout(200)
        pg.evaluate("(() => { const i = document.querySelector('#termForm input'); i.value = 'lien Mairie de Lyon'; document.getElementById('termForm').requestSubmit(); })()"); pg.wait_for_timeout(150)
        lien = pg.evaluate("[...document.querySelectorAll('#term a')].map(a => a.href).pop() || ''")
        if lien != 'https://jeremy-grosjean.fr/?pour=Mairie+de+Lyon':
            erreurs.append(f'{nom} : commande lien → {lien}')
        pg.evaluate("(() => { const i = document.querySelector('#termForm input'); i.value = 'competences'; document.getElementById('termForm').requestSubmit(); })()"); pg.wait_for_timeout(400)
        if not pg.evaluate("document.getElementById('skillsPanel').classList.contains('open')"):
            erreurs.append(f'{nom} : commande competences')
        pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open'))")
        ok(f'{nom} : lien personnalisé ?pour=… (texte nettoyé), commandes lien et competences')
        # Mode forum : écran d'accueil, un toucher le masque, Quitter le mode
        pg.goto(BASE + '/?mode=forum'); pg.wait_for_timeout(1200)
        f1 = pg.evaluate("!document.getElementById('forum').hidden && document.getElementById('fmFact').textContent.length > 3")
        pg.mouse.click(5, 5); pg.wait_for_timeout(150)
        f2 = pg.evaluate("document.getElementById('forum').hidden")
        if not (f1 and f2):
            erreurs.append(f'{nom} : mode forum {f1} {f2}')
        ok(f'{nom} : mode forum (écran d’accueil, retour au site au toucher)')
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
        # Régressions : le texte d'aide ne passe jamais derrière les boutons ou le contenu ; le nombre de jeux du bouton est exact
        pg.wait_for_timeout(400)
        aide = pg.evaluate("""(() => { const h = document.querySelector('.hint'), n = document.querySelectorAll('#gamesPanel .pick:not(#pickDaily):not(#pickSupport2)').length, out = [];
          if (!document.getElementById('openGame').textContent.includes(String(n))) out.push('le bouton Jouer annonce un mauvais nombre de jeux : ' + document.getElementById('openGame').textContent + ' (' + n + ' jeux)');
          if (getComputedStyle(h).display !== 'none' && !h.classList.contains('hint-cache')) {
            const s = [...h.querySelectorAll('span')].map(x => x.getBoundingClientRect()).find(x => x.width > 0);
            if (s) [...document.querySelectorAll('.dock .pill, .dock button, .dock-mid, .cta, .keys, .scores, .avail')].forEach(e => { const q = e.getBoundingClientRect(); if (q.width > 0 && s.left < q.right - 1 && q.left < s.right - 1 && s.top < q.bottom - 1 && q.top < s.bottom - 1) out.push('le texte d’aide chevauche ' + (e.id || e.className)); });
          }
          return out; })()""")
        for pb in aide:
            erreurs.append(f'{w}×{h} : {pb}')
        for pb in pg.evaluate(MESURE, CLES):
            erreurs.append(f'{w}×{h} : {pb}')
        for panneau, bouton in (('contactPanel', 'contactBtn'), ('secPanel', 'secBtn'), ('supPanel', 'supBtn'), ('gamesPanel', 'openGame'), ('niPanel', 'pickNoNet'), ('rwPanel', 'pickRansom')):
            pg.evaluate(f"document.getElementById('{bouton}').click()"); pg.wait_for_timeout(200)
            if pg.evaluate(f"(() => {{ const c = document.querySelector('#{panneau} .card'), r = c.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1 || c.scrollWidth > c.clientWidth + 2; }})()"):
                erreurs.append(f'{w}×{h} : la fenêtre {panneau} sort de l’écran')
            # Régression : la croix ✕ ne doit jamais recouvrir le bandeau de la fenêtre ; le domaine n'est jamais coupé au tiret
            pb = pg.evaluate(f"""(() => {{ const c = document.querySelector('#{panneau} .card'), x = c.querySelector('.panel-x'), b = c.querySelector(':scope > .g-band'), out = [];
              if (x && b) {{ const r = x.getBoundingClientRect(), q = b.getBoundingClientRect(); if (r.left < q.right - 1 && q.left < r.right - 1 && r.top < q.bottom - 1 && q.top < r.bottom - 1) out.push('la croix recouvre le bandeau de ' + Math.round(q.right - r.left) + ' px'); }}
              if (innerWidth > 300) c.querySelectorAll('.nobr').forEach(n => {{ if (n.getClientRects().length > 1) out.push('le domaine est coupé en deux'); }});
              return out; }})()""")
            for p_ in pb:
                erreurs.append(f'{w}×{h} : fenêtre {panneau} : {p_}')
            if panneau == 'contactPanel':
                # Fenêtre contact : messageries de même hauteur, plus de bouton « Fermer » (la croix suffit), QR code = fiche contact
                ct = pg.evaluate("""(() => { const c = document.querySelector('#contactPanel .card'), h = [...c.querySelectorAll('.webmail .wm:not(.wm-wide)')].map(b => Math.round(b.getBoundingClientRect().height));
                  return { ecart: Math.max(...h) - Math.min(...h), fermer: !!document.getElementById('contactClose'), qr: document.getElementById('qrImg').getAttribute('src'), app: !!c.querySelector('.webmail #openMail') }; })()""")
                if ct['ecart'] > 1 or ct['fermer'] or 'qr-contact.svg' not in ct['qr'] or not ct['app']:
                    erreurs.append(f'{w}×{h} : fenêtre contact {ct}')
            pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open'))")
        ctx.close()
    ok(f'{len(ECRANS)} formes d’écran, du 200×200 au 8K : rien ne déborde ni ne se chevauche, la croix ne touche aucun bandeau')
    # Fluidité : le jeu va à la même vitesse sur un écran 30 Hz, 60 Hz, 144 Hz ou 240 Hz (hasard figé pour comparer)
    # Une machine surchargée (GitHub lance plusieurs vérifications à la fois) peut ralentir une seule mesure :
    # en cas d'écart, on refait la mesure (2 fois au plus) et on garde le meilleur temps de chaque fréquence.
    # Un vrai défaut (vitesse liée à l'écran) donne toujours le même écart et fait toujours échouer le test.
    def mesurer(hz):
        pg = nav.new_page(viewport={'width': 1280, 'height': 800}); suivre(pg, f'{hz} Hz')
        pg.add_init_script("Math.random = () => 0.5; window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 1000 / %d); localStorage.setItem('jg-tour', '1');" % hz)
        pg.goto(BASE + '/'); pg.wait_for_timeout(1200)
        pg.evaluate("document.getElementById('openGame').click(); document.getElementById('pickServer').click(); document.getElementById('start').click()"); pg.wait_for_timeout(150)
        t = pg.evaluate("""new Promise(res => { const t0 = performance.now(); document.getElementById('lvGo').click();
          const iv = setInterval(() => { if (document.getElementById('hBreach').textContent !== '0/3' || performance.now() - t0 > 15000) { clearInterval(iv); res(performance.now() - t0); } }, 20); })""")
        pg.close()
        return t

    FREQUENCES = (30, 60, 144, 240)
    temps = {hz: mesurer(hz) for hz in FREQUENCES}
    essais = 1
    while max(temps.values()) > min(temps.values()) * 1.12 and essais < 3:
        essais += 1
        temps = {hz: min(temps[hz], mesurer(hz)) for hz in FREQUENCES}
    detail = ' · '.join(f'{v / 1000:.1f} s' for v in temps.values()) + (f', {essais} mesures' if essais > 1 else '')
    if max(temps.values()) > min(temps.values()) * 1.12:
        erreurs.append('fluidité : la vitesse du jeu dépend de l’écran (' + ', '.join(f'{k} Hz : {v / 1000:.1f} s' for k, v in temps.items()) + f', après {essais} mesures)')
    else:
        ok(f'même vitesse de jeu à 30, 60, 144 et 240 Hz ({detail})')
    nav.close()
srv.shutdown()

print()
if erreurs:
    for e in erreurs:
        print('  ✗ ' + e)
    print(f'✗ {len(erreurs)} problème(s)')
    sys.exit(1)
print('✓ Aucune erreur dans le navigateur')
