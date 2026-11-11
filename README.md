# Chess Compagnon

**Un assistant d’échecs local pour comparer les analyses de Stockfish aux prédictions de coups humains de Maia 3, directement sur un échiquier Chess.com.**

Extension Chrome / Edge · Manifest V3 · Interface en français · Version 1.4.1

Chess Compagnon lit la position de l’échiquier, calcule des suggestions dans le navigateur et affiche une flèche pour le coup sélectionné. Le choix du moteur, le profil Elo Maia et les préférences d’affichage sont conservés localement.

## Fonctionnalités

- **Deux moteurs au choix** : Stockfish 17.1 Lite et Maia 3.
- **Profils Maia de 1000 à 2500 Elo**, par pas de 100, dont 1500, 2000 et 2300.
- **Trois suggestions Maia**, classées par probabilité de jeu estimée.
- **Stockfish à pleine force ou à force réduite**, avec temps de calcul de 0,3, 1 ou 3 secondes.
- **Flèche interactive**, choix du camp conseillé, panneau déplaçable et copie de la FEN.
- **Calcul local** : moteurs, modèle ONNX et runtime WebAssembly inclus dans le dépôt.
- **Contrôle manuel** : démarrage, pause et fermeture du panneau ; aucun coup joué automatiquement.

## Installation

Prérequis : une version récente de Google Chrome ou Microsoft Edge sur ordinateur. Aucun serveur, compte supplémentaire, Python ou clé API n’est nécessaire.

1. Télécharge ce dépôt avec **Code → Download ZIP**, puis décompresse-le, ou clone-le :

   ```sh
   git clone https://github.com/BilalJaouad/chess-compagnon.git
   ```

2. Ouvre `chrome://extensions` ou `edge://extensions`.
3. Active le **Mode développeur**.
4. Clique sur **Charger l’extension non empaquetée**.
5. Sélectionne le dossier **extension** du dépôt.
6. Ouvre ou recharge un échiquier sur Chess.com.

Les fichiers de calcul sont inclus : le dépôt occupe environ 65 Mo avant compression. Il n’est pas nécessaire d’utiliser Git LFS.

## Utilisation

1. Ouvre le panneau **Chess Compagnon**, au besoin en cliquant sur son icône dans le navigateur.
2. Choisis **Stockfish** ou **Maia 3** dans le menu **Moteur**.
3. Avec Maia, sélectionne le **Profil Maia · Elo**. Avec Stockfish, choisis le style et le temps de calcul.
4. Clique sur **Démarrer les suggestions**.
5. Clique sur un coup proposé pour afficher sa flèche.

Le panneau suit les changements de position. Le choix **Camp conseillé** permet de limiter les suggestions aux Blancs ou aux Noirs. Les changements de position et de réglages invalident les anciens résultats. Le passage à un autre onglet suspend les demandes de calcul.

Maia est disponible sur les pages Chess.com où un échiquier compatible expose sa position, y compris les pages de parties en ligne. Cette disponibilité technique ne détermine pas les usages autorisés par le site.

### Comprendre les résultats

| Moteur | Ce qu’il affiche | Comment l’interpréter |
| --- | --- | --- |
| Stockfish | Évaluation et variante calculées | Un score positif favorise les Blancs ; un score négatif favorise les Noirs. `M` indique un mat annoncé. |
| Maia 3 | Probabilité estimée de chaque coup légal | Un pourcentage élevé désigne un coup que le modèle prédit comme fréquent au niveau choisi. |

**Maia prédit des choix humains.** Le premier coup de sa liste n’est pas nécessairement le meilleur coup tactique. Les pourcentages ne représentent pas des chances de gagner. Seuls les trois premiers coups sont affichés : leur somme peut donc être inférieure à 100 %.

Le sélecteur Elo conditionne **un seul modèle Maia 3**, avec la même valeur pour le joueur au trait et son adversaire. Ces profils ne garantissent pas une force équivalente au classement Chess.com. L’extension n’affiche pas d’explication verbale du raisonnement du modèle ; elle fournit des coups et leurs probabilités pour soutenir l’analyse.

### Stockfish à force réduite

Le mode **Niveau cible · adversaire + marge** utilise les options natives de limitation de force du moteur. La cible est bornée aux valeurs annoncées par Stockfish et peut différer de la demande. Le mode **Analyse maximale · 3 variantes** restaure le calcul à pleine force. La réflexion variable ajoute un délai de présentation facultatif.

## Données et confidentialité

- Les positions sont traitées dans le navigateur, sans envoi à un service d’analyse.
- L’extension ne contient ni télémétrie ni clé API.
- Les préférences sont enregistrées avec `chrome.storage.local`.
- Le script de lecture récupère la FEN exposée par l’échiquier et ne commande pas les déplacements de pièces.
- Les scripts de contenu sont limités aux domaines `chess.com` et `www.chess.com`.

