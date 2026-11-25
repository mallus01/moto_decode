# Enregistrer un bon échantillon de voix

Chatterbox copie **tout** ce qu'il entend dans ton échantillon : le timbre, mais aussi l'énergie, le rythme, l'écho de la pièce et le bruit.
Un bon échantillon fait plus pour le naturel que n'importe quel réglage.

## Les règles

| ✅ À faire | ❌ À éviter |
|---|---|
| **10 à 20 secondes** de parole continue | plus de 30 s (le modèle n'en utilise qu'une partie) |
| Parler **comme dans tes vidéos** : énergique, souriant, en appuyant sur les mots clés | lire un texte d'une voix monotone |
| Pièce calme et « molle » (rideaux, lit, vêtements autour) | salle de bain, cuisine, pièce vide (écho) |
| Micro (ou téléphone) à **15-20 cm** de la bouche, toujours à la même distance | micro loin ou qui bouge |
| Une seule voix, aucun fond sonore | musique, télé, ventilateur, moto qui tourne |
| Phrases complètes, avec des « ! » et des questions | silence long au début ou à la fin, bafouillages |

## Le texte à lire (≈ 15 s)

Lis-le **deux ou trois fois** pour te chauffer, puis enregistre la meilleure prise :

> Salut les motards ! Aujourd'hui, on décode une pièce que t'utilises tous les jours, sans même y penser.
> Tu vas voir, c'est hyper simple. Et à la fin, je te donne une astuce pour la faire durer deux fois plus longtemps !

## Enregistrer avec Audacity

1. Micro : choisis ton micro en haut, et mets **Mono** (1 canal).
2. Clique sur ⏺, attends une seconde, parle, attends une seconde, ⏹.
3. Le niveau doit monter vers **-12 / -6 dB** sans jamais toucher le rouge.
4. Sélectionne tout (Ctrl+A) → **Effet → Volume et compression → Normaliser** (-1 dB).
5. Coupe les silences du début et de la fin, et les ratés.
6. **Fichier → Exporter → Exporter en WAV**, nom : `mattis2.wav`, dans le dossier `voices\` du projet.

Avec un téléphone : l'app dictaphone suffit, téléphone posé sur un livre devant toi. Récupère le fichier puis convertis-le en WAV dans Audacity (Fichier → Ouvrir, puis étape 4 à 6).

## Tester

Dans Anaconda Prompt :

```bat
cd C:\Users\matti\Documents\moto_decode
conda activate motovoice
python pipeline\try_voice.py "Salut les motards ! Aujourd'hui, on décode la chaîne."
```

Écoute `out\test-voix.wav`. Si ça ne ressemble pas à toi ou que ça sonne faux, refais l'échantillon **avant** de toucher aux réglages.
Tu peux garder plusieurs essais (`mattis2.wav`, `mattis3.wav`…) et les comparer avec `set MOTO_VOICE_REF=voices\mattis3.wav`.
