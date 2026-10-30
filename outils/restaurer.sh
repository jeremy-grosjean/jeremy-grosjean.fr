#!/bin/bash
# =============================================================================
#  restaurer.sh : revenir à une version précédente du site (retour arrière)
#  Chaque publication réussie est archivée par publier.sh dans
#    ~/Downloads/jeremy-grosjean-archives/site-AAAAMMJJ-HHMM-<commit>.zip  (10 dernières)
#  Ce script affiche la liste, propose la version précédente et la remet en ligne
#  avec les mêmes contrôles que d'habitude (mettre-a-jour-site.sh).
#
#  Utilisation :  bash outils/restaurer.sh            choisir dans la liste
#                 bash outils/restaurer.sh 2          remettre directement la version n° 2
#  Le mot de passe SFTP est demandé comme d'habitude et n'est jamais enregistré.
# =============================================================================
set -u
ICI="$(cd "$(dirname "$0")" && pwd)"
ARCH="$HOME/Downloads/jeremy-grosjean-archives"
VERT=$'\033[32m'; JAUNE=$'\033[33m'; ROUGE=$'\033[31m'; CYAN=$'\033[36m'; GRAS=$'\033[1m'; FIN=$'\033[0m'
stop() { printf '%s✗ %s%s\n' "$ROUGE" "$1" "$FIN"; exit 1; }

printf '\n%sRetour à une version précédente de jeremy-grosjean.fr%s\n\n' "$GRAS" "$FIN"
VERSIONS=()
while IFS= read -r f; do VERSIONS+=("$f"); done < <(ls -t "$ARCH"/site-*.zip 2>/dev/null)
[ "${#VERSIONS[@]}" -gt 0 ] || stop "Aucune version archivée dans $ARCH (elles sont créées à chaque publication réussie)."

i=1
for f in "${VERSIONS[@]}"; do
  n="$(basename "$f" .zip)"; c="${n##*-}"
  etiquette=""; [ "$i" = 1 ] && etiquette="  ← en ligne actuellement"
  msg=""; if [ "${#c}" = 7 ] && git -C "$ICI/.." cat-file -e "$c" 2>/dev/null; then msg="  $(git -C "$ICI/.." log -1 --format='%s' "$c" | cut -c1-70)"; fi
  printf '  %2d) %s%s%s\n' "$i" "$n" "$msg" "$etiquette"
  i=$((i + 1))
done

CHOIX="${1:-}"
if [ -z "$CHOIX" ]; then
  DEFAUT=2; [ "${#VERSIONS[@]}" -lt 2 ] && DEFAUT=1
  printf '\nNuméro de la version à remettre en ligne [%s] : ' "$DEFAUT"; read -r CHOIX; CHOIX="${CHOIX:-$DEFAUT}"
fi
case "$CHOIX" in ''|*[!0-9]*) stop "Numéro invalide : $CHOIX" ;; esac
[ "$CHOIX" -ge 1 ] && [ "$CHOIX" -le "${#VERSIONS[@]}" ] || stop "Numéro hors liste : $CHOIX"
CIBLE="${VERSIONS[$((CHOIX - 1))]}"
printf '%s›%s Version choisie : %s\n' "$CYAN" "$FIN" "$(basename "$CIBLE")"

# mettre-a-jour-site.sh envoie le zip le plus récent de Téléchargements : on y place une copie de l'archive
COPIE="$HOME/Downloads/jeremy-grosjean-site-restauration.zip"
cp "$CIBLE" "$COPIE" || stop "Copie impossible."
touch "$COPIE"
bash "$ICI/mettre-a-jour-site.sh" "${@:2}"
RESULTAT=$?
rm -f "$COPIE"
if [ "$RESULTAT" = 0 ]; then
  printf '%s✓%s Le site est revenu à la version %s.\n' "$VERT" "$FIN" "$(basename "$CIBLE" .zip)"
  printf '%s!%s Pensez à corriger le problème dans le code, puis à republier normalement (bash outils/publier.sh).\n' "$JAUNE" "$FIN"
fi
exit $RESULTAT
