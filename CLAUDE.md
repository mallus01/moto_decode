# Moto Décode : instructions pour Claude

Ce dépôt produit des vidéos TikTok éducatives sur la moto, **en français**, ~55-65 s, à partir d'un sujet.
Quand l'utilisateur donne un sujet (« fais une vidéo sur la chaîne »), fais tout ceci :

## 1. Écrire le script
Crée `content/<slug>/script.json` (slug en kebab-case sans accents). Format : voir `content/moteur-4-temps/script.json` et `src/types.ts`.

- `title` : `"Épisode N · <Sujet>"` (regarde les épisodes existants pour N).
- `scenes` : 6 à 8 scènes, dans cet ordre :
  1. `hook` (1) : accroche choc en 1-2 phrases, heading = nom du sujet.
  2. `explain` (3 à 5) : comment ça marche, pièce par pièce, puis **son rôle** dans la moto.
  3. `tip` (1) : une astuce d'entretien concrète et sûre.
- `outro` : `{ "narration": "Abonne-toi à Moto Décode ! La prochaine fois, on …", "next": "<sujet suivant>" }`.
- Narration : tutoiement, phrases courtes, ton énergique, **nombres écrits en lettres** (la voix lit mieux « quatre » que « 4 »).
  Vise ~850 caractères de narration au total (≈ 60 s).
- `heading` : 1 à 4 mots. Les chiffres sont OK ici.
- Exactitude technique : pas d'approximation dangereuse. Pour l'entretien, renvoie au manuel constructeur quand la méthode varie selon la moto (couple de serrage, méthode de niveau d'huile…).

## 2. Les visuels
Chaque scène a un `visual` dont `kind` est déclaré dans `src/visuals/index.tsx`.
Existants : `engine4t` (coupe moteur animée : `stroke`, `speed`, `labels`, `highlight`), `oilcheck`, `mascot`, `logo`.
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
- Intro/outro : `hyperframes/templates/*.html` (HyperFrames). Variables `{{TITLE}}`, `{{NEXT}}`, `{{DUR}}`, `{{VO_DUR}}` remplies par `pipeline/make.mjs`.
- Les couleurs et polices ne changent que dans `src/brand.ts` + `hyperframes/templates/_shared.css` (garde-les synchronisés).
- Zone sûre TikTok : rien d'important sous y=1600 ni dans les 150 px de droite.
