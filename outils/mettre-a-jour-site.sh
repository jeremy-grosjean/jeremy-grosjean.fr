#!/bin/bash
# =============================================================================
#  mettre-a-jour-site.sh : met en ligne jeremy-grosjean.fr en une commande
#  - prend le zip le plus récent « jeremy-grosjean-site*.zip » dans Téléchargements
#  - vérifie son contenu, l'envoie par SFTP (connexion chiffrée)
#  - contrôle le site en ligne et annule le .htaccess automatiquement en cas de panne
#  Le mot de passe FTP est demandé une seule fois et n'est jamais enregistré.
#
#  Utilisation :
#    ~/mettre-a-jour-site.sh                 envoi complet (avec .htaccess)
#    ~/mettre-a-jour-site.sh --sans-htaccess envoi sans les règles du serveur
# =============================================================================
set -u

# Hôte SFTP et identifiant : lus dans un fichier privé, jamais publiés avec le code.
#   ~/.config/jeremy-grosjean/site.conf   (droits 600)
#   JG_HOTE=…
#   JG_UTILISATEUR=…
CONFIG="${JG_CONFIG:-$HOME/.config/jeremy-grosjean/site.conf}"
lire_conf() { [ -f "$CONFIG" ] && grep -E "^$1=" "$CONFIG" | tail -n 1 | cut -d= -f2- | tr -d '"[:space:]'; }
HOTE="${JG_HOTE:-$(lire_conf JG_HOTE)}"
UTILISATEUR="${JG_UTILISATEUR:-$(lire_conf JG_UTILISATEUR)}"
SITE="${JG_SITE:-https://jeremy-grosjean.fr}"
DOSSIER_ZIP="$HOME/Downloads"
AVEC_HTACCESS=1
[ "${1:-}" = "--sans-htaccess" ] && AVEC_HTACCESS=0

VERT=$'\033[32m'; ROUGE=$'\033[31m'; CYAN=$'\033[36m'; GRAS=$'\033[1m'; FIN=$'\033[0m'
ok()   { printf '%s✓%s %s\n' "$VERT" "$FIN" "$1"; }
info() { printf '%s›%s %s\n' "$CYAN" "$FIN" "$1"; }
stop() { printf '%s✗ %s%s\n' "$ROUGE" "$1" "$FIN"; exit 1; }

printf '\n%sMise à jour de jeremy-grosjean.fr%s\n\n' "$GRAS" "$FIN"
[ -n "$HOTE" ] && [ -n "$UTILISATEUR" ] || stop "Configuration manquante : créez $CONFIG (voir le README)."

# 1. Trouver le zip le plus récent ---------------------------------------------
ZIP="$(ls -t "$DOSSIER_ZIP"/jeremy-grosjean-site*.zip 2>/dev/null | head -n 1)"
[ -n "$ZIP" ] || stop "Aucun fichier jeremy-grosjean-site.zip dans Téléchargements."
info "Fichier trouvé : $(basename "$ZIP") ($(date -r "$ZIP" '+%d/%m/%Y %H:%M'))"

# 2. Décompresser dans un dossier temporaire et vérifier -----------------------
TMP="$(mktemp -d)"
CP="$TMP/ctl"
nettoyer() {
  ssh -o ControlPath="$CP" -O exit "$UTILISATEUR@$HOTE" >/dev/null 2>&1
  rm -rf "$TMP"
}
trap nettoyer EXIT
unzip -q -o "$ZIP" -d "$TMP/site" || stop "Le zip est illisible."
# Droits standard d'un site : lecture pour tous, écriture pour le propriétaire seulement (644 / 755)
chmod -R u=rwX,go=rX "$TMP/site"
for f in index.html assets/app.css assets/app.js assets/i18n.js .well-known/security.txt .htaccess; do
  [ -s "$TMP/site/$f" ] || stop "Fichier manquant dans le zip : $f"
done
NB="$(cd "$TMP/site" && find . -type f | wc -l | tr -d ' ')"
ok "Contenu du zip vérifié ($NB fichiers)"

if [ "$AVEC_HTACCESS" = 1 ]; then info "Mode : envoi complet, avec .htaccess"; else info "Mode : sans .htaccess"; fi
printf '\nEnvoyer sur le serveur ? [o/N] '
read -r REP
case "$REP" in o|O|oui|OUI|y|Y) ;; *) stop "Annulé, rien n'a été envoyé." ;; esac

