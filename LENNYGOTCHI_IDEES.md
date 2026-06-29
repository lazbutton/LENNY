# LENNYGOTCHI

## Intention

LENNYGOTCHI est un petit compagnon internet inspire de Lenny, un vrai doudou transforme en pixel art. L'idee est d'en faire une presence douce et vivante pour Chloe : un Lenny qui accompagne les vacances, les petites routines, les clins d'oeil du quotidien et les moments que l'on veut partager meme a distance.

Le site doit rester simple, intime et mignon. Il ne cherche pas a devenir un gros jeu, mais plutot un petit rituel : on ouvre la page, on voit Lenny dans son etat du moment, et il raconte quelque chose de la journee.

## Direction artistique

- Garder un pixel art lisible, pas trop detaille, comme une version numerique d'une broderie.
- Reprendre les signes reconnaissables du doudou : tete blanche, longues oreilles asymetriques, col rose, corps pastel en quartiers, jambe jaune, jambe rose/rouge et petit patch fleur.
- Privilegier les aplats doux, les contours chauds et quelques pixels de texture seulement.
- Faire evoluer Lenny avec des accessoires poses par-dessus le sprite, pour pouvoir ajouter des souvenirs sans tout redessiner.
- Conserver une page calme, avec beaucoup d'espace et des interactions simples.

## Idees de moments

- Piscine : masque, tuba, petites gouttes d'eau, serviette ou bouee.
- Petit dejeuner : tartines, tasse, confiture, miettes autour de Lenny.
- Plage : lunettes de soleil, coquillage, petit seau, sable sous les pieds.
- Balade : sac a dos, carte, fleur cueillie, trace de pas.
- Soir : lune, pyjama, etoiles, doudou qui dort plus profondement.
- Message pour Chloe : petit coeur, enveloppe, phrase courte du jour.
- Meteo : soleil, nuage, pluie douce, vent dans les oreilles.
- Repas : fruit, glace, assiette locale, mini pique-nique.
- Transport : train, voiture, avion en fond tres discret.
- Souvenir : un badge ou autocollant ajoute apres chaque activite.

## Petits rituels possibles

- Un bouton "Dodo / Reveil" comme aujourd'hui, qui garde l'etat de Lenny.
- Un bouton "Aujourd'hui" qui affiche l'accessoire ou le clin d'oeil du jour.
- Une phrase courte sous Lenny, par exemple "Lenny est alle a la piscine" ou "Lenny pense a Chloe".
- Un historique minimal des derniers souvenirs, sous forme de petites icones pixel art.
- Des surprises rares : Lenny cligne des yeux, fait un coeur, baille, ou affiche un "coucou".

## Evolution technique simple

- Garder le site en HTML/CSS/JS statique pour pouvoir deployer vite sur Vercel.
- Organiser les accessoires comme des calques pixel art separes du corps de Lenny.
- Ajouter un petit objet JavaScript `ACTIVITES` avec un nom, une phrase, une palette et une liste de pixels a dessiner.
- Stocker l'etat actif dans `localStorage`, comme le sommeil actuel.
- Plus tard, ajouter une petite interface cachee pour choisir l'activite du jour sans toucher au code.

## Ton

Le ton doit rester tendre, personnel et leger. LENNYGOTCHI n'a pas besoin d'expliquer beaucoup : il doit surtout faire sourire Chloe et donner l'impression que Lenny vit les vacances avec toi.