| Permission | Utilisation |
| --- | --- |
| `activeTab` et `scripting` | Afficher ou rouvrir le panneau à la demande sur Chess.com. |
| `storage` | Conserver les préférences de l’extension. |
| `offscreen` | Héberger les workers de calcul hors du script de la page. |

Ce dépôt contient uniquement les sources, tests et ressources nécessaires. Les profils de navigateur, cookies, sessions, données d’expérience, captures d’écran et environnements locaux ne sont pas distribués. Voir [PRIVACY.md](PRIVACY.md).

## Architecture

```text
extension/
  manifest.json       Configuration Manifest V3
  bridge.js           Lecture de la FEN dans la page
  content.js          Panneau, préférences et flèches
  background.js       Routage des messages
  offscreen.js        Sessions de calcul par onglet
  engine.js           Sélection du moteur et résultats
  maia.js             Encodage, classement et client du worker Maia
  maia-worker.js      Inférence ONNX locale
  vendor/             Stockfish, chess.js, Maia et ONNX Runtime
tests/                Tests unitaires et tests de navigateur
scripts/              Vérification des ressources embarquées
```

La page **Research**, accessible depuis les options, analyse des observations importées manuellement. Son exemple est synthétique ; aucun jeu de données personnel n’est inclus. Voir [RESEARCH.md](RESEARCH.md) pour les hypothèses et limites.

## Développement et tests

Utilise **Node.js 24**. Les tests unitaires n’ont aucune dépendance à installer :

```sh
npm test
npm run verify:assets
```

Pour tester l’extension avec ses deux moteurs dans Chromium :

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

Le test de navigateur utilise un profil temporaire et une page Chess.com simulée. Il vérifie l’inférence réelle de Maia à 1500, 2000 et 2300 Elo, une promotion noire, les flèches, la sauvegarde des préférences et le retour à Stockfish. Il vérifie aussi les suggestions sur une URL de partie en ligne simulée, sans lancer de partie sur le site.

Les scripts d’intégration supplémentaires dans `tests/` acceptent le chemin du paquet Playwright via `PLAYWRIGHT_PATH`. `tests/integration.cjs` visite réellement la page d’analyse Chess.com et nécessite Edge et Internet ; il ne fait pas partie des tests automatiques.

Après une modification, recharge l’extension depuis la page des extensions, puis recharge l’onglet Chess.com.

## Limites

- Dépend des composants `wc-chess-board` ou `chess-board` et de leur API de position. Une évolution de Chess.com peut nécessiter une adaptation.
- Échecs standard uniquement : pas de Chess960 ni de reconnaissance d’image.
- Le calcul part de la FEN courante, sans historique complet. Les répétitions et le contexte des coups précédents ne sont pas reconstitués.
- Le temps de calcul et les capacités de l’ordinateur influencent les résultats et la latence.

## Contribuer

Les contributions sont les bienvenues. Décris le problème, les étapes de reproduction et les tests réalisés dans ta pull request. Pour un problème de position, utilise de préférence une FEN minimale sans nom de joueur ni identifiant de partie.

Avant de partager un journal ou une capture, supprime les noms de compte, messages privés, cookies et autres données personnelles. Pour une vulnérabilité, consulte [SECURITY.md](SECURITY.md).

## Sources et licences

Le code du projet est distribué sous **GNU GPL v3** ; voir [LICENSE.txt](LICENSE.txt). Les composants tiers conservent leurs licences et notices respectives.

- [Stockfish.js](https://github.com/nmrugg/stockfish.js/releases/tag/v17.1.0) — moteur Stockfish 17.1 Lite.
- [Maia Chess](https://github.com/CSSLab/maia-platform-frontend/tree/727df602996e97d544ca30dd09aaa1cd7c418ee7) — export ONNX Maia 3 et vocabulaire des coups.
- [ONNX Runtime](https://github.com/microsoft/onnxruntime/tree/v1.23.0) — exécution WebAssembly du modèle.
- [chess.js](https://github.com/jhlywa/chess.js/tree/v1.4.0) — validation et notation des coups.

Les références exactes, empreintes SHA-256 et notices sont regroupées dans [THIRD_PARTY.md](THIRD_PARTY.md) et [vendor-manifest.json](vendor-manifest.json).

Projet indépendant, sans affiliation avec Chess.com, Stockfish ou les auteurs de Maia. Respecte les [règles d’utilisation de l’assistance de Chess.com](https://support.chess.com/en/articles/8568369-what-do-i-need-to-know-about-fair-play-on-chess-com) dans tes séances.
