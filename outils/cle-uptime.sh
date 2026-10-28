#!/bin/bash
# =============================================================================
#  cle-uptime.sh : enregistre la clé UptimeRobot en LECTURE SEULE (disponibilité sur 30 jours)
#  - la clé est demandée sans être affichée, puis rangée dans ~/.config/jeremy-grosjean/site.conf (droits 600)
#  - la clé principale (« Main API key ») est refusée : elle permettrait de tout modifier
#  Utilisation : bash outils/cle-uptime.sh
# =============================================================================
set -u
CONFIG="${JG_CONFIG:-$HOME/.config/jeremy-grosjean/site.conf}"
VERT=$'\033[32m'; ROUGE=$'\033[31m'; FIN=$'\033[0m'
mkdir -p "$(dirname "$CONFIG")"; touch "$CONFIG"; chmod 600 "$CONFIG"
printf 'Collez la clé UptimeRobot en lecture seule (rien ne s’affiche), puis Entrée : '
IFS= read -rs CLE; echo
# Retire ce que Terminal peut ajouter en collant (séquences de collage, espaces, retours à la ligne)
CLE="$(printf '%s' "$CLE" | LC_ALL=C tr -d '\033' | LC_ALL=C sed -e 's/\[20[01]~//g' | LC_ALL=C tr -cd 'A-Za-z0-9_-')"
if [ -z "$CLE" ]; then
  printf '%s✗ Rien n’a été collé : copiez la clé (icône « copier » à côté de la clé), puis recommencez.%s\n' "$ROUGE" "$FIN"; exit 1
fi
printf 'Reçu : %s caractères, commençant par « %s ».\n' "${#CLE}" "${CLE:0:1}"
case "$CLE" in
  u[0-9]*) printf '%s✗ C’est la clé principale (elle permet de tout modifier) : utilisez la clé du moniteur jeremy-grosjean.fr.%s\n' "$ROUGE" "$FIN"; exit 1 ;;
esac
REP="$(printf 'api_key=%s&format=json' "$CLE" | curl -s -m 20 --data @- https://api.uptimerobot.com/v2/getMonitors)"
if ! printf '%s' "$REP" | grep -q '"stat":"ok"'; then
  printf '%s✗ UptimeRobot refuse cette clé (rien n’a été enregistré). Vérifiez qu’elle a été copiée en entier.%s\n' "$ROUGE" "$FIN"; exit 1
fi
grep -v '^JG_UPTIME_KEY=' "$CONFIG" > "$CONFIG.tmp" || true
printf 'JG_UPTIME_KEY=%s\n' "$CLE" >> "$CONFIG.tmp" && mv "$CONFIG.tmp" "$CONFIG" && chmod 600 "$CONFIG"
unset CLE REP
printf '%s✓ Clé vérifiée auprès d’UptimeRobot et enregistrée. Lancez maintenant : bash outils/publier.sh%s\n' "$VERT" "$FIN"
