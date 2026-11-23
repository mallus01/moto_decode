# Moto Décode 🏍️

Pipeline qui transforme **un sujet moto** en **vidéo TikTok verticale** (1080×1920, ~1 min, en français) :
cartoon dessiné en code, voix off, sous-titres animés, intro et outro de marque.

```
sujet ──► Claude écrit content/<slug>/script.json
      ──► voix off (Piper provisoire, ou TA voix clonée avec Chatterbox)
      ──► vidéo principale avec Remotion (scènes cartoon React/SVG)
      ──► intro + outro avec HyperFrames (HTML + GSAP)
      ──► ffmpeg assemble tout ──► out/<slug>.mp4
```

Tout est gratuit et local : aucune API payante. Le script est écrit par Claude (ton abonnement).

## Installation (une fois)

Prérequis : Node.js 22+, Python 3.10+, FFmpeg dans le PATH.

```bash
npm install
pip install -r pipeline/requirements.txt
python pipeline/setup_voice.py        # voix française provisoire (~60 Mo)
```

## Faire une vidéo

1. Ouvre Claude Code dans ce dossier et demande :
   *« Fais une vidéo sur les plaquettes de frein »*.
   Claude suit `CLAUDE.md` : il écrit `content/plaquettes-de-frein/script.json`, dessine les visuels manquants, puis lance le rendu.
2. Ou à la main, une fois le script écrit :

```bash
npm run make -- moteur-4-temps                 # voix provisoire
npm run make -- moteur-4-temps --voice clone   # ta voix clonée
```

Résultat : `out/<slug>.mp4`. Aperçu interactif des scènes : `npm run studio`.

## Ta voix clonée

Voir [`voices/README.md`](voices/README.md). En bref : enregistre 10 à 30 s de ta voix dans `voices/mattis.wav`,
installe `pipeline/requirements-clone.txt` (PyTorch + Chatterbox, licence MIT), puis `--voice clone`.
Une carte graphique NVIDIA est fortement conseillée.

## Structure

| Dossier | Rôle |
|---|---|
| `content/<slug>/script.json` | Le script d'un épisode (texte, scènes, visuels) |
| `src/` | Projet Remotion : scènes, sous-titres, visuels cartoon (`src/visuals/`) |
| `hyperframes/templates/` | Intro et outro HyperFrames |
| `pipeline/` | `make.mjs` (orchestration), `voice.py` (voix off) |
| `brand/` | Charte : nom, couleurs, logo, mascotte |
| `out/` | Vidéos générées (non versionnées) |

## Licences à connaître

- **Remotion** : gratuit pour un particulier ou une entreprise de 3 personnes max.
- **HyperFrames** : Apache-2.0. **Chatterbox** : MIT. Voix Piper « tom » : AGPLv3 (modèle provisoire).
- Polices Lilita One et Nunito : OFL.
