# Tuto : cloner ta voix avec Chatterbox (Windows)

Objectif : que `npm run make -- <sujet> --voice clone` fasse parler **ta** voix dans les vidéos.
Tout tourne sur ton PC, gratuitement. Chatterbox Multilingual est un modèle open source (licence MIT) de Resemble AI qui parle français.

Durée : environ 30 à 45 min la première fois (surtout des téléchargements).

---

## 0. Ce qu'il te faut

| | Minimum | Conseillé |
|---|---|---|
| Carte graphique | aucune (CPU, mais **lent** : plusieurs minutes par phrase) | NVIDIA avec 6 Go de VRAM ou plus |
| Espace disque | 10 Go | 15 Go |
| Logiciels | Git, Node.js 22+, FFmpeg, Anaconda (tu l'as déjà) | |

**Vérifie ta carte graphique** : ouvre *PowerShell* et tape :

```powershell
nvidia-smi
```

Si un tableau s'affiche avec le nom de ta carte (ex. « RTX 3060 »), c'est parfait.
Si la commande est inconnue, tu n'as pas de carte NVIDIA (ou pas le pilote) : ça marchera quand même, mais lentement.
Dans ce cas, installe d'abord le dernier pilote sur https://www.nvidia.com/fr-fr/drivers/ si tu as bien une carte NVIDIA.

## 1. Installer les outils de base (une seule fois)

Dans PowerShell :

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install Gyan.FFmpeg
```

Ferme puis rouvre PowerShell, et vérifie :

```powershell
git --version
node --version     # doit afficher v22 ou plus
ffmpeg -version
```

## 2. Récupérer le projet

```powershell
cd $HOME\Documents
git clone https://github.com/mallus01/moto_decode.git
cd moto_decode
npm install
```

> Si PowerShell refuse `npm` (« l'exécution de scripts est désactivée sur ce système »), lance une fois
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, réponds O, puis rouvre PowerShell.

## 3. Créer un environnement Python dédié

Ouvre **Anaconda Prompt** (menu Démarrer), puis :

```bat
conda create -n motovoice python=3.11 -y
conda activate motovoice
cd %USERPROFILE%\Documents\moto_decode
```

> Python 3.11 est important : Chatterbox 0.1.7 demande PyTorch 2.6, qui n'existe pas pour les Python plus récents.
> À chaque nouvelle session, refais `conda activate motovoice` avant de lancer le pipeline.

## 4. Installer PyTorch puis Chatterbox

**Avec une carte NVIDIA** :

```bat
pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cu124
pip install -r pipeline\requirements-clone.txt
```

**Sans carte NVIDIA** (CPU) :

```bat
pip install torch==2.6.0 torchaudio==2.6.0
pip install -r pipeline\requirements-clone.txt
```

Vérifie que PyTorch voit ta carte :

```bat
python -c "import torch; print('GPU OK :', torch.cuda.is_available())"
```

`GPU OK : True` = parfait. `False` alors que tu as une carte NVIDIA : voir *Dépannage*.

Installe aussi la voix provisoire (utile pour comparer) :

```bat
python pipeline\setup_voice.py
```

## 5. Enregistrer ta voix

C'est l'étape qui fait toute la qualité. Le modèle copie **le timbre et le ton** de ton échantillon.

1. Installe Audacity (gratuit) : `winget install Audacity.Audacity`
2. Pièce calme, micro (ou casque-micro) à 15-20 cm, pas de musique ni de ventilateur.
3. Lis ce texte **avec l'énergie de tes vidéos**, comme si tu parlais à un pote motard (20 à 25 secondes) :

   > Salut les motards ! Aujourd'hui on va voir comment fonctionne ta moto, pièce par pièce.
   > Le piston monte, la bougie fait une étincelle, et boum, le moteur tourne !
   > Franchement, c'est pas si compliqué. Et avec deux ou trois astuces d'entretien,
   > ta bécane va te remercier pendant des années. Allez, on y va !

4. Dans Audacity : *Effet → Normaliser* (-1 dB), coupe les blancs au début et à la fin.
5. *Fichier → Exporter → Exporter en WAV*, enregistre sous :
   `Documents\moto_decode\voices\mattis.wav`

Conseils : une seule voix, pas d'écho, 10 s minimum, 30 s maximum. Mieux vaut 20 s propres que 30 s bruitées.

## 6. Premier test

Toujours dans Anaconda Prompt (environnement `motovoice` activé) :

```bat
python pipeline\try_voice.py "Salut les motards ! Aujourd'hui, on décode le moteur quatre temps."
```

- Au **premier lancement**, le modèle (~3 Go) se télécharge depuis Hugging Face : patiente.
- Le résultat est dans `out\test-voix.wav`. Écoute-le.

Tu n'aimes pas le rendu ? Joue sur deux réglages puis relance le test :

```bat
set MOTO_VOICE_EXAGGERATION=0.7
set MOTO_VOICE_CFG=0.4
```

| Réglage | Effet | Valeurs |
|---|---|---|
| `MOTO_VOICE_EXAGGERATION` | expressivité, énergie | 0.3 calme → 0.8 très expressif (défaut 0.55) |
| `MOTO_VOICE_CFG` | rythme / fidélité au texte | 0.3 plus posé → 0.7 plus rapide et strict (défaut 0.5) |

Astuce : si la voix sonne « pressée » quand tu montes l'expressivité, baisse `MOTO_VOICE_CFG` vers 0.3.

## 7. Faire une vidéo avec ta voix

```bat
npm run make -- moteur-4-temps --voice clone
```

La vidéo finale sort dans `out\moteur-4-temps.mp4`.
Les voix déjà générées sont gardées en cache : si tu changes une seule phrase du script, seule cette phrase est régénérée.
Pour tout refaire (après avoir changé les réglages) : ajoute `--force-voice`.

Pour que ta voix soit utilisée **par défaut** :

```bat
setx MOTO_VOICE clone
```

(rouvre ensuite Anaconda Prompt).

## 8. Créer une nouvelle vidéo

Ouvre Claude Code dans le dossier `moto_decode` et demande simplement :
« Fais une vidéo sur les plaquettes de frein, avec ma voix clonée ».
Claude écrit le script, choisit la mascotte (Pistou, Zap, Gomme, Disco ou Maillon), dessine ce qui manque et lance le rendu.

---

## Dépannage

| Problème | Solution |
|---|---|
| `npm.ps1 ne peut pas être chargé… l'exécution de scripts est désactivée` (PowerShell) | Une fois : `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, réponds O, puis rouvre PowerShell. Ou tape `npm.cmd install`, ou utilise Anaconda Prompt / cmd. |
| `GPU OK : False` avec une carte NVIDIA | Mets à jour le pilote NVIDIA, puis réinstalle PyTorch avec la commande `--index-url .../cu124` de l'étape 4 (`pip uninstall torch torchaudio -y` avant). |
| `CUDA out of memory` | Ferme les jeux et logiciels 3D (Blender…), puis relance. Avec moins de 6 Go de VRAM, essaie quand même : ça passe souvent pour des phrases courtes. |
| `No module named 'chatterbox'` | Tu n'as pas activé l'environnement : `conda activate motovoice`. |
| `npm run make` lance le mauvais Python | Indique-le explicitement : `set MOTO_PYTHON=%CONDA_PREFIX%\python.exe` |
| Téléchargement Hugging Face très lent ou bloqué | Relance : il reprend où il s'est arrêté. Les fichiers sont dans `%USERPROFILE%\.cache\huggingface`. |
| La voix prononce mal un mot technique ou un sigle | Dans le script, écris-le comme il se prononce (ex. « A B S » au lieu de « ABS », « deux temps » au lieu de « 2T »). |
| La voix ne te ressemble pas assez | Réenregistre `voices\mattis.wav` plus proche du micro, avec plus d'énergie, sans bruit de fond. C'est presque toujours l'échantillon. |

## À savoir

- **100 % local** : ta voix et ton échantillon ne quittent jamais ton PC (`voices/` n'est pas envoyé sur GitHub).
- **Filigrane** : Chatterbox ajoute à chaque fichier généré un filigrane audio inaudible (« Perth ») qui permet de détecter que la voix a été générée par IA. Ça n'altère pas le son.
- **Mentionne l'IA** : TikTok demande d'étiqueter les contenus réalistes générés par IA. Coche « Contenu généré par l'IA » à la publication, c'est plus sûr.
- **Licence** : Chatterbox est sous licence MIT, utilisable aussi pour des vidéos monétisées.
