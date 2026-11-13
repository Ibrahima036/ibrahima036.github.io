# Portfolio d'Ibrahima Bah

Site personnel en ligne sur https://ibrahima036.github.io

Écrit à la main en HTML, CSS et JavaScript, sans framework ni étape de build.

## Organisation

```
index.html            Contenu de la page (HTML sémantique)
assets/
  css/style.css       Styles, rangés par sections (voir le sommaire en tête du fichier)
  js/main.js          Scripts, un module par fonctionnalité
  img/                Photo, captures des projets, favicon
.nojekyll             Demande à GitHub Pages de servir les fichiers tels quels
```

### Conventions

- **HTML** : une `<section>` par partie de la page, chacune reliée à son titre par `aria-labelledby`.
  Le contenu (projets, services, clients) est écrit dans le HTML ; le JavaScript ne fait que l'animer.
- **CSS** : nommage [BEM](https://getbem.com/) (`bloc__élément--modificateur`), couleurs et polices
  dans des variables (`--color-*`, `--font-*`), thème sombre par défaut et thème clair automatique.
- **JavaScript** : les éléments sont repérés par des attributs `data-*` (jamais par les classes de style).
- **Icônes** : définies une seule fois dans le sprite SVG en haut de `index.html`, réutilisées avec `<use href="#icon-…">`.

## Modifier le contenu

| Pour changer…                 | Où                                                                 |
| ----------------------------- | ------------------------------------------------------------------ |
| Le titre, la phrase d'accueil | `index.html`, section `#accueil`                                   |
| Un projet                     | `index.html`, section `#projets` : une `.project-card` (visuel) et un `<article class="project">` (détails), dans le même ordre |
| Les services, outils, clients | `index.html`, sections `#services`, `#outils`, `#clients`          |
| L'e-mail ou le téléphone      | `index.html` (attributs `data-copy` et liens) et `CONTACT` dans `assets/js/main.js` |
| Les couleurs                  | `assets/css/style.css`, section 1 « Variables »                    |
| La photo                      | remplacer `assets/img/photo.jpg` (format carré conseillé)          |

## Mise en ligne

GitHub Pages publie la branche `main` (Settings → Pages → Deploy from a branch → `main`, `/ (root)`).
Chaque push met le site à jour en une ou deux minutes.

Pour tester en local : `python3 -m http.server` à la racine, puis ouvrir http://localhost:8000.
