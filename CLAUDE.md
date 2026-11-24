# Moto Décode : instructions pour Claude

Ce dépôt produit des vidéos TikTok éducatives sur la moto, **en français**, ~55-65 s, à partir d'un sujet.
Quand l'utilisateur donne un sujet (« fais une vidéo sur la chaîne »), fais tout ceci :

## 1. Écrire le script
Crée `content/<slug>/script.json` (slug en kebab-case sans accents). Format : voir `content/moteur-4-temps/script.json` et `src/types.ts`.

- `title` : `"Épisode N · <Sujet>"` (regarde les épisodes existants pour N).
- `mascot` : la mascotte de l'épisode, celle dont la pièce est la plus proche du sujet (`src/components/Mascots.tsx`) :
  `piston` (Pistou : moteur, huile, embrayage…), `bougie` (Zap : allumage, électricité, batterie), `pneu` (Gomme : pneus, roues, suspension),
  `frein` (Disco : freinage, ABS), `pignon` (Maillon : transmission, chaîne, boîte). Défaut : `piston`.
- `scenes` : 6 à 8 scènes, dans cet ordre :
  1. `hook` (1) : l'accroche, les 3 premières secondes décident si on regarde. Elle a :
     - `heading` : **une phrase choc** de 3 à 6 mots, un chiffre ou une surprise vraie, mots clés entre `*` (surlignés en jaune).
       Ex. `"*50 explosions* par seconde !"`.
     - `kicker` : le nom du sujet (petite étiquette orange).
     - `visual` : **une image qui illustre le sujet**, en général `{ "kind": "bike", "focus": "<pièce>", "label": "<PIÈCE>" }`
       (moto cartoon avec la pièce entourée ; `focus` = engine | spark | brake | tire | chain | clutch ; `boom: true` pour les sujets moteur).
     - `narration` : la phrase choc dite à l'oral (chiffres en lettres), puis « On décode … ». Vérifie que le chiffre est exact.
  2. `explain` (3 à 5) : comment ça marche, pièce par pièce, puis **son rôle** dans la moto.
  3. `tip` (1) : une astuce d'entretien concrète et sûre.
- `outro` : `{ "narration": "Abonne-toi ! La prochaine fois, on …", "next": "<sujet suivant>" }`. Dire juste « Abonne-toi », sans le nom de la chaîne.
- `description` : texte de publication TikTok, 1re ligne = l'accroche (avec le chiffre choc), 2e ligne = résumé avec les mots clés que les gens tapent
  dans la recherche (nom de la pièce, « entretien », « comment ça marche »), puis une question pour faire commenter. 1 à 3 emojis max.
- `hashtags` : 4 ou 5, sans `#` : 1-2 larges (`moto`, `motard`), 2 de niche sur le sujet (`mecaniquemoto`, `entretienmoto`, `freinmoto`…),
  + `apprendresurtiktok`. Pas de #fyp/#pourtoi. Le pipeline écrit `out/<slug>.txt` prêt à copier.
- Narration : tutoiement, phrases courtes, ton énergique, **nombres écrits en lettres** (la voix lit mieux « quatre » que « 4 »).
  Vise ~850 caractères de narration au total (≈ 60 s).
- `heading` des autres scènes : 1 à 4 mots. Les chiffres sont OK ici.
- Exactitude technique : pas d'approximation dangereuse. Pour l'entretien, renvoie au manuel constructeur quand la méthode varie selon la moto (couple de serrage, méthode de niveau d'huile…).

## 2. Les visuels
Chaque scène a un `visual` dont `kind` est déclaré dans `src/visuals/index.tsx`.
Existants : `bike` (moto de profil, `focus`, `label`, `boom`), `engine4t` (coupe moteur animée : `stroke`, `speed`, `labels`, `highlight`), `oilcheck`, `clutch` (embrayage en coupe : `state` engaged | disengaged | slip | cycle, `labels`), `clutchlever` (garde du levier), `mascot` (`id`, `pose`), `logo`.
Si le sujet en demande un nouveau (chaîne, frein, bougie, embrayage…), **crée-le** dans `src/visuals/<Nom>.tsx` :
- SVG React, `viewBox="0 0 600 900"`, animé avec `useCurrentFrame()` (jamais de CSS animation ni `Math.random`).
- Style cartoon : couleurs de `BRAND.colors`, contours `BRAND.stroke` (#14213D), formes simples et arrondies.
- Ajoute-le au `switch` de `src/visuals/index.tsx` et lance `npm run typecheck`.

## 3. Rendre
```bash
npm run make -- <slug>                # voix provisoire Piper
npm run make -- <slug> --voice clone  # voix clonée (si voices/mattis.wav existe)
```
Puis vérifie quelques images avant de livrer :
`ffmpeg -ss 10 -i out/<slug>.mp4 -frames:v 1 out/check.png` et regarde-les.
Livre `out/<slug>.mp4`. Pas de publication automatique.

## Règles
- Pas d'intro : la vidéo démarre directement sur l'accroche (le logo d'intro HyperFrames n'est ajouté qu'avec `--intro`, à éviter).
- Intro/outro : `hyperframes/templates/*.html` (HyperFrames). Variables `{{TITLE}}`, `{{NEXT}}`, `{{DUR}}`, `{{VO_DUR}}` remplies par `pipeline/make.mjs`.
  L'outro affiche `mascot.png`, la mascotte de l'épisode rendue par la composition Remotion `MascotStill`.
- Planche des mascottes : `npx remotion still src/index.ts MascotSheet brand/mascottes.png`.
- Les couleurs et polices ne changent que dans `src/brand.ts` + `hyperframes/templates/_shared.css` (garde-les synchronisés).
- Bruitages : composant `<Sfx name="…" at={image} />` (`src/components/Sfx.tsx`), sons dans `public/sfx/` (régénérer : `python pipeline/make_sfx.py`).
  Déjà placés automatiquement : boom + pop dans l'accroche, whoosh à chaque scène, ding dans l'astuce, zap sur la combustion, levelup sur `oilcheck`.
  Pour un nouveau visuel, ajoute ses bruitages dans `SceneView.tsx` sur ses moments forts, sans en mettre partout.
- Signature : « by Fazerr » (`BRAND.author`) à côté du logo.
- Zone sûre TikTok : rien d'important sous y=1600 ni dans les 150 px de droite.