# 2 bis. Supervision : relevés publics du domaine (certificat, e-mail, DNSSEC) -----
info "Relevés de supervision (certificat, e-mail, DNSSEC)"
DOM="jeremy-grosjean.fr"
nettoie() { tr -d '"\\' | tr -s ' ' | sed 's/^ //; s/ $//'; }
avec_delai() { perl -e 'alarm shift; exec @ARGV' "$@"; }
HTTPS_CODE="$(curl -s -o /dev/null -m 15 -w '%{http_code}' "https://$DOM/")"; HTTPS_CODE=$((10#${HTTPS_CODE:-0}))
TLS_END="$(echo | avec_delai 15 openssl s_client -servername "$DOM" -connect "$DOM:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)"
TLS_DAYS="null"
if [ -n "$TLS_END" ]; then
  # LC_ALL=C : la date du certificat est en anglais (« Jan »), même sur un Mac réglé en français
  END_TS="$(LC_ALL=C date -j -f '%b %e %T %Y %Z' "$TLS_END" +%s 2>/dev/null || LC_ALL=C date -d "$TLS_END" +%s 2>/dev/null)"
  [ -n "$END_TS" ] && TLS_DAYS=$(( (END_TS - $(date +%s)) / 86400 ))
fi
if command -v dig >/dev/null 2>&1; then
  MX_JSON="$(dig +short MX "$DOM" | sort -n | awk '{print $2}' | sed 's/\.$//' | nettoie | awk 'NF{printf "%s\"%s\"", (n++?",":""), $0}')"
  SPF="$(dig +short TXT "$DOM" | nettoie | grep -i 'v=spf1' | head -n 1)"
  DMARC="$(dig +short TXT "_dmarc.$DOM" | nettoie | grep -i 'v=dmarc1' | head -n 1)"
  TLSRPT="$(dig +short TXT "_smtp._tls.$DOM" | nettoie | grep -i 'v=tlsrptv1' | head -n 1)"
  DS="$(dig +short DS "$DOM" | head -n 1 | nettoie)"
  A_REC="$(dig +short A "$DOM" | head -n 1 | nettoie)"
  CAA="$(dig +short CAA "$DOM" | nettoie | tr '\n' ';' | sed 's/;$//')"
else
  MX_JSON=""; SPF=""; DMARC=""; TLSRPT=""; DS=""; A_REC=""; CAA=""
fi
DNSSEC=false; [ -n "$DS" ] && DNSSEC=true
CHECKED="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
# Un vrai envoi de formulaire (avec des données), comme le ferait un robot ou un attaquant
METHODS="$(curl -s -o /dev/null -m 15 -w '%{http_code}' --data 'test=1' "https://$DOM/")"; METHODS=$((10#${METHODS:-0}))
mkdir -p "$TMP/site/assets"
ecrire_status() {
  cat > "$TMP/site/assets/status.js" <<STATUS
/* Supervision : relevés publics faits par le script de mise à jour le $CHECKED */
window.JG_STATUS = {"checked":"$CHECKED","https":$HTTPS_CODE,"tlsDays":$TLS_DAYS,"mx":[$MX_JSON],"spf":"$SPF","dmarc":"$DMARC","tlsrpt":"$TLSRPT","dnssec":$DNSSEC,"ds":"$DS","a":"$A_REC","caa":"$CAA","methods":$METHODS};
STATUS
}
ecrire_status
ok "Supervision : HTTPS $HTTPS_CODE · certificat $( [ "$TLS_DAYS" = null ] && echo "?" || echo "$TLS_DAYS j") · MX $( [ -n "$MX_JSON" ] && echo OK || echo '?') · DMARC $( [ -n "$DMARC" ] && echo OK || echo '?') · DNSSEC $DNSSEC · CAA $( [ -n "$CAA" ] && echo OK || echo '?')"

# 3. Envoi par SFTP (le mot de passe est demandé ici) --------------------------
SSHOPTS=(-o ControlMaster=auto -o ControlPath="$CP" -o ControlPersist=180 -o ConnectTimeout=15)
CMDS="$TMP/cmds"
{
  # tous les dossiers du zip, puis tous les fichiers (le .htaccess toujours en dernier)
  (cd "$TMP/site" && find . -mindepth 1 -type d | sed 's|^\./||' | sort) | while IFS= read -r d; do echo "-mkdir \"www/$d\""; done
  (cd "$TMP/site" && find . -type f ! -name .htaccess | sed 's|^\./||' | sort) | while IFS= read -r f; do echo "put \"$TMP/site/$f\" \"www/$f\""; done
  [ "$AVEC_HTACCESS" = 1 ] && echo "put \"$TMP/site/.htaccess\" www/.htaccess"
  echo "ls -l www"
} > "$CMDS"

printf '\n'
info "Connexion à $HOTE (mot de passe FTP demandé, rien ne s'affiche pendant la saisie)"
sftp "${SSHOPTS[@]}" -q "$UTILISATEUR@$HOTE" < "$CMDS" || stop "L'envoi a échoué (mot de passe ou connexion)."
ok "Fichiers envoyés"

