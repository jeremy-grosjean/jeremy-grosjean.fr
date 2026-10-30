# Apostrophes typographiques : dans les textes affichés aux visiteurs, « l’accueil » (’) et non « l'accueil » (').
#   python3 outils/apostrophes.py              liste les apostrophes droites restantes (code de sortie 1 s'il y en a)
#   python3 outils/apostrophes.py --corriger   les remplace par ’
# Seul l'intérieur des textes est lu : le code, les commentaires et les noms de fichiers ne sont jamais modifiés.
# Restent volontairement droites : les sorties de commandes imitées (fidèles à la vraie console Windows) listées dans GARDER.
import pathlib, re, sys

SITE = pathlib.Path(__file__).resolve().parent.parent / 'site'
FICHIERS_JS = ['assets/i18n.js', 'assets/labs.js', 'assets/labs2.js', 'assets/labs3.js', 'assets/labs4.js', 'assets/labs5.js',
               'assets/labs6.js', 'assets/labs7.js', 'assets/a11y.js', 'assets/legal.js', 'assets/404.js', 'assets/app.js']
FICHIERS_HTML = ['index.html', '404.html', 'accessibilite.html', 'mentions-legales.html']
GARDER = ("Envoi d'une requête 'Ping'", "Délai d'attente de la demande")  # vraie sortie de ping sous Windows
MOT = r"[^\W\d_]"
TYPO = '’'


def textes_js(src):
    """Découpe un fichier JavaScript : renvoie les (début, fin, guillemet) de chaque chaîne de caractères, hors commentaires."""
    i, n, out, pile = 0, len(src), [], []
    while i < n:
        c = src[i]
        if c == '/' and src.startswith('//', i):
            i = src.find('\n', i); i = n if i < 0 else i; continue
        if c == '/' and src.startswith('/*', i):
            j = src.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c in '\'"`':
            q, j = c, i + 1
            while j < n and src[j] != q:
                if src[j] == '\\': j += 2; continue
                if q == '`' and src.startswith('${', j):
                    k, prof = j + 2, 1
                    while k < n and prof:
                        prof += {'{': 1, '}': -1}.get(src[k], 0); k += 1
                    j = k; continue
                if q != '`' and src[j] == '\n': break
                j += 1
            out.append((i + 1, j, q)); i = j + 1; continue
        if c == '}' and pile: pile.pop()
        i += 1
    return out


def corriger_texte(t, q):
    if any(g in t for g in GARDER): return t, 0
    motif = re.compile(rf"(?<={MOT})\\'(?={MOT})") if q == "'" else re.compile(rf"(?<={MOT})'(?={MOT})")
    return motif.subn(TYPO, t)


def traiter_js(src):
    morceaux, pos, total = [], 0, 0
    for a, b, q in textes_js(src):
        t, k = corriger_texte(src[a:b], q); total += k
        morceaux += [src[pos:a], t]; pos = b
    morceaux.append(src[pos:])
    return ''.join(morceaux), total


def traiter_html(src):
    """Seul le texte entre les balises est corrigé (jamais les attributs, les scripts ni les styles)."""
    morceaux, total = [], 0
    for part in re.split(r'(<script\b.*?</script>|<style\b.*?</style>|<[^>]+>)', src, flags=re.S):
        if part.startswith('<'):
            morceaux.append(part); continue
        t, k = re.subn(rf"(?<={MOT})'(?={MOT})", TYPO, part); total += k; morceaux.append(t)
    return ''.join(morceaux), total


def restantes(racine=SITE):
    res = []
    for f in FICHIERS_JS + FICHIERS_HTML:
        p = racine / f
        if not p.exists(): continue
        src = p.read_text(encoding='utf-8')
        _, k = (traiter_js if f.endswith('.js') else traiter_html)(src)
        if k: res.append((f, k))
    return res


if __name__ == '__main__':
    if '--corriger' in sys.argv:
        for f in FICHIERS_JS + FICHIERS_HTML:
            p = SITE / f
            if not p.exists(): continue
            src = p.read_text(encoding='utf-8')
            neuf, k = (traiter_js if f.endswith('.js') else traiter_html)(src)
            if k: p.write_text(neuf, encoding='utf-8'); print(f'  {f} : {k} apostrophe(s) corrigée(s)')
    r = restantes()
    for f, k in r: print(f'✗ {f} : {k} apostrophe(s) droite(s) dans un texte affiché')
    if not r: print('✓ Apostrophes typographiques partout dans les textes affichés')
    sys.exit(1 if r else 0)
