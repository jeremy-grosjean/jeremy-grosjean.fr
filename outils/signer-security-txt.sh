#!/bin/bash
# =============================================================================
#  signer-security-txt.sh : signe security.txt avec votre clé PGP (RFC 9116)
#  - source non signée : outils/security.txt (modifiez ici la date « Expires »)
#  - écrit site/.well-known/security.txt (signé) et site/.well-known/pgp-key.txt (clé publique)
#  La phrase secrète est demandée par GnuPG ; elle n'est jamais enregistrée par ce script.
#  Utilisation : bash outils/signer-security-txt.sh   (puis publier.sh)
# =============================================================================
set -eu
ICI="$(cd "$(dirname "$0")" && pwd)"; RACINE="$(dirname "$ICI")"
CLE="${JG_CLE:-security@jeremy-grosjean.fr}"
SRC="$ICI/security.txt"; DEST="$RACINE/site/.well-known"
command -v gpg >/dev/null || { echo "GnuPG absent : brew install gnupg"; exit 1; }
gpg --list-secret-keys "$CLE" >/dev/null 2>&1 || { echo "Aucune clé secrète pour $CLE (voir le README)."; exit 1; }
EXP="$(grep -m1 '^Expires:' "$SRC" | cut -d' ' -f2)"
JOURS="$(python3 -c 'import sys, datetime as d; e = d.datetime.fromisoformat(sys.argv[1].replace("Z", "+00:00")); print((e - d.datetime.now(d.timezone.utc)).days)' "$EXP")"
[ "$JOURS" -gt 0 ] || { echo "La date Expires ($EXP) est passée : modifiez outils/security.txt."; exit 1; }
[ "$JOURS" -le 366 ] || { echo "La norme recommande une date Expires à moins d'un an (ici $JOURS jours)."; exit 1; }
gpg --armor --export "$CLE" > "$DEST/pgp-key.txt"
gpg --yes --local-user "$CLE" --clearsign --output "$DEST/security.txt" "$SRC"
gpg --verify "$DEST/security.txt" 2>&1 | grep -E 'Good signature|Bonne signature' >/dev/null && echo "✓ security.txt signé (valable $JOURS jours) et clé publique exportée" || { echo "✗ Signature non vérifiée"; exit 1; }
