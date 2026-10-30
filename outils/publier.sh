#!/bin/bash
# =============================================================================
#  publier.sh : met jeremy-grosjean.fr à jour en une seule commande
#    1. prépare la version en ligne (minification, empreintes anti-cache, zip)
#    2. l'envoie par SFTP et vérifie le site en ligne (mettre-a-jour-site.sh)
#    3. rappelle de faire Commit + Push si GitHub n'est pas à jour
#  Avant tout envoi, des garde-fous (voir METHODE.md) :
#    - modifications non enregistrées, vérifications locales (outils/verifier.py),
#    - résultat de la vérification GitHub pour ce commit : si elle est rouge, rien n'est envoyé.
#  Après un envoi réussi, la version est archivée : outils/restaurer.sh permet d'y revenir.
#  Le mot de passe SFTP est demandé à chaque fois et n'est jamais enregistré.
#
#  Utilisation :  bash ~/Documents/GitHub/jeremy-grosjean.fr/outils/publier.sh
#                 bash outils/publier.sh --forcer     (urgence : ignore les garde-fous, à éviter)
# =============================================================================
set -u
ICI="$(cd "$(dirname "$0")" && pwd)"
DEPOT="$(cd "$ICI/.." && pwd)"
VERT=$'\033[32m'; JAUNE=$'\033[33m'; ROUGE=$'\033[31m'; CYAN=$'\033[36m'; GRAS=$'\033[1m'; FIN=$'\033[0m'

printf '\n%sPublication de jeremy-grosjean.fr%s\n\n' "$GRAS" "$FIN"

# Options : --forcer est pour ce script, les autres sont transmises à mettre-a-jour-site.sh
FORCER=0; ARGS=()
for a in "$@"; do if [ "$a" = "--forcer" ]; then FORCER=1; else ARGS+=("$a"); fi; done
demander() { local r; printf '%s [o/N] ' "$1"; read -r r; [ "$r" = "o" ] || [ "$r" = "O" ]; }
arret() { printf '%s✗ %s%s\n' "$ROUGE" "$1" "$FIN"; printf '  Rien n'"'"'a été envoyé. En cas d'"'"'urgence seulement : bash outils/publier.sh --forcer\n'; exit 1; }

# 0. Garde-fous ------------------------------------------------------------------
printf '%s›%s Garde-fous avant publication\n' "$CYAN" "$FIN"
SHA=""; DEPUIS=""
if [ "$FORCER" = 1 ]; then
  printf '%s! --forcer : garde-fous ignorés.%s\n' "$JAUNE" "$FIN"
elif command -v git >/dev/null 2>&1 && git -C "$DEPOT" rev-parse >/dev/null 2>&1; then
  # a) Tout est-il enregistré ? (on publie ce qui a été vérifié, pas un état intermédiaire)
  MODIFS0="$(git -C "$DEPOT" status --porcelain | wc -l | tr -d ' ')"
  if [ "$MODIFS0" != 0 ]; then
    printf '%s! %s fichier(s) modifié(s) pas encore enregistré(s) (commit) :%s\n' "$JAUNE" "$MODIFS0" "$FIN"
    git -C "$DEPOT" status --short | head -n 10 | sed 's/^/    /'
    demander '  Publier quand même cet état non enregistré ?' || arret "Publication annulée : enregistrez d'abord (GitHub Desktop, Commit puis Push)."
  fi
  # b) Vérifications locales rapides (HTML, liens, JavaScript, traductions, secrets, poids)
  if command -v node >/dev/null 2>&1; then
    if python3 "$ICI/verifier.py" > /tmp/jg-verif.txt 2>&1; then printf '%s✓%s Vérifications locales réussies\n' "$VERT" "$FIN"
    else grep -E '✗' /tmp/jg-verif.txt | head -n 15; arret "Les vérifications locales ont échoué."; fi
  else
    printf '%s! node absent : vérifications locales sautées (GitHub les fait quand même).%s\n' "$JAUNE" "$FIN"
  fi
  # c) La vérification GitHub de ce commit est-elle verte ? (lecture publique, sans identifiant)
  SHA="$(git -C "$DEPOT" rev-parse HEAD)"
  git -C "$DEPOT" fetch -q 2>/dev/null
  if [ "$(git -C "$DEPOT" rev-list --count '@{u}..HEAD' 2>/dev/null || echo 0)" != 0 ]; then
    printf '%s! Ce commit n'"'"'est pas encore sur GitHub : il n'"'"'a donc pas été testé dans le navigateur.%s\n' "$JAUNE" "$FIN"
    demander '  Publier sans attendre la vérification GitHub ?' || arret "Faites Push origin dans GitHub Desktop, attendez la coche verte, puis relancez."
  else
    REPO="$(git -C "$DEPOT" remote get-url origin 2>/dev/null | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"
    ETAT="$(curl -s -m 15 -H 'Accept: application/vnd.github+json' "https://api.github.com/repos/$REPO/commits/$SHA/check-runs" | python3 -c '
