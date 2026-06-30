# LENNYGOTCHI - Ameliorations possibles

## Intention

Lenny doit rester minimal : une page calme, un pixel art lisible, une phrase courte, pas de menus compliques pour Chloe.

L'objectif n'est pas d'en faire un gros jeu, mais un petit compagnon vivant qui peut recevoir de nouveaux moments facilement : vacances, messages, repas, piscine, fatigue, cafe, souvenirs.

## Priorites

1. Garder l'ecran principal ultra simple.
2. Ajouter des interactions petites mais tendres.
3. Simplifier la creation de nouveaux etats.
4. Rendre l'admin plus rapide pour piloter Lenny sans coder.
5. Eviter que chaque nouvelle scene grossisse trop `App.jsx`.

## Etat actuel du systeme

Fait :

- Les etats sont centralises dans `src/lenny-states.js`.
- Les scenes pixel art sont sorties de `App.jsx` dans `src/lenny-scenes.js`.
- Le moteur de rendu canvas est sorti dans `src/lenny-renderer.js`.
- L'API valide les modes avec la meme source que le front.
- `npm run check:lenny` verifie les erreurs classiques : sprite 48x60, couleurs, scenes manquantes, modes invalides.
- Les notifications peuvent ouvrir Lenny avec un message temporaire.
- La PWA recharge au retour de l'arriere-plan.

Reste a faire :

- Rendre l'admin plus rapide pour envoyer un message ou changer l'etat. Fait.
- Ajouter une vraie documentation courte pour creer un nouvel etat. Fait.
- Ajouter des helpers de dessin pour aller plus vite en pixel art. Fait.
- Ajouter 1 ou 2 interactions simples sans compliquer l'ecran principal. Fait.
- Tester visuellement chaque nouveau flow sur iPhone/PWA avant prod.

## TODO priorisee

### P0 - Stabiliser avant d'ajouter beaucoup d'etats

- [ ] Tester sur iPhone le clic sur une notification : ouverture de Lenny, etat normal, message 6 secondes, retour a l'etat admin.
- [ ] Tester sur iPhone le retour depuis l'arriere-plan : verifier que l'etat admin est bien recharge.
- [x] Verifier que `/admin` reste scrollable sur petit ecran.
- [x] Lancer avant chaque prod : `npm run check:lenny` puis `npm run build`.
- [x] Ajouter une mini section dans l'admin avec la version actuelle du service worker ou de l'app.

### P1 - Simplifier vraiment la creation d'un nouvel etat

- [x] Creer une documentation courte `COMMENT_AJOUTER_UN_ETAT.md`.
- [x] Documenter les 3 fichiers a modifier : `src/lenny-states.js`, `src/lenny-scenes.js`, puis test avec `npm run check:lenny`.
- [x] Ajouter un exemple complet d'etat simple, par exemple `Câlin`, dans la doc seulement.
- [x] Ajouter des helpers de dessin dans `src/lenny-scenes.js` ou un futur `src/pixel-helpers.js` :
  - [x] `line(x1, y1, x2, y2, key)`
  - [x] `pattern(x, y, rows)`
  - [x] `symmetry(leftFn, rightFn)` ou un helper equivalent
- [x] Ajouter une grille de debug activable en local pour placer les pixels plus facilement.

### P1 - Ameliorer l'admin sans le rendre lourd

- [x] Ajouter un bouton clair "Retour auto".
- [x] Ajouter des templates de notification minimalistes :
  - [x] "Je pense a toi"
  - [x] "Regarde Lenny"
  - [x] "Petit coucou"
- [x] Ajouter une duree configurable pour le message temporaire : 3s, 6s, 10s.
- [x] Ajouter une previsualisation textuelle avant envoi : etat choisi + message.
- [x] Si la liste d'etats grandit, remplacer les gros boutons par un selecteur compact.

### P2 - Ajouter des interactions simples cote Lenny

- [x] Garder le tap simple pour changer d'etat.
- [x] Eviter le double tap pour l'instant : il peut entrer en conflit avec le tap simple.
- [x] Ajouter un tap long pour une reaction douce :
  - [x] coeur pixel art
  - [x] clignement special
  - [x] petite phrase courte
- [x] Ajouter une surprise rare et non intrusive : etoile, baillement, mini coeur.
- [x] Ajouter un "message du jour" visible sans envoyer de notification.

### P2 - Nouveaux etats a ajouter ensuite

- [x] Câlin : coeur pixel art tres simple, phrase douce sans mentionner Chloe.
- [ ] Plage : sable discret, coquillage, lunettes de soleil.
- [ ] Balade : petit sac, fleur, traces de pas.
- [ ] Glace : cornet a cote de Lenny, petites gouttes.
- [ ] Fatigue de vacances : Lenny affale, yeux mi-clos.
- [ ] Soiree : lune, etoiles, pyjama.
- [ ] Meteo : soleil, pluie douce, vent dans les oreilles.
- [ ] Transport : mini train ou avion en fond, tres discret.

### P3 - Souvenirs et historique

- [ ] Ajouter un mini historique des 3 derniers moments, seulement si ca reste discret.
- [ ] Ajouter des badges/autocollants souvenir apres certaines activites.
- [x] Ajouter une option admin "programmer jusqu'a telle heure", puis retour auto.
- [x] Ajouter une petite galerie cachee des anciens etats, accessible seulement depuis l'admin.

