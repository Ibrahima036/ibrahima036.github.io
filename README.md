# Portfolio d'Ibrahima

En ligne : https://ibrahima036.github.io

Page unique (`index.html`), sans dépendance ni étape de build. Inspirée de la mise en page de joelcodja.com.

## Personnaliser

Tout le contenu est dans `index.html` :

- nom, métier, ville et prononciation : section `#accueil` ;
- adresse e-mail : remplacer `ibrahima@example.com` partout ;
- liens GitHub et LinkedIn : en-tête et pied de page ;
- projets : tableau `projects` dans le script en bas du fichier, et cartes `.p-card` de la section `#projets` (les projets marqués « Exemple » sont à remplacer) ;
- services, outils et parcours : sections `#services` et `#parcours`.

Fichiers optionnels à ajouter dans `assets/` :

- `photo.jpg` : remplace le visuel génératif du haut de page (affichée en noir et blanc) ;
- `cv.pdf` : fichier du bouton « Télécharger mon CV ».

## Mettre en ligne

Le site est publié par GitHub Pages : Settings → Pages → Deploy from a branch → `main`, dossier `/ (root)`.
Chaque push sur `main` met le site à jour en une ou deux minutes.