import json, sys
try: runs = json.load(sys.stdin).get("check_runs", [])
except Exception: print("inconnu"); sys.exit()
if not runs: print("aucun")
elif any(r.get("status") != "completed" for r in runs): print("encours")
elif all(r.get("conclusion") in ("success", "skipped", "neutral") for r in runs): print("vert")
else: print("rouge")' 2>/dev/null || echo inconnu)"
    case "$ETAT" in
      vert) printf '%s✓%s Vérification GitHub réussie pour ce commit (%s)\n' "$VERT" "$FIN" "${SHA:0:7}" ;;
      rouge) arret "La vérification GitHub de ce commit a échoué : corrigez d'abord (onglet Actions du dépôt)." ;;
      encours) printf '%s! La vérification GitHub est encore en cours (environ 4 minutes).%s\n' "$JAUNE" "$FIN"
               demander '  Publier sans attendre son résultat ?' || arret "Relancez la publication quand la vérification sera terminée." ;;
      *) printf '%s! Résultat de la vérification GitHub introuvable (%s).%s\n' "$JAUNE" "$ETAT" "$FIN"
         demander '  Publier quand même ?' || arret "Publication annulée." ;;
    esac
  fi
  # d) Ce qui va changer en ligne depuis la dernière publication (relire avant d'envoyer)
  DERNIER="$HOME/.config/jeremy-grosjean/derniere-publication"
  if [ -f "$DERNIER" ]; then
    DEPUIS="$(cat "$DERNIER")"
    if git -C "$DEPOT" cat-file -e "$DEPUIS" 2>/dev/null; then
      NBC="$(git -C "$DEPOT" rev-list --count "$DEPUIS..HEAD" 2>/dev/null || echo 0)"
      printf '%s›%s Depuis la dernière mise en ligne : %s commit(s)\n' "$CYAN" "$FIN" "$NBC"
      git -C "$DEPOT" log --format='    %s' "$DEPUIS..HEAD" | head -n 12
    fi
  fi
fi

# 1. Préparer --------------------------------------------------------------------
command -v python3 >/dev/null 2>&1 || { printf '%s✗ python3 est introuvable.%s\n' "$ROUGE" "$FIN"; exit 1; }
if ! command -v esbuild >/dev/null 2>&1 && [ ! -x "$DEPOT/node_modules/.bin/esbuild" ]; then
  printf '%s! esbuild absent : le site sera envoyé sans minification (il fonctionne pareil, un peu plus lourd).%s\n' "$JAUNE" "$FIN"
  command -v brew >/dev/null 2>&1 && printf '  Pour l'"'"'installer une fois pour toutes : brew install esbuild\n'
fi
[ -x "$DEPOT/node_modules/.bin/esbuild" ] && export PATH="$DEPOT/node_modules/.bin:$PATH"
printf '%s›%s Préparation de la version en ligne\n' "$CYAN" "$FIN"
python3 "$ICI/preparer.py" || { printf '%s✗ La préparation a échoué, rien n'"'"'a été envoyé.%s\n' "$ROUGE" "$FIN"; exit 1; }

# 2. Envoyer et vérifier -----------------------------------------------------------
bash "$ICI/mettre-a-jour-site.sh" ${ARGS[@]+"${ARGS[@]}"}
RESULTAT=$?

# 2 bis. Archiver la version en ligne (retour arrière possible avec outils/restaurer.sh)
if [ "$RESULTAT" = 0 ] && [ -f "$HOME/Downloads/jeremy-grosjean-site.zip" ]; then
  ARCH="$HOME/Downloads/jeremy-grosjean-archives"; mkdir -p "$ARCH"
  NOM="site-$(date '+%Y%m%d-%H%M')-${SHA:0:7}.zip"; [ -n "$SHA" ] || NOM="site-$(date '+%Y%m%d-%H%M').zip"
  cp "$HOME/Downloads/jeremy-grosjean-site.zip" "$ARCH/$NOM" && printf '%s✓%s Version archivée : %s (retour arrière : bash outils/restaurer.sh)\n' "$VERT" "$FIN" "$NOM"
  # on garde les 10 dernières versions
  ls -t "$ARCH"/site-*.zip 2>/dev/null | tail -n +11 | while IFS= read -r vieux; do rm -f "$vieux"; done
  if [ -n "$SHA" ]; then mkdir -p "$HOME/.config/jeremy-grosjean"; printf '%s\n' "$SHA" > "$HOME/.config/jeremy-grosjean/derniere-publication"; fi
fi

# 3. GitHub est-il à jour ? --------------------------------------------------------
if command -v git >/dev/null 2>&1 && git -C "$DEPOT" rev-parse >/dev/null 2>&1; then
  MODIFS="$(git -C "$DEPOT" status --porcelain | wc -l | tr -d ' ')"
  git -C "$DEPOT" fetch -q 2>/dev/null
  EN_AVANCE="$(git -C "$DEPOT" rev-list --count '@{u}..HEAD' 2>/dev/null || echo 0)"
  if [ "$MODIFS" != 0 ]; then
    printf '%s! %s fichier(s) modifié(s) pas encore enregistré(s) sur GitHub :%s ouvrez GitHub Desktop, puis Commit et Push.\n' "$JAUNE" "$MODIFS" "$FIN"
  elif [ "$EN_AVANCE" != 0 ]; then
    printf '%s! %s commit(s) pas encore envoyé(s) sur GitHub :%s ouvrez GitHub Desktop, puis Push origin.\n' "$JAUNE" "$EN_AVANCE" "$FIN"
  else
    printf '%s✓%s GitHub est à jour : le code publié correspond au site en ligne\n' "$VERT" "$FIN"
  fi
fi
exit $RESULTAT
