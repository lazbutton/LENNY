# Comment ajouter un etat Lenny

Objectif : ajouter un moment sans toucher au coeur React.

## 1. Declarer l'etat

Dans `src/lenny-states.js`, ajouter une entree dans `LENNY_STATES` :

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
},
```

## 2. Declarer la scene

Dans `src/lenny-scenes.js`, ajouter la cle dans `SCENES` :

```js
export const SCENES = ['breakfast', 'pool', 'cafe', 'amour'];
```

Puis creer une fonction de dessin :

```js
function drawAmour() {
  pattern(35, 8, ['.rr.rr.', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...']);
}
```

Et la brancher dans le retour de `createSceneDrawers` :

```js
scenes: {
  amour: drawAmour,
}
```

## 3. Utiliser les helpers

Dans `src/lenny-scenes.js`, les helpers disponibles sont :

- `line(x1, y1, x2, y2, key)` pour tracer une ligne.
- `pattern(x, y, rows, palette)` pour dessiner un petit motif.
- `symmetric(drawLeft)` pour dessiner gauche/droite.
- Le renderer est en grille x2 : les anciens pixels restent identiques, mais `fine.fpx(x, y, key)` et
  `fine.fblk(x, y, w, h, key)` permettent de dessiner des details deux fois plus fins dans les decors.

Exemple :

```js
pattern(4, 50, [
  '.bbb.',
  'boeob',
  '.bbb.',
]);

fine.fpx(12, 80, 'o'); // detail fin sur le decor
```

## 4. Verifier

Toujours lancer :

```sh
npm run check:lenny
npm run build
```

## 5. Tester visuellement

Lancer le site en local, aller sur `/admin`, choisir le nouvel etat, puis verifier Lenny sur mobile si possible.

Ne pas envoyer en prod tant que le rendu pixel art n'est pas valide visuellement.