## Interactions minimalistes cote Lenny

- Message temporaire apres notification : Lenny revient en etat normal, affiche le message pendant quelques secondes, puis reprend l'etat par defaut.
- Tap simple sur Lenny : continuer a changer d'etat, mais garder ce comportement discret.
- Tap long : petite reaction speciale, par exemple un coeur, un clignement rapide ou une phrase douce.
- Eviter le double tap pour l'instant : il peut entrer en conflit avec le tap simple.
- Surprise rare : une fois de temps en temps, Lenny cligne, baille, tremble apres trop de cafe, ou affiche une petite etoile.
- Etat "message du jour" : un message fixe choisi dans l'admin, sans notification.
- Micro historique : les 3 derniers moments sous forme de petits pixels/icones, seulement si ca ne surcharge pas l'ecran.

## Nouveaux etats possibles

- Balade : petit sac, fleur, traces de pas.
- Resto : assiette, verre, serviette.
- Glace : cornet a cote de Lenny, petites gouttes.
- Fatigue de vacances : Lenny affale, yeux mi-clos.
- Câlin : coeur pixel art tres simple, phrase douce sans mentionner Chloe.
- Meteo : soleil, pluie douce, vent dans les oreilles.
- Transport : mini train ou avion en fond, tres discret.
- Soiree : lune, etoiles, pyjama.
- Souvenir : badge ou autocollant ajoute sur Lenny.

## Ameliorations admin

- Ajouter un champ "message du jour" visible sur l'ecran principal sans envoyer de notification.
- Ajouter un bouton "envoyer notif + afficher message temporaire", deja proche du comportement actuel.
- Ajouter une duree configurable pour le message temporaire : 3s, 6s, 10s. Fait.
- Ajouter un selecteur d'etat plus compact si la liste grandit.
- Ajouter un bouton "Retour auto" pour remettre rapidement `auto`. Fait.
- Ajouter une previsualisation simple dans l'admin : voir la phrase et l'etat choisi avant d'envoyer.
- Ajouter une option "programmer" : choisir un etat jusqu'a une heure donnee, puis retour auto.
- Ajouter des templates de notification : "Je pense a toi", "Lenny est arrive", "Regarde Lenny".

## Workflow actuel pour ajouter un etat

Le refactor a deja simplifie le systeme. Aujourd'hui, un nouvel etat doit surtout passer par :

1. `src/lenny-states.js` pour declarer le label, la phrase, la scene, l'animation et le comportement.
2. `src/lenny-scenes.js` pour dessiner la scene pixel art.
3. `npm run check:lenny` pour verifier que rien n'est mal branche.
4. `npm run build` pour verifier la compilation.
5. Test visuel local.

Exemple de declaration :

```js
amour: {
  label: 'Câlin',
  mood: 'Lenny réclame un gros câlin tout doux.',
  scene: 'amour',
  backgroundScene: null,
  animated: false,
  tickMs: null,
  allowBlink: false,
  sleepEffect: false,
};
```

## Structure pour les calques pixel art

Le systeme est maintenant separe comme ca :

- `src/lenny-art.js` : palette, sprite principal, expressions du visage.
- `src/lenny-states.js` : definition des etats.
- `src/lenny-scenes.js` : scenes et decors pixel art.
- `src/lenny-renderer.js` : assemble sprite + decor + scene + expression.
- `src/App.jsx` : React, admin, PWA, notifications, interactions.

Puis chaque scene devient un calque pose autour de Lenny. Ca permet de garder le sprite principal stable et d'ajouter des accessoires sans casser le doudou.

## Workflow ideal pour ajouter un etat

1. Ajouter une entree dans `LENNY_STATES`.
2. Ajouter la cle de scene dans `SCENES` ou `BACKGROUND_SCENES`.
3. Creer la fonction de dessin dans `src/lenny-scenes.js`.
4. Lancer `npm run check:lenny`.
5. Lancer `npm run build`.
6. Tester visuellement.
7. Envoyer en prod seulement quand le rendu est bon.

Objectif : ne pas toucher au coeur React pour chaque nouvel etat.

## Petits outils utiles

- Une grille de debug optionnelle pour placer les pixels plus vite.
- Un mini "sprite preview" local pour tester une scene sans passer par l'admin.
- Un helper `pixelLine`, `pixelBox`, `pixelPattern` pour dessiner plus vite.
- Une fonction `drawSymmetric` pour les accessoires gauche/droite.
- `npm run check:lenny` pour verifier le sprite, les couleurs, les etats et les scenes.
- Un script qui regenere les icones apres modification de Lenny.

## Ameliorations PWA

- Garder le reload au retour de l'arriere-plan, mais eviter de le declencher pendant un message temporaire si ca gene.
- Ajouter une petite version interne affichee en bas de l'admin pour savoir si la PWA est a jour.
- Ajouter un bouton admin "forcer mise a jour PWA" avec une version de service worker incrementee.
- Garder les notifications tres minimales : titre = message, pas de body.

## Direction recommandee

Le prochain vrai chantier utile est de tester l'etat `Câlin` visuellement, puis d'ajouter un autre etat seulement quand le rendu est valide.

Les autres etats (`plage`, `balade`, `glace`, etc.) restent des idees futures, pas des etats actifs pour le moment.