# 4. Vérifier le site en ligne --------------------------------------------------
sleep 2
CODE="$(curl -s -o "$TMP/page.html" -w '%{http_code}' "$SITE/?v=$(date +%s)")"
if [ "$CODE" = "200" ] && grep -q 'assets/app.js' "$TMP/page.html"; then
  ok "Le site répond (HTTP 200) et affiche la nouvelle version"
else
  printf '%s✗ Le site ne répond pas correctement (code %s).%s\n' "$ROUGE" "$CODE" "$FIN"
  if [ "$AVEC_HTACCESS" = 1 ]; then
    info "Annulation automatique : suppression du .htaccess"
    echo "rm www/.htaccess" | sftp "${SSHOPTS[@]}" -q "$UTILISATEUR@$HOTE" >/dev/null 2>&1
    sleep 2
    CODE="$(curl -s -o /dev/null -w '%{http_code}' "$SITE/?v=$(date +%s)")"
    [ "$CODE" = "200" ] && ok "Site rétabli sans .htaccess (code $CODE)" || stop "Toujours en erreur (code $CODE)."
  fi
  exit 1
fi
for f in assets/app.css assets/app.js assets/i18n.js .well-known/security.txt favicon.ico favicon.svg apple-touch-icon.png site.webmanifest og.jpg 404.html assets/404.css assets/404.js mentions-legales.html assets/legal.css assets/legal.js sw.js qr.svg contact.vcf assets/status.js; do
  C="$(curl -s -o /dev/null -w '%{http_code}' "$SITE/$f")"
  [ "$C" = "200" ] && ok "$f (HTTP 200)" || printf '%s✗ %s (code %s)%s\n' "$ROUGE" "$f" "$C" "$FIN"
done

if [ "$AVEC_HTACCESS" = 1 ]; then
  H="$(curl -sI "$SITE/")"
  for h in strict-transport-security content-security-policy x-frame-options x-content-type-options referrer-policy permissions-policy; do
    echo "$H" | grep -qi "^$h:" && ok "En-tête $h" || printf '%s✗ En-tête absent : %s%s\n' "$ROUGE" "$h" "$FIN"
  done
  if curl -sI "$SITE/sw.js" | grep -qi "^content-security-policy:.*connect-src 'self'"; then ok "Mode hors ligne : politique du service worker"; else printf '%s✗ Mode hors ligne : politique du service worker absente (le site marche, mais pas hors ligne)%s\n' "$ROUGE" "$FIN"; fi
  C404="$(curl -s -o "$TMP/404.html" -w '%{http_code}' "$SITE/page-qui-n-existe-pas-$(date +%s)")"
  if [ "$C404" = "404" ] && grep -q 'traceroute' "$TMP/404.html"; then ok "Page 404 personnalisée (code 404)"; else printf '%s✗ Page 404 : code %s%s\n' "$ROUGE" "$C404" "$FIN"; fi
  R1="$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "http://jeremy-grosjean.fr/")"
  R2="$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "https://www.jeremy-grosjean.fr/")"
  case "$R1" in 301\ https://jeremy-grosjean.fr/*) ok "Redirection http → https" ;; *) printf '%s✗ Redirection http : %s%s\n' "$ROUGE" "$R1" "$FIN" ;; esac
  case "$R2" in 301\ https://jeremy-grosjean.fr/*) ok "Redirection www → sans www" ;; *) printf '%s✗ Redirection www : %s%s\n' "$ROUGE" "$R2" "$FIN" ;; esac
  # Site statique : un envoi de données (POST) doit être refusé (405)
  NEW_METHODS="$(curl -s -o /dev/null -m 15 -w '%{http_code}' --data 'test=1' "$SITE/")"; NEW_METHODS=$((10#${NEW_METHODS:-0}))
  if [ "$NEW_METHODS" = 405 ]; then ok "Méthodes HTTP : lecture seule (POST refusé, code 405)"; else printf '%s✗ Méthodes HTTP : POST renvoie %s (405 attendu)%s\n' "$ROUGE" "$NEW_METHODS" "$FIN"; fi
  # Mettre la supervision à jour avec ce nouveau relevé (même connexion, pas de nouveau mot de passe)
  if [ "$NEW_METHODS" != "$METHODS" ]; then
    METHODS="$NEW_METHODS"; ecrire_status
    echo "put \"$TMP/site/assets/status.js\" www/assets/status.js" | sftp "${SSHOPTS[@]}" -q "$UTILISATEUR@$HOTE" >/dev/null 2>&1 && ok "Supervision mise à jour (méthodes HTTP)"
  fi
fi

printf '\n%sTerminé.%s %s\n\n' "$GRAS" "$FIN" "$SITE"
