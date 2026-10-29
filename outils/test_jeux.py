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
        for bouton, panneau in (('pickServer', 'intro'), ('pickSupport', 'supportPanel'), ('pickPanne', 'panPanel'), ('pickQuiz', 'quizPanel'), ('pickPhish', 'phPanel'), ('pickSubnet', 'snPanel'), ('pickItil', 'itPanel'), ('pickPs', 'psPanel'), ('pickRj', 'rjPanel'), ('pickCall', 'clPanel'), ('pickDaily', 'dyPanel'), ('pickPrep', 'prPanel'), ('pickRansom', 'rwPanel'), ('pickReply', 'rpPanel')):
            pg.evaluate("document.getElementById('openGame').click()"); pg.wait_for_timeout(150)
            pg.evaluate(f"document.getElementById('{bouton}').click()"); pg.wait_for_timeout(300)
            if not pg.evaluate(f"document.getElementById('{panneau}').classList.contains('open')"):
                erreurs.append(f'{nom} : le jeu {bouton} ne s’ouvre pas')
            pg.keyboard.press('Escape'); pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open'))")
        ok(f'{nom} : les 15 jeux et défis s’ouvrent')
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
        if not (res['slotOpen'] and res['days'] == 8 and res['slots'] == 32 and not res['wkend'] and res['needPick'] and 'par téléphone' in res['mail'] and res['gmail'] and res['slotClosed'] and res['skills'] == 3 and res['chips'] == 13 and res['chipGame'] and res['share'] and res['faq'] == 8 and res['faqTxt']):
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
        for pb in pg.evaluate(MESURE, CLES):
            erreurs.append(f'{w}×{h} : {pb}')
        for panneau, bouton in (('contactPanel', 'contactBtn'), ('secPanel', 'secBtn'), ('gamesPanel', 'openGame')):
            pg.evaluate(f"document.getElementById('{bouton}').click()"); pg.wait_for_timeout(200)
            if pg.evaluate(f"(() => {{ const c = document.querySelector('#{panneau} .card'), r = c.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1 || c.scrollWidth > c.clientWidth + 2; }})()"):
                erreurs.append(f'{w}×{h} : la fenêtre {panneau} sort de l’écran')
            pg.evaluate("document.querySelectorAll('.panel.open').forEach(p => p.classList.remove('open'))")
        ctx.close()
    ok(f'{len(ECRANS)} formes d’écran, du 200×200 au 8K : rien ne déborde ni ne se chevauche')
    # Fluidité : le jeu va à la même vitesse sur un écran 30 Hz, 60 Hz, 144 Hz ou 240 Hz (hasard figé pour comparer)
    temps = {}
    for hz in (30, 60, 144, 240):
        pg = nav.new_page(viewport={'width': 1280, 'height': 800}); suivre(pg, f'{hz} Hz')
        pg.add_init_script("Math.random = () => 0.5; window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 1000 / %d); localStorage.setItem('jg-tour', '1');" % hz)
        pg.goto(BASE + '/'); pg.wait_for_timeout(1200)
        pg.evaluate("document.getElementById('openGame').click(); document.getElementById('pickServer').click(); document.getElementById('start').click()"); pg.wait_for_timeout(150)
        temps[hz] = pg.evaluate("""new Promise(res => { const t0 = performance.now(); document.getElementById('lvGo').click();
          const iv = setInterval(() => { if (document.getElementById('hBreach').textContent !== '0/3' || performance.now() - t0 > 15000) { clearInterval(iv); res(performance.now() - t0); } }, 20); })""")
        pg.close()
    if max(temps.values()) > min(temps.values()) * 1.12:
        erreurs.append('fluidité : la vitesse du jeu dépend de l’écran (' + ', '.join(f'{k} Hz : {v / 1000:.1f} s' for k, v in temps.items()) + ')')
    ok('même vitesse de jeu à 30, 60, 144 et 240 Hz (' + ' · '.join(f'{v / 1000:.1f} s' for v in temps.values()) + ')')
    nav.close()
srv.shutdown()

print()
if erreurs:
    for e in erreurs:
        print('  ✗ ' + e)
    print(f'✗ {len(erreurs)} problème(s)')
    sys.exit(1)
print('✓ Aucune erreur dans le navigateur')
