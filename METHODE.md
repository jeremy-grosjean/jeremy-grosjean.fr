# Méthode de travail

Comment je fais évoluer ce site sans le casser. Chaque règle est appliquée concrètement dans le dépôt.

## 1. Tout est versionné, avec des messages clairs

- Tout le code est dans Git et sur GitHub : chaque modification peut être retrouvée, comparée ou annulée.
- Messages au format **Conventional Commits** : `type: description`.

  | Type | Usage |
  |---|---|
  | `feat` | nouveauté visible |
  | `fix` | correction |
  | `perf` | performances |
  | `docs` | documentation |
  | `test` | tests |
  | `ci` | intégration continue |
  | `refactor` | réorganisation sans changement visible |
  | `style` | mise en forme |
  | `chore` / `build` | outillage |

- Le hook `.githooks/commit-msg` refuse un message qui ne suit pas ce format.
- Les `feat`, `fix` et `perf` alimentent automatiquement la fenêtre « Nouveautés » du site.

## 2. Vérifier avant d'enregistrer

Le hook `.githooks/pre-commit` lance `outils/verifier.py` avant chaque commit. Il contrôle :

- le HTML, les liens et la syntaxe JavaScript ;
- les traductions dans les 6 langues ;
- la typographie : apostrophes courbes (’) dans tous les textes affichés, réparables avec `python3 outils/apostrophes.py --corriger` ;
- l'absence de mots de passe, de clés et de jetons ;
- le poids du site.

Un commit qui casse le site est refusé.

Activation, une seule fois par ordinateur :

```
git config core.hooksPath .githooks
```

## 3. Tests automatiques et tests de régression

`outils/test_jeux.py` ouvre le site dans un vrai navigateur (Chromium) et joue tous les jeux jusqu'au bout. Il passe :

- sur ordinateur, sur mobile et sur téléphone à l'horizontale ;
- sur 18 tailles d'écran, du 200×200 au 8K ;
- à 30, 60, 144 et 240 Hz.

Il échoue à la moindre erreur JavaScript.

**Chaque bug corrigé reçoit un test**, pour qu'il ne revienne jamais (test de régression). Exemples :

| Bug corrigé | Test qui l'empêche de revenir |
|---|---|
| Un texte de traduction en écrasait un autre (`tickets`, `rsTitle`) | `verifier.py` refuse tout texte redéfini par erreur ; `test_jeux.py` contrôle le titre « Partie en cours » |
| Débordement de la page sur un écran de 200 px de large | 18 tailles d'écran testées |
| Horloge qui chevauchait le nom quand la date passe sur deux lignes | test dans trois fuseaux horaires (Paris, UTC, New York) |
| Indice qui donnait directement la réponse chiffrée | indices testés jeu par jeu |

## 4. Tester ce qui est réellement publié

La version en ligne est minifiée et servie avec une politique de sécurité stricte (CSP, Trusted Types). Une erreur peut donc n'apparaître qu'en ligne.

`outils/test_jeux.py --prod` rejoue tous les tests :

- sur cette version (dossier `dist/`, créé par `outils/preparer.py`) ;
- avec les vrais en-têtes du `.htaccess`.

## 5. Intégration continue (GitHub Actions)

`.github/workflows/verifier.yml` lance toutes les vérifications :

- à chaque envoi sur GitHub ;
- à chaque demande de fusion ;
- chaque lundi, pour détecter un problème venu d'une mise à jour du navigateur ou d'un outil.

Les tests tournent dans trois fuseaux horaires, plus sur la version en ligne. Dependabot signale par une simple alerte les actions GitHub à mettre à jour, sans jamais écrire de commit : chaque commit est signé par Jérémy Grosjean seul, ce que vérifient le crochet commit-msg, outils/verifier.py à chaque envoi et la surveillance de chaque matin (liste des contributeurs sur GitHub).

Aucun mot de passe ni clé n'est confié à GitHub.

## 6. Publier seulement ce qui a été vérifié

`bash outils/publier.sh` applique ces garde-fous avant d'envoyer quoi que ce soit :

1. **Modifications non enregistrées** : avertissement, et publication seulement si je confirme.
2. **Vérifications locales** : si elles échouent, rien n'est envoyé.
3. **Vérification GitHub de ce commit** :
   - rouge : rien n'est envoyé ;
   - en cours, ou commit pas encore envoyé sur GitHub : confirmation demandée.
4. **Liste des commits depuis la dernière mise en ligne** : pour relire ce qui va changer.

Ensuite, le script envoie le site par SFTP et contrôle en ligne :

- les fichiers ;
- les en-têtes de sécurité ;
- les redirections ;
- la page 404.

Si le site ne répond plus, le `.htaccess` est retiré automatiquement.

En cas d'urgence seulement : `bash outils/publier.sh --forcer` ignore les garde-fous.

Pendant l'attente de la vérification GitHub, le script affiche l'avancement test par test et le temps restant (estimé d'après les dernières vérifications), puis envoie une notification sur le Mac. `bash outils/publier.sh --essai` fait tout sauf l'envoi, pour voir ce qui partirait.

Chaque mise en ligne reçoit un numéro de version (`v2026.10.30.1` : date, puis numéro du jour) : une étiquette Git, affichée en bas du site avec un lien vers le code exact.

## 6 bis. Surveiller le site en ligne

Chaque matin, `.github/workflows/surveiller.yml` lance `outils/surveiller.py` : le vrai site est visité comme par un visiteur, sur ordinateur et sur téléphone.

- Il vérifie la page d'accueil, les fichiers principaux et la page 404.
- Il vérifie les en-têtes de sécurité, le certificat HTTPS (au moins 14 jours) et `security.txt` (au moins 30 jours).
- Il ouvre les fenêtres, joue le jeu « Plus d'Internet » jusqu'au bout et contrôle qu'il n'y a aucune erreur dans le navigateur.

En cas de problème (hébergeur, certificat, fichier abîmé), la vérification échoue et GitHub envoie un e-mail. C'est de la surveillance synthétique : on détecte la panne avant les visiteurs.

## 7. Pouvoir revenir en arrière

Chaque publication réussie est archivée : `~/Downloads/jeremy-grosjean-archives/`. Les 10 dernières versions sont gardées, et chaque archive porte le numéro du commit.

```
bash outils/restaurer.sh
```

Le script affiche les versions archivées, propose la précédente et la remet en ligne avec les mêmes contrôles qu'une publication normale. Je corrige ensuite le problème dans le code, puis je republie normalement.

## 8. Sécurité dès la conception

- Aucun secret dans le dépôt :
  - l'hôte et l'identifiant SFTP sont dans un fichier privé, hors du dépôt ;
  - le mot de passe est demandé à chaque fois et n'est jamais enregistré.
- Moindre privilège :
  - l'intégration continue ne peut que lire le dépôt (`permissions: contents: read`) ;
  - la clé UptimeRobot est en lecture seule.
- Politique de sécurité stricte : pas de script ni de style en ligne, Trusted Types, serveur en lecture seule.
