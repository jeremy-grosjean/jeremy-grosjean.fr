#!/bin/bash
# =============================================================================
#  publier.sh : met jeremy-grosjean.fr à jour en une seule commande
#    1. prépare la version en ligne (minification, empreintes anti-cache, zip)
#    2. l'envoie par SFTP et vérifie le site en ligne (mettre-a-jour-site.sh)
#    3. rappelle de faire Commit + Push si GitHub n'est pas à jour
#  Le mot de passe SFTP est demandé à chaque fois et n'est jamais enregistré.
#
#  Utilisation :  bash ~/Documents/GitHub/jeremy-grosjean.fr/outils/publier.sh
# =============================================================================
set -u
ICI="$(cd "$(dirname "$0")" && pwd)"
DEPOT="$(cd "$ICI/.." && pwd)"
VERT=$'\033[32m'; JAUNE=$'\033[33m'; ROUGE=$'\033[31m'; CYAN=$'\033[36m'; GRAS=$'\033[1m'; FIN=$'\033[0m'

printf '\n%sPublication de jeremy-grosjean.fr%s\n\n' "$GRAS" "$FIN"

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
bash "$ICI/mettre-a-jour-site.sh" "$@"
RESULTAT=$?

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
