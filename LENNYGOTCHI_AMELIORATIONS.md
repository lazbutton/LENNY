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

## Interactions minimalistes cote Lenny

- Message temporaire apres notification : Lenny revient en etat normal, affiche le message pendant quelques secondes, puis reprend l'etat par defaut.
- Tap simple sur Lenny : continuer a changer d'etat, mais garder ce comportement discret.
- Tap long : petite reaction speciale, par exemple un coeur, un clignement rapide ou une phrase douce.
- Double tap : afficher un mini "coucou" ou une animation de 2 secondes.
- Surprise rare : une fois de temps en temps, Lenny cligne, baille, tremble apres trop de cafe, ou affiche une petite etoile.
- Etat "message du jour" : un message fixe choisi dans l'admin, sans notification.
- Micro historique : les 3 derniers moments sous forme de petits pixels/icones, seulement si ca ne surcharge pas l'ecran.

## Nouveaux etats possibles

- Plage : sable discret, coquillage, lunettes de soleil.
- Balade : petit sac, fleur, traces de pas.
- Resto : assiette, verre, serviette.
- Glace : cornet a cote de Lenny, petites gouttes.
- Fatigue de vacances : Lenny affale, yeux mi-clos.
- Amour : coeur pixel art tres simple, phrase pour Chloe.
- Meteo : soleil, pluie douce, vent dans les oreilles.
- Transport : mini train ou avion en fond, tres discret.
- Soiree : lune, etoiles, pyjama.
- Souvenir : badge ou autocollant ajoute sur Lenny.

## Ameliorations admin

- Ajouter un champ "message du jour" visible sur l'ecran principal sans envoyer de notification.
- Ajouter un bouton "envoyer notif + afficher message temporaire", deja proche du comportement actuel.
- Ajouter une duree configurable pour le message temporaire : 3s, 6s, 10s.
- Ajouter un selecteur d'etat plus compact si la liste grandit.
- Ajouter un bouton "Retour auto" pour remettre rapidement `auto`.
- Ajouter une previsualisation simple dans l'admin : voir la phrase et l'etat choisi avant d'envoyer.
- Ajouter une option "programmer" : choisir un etat jusqu'a une heure donnee, puis retour auto.
- Ajouter des templates de notification : "Je pense a toi", "Lenny est arrive", "Regarde Lenny".

## Simplifier la creation de nouveaux etats

Aujourd'hui, ajouter un etat demande de modifier plusieurs endroits :

- `MODES`
- `ADMIN_MODES`
- `MODE_LABELS`
- `moodFor`
- `drawScene`
- parfois `tickRef`
- parfois les intervalles d'animation
- `api/lenny-state.js`

Ca marche, mais ca peut devenir lourd. Le prochain gros gain serait de centraliser les etats dans un seul fichier.

## Structure proposee

Creer un fichier `src/lenny-states.js` :

```js
export const LENNY_STATES = {
  awake: {
    label: 'Reveille',
    mood: 'Lenny est reveille.',
    draw: null,
    animated: false,
  },
  pool: {
    label: 'Piscine',
    mood: 'Lenny se prelasse a la piscine.',
    draw: drawPool,
    animated: true,
    tickMs: 360,
  },
};
```

Puis `App.jsx` pourrait generer automatiquement :

- la liste des modes
- les boutons admin
- les labels
- les phrases
- les timers d'animation
- la validation API

## Structure pour les calques pixel art

Au lieu de dessiner toutes les scenes directement dans `drawScene`, creer des fonctions separees :

- `drawBaseLenny`
- `drawBreakfastScene`
- `drawPoolScene`
- `drawCafeScene`
- `drawMessageOverlay`

Puis chaque scene devient un calque pose autour de Lenny. Ca permet de garder le sprite principal stable et d'ajouter des accessoires sans casser le doudou.

## Workflow ideal pour ajouter un etat

1. Ajouter une entree dans `LENNY_STATES`.
2. Creer une fonction de dessin dans `src/scenes/<etat>.js`.
3. Ajouter une phrase courte.
4. Lancer `npm run build`.
5. Tester visuellement.
6. Envoyer en prod.

Objectif : ne plus modifier 5 ou 6 endroits pour chaque nouvel etat.

## Petits outils utiles

- Une grille de debug optionnelle pour placer les pixels plus vite.
- Un mini "sprite preview" local pour tester une scene sans passer par l'admin.
- Un helper `pixelLine`, `pixelBox`, `pixelPattern` pour dessiner plus vite.
- Une fonction `drawSymmetric` pour les accessoires gauche/droite.
- Un script qui verifie que toutes les lignes du sprite font bien 48 caracteres.
- Un script qui regenere les icones apres modification de Lenny.

## Ameliorations PWA

- Garder le reload au retour de l'arriere-plan, mais eviter de le declencher pendant un message temporaire si ca gene.
- Ajouter une petite version interne affichee en bas de l'admin pour savoir si la PWA est a jour.
- Ajouter un bouton admin "forcer mise a jour PWA" avec une version de service worker incrementee.
- Garder les notifications tres minimales : titre = message, pas de body.

## Direction recommandee

La prochaine vraie amelioration technique serait de sortir les etats de `App.jsx` vers un systeme declaratif.

Ca rendrait Lenny plus facile a faire evoluer sans changer son esprit : peu d'interface, peu de texte, mais beaucoup de petits moments ajoutables rapidement.
