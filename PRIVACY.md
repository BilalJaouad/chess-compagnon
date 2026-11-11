# Confidentialité

## Dans l’extension

Chess Compagnon lit la position de l’échiquier et effectue les calculs localement avec les fichiers inclus. Aucun endpoint d’analyse distant, service de télémétrie ou mécanisme d’envoi des positions n’est intégré.

Les réglages du panneau sont conservés dans le stockage local de l’extension. La page Research garde les observations importées en mémoire jusqu’à sa fermeture ; l’utilisateur peut télécharger un rapport. Ces données ne sont pas livrées avec le dépôt.

Les liens externes du panneau et de la documentation s’ouvrent uniquement à l’initiative de l’utilisateur. Le fonctionnement de Chess.com, du navigateur et de GitHub relève de leurs propres politiques.

## Dans ce dépôt

La version publiée est une copie sélectionnée des sources et ressources du projet. Elle exclut les profils de navigateur, sessions, cookies, historiques, captures d’écran, environnements Python, lanceurs propres à une machine et observations personnelles.

Les ressources de calcul sont accompagnées d’empreintes SHA-256 pour vérifier leur intégrité. Les commits de publication utilisent une adresse GitHub noreply.

## Avant de contribuer

Inspecte toujours les fichiers ajoutés avec `git diff --cached` et `git status --short`. Le fichier `.gitignore` réduit les ajouts accidentels, mais ne garantit pas à lui seul l’absence de données sensibles. N’ajoute pas de jeton, fichier de session, profil de navigateur ou capture contenant des informations personnelles.
