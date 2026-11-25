# Voix off

## Voix provisoire (Piper)
`python pipeline/setup_voice.py` télécharge `fr_FR-tom-medium` dans `voices/piper/`. Rapide, CPU, gratuite.
Vitesse réglable : `MOTO_PIPER_SPEED=0.88` (plus petit = plus rapide).

## Ta voix clonée (Chatterbox Multilingual, MIT, 100 % local)

👉 Tuto complet pas à pas pour Windows : [`docs/TUTO-CHATTERBOX.md`](../docs/TUTO-CHATTERBOX.md)

1. **Enregistre ta voix** : 10 à 30 secondes, en français, ton naturel et énergique comme dans tes vidéos,
   pièce calme, micro proche, sans musique. Sauvegarde en WAV : `voices/mattis2.wav` (utilisé par défaut ; sinon `voices/mattis.wav`).
   Guide complet : [`docs/ENREGISTRER-SA-VOIX.md`](../docs/ENREGISTRER-SA-VOIX.md).
   (Une seule personne qui parle, pas de silence long au début.)
2. **Installe** PyTorch 2.6 avec CUDA (Python 3.11), puis :
   `pip install -r pipeline/requirements-clone.txt`
3. **Rends** : `npm run make -- <slug> --voice clone`
   Au premier lancement le modèle (~2 Go) est téléchargé depuis Hugging Face.

Préréglage `naturel` par défaut (`MOTO_VOICE_EXAGGERATION` 0.7, `MOTO_VOICE_CFG` 0.35, `MOTO_VOICE_TEMP` 0.8, pas d'accélération), génération phrase par phrase + finition EQ/compression. Anciens réglages : `MOTO_VOICE_PRESET=tiktok`. Détails dans le tuto.
Pour utiliser le clone par défaut : variable d'environnement `MOTO_VOICE=clone`.

> `voices/` n'est pas versionné (ta voix reste sur ta machine).
